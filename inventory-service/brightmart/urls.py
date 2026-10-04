from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

from inventory.views import (
	CategoryViewSet,
	LowStockProductListView,
	ProductViewSet,
	SupplierViewSet,
)
from transactions.views import TransactionViewSet, StockIssueAPIView, StockReceiveAPIView


router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/transactions/receive/', StockReceiveAPIView.as_view(), name='stock-receive'),
    path('api/transactions/issue/', StockIssueAPIView.as_view(), name='stock-issue'),
    path('api/products/low-stock/', LowStockProductListView.as_view(), name='low-stock-products'),
    path('api/', include(router.urls)),
]
