from django.db import models


class Category(models.Model):
	category_name = models.CharField(max_length=150, unique=True)
	description = models.TextField(blank=True)

	class Meta:
		verbose_name_plural = "Categories"
		ordering = ["category_name"]

	def __str__(self) -> str:
		return self.category_name


class Supplier(models.Model):
	supplier_name = models.CharField(max_length=200, unique=True)
	contact_person = models.CharField(max_length=200)
	email = models.EmailField(unique=True)
	phone = models.CharField(max_length=30)
	address = models.TextField()

	class Meta:
		ordering = ["supplier_name"]

	def __str__(self) -> str:
		return self.supplier_name


class Product(models.Model):
	sku = models.CharField(max_length=64, unique=True)
	name = models.CharField(max_length=255)
	category = models.ForeignKey(
		Category,
		on_delete=models.PROTECT,
		related_name="products",
	)
	supplier = models.ForeignKey(
		Supplier,
		on_delete=models.PROTECT,
		related_name="products",
	)
	unit_price = models.DecimalField(max_digits=10, decimal_places=2)
	current_quantity = models.PositiveIntegerField(default=0)
	reorder_threshold = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["name"]

	def __str__(self) -> str:
		return f"{self.sku} - {self.name}"
