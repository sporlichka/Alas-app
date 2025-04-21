from django.urls import path
from .views import (
    user_login, user_logout,
    ProductListCreateView, ProductDetailView,
    OrderCreateView, CategoryStatsView
)

urlpatterns = [
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    
    path('products/', ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('categories/stats/', CategoryStatsView.as_view(), name='category-stats'),
]
