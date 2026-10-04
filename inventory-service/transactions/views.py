from django.core.exceptions import ValidationError
from django.db import IntegrityError
from rest_framework import status, viewsets
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.serializers import StockIssueSerializer, StockReceiveSerializer
from inventory.services import issue_stock, receive_stock
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer
from users.permissions import IsInventoryStaffOrManager


def _validation_detail(error):
	if isinstance(error, ValidationError):
		return error.messages
	return [str(error)]


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = Transaction.objects.select_related("product", "user").all()
	serializer_class = TransactionSerializer
	permission_classes = [IsAuthenticated, IsInventoryStaffOrManager]


class StockReceiveAPIView(CreateAPIView):
	serializer_class = StockReceiveSerializer
	permission_classes = [IsAuthenticated, IsInventoryStaffOrManager]

	def create(self, request, *args, **kwargs):
		if not request.user.is_authenticated:
			return Response(
				{"detail": "Authentication credentials were not provided."},
				status=status.HTTP_401_UNAUTHORIZED,
			)
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		try:
			transaction_obj = receive_stock(
				product_id=serializer.validated_data["product_id"].pk,
				quantity=serializer.validated_data["quantity"],
				user=request.user,
				supplier_id=serializer.validated_data["supplier_id"].pk,
				reference_note=serializer.validated_data.get("reference_note", ""),
			)
		except (ValidationError, IntegrityError) as error:
			return Response({"detail": _validation_detail(error)}, status=status.HTTP_400_BAD_REQUEST)
		output_serializer = TransactionSerializer(transaction_obj)
		return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class StockIssueAPIView(CreateAPIView):
	serializer_class = StockIssueSerializer
	permission_classes = [IsAuthenticated, IsInventoryStaffOrManager]

	def create(self, request, *args, **kwargs):
		if not request.user.is_authenticated:
			return Response(
				{"detail": "Authentication credentials were not provided."},
				status=status.HTTP_401_UNAUTHORIZED,
			)
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		try:
			transaction_obj = issue_stock(
				product_id=serializer.validated_data["product_id"].pk,
				quantity=serializer.validated_data["quantity"],
				user=request.user,
				reference_note=serializer.validated_data.get("reference_note", ""),
			)
		except (ValidationError, IntegrityError) as error:
			return Response({"detail": _validation_detail(error)}, status=status.HTTP_400_BAD_REQUEST)
		output_serializer = TransactionSerializer(transaction_obj)
		return Response(output_serializer.data, status=status.HTTP_201_CREATED)
