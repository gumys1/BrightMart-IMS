from __future__ import annotations

from rest_framework import serializers

from inventory.models import Category, Product, Supplier


class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ["id", "category_name", "description"]
		read_only_fields = ["id"]


class SupplierSerializer(serializers.ModelSerializer):
	class Meta:
		model = Supplier
		fields = ["id", "supplier_name", "contact_person", "email", "phone", "address"]
		read_only_fields = ["id"]


class ProductSerializer(serializers.ModelSerializer):
	class Meta:
		model = Product
		fields = [
			"id",
			"sku",
			"name",
			"category",
			"supplier",
			"unit_price",
			"current_quantity",
			"reorder_threshold",
			"created_at",
		]
		read_only_fields = ["id", "current_quantity", "created_at"]

	def validate_unit_price(self, value):
		if value < 0:
			raise serializers.ValidationError("Unit price must be non-negative.")
		return value

	def validate_reorder_threshold(self, value):
		if value < 0:
			raise serializers.ValidationError("Reorder threshold must be non-negative.")
		return value


class StockReceiveSerializer(serializers.Serializer):
	product_id = serializers.PrimaryKeyRelatedField(
		queryset=Product.objects.all(),
		required=False,
	)
	product = serializers.PrimaryKeyRelatedField(
		queryset=Product.objects.all(),
		source="product_id",
		write_only=True,
		required=False,
	)
	supplier_id = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all())
	quantity = serializers.IntegerField()
	notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	reference_note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

	def validate(self, attrs):
		if "product_id" not in attrs:
			raise serializers.ValidationError({"product_id": "This field is required."})
		if "notes" in attrs and "reference_note" not in attrs:
			attrs["reference_note"] = attrs["notes"]
		return attrs

	def validate_quantity(self, value):
		if value <= 0:
			raise serializers.ValidationError("Quantity must be greater than 0.")
		return value


class StockIssueSerializer(serializers.Serializer):
	product_id = serializers.PrimaryKeyRelatedField(
		queryset=Product.objects.all(),
		required=False,
	)
	product = serializers.PrimaryKeyRelatedField(
		queryset=Product.objects.all(),
		source="product_id",
		write_only=True,
		required=False,
	)
	quantity = serializers.IntegerField()
	notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	reference_note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

	def validate(self, attrs):
		if "product_id" not in attrs:
			raise serializers.ValidationError({"product_id": "This field is required."})
		if "notes" in attrs and "reference_note" not in attrs:
			attrs["reference_note"] = attrs["notes"]
		return attrs

	def validate_quantity(self, value):
		if value <= 0:
			raise serializers.ValidationError("Quantity must be greater than 0.")
		return value