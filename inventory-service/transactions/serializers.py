from __future__ import annotations

from rest_framework import serializers

from transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Transaction
		fields = [
			"id",
			"product",
			"user",
			"transaction_type",
			"quantity",
			"reference_note",
			"transaction_date",
		]
		read_only_fields = ["id", "user", "transaction_type", "transaction_date"]

	def validate_quantity(self, value):
		if value <= 0:
			raise serializers.ValidationError("Quantity must be greater than 0.")
		return value