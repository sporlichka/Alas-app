from rest_framework import serializers
from .models import User, Product, Category, Order, OrderItem
from rest_framework.authtoken.models import Token

# Basic serializers using serializers.Serializer
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class CategoryStatsSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    product_count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=10, decimal_places=2)

# Model serializers using serializers.ModelSerializer
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'created_at']
        read_only_fields = ['created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_amount', 'created_at', 'items']
        read_only_fields = ['user', 'total_amount', 'created_at', 'items']
    
    def get_items(self, obj):
        items = OrderItem.objects.filter(order=obj)
        return OrderItemSerializer(items, many=True).data

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class UserSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin', 'token']
        extra_kwargs = {'password': {'write_only': True}}
    
    def get_token(self, obj):
        token, created = Token.objects.get_or_create(user=obj)
        return token.key