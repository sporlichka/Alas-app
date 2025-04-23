from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.exceptions import ValidationError
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from knox.views import LogoutView as KnoxLogoutView
from knox.views import LogoutAllView as KnoxLogoutAllView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .permissions import IsAdminOrReadOnly, IsAdminOnly, IsConversationOwnerOrAdmin, IsUserOrAdmin
from rest_framework.decorators import action
from .services.cart_service import CartService
from .services.stripe_service import StripeService
from .services.purchase_service import PurchaseService
from .services.delivery_service import DeliveryService
from .services.email_service import EmailService
from .serializers import UserSerializer, ProductSerializer, ConversationSerializer, MessageSerializer ,PasswordResetConfirmSerializer, PasswordResetRequestSerializer,EmailSerializer, UserUpdateSerializer,PaymentModeTypeSerializer, DeliverySerializer,DeliveryHistorySerializer, CartSerializer, CartDetailSerializer, PurchaseSerializer,PurchaseDetailSerializer, ShoeModelTypeSerializer,BrandTypeSerializer,SizeTypeSerializer, ColorTypeSerializer
from .models import  Product, Cart,CartDetail,CustomUser, Purchase, Conversation, Message, PaymentModeType, DeliveryStatusType, Delivery,DeliveryHistory, ShoeModelType, BrandType,SizeType,ColorType
from knox.settings import knox_settings
from datetime import datetime, timezone
import random
from django_filters.rest_framework import DjangoFilterBackend
from .utils.filters import ProductFilter
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from datetime import datetime, timezone


class LoginView(KnoxLoginView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid username or password"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = serializer.validated_data["user"]
            login(request, user)
            user_serializer = UserSerializer(user)
            token_instance, token = AuthToken.objects.create(user)
            isAdmin = request.user.is_staff
            expiration_date = token_instance.expiry
            expires_in = (expiration_date - datetime.now(timezone.utc)).total_seconds()

            return Response(
                {"user": user_serializer.data, "token": token, "is_staff": isAdmin, "expires_in": expires_in},
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutView(KnoxLogoutView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        try:
            response = super().post(request, format=None)
            return Response({"success": "Logged out"}, status=response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LogoutAllView(KnoxLogoutAllView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        try:
            super().post(request, format=None)
            return Response({"success": "Logged out from all sessions"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        try:
            serializer = UserSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            user_serializer = UserSerializer(user)

            return Response(
                {"user": user_serializer.data,"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user 
            serializer = UserUpdateSerializer(user) 
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        try:
            user = request.user
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
   
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def get_random_product_excluding_id(self, request):
        try:
            current_product_id = request.query_params.get('current_product_id')
            queryset = self.get_queryset().exclude(id=current_product_id)
            random_product = random.choice(queryset) if queryset.exists() else None
        
            if random_product:
                serializer = self.get_serializer(random_product)
                return Response(serializer.data)
            else:
                return Response({'error': 'No products available excluding the current one.'}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    
    
    @action(detail=False, methods=["post"])
    def create_cart(self, request):
        try:
            cart, created = CartService.create_cart(request.user)
            if created:
                serializer = CartSerializer(cart)
                response_data = {
                "message": " Cart added successfully",
                "cart": serializer.data
            }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Cart already exists"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["delete"])
    def delete_cart(self, request):
        try:
            CartService.delete_cart(request.user)
            return Response({"message": "Cart deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["post"])
    def add_product(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)
        try:
            CartService.add_product_to_cart(request.user, product_id, quantity)
            cart = Cart.objects.get(user=request.user)
            serializer = CartSerializer(cart)
            response_data = {
                "message": "Product added to cart successfully",
                "cart": serializer.data
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def get_items(self, request):
        try:
            cart, _ = CartService.create_cart(request.user)
            items = CartDetail.objects.filter(cart=cart)
            serializer = CartDetailSerializer(items, many=True)
            cart_response = {
                "cart_id": cart.id,
                "created_date": cart.date,
                "email": cart.user.email,
                "items": serializer.data,
            }
            return Response(cart_response)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["delete"])
    def remove_item(self, request):
        item_id = request.data.get("item_id")
        try:
            CartService.remove_item_from_cart(item_id)
            return Response({"message": "Item removed from cart successfully"},status=status.HTTP_200_OK)
        except CartDetail.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
        
    def destroy(self, request, *args, **kwargs):
        return Response(
            {"error": "Direct delete not allowed. Use the delete_cart action instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
        
class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def user_purchases(self, request):
        try:
            purchases = Purchase.objects.filter(user=request.user)
            serializer = PurchaseSerializer(purchases, many=True)
            return Response(serializer.data)
        except Purchase.DoesNotExist:
            return Response(
                {"error": "No purchases found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def confirm_purchase(self, request):
        user = request.user
        payment_method_id = request.data.get('Payment_method_id')

        if not payment_method_id:
            return Response({'error': 'Payment method ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=user)
            total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
            payment_method = PaymentModeType.objects.get(id=payment_method_id)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found for the user'}, status=status.HTTP_404_NOT_FOUND)
        except PaymentModeType.DoesNotExist:
            return Response({'error': 'Invalid payment method ID'}, status=status.HTTP_400_BAD_REQUEST)

        if payment_method.description == "Stripe":  
            try:
                with transaction.atomic():
                    amount_in_cents = int(total_amount * 100)
                    payment_intent = StripeService.create_payment_intent(amount=amount_in_cents)
                    payment_method = 'pm_card_visa' 
                    StripeService.confirm_payment_intent(payment_intent['id'], payment_method)

                    purchase, purchase_details = PurchaseService.confirm_purchase(user, cart, payment_method_id)
                    delivery = DeliveryService.create_delivery(purchase)

                    details_serializer = PurchaseDetailSerializer(purchase_details, many=True)
                    delivery_serializer = DeliverySerializer(delivery)

                    response_data = {
                        "message": "Purchase completed successfully",
                        "details": details_serializer.data,
                        "delivery": delivery_serializer.data,
                        "payment_intent": payment_intent['id'],
                        "payment_method": payment_method
                    }

                    return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        elif payment_method.description == "Cash":
            try:
                with transaction.atomic():
                    amount_in_cents = int(total_amount * 100)

                    purchase, purchase_details = PurchaseService.confirm_purchase(user, cart, payment_method_id)
                    delivery = DeliveryService.create_delivery(purchase)

                    details_serializer = PurchaseDetailSerializer(purchase_details, many=True)
                    delivery_serializer = DeliverySerializer(delivery)

                    response_data = {
                        "message": "Purchase completed successfully",
                        "details": details_serializer.data,
                        "delivery": delivery_serializer.data,
                        "payment_intent": "cash",
                        "payment_method": payment_method.description
                    }

                    return Response(response_data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Unsupported payment method'}, status=status.HTTP_400_BAD_REQUEST)

class ChangeDeliveryStatusAPIView(APIView):
    permission_classes = [IsAdminOnly]

    def patch(self, request):
        try:
            purchase_id = request.data.get('purchase_id')
            status_description = request.data.get('status_description')

            if not purchase_id:
                return Response({'error': 'purchase_id is requered'}, status=status.HTTP_400_BAD_REQUEST)
            if not status_description:
                return Response({'error': 'status_description is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if status_description not in dict(DeliveryStatusType.STATUS_CHOICES):
                return Response({'error': 'Invalid status description,Choices avaibles Pending,Transit,Completed'}, status=status.HTTP_400_BAD_REQUEST)
            
            purchase = Purchase.objects.get(id=purchase_id)
            updated_delivery, delivery_history = DeliveryService.update_delivery_status_with_history(purchase, status_description)

            return Response({
                'message': 'Delivery status updated successfully',
                'delivery': DeliverySerializer(updated_delivery).data,
                'delivery_history': DeliveryHistorySerializer(delivery_history, many=True).data
            }, status=status.HTTP_200_OK)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def get(self, request):
        try:
            deliveries= Delivery.objects.all()
            if not deliveries:
                return Response ({"error": "No deliveries founded "},
                status=status.HTTP_404_NOT_FOUND)
            
            deliveries_all = DeliverySerializer(deliveries, many=True)
            return Response(
                 deliveries_all.data,
               )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ShoeModelTypeViewSet(viewsets.ModelViewSet):
    queryset = ShoeModelType.objects.all()
    serializer_class = ShoeModelTypeSerializer
    permission_classes = [IsAdminOrReadOnly]

class BrandTypeViewSet(viewsets.ModelViewSet):
    queryset = BrandType.objects.all()
    serializer_class = BrandTypeSerializer
    permission_classes = [IsAdminOrReadOnly]

class SizeTypeViewSet(viewsets.ModelViewSet):
    queryset = SizeType.objects.all()
    serializer_class = SizeTypeSerializer
    permission_classes = [IsAdminOrReadOnly]

class ColorTypeViewSet(viewsets.ModelViewSet):
    queryset = ColorType.objects.all()
    serializer_class = ColorTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
class PaymentModeTypeViewSet(viewsets.ModelViewSet):
    queryset = PaymentModeType.objects.all()
    serializer_class = PaymentModeTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
class SendEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.validated_data['subject']
            message = serializer.validated_data['message']
            to_email = serializer.validated_data['to_email']
            
            email_service = EmailService(subject, message, to_email)
            try:
                result = email_service.send_email()
                if result['status'] == 'success':
                    return Response({'status': 'success'}, status=status.HTTP_200_OK)
                else:
                    return Response({'status': 'error', 'message': result.get('message')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.filter(email=email).first()
            if user:
                try:
                    token = default_token_generator.make_token(user)
                    uid = urlsafe_base64_encode(force_bytes(user.pk))
                    reset_link = f"http://localhost:4200/reset-password/{uid}/{token}/"
                    message = f"Click the link to reset your password: {reset_link}"
                    
                    email_message = EmailMessage(
                        'Password Reset Request',
                        message,
                        'Full@reset.com',
                        [email]
                    )
                    email_message.send()
                except Exception as e:
                    return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'status': 'success', 'message': 'If an account with that email exists, a reset link has been sent.'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uid, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            new_password = serializer.validated_data.get('new_password')
            confirm_password = serializer.validated_data.get('confirm_password')

            if not uid or not token:
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                uid = urlsafe_base64_decode(uid).decode()
                user = CustomUser.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
                return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

            if not default_token_generator.check_token(user, token):
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

            if new_password != confirm_password:
                return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user.set_password(new_password)
                user.save()
            except Exception as e:
                return Response({'error': 'Error resetting password', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'success': 'Password has been reset'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'GET']:
            self.permission_classes = [IsUserOrAdmin]
        elif self.request.method in ['PUT', 'PATCH', 'DELETE']:
            self.permission_classes = [IsConversationOwnerOrAdmin]
        else:
            self.permission_classes = [IsAdminOnly]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOnly])
    def close(self, request, pk=None):
        conversation = self.get_object()
        try:
            if conversation.closed_at:
                return Response({"detail": "Conversation already closed."}, status=status.HTTP_400_BAD_REQUEST)
            conversation.closed_at = datetime.now(timezone.utc)
            conversation.open = False
            conversation.save()
            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Error closing conversation', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'GET']:
            self.permission_classes = [IsUserOrAdmin]
        elif self.request.method in ['PUT', 'PATCH', 'DELETE']:
            self.permission_classes = [IsAdminOnly]
        else:
            self.permission_classes = [IsAdminOrReadOnly]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        queryset = Message.objects.all()
        conversation_id = self.request.query_params.get('conversation', None)
        if conversation_id is not None:
            queryset = queryset.filter(conversation_id=conversation_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)