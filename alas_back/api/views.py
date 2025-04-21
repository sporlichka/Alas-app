from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from .models import Product, Order, Category, User
from .serializers import (
    ProductSerializer, OrderSerializer, UserLoginSerializer, 
    UserSerializer, CategoryStatsSerializer
)

# Function-Based Views (FBV)
@api_view(['POST'])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    request.auth.delete()
    logout(request)
    return Response({'message': 'Successfully logged out'})

# Class-Based Views (CBV) using APIView
class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admin users can create products'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self, request, pk):
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admin users can update products'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        product = self.get_object(pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admin users can delete products'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # In a real app, we'd have more complex order creation logic
        # For simplicity, we'll just create an order with one product
        
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product = get_object_or_404(Product, pk=product_id)
        
        if product.stock < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total amount
        total_amount = product.price * quantity
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='P'
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=product.price
        )
        
        # Update product stock
        product.stock -= quantity
        product.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CategoryStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Count, Sum
        categories = Category.objects.annotate(
            product_count=Count('products'),
            total_value=Sum('products__price')
        )
        serializer = CategoryStatsSerializer(categories, many=True)
        return Response(serializer.data)