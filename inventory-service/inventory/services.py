from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F

from inventory.models import Product, Supplier
from transactions.models import Transaction


def _validate_positive_quantity(quantity: int) -> None:
	if quantity <= 0:
		raise ValidationError({"quantity": "Quantity must be greater than 0."})


@transaction.atomic
def receive_stock(product_id, quantity, user, supplier_id, reference_note):
	"""Increase product stock and write an immutable received transaction."""
	_validate_positive_quantity(quantity)

	product = Product.objects.select_for_update().select_related("supplier").get(pk=product_id)
	Supplier.objects.get(pk=supplier_id)

	product.current_quantity += quantity
	product.save(update_fields=["current_quantity"])

	return Transaction.objects.create(
		product=product,
		user=user,
		transaction_type=Transaction.TransactionType.RECEIVED,
		quantity=quantity,
		reference_note=reference_note or "",
	)


@transaction.atomic
def issue_stock(product_id, quantity, user, reference_note):
	"""Decrease product stock and write an immutable issued transaction."""
	_validate_positive_quantity(quantity)

	product = Product.objects.select_for_update().get(pk=product_id)
	if quantity > product.current_quantity:
		raise ValidationError("Insufficient stock")

	product.current_quantity -= quantity
	product.save(update_fields=["current_quantity"])

	return Transaction.objects.create(
		product=product,
		user=user,
		transaction_type=Transaction.TransactionType.ISSUED,
		quantity=quantity,
		reference_note=reference_note or "",
	)


def get_low_stock_products():
	"""Return products at or below their reorder threshold."""
	return Product.objects.filter(current_quantity__lte=F("reorder_threshold"))