
from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import (
    CustomUser, Conversation, Message, ColorType, BrandType, SizeType, 
    ShoeModelType, Product, Cart, CartDetail, PaymentModeType, 
    Purchase, PurchaseDetail, DeliveryStatusType, Delivery, DeliveryHistory
)

class CustomUserTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123",
            identification_number=123456789,
            phone="1234567890",
            adress="123 Main St"
        )

    def test_user_str_method(self):
        self.assertEqual(str(self.user), "test@example.com")

    def test_user_email_unique(self):
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(
                email="test@example.com", 
                username="anotheruser", 
                password="password123"
            )

class ConversationTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.conversation = Conversation.objects.create(
            name="Test Conversation",
            user=self.user
        )

    def test_conversation_str_method(self):
        self.assertEqual(str(self.conversation), f"Conversation with {self.user} ")

class MessageTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.conversation = Conversation.objects.create(
            name="Test Conversation",
            user=self.user
        )
        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="Hello World"
        )

    def test_message_str_method(self):
        self.assertEqual(str(self.message), f"Message from {self.user} on {self.message.created_at}")

class ColorTypeTests(TestCase):
    def setUp(self):
        self.color = ColorType.objects.create(description="Red")

    def test_color_str_method(self):
        self.assertEqual(str(self.color), "Red")

class BrandTypeTests(TestCase):
    def setUp(self):
        self.brand = BrandType.objects.create(description="Nike")

    def test_brand_str_method(self):
        self.assertEqual(str(self.brand), "Nike")

class SizeTypeTests(TestCase):
    def setUp(self):
        self.size = SizeType.objects.create(size="M")

    def test_size_str_method(self):
        self.assertEqual(str(self.size), "M")

class ShoeModelTypeTests(TestCase):
    def setUp(self):
        self.model = ShoeModelType.objects.create(model="Air Max")

    def test_model_str_method(self):
        self.assertEqual(str(self.model), "Air Max")

class ProductTests(TestCase):
    def setUp(self):
        self.model = ShoeModelType.objects.create(model="Air Max")
        self.brand = BrandType.objects.create(description="Nike")
        self.color = ColorType.objects.create(description="Red")
        self.size = SizeType.objects.create(size="M")
        self.product = Product.objects.create(
            model=self.model,
            brand=self.brand,
            color=self.color,
            size=self.size,
            price=100.0,
            stock=10,
            image="image.jpg",
            detail="A nice pair of shoes"
        )

    def test_product_str_method(self):
        self.assertEqual(str(self.product), f"{self.model} - {self.size} - {self.color}")

class CartTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.cart = Cart.objects.create(user=self.user)

    def test_cart_str_method(self):
        self.assertEqual(str(self.cart), f"{self.user.email} - {self.cart.date}")

class CartDetailTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.cart = Cart.objects.create(user=self.user)
        self.product = Product.objects.create(
            model=ShoeModelType.objects.create(model="Air Max"),
            brand=BrandType.objects.create(description="Nike"),
            color=ColorType.objects.create(description="Red"),
            size=SizeType.objects.create(size="M"),
            price=100.0,
            stock=10,
            image="image.jpg",
            detail="A nice pair of shoes"
        )
        self.cart_detail = CartDetail.objects.create(
            quantity=2,
            cart=self.cart,
            product=self.product
        )

    def test_cart_detail_str_method(self):
        self.assertEqual(
            str(self.cart_detail),
            f"Cart id: {self.cart.id} - Product: {self.product} - Quantity: {self.cart_detail.quantity}"
        )

class PaymentModeTypeTests(TestCase):
    def setUp(self):
        self.payment_mode = PaymentModeType.objects.create(description="Credit Card")

    def test_payment_mode_str_method(self):
        self.assertEqual(str(self.payment_mode), "Credit Card")

class PurchaseTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.payment_mode = PaymentModeType.objects.create(description="Credit Card")
        self.purchase = Purchase.objects.create(
            invoice_number="INV123",
            user=self.user,
            total=200,
            payment_type=self.payment_mode
        )

    def test_purchase_str_method(self):
        self.assertEqual(str(self.purchase), f"{self.purchase.invoice_number} - {self.purchase.date}")

class PurchaseDetailTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.product = Product.objects.create(
            model=ShoeModelType.objects.create(model="Air Max"),
            brand=BrandType.objects.create(description="Nike"),
            color=ColorType.objects.create(description="Red"),
            size=SizeType.objects.create(size="M"),
            price=100.0,
            stock=10,
            image="image.jpg",
            detail="A nice pair of shoes"
        )
        self.purchase = Purchase.objects.create(
            invoice_number="INV123",
            user=self.user,
            total=100,
            payment_type=PaymentModeType.objects.create(description="Credit Card")
        )
        self.purchase_detail = PurchaseDetail.objects.create(
            quantity=1,
            purchase=self.purchase,
            product=self.product,
            price=100.0
        )

    def test_purchase_detail_str_method(self):
        self.assertEqual(
            str(self.purchase_detail),
            f"Purchase id: {self.purchase.id} - Product: {self.product} - Quantity: {self.purchase_detail.quantity}"
        )

class DeliveryStatusTypeTests(TestCase):
    def setUp(self):
        self.delivery_status = DeliveryStatusType.objects.create(description="Pending")

    def test_delivery_status_str_method(self):
        self.assertEqual(str(self.delivery_status), f"Pending - {self.delivery_status.change_date}")

class DeliveryTests(TestCase):
    def setUp(self):
        self.purchase = Purchase.objects.create(
            invoice_number="INV123",
            user=CustomUser.objects.create_user(
                email="test@example.com",
                username="testuser",
                password="password123"
            ),
            total=100
        )
        self.delivery_status = DeliveryStatusType.objects.create(description="Pending")
        self.delivery = Delivery.objects.create(
            purchase=self.purchase,
            tracking_number="TRACK123",
            delivery_address="123 Main St",
            estimated_date="2024-08-01",
            delivery_date=None,
            delivery_status=self.delivery_status
        )

    def test_delivery_str_method(self):
        self.assertEqual(str(self.delivery), f"Tracking: {self.delivery.tracking_number}")

class DeliveryHistoryTests(TestCase):
    def setUp(self):
        self.delivery = Delivery.objects.create(
            purchase=Purchase.objects.create(
                invoice_number="INV123",
                user=CustomUser.objects.create_user(
                    email="test@example.com",
                    username="testuser",
                    password="password123"
                ),
                total=100
            ),
            tracking_number="TRACK123",
            delivery_address="123 Main St",
            estimated_date="2024-08-01",
            delivery_date=None,
            delivery_status=DeliveryStatusType.objects.create(description="Pending")
        )
        self.delivery_history = DeliveryHistory.objects.create(
            delivery=self.delivery,
            description="Delivered to local courier"
        )

    def test_delivery_history_str_method(self):
        self.assertEqual(
            str(self.delivery_history),
            f"{self.delivery} - {self.delivery_history.description} - {self.delivery_history.change_date}"
        )
