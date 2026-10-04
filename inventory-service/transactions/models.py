from django.conf import settings
from django.db import models


class Transaction(models.Model):
	class TransactionType(models.TextChoices):
		RECEIVED = "RECEIVED", "Received"
		ISSUED = "ISSUED", "Issued"
		ADJUSTMENT = "ADJUSTMENT", "Adjustment"

	product = models.ForeignKey(
		"inventory.Product",
		on_delete=models.PROTECT,
		related_name="transactions",
	)
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.PROTECT,
		related_name="transactions",
	)
	transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
	quantity = models.PositiveIntegerField()
	reference_note = models.CharField(max_length=255, blank=True)
	transaction_date = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-transaction_date", "-id"]

	def __str__(self) -> str:
		return f"{self.transaction_type} - {self.product.sku} - {self.quantity}"
