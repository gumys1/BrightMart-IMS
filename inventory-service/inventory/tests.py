from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from inventory.models import Category, Product, Supplier
from inventory.services import get_low_stock_products, issue_stock, receive_stock
from transactions.models import Transaction as InventoryTransaction
from users.models import User


class InventoryStockTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(
			username="stock-manager",
			password="test-password",
			full_name="Stock Manager",
		)
		self.category = Category.objects.create(category_name="Test category")
		self.supplier = Supplier.objects.create(
			supplier_name="Test supplier",
			contact_person="Test contact",
			email="supplier@example.com",
			phone="555-0100",
			address="Test address",
		)
		self.product = Product.objects.create(
			sku="TEST-001",
			name="Test product",
			category=self.category,
			supplier=self.supplier,
			unit_price="10.00",
			current_quantity=10,
			reorder_threshold=5,
		)

	def test_UT01_stock_receipt_increases_quantity(self):
		receive_stock(
			product_id=self.product.pk,
			quantity=5,
			user=self.user,
			supplier_id=self.supplier.pk,
			reference_note="Delivery",
		)

		self.product.refresh_from_db()
		self.assertEqual(self.product.current_quantity, 15)

	def test_UT02_stock_issue_decreases_quantity(self):
		issue_stock(
			product_id=self.product.pk,
			quantity=4,
			user=self.user,
			reference_note="Customer order",
		)

		self.product.refresh_from_db()
		self.assertEqual(self.product.current_quantity, 6)

	def test_UT03_insufficient_stock_prevention(self):
		with self.assertRaises(ValidationError):
			issue_stock(
				product_id=self.product.pk,
				quantity=11,
				user=self.user,
				reference_note="Too large",
			)

		self.product.refresh_from_db()
		self.assertEqual(self.product.current_quantity, 10)
		self.assertEqual(InventoryTransaction.objects.count(), 0)

	def test_UT04_invalid_negative_quantity_validation(self):
		for quantity in (0, -1):
			with self.subTest(quantity=quantity):
				with self.assertRaises(ValidationError):
					issue_stock(
						product_id=self.product.pk,
						quantity=quantity,
						user=self.user,
						reference_note="Invalid quantity",
					)

		self.product.refresh_from_db()
		self.assertEqual(self.product.current_quantity, 10)
		self.assertEqual(InventoryTransaction.objects.count(), 0)

	def test_UT05_low_stock_threshold_detection(self):
		self.product.current_quantity = self.product.reorder_threshold
		self.product.save(update_fields=["current_quantity"])

		low_stock_products = get_low_stock_products()

		self.assertIn(self.product, low_stock_products)

	def test_UT06_transaction_logging(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post(
			"/api/transactions/issue/",
			{
				"product_id": self.product.pk,
				"quantity": 2,
				"notes": "Customer order",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		transaction = InventoryTransaction.objects.get(product=self.product)
		self.assertEqual(transaction.quantity, 2)
		self.assertEqual(
			transaction.transaction_type,
			InventoryTransaction.TransactionType.ISSUED,
		)
		self.assertEqual(transaction.user, self.user)
