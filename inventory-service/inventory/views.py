from rest_framework import viewsets
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from inventory.models import Category, Product, Supplier
from inventory.serializers import CategorySerializer, ProductSerializer, SupplierSerializer
from inventory.services import get_low_stock_products
from users.permissions import IsInventoryManager, IsInventoryStaffOrManager


class CategoryViewSet(viewsets.ModelViewSet):
	queryset = Category.objects.all()
	serializer_class = CategorySerializer
	permission_classes = [IsAuthenticated, IsInventoryManager]


class SupplierViewSet(viewsets.ModelViewSet):
	queryset = Supplier.objects.all()
	serializer_class = SupplierSerializer
	permission_classes = [IsAuthenticated, IsInventoryManager]


class ProductViewSet(viewsets.ModelViewSet):
	queryset = Product.objects.select_related("category", "supplier").all()
	serializer_class = ProductSerializer

	def get_permissions(self):
		if self.action in {"create", "update", "partial_update", "destroy"}:
			return [IsAuthenticated(), IsInventoryManager()]
		return [IsAuthenticated(), IsInventoryStaffOrManager()]


class LowStockProductListView(ListAPIView):
	serializer_class = ProductSerializer
	permission_classes = [IsAuthenticated, IsInventoryManager]

	def get_queryset(self):
		return get_low_stock_products().select_related("category", "supplier")
