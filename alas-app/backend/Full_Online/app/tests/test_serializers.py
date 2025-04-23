from django.test import TestCase
from app.models import (
    CustomUser, PaymentModeType, DeliveryStatusType, Delivery,
    Product, ShoeModelType, BrandType, ColorType, SizeType,
    Cart, CartDetail, Purchase, PurchaseDetail, DeliveryHistory,
    Message, Conversation
)
from app.serializers import (
    UserSerializer, UserUpdateSerializer, ShoeModelTypeSerializer,
    BrandTypeSerializer, ColorTypeSerializer, SizeTypeSerializer,
    ProductSerializer, CartDetailSerializer, CartSerializer,
    DeliveryStatusTypeSerializer, DeliverySerializer,
    PurchaseDetailSerializer, PurchaseSerializer,
    DeliveryHistorySerializer, PaymentModeTypeSerializer,
    EmailSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, MessageSerializer, ConversationSerializer
)

class UserSerializerTests(TestCase):
    
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'password123',
            'identification_number': '123456',
            'phone': '1234567890',
            'adress': '123 Test St'
        }
    
    def test_user_serializer_create(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, self.user_data['username'])
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_user_update_serializer(self):
        user = CustomUser.objects.create_user(**self.user_data)
        updated_data = {
            'identification_number': '654321',
            'phone': '0987654321',
            'adress': '321 Test St'
        }
        serializer = UserUpdateSerializer(user, data=updated_data, partial=True)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.identification_number, updated_data['identification_number'])
        self.assertEqual(user.phone, updated_data['phone'])
        self.assertEqual(user.adress, updated_data['adress'])

class ShoeModelTypeSerializerTests(TestCase):

    def setUp(self):
        self.shoe_model = ShoeModelType.objects.create(model='Running')

    def test_shoe_model_type_serializer(self):
        serializer = ShoeModelTypeSerializer(self.shoe_model)
        self.assertEqual(serializer.data['model'], 'Running')

class BrandTypeSerializerTests(TestCase):

    def setUp(self):
        self.brand = BrandType.objects.create(description='Nike')

    def test_brand_type_serializer(self):
        serializer = BrandTypeSerializer(self.brand)
        self.assertEqual(serializer.data['description'], 'Nike')

class ColorTypeSerializerTests(TestCase):

    def setUp(self):
        self.color = ColorType.objects.create(description='Red')

    def test_color_type_serializer(self):
        serializer = ColorTypeSerializer(self.color)
        self.assertEqual(serializer.data['description'], 'Red')

class SizeTypeSerializerTests(TestCase):

    def setUp(self):
        self.size = SizeType.objects.create(size='L')

    def test_size_type_serializer(self):
        serializer = SizeTypeSerializer(self.size)
        self.assertEqual(serializer.data['size'], 'L')

class ProductSerializerTests(TestCase):

    def setUp(self):
        self.shoe_model = ShoeModelType.objects.create(model='Running')
        self.brand = BrandType.objects.create(description='Nike')
        self.color = ColorType.objects.create(description='Red')
        self.size = SizeType.objects.create(size='L')
        self.product = Product.objects.create(
            price=100.0,
            stock=10,
            image='image_url',
            detail='Product detail',
            model=self.shoe_model,
            brand=self.brand,
            color=self.color,
            size=self.size
        )

    def test_product_serializer(self):
        serializer = ProductSerializer(self.product)
        data = serializer.data
        self.assertEqual(data['price'], 100.0)
        self.assertEqual(data['stock'], 10)
        self.assertEqual(data['image'], 'image_url')
        self.assertEqual(data['detail'], 'Product detail')
        self.assertEqual(data['brand']['description'], 'Nike')
        self.assertEqual(data['model']['model'], 'Running')
        self.assertEqual(data['color']['description'], 'Red')
        self.assertEqual(data['size']['size'], 'L')

class CartDetailSerializerTests(TestCase):

    def setUp(self):
        self.shoe_model = ShoeModelType.objects.create(model='Running')
        self.brand = BrandType.objects.create(description='Nike')
        self.color = ColorType.objects.create(description='Red')
        self.size = SizeType.objects.create(size='L')
        self.product = Product.objects.create(
            price=100.0,
            stock=10,
            image='image_url',
            detail='Product detail',
            model=self.shoe_model,
            brand=self.brand,
            color=self.color,
            size=self.size
        )
        self.cart = Cart.objects.create(user=CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123'))
        self.cart_detail = CartDetail.objects.create(
            product=self.product,
            cart=self.cart,
            quantity=2
        )

    def test_cart_detail_serializer(self):
        serializer = CartDetailSerializer(self.cart_detail)
        data = serializer.data
        self.assertEqual(data['quantity'], 2)
        self.assertEqual(data['product']['price'], 100.0)
        self.assertEqual(data['cart'], self.cart.id)

class CartSerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.cart = Cart.objects.create(user=self.user)
        self.product = Product.objects.create(
            price=100.0,
            stock=10,
            image='image_url',
            detail='Product detail',
            model=ShoeModelType.objects.create(model='Running'),
            brand=BrandType.objects.create(description='Nike'),
            color=ColorType.objects.create(description='Red'),
            size=SizeType.objects.create(size='L')
        )
        CartDetail.objects.create(
            product=self.product,
            cart=self.cart,
            quantity=2
        )

    def test_cart_serializer(self):
        serializer = CartSerializer(self.cart)
        data = serializer.data
        self.assertEqual(data['user_email'], self.user.email)
        self.assertEqual(len(data['items']), 1)  # Assuming only one CartDetail is added

class DeliveryStatusTypeSerializerTests(TestCase):

    def setUp(self):
        self.status = DeliveryStatusType.objects.create(description='Completed')

    def test_delivery_status_type_serializer(self):
        serializer = DeliveryStatusTypeSerializer(self.status)
        self.assertEqual(serializer.data['description'], 'Completed')

class DeliverySerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.purchase = Purchase.objects.create(
            user=self.user,
            total=100.0,
            date='2024-07-29',
            invoice_number='INV123',
            payment_type=PaymentModeType.objects.create(description='Credit Card')
        )
        self.delivery_status = DeliveryStatusType.objects.create(description='Completed')
        self.delivery = Delivery.objects.create(
            delivery_status=self.delivery_status,
            purchase=self.purchase,
            tracking_number='TRACK123',
            delivery_address='123 Main St',
            estimated_date='2024-08-01',
            delivery_date='2024-08-02'
        )

    def test_delivery_serializer(self):
        serializer = DeliverySerializer(self.delivery)
        data = serializer.data
        self.assertEqual(data['tracking_number'], 'TRACK123')
        self.assertEqual(data['delivery_address'], '123 Main St')
        self.assertEqual(data['estimated_date'], '2024-08-01')
        self.assertEqual(data['delivery_date'], '2024-08-02')
        self.assertEqual(data['delivery_status'], self.delivery_status.description)
        self.assertEqual(data['purchase'], self.purchase.id)

class PurchaseDetailSerializerTests(TestCase):

    def setUp(self):
        self.product = Product.objects.create(
            price=100.0,
            stock=10,
            image='image_url',
            detail='Product detail',
            model=ShoeModelType.objects.create(model='Running'),
            brand=BrandType.objects.create(description='Nike'),
            color=ColorType.objects.create(description='Red'),
            size=SizeType.objects.create(size='L')
        )
        self.purchase = Purchase.objects.create(
            user=CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123'),
            total=100.0,
            date='2024-07-29',
            invoice_number='INV123',
            payment_type=PaymentModeType.objects.create(description='Credit Card')
        )
        self.purchase_detail = PurchaseDetail.objects.create(
            product=self.product,
            purchase=self.purchase,
            quantity=2,
            price=100.0
        )

    def test_purchase_detail_serializer(self):
        serializer = PurchaseDetailSerializer(self.purchase_detail)
        data = serializer.data
        self.assertEqual(data['quantity'], 2)
        self.assertEqual(data['price'], 100.0)
        self.assertEqual(data['product']['price'], 100.0)
        self.assertEqual(data['purchase'], self.purchase.id)

class PurchaseSerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.payment_type = PaymentModeType.objects.create(description='Credit Card')
        self.purchase = Purchase.objects.create(
            user=self.user,
            total=100.0,
            date='2024-07-29',
            invoice_number='INV123',
            payment_type=self.payment_type
        )
        self.delivery = Delivery.objects.create(
            delivery_status=DeliveryStatusType.objects.create(description='Completed'),
            purchase=self.purchase,
            tracking_number='TRACK123',
            delivery_address='123 Main St',
            estimated_date='2024-08-01',
            delivery_date='2024-08-02'
        )
        self.purchase_detail = PurchaseDetail.objects.create(
            product=Product.objects.create(
                price=100.0,
                stock=10,
                image='image_url',
                detail='Product detail',
                model=ShoeModelType.objects.create(model='Running'),
                brand=BrandType.objects.create(description='Nike'),
                color=ColorType.objects.create(description='Red'),
                size=SizeType.objects.create(size='L')
            ),
            purchase=self.purchase,
            quantity=2,
            price=100.0
        )

    def test_purchase_serializer(self):
        serializer = PurchaseSerializer(self.purchase)
        data = serializer.data
        self.assertEqual(data['invoice_number'], 'INV123')
        self.assertEqual(data['total'], 100.0)
        self.assertEqual(data['user']['username'], self.user.username)
        self.assertEqual(len(data['details']), 1)  # Assuming one PurchaseDetail
        self.assertEqual(data['delivery']['tracking_number'], 'TRACK123')

class DeliveryHistorySerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.delivery = Delivery.objects.create(
            delivery_status=DeliveryStatusType.objects.create(description='Completed'),
            
            purchase=Purchase.objects.create(
                user= self.user,  # Ajusta según tu caso de prueba
                total=100.0,
                date='2024-07-29',
                invoice_number='INV123',
                payment_type=None  # Ajusta según tu caso de prueba
            ),
            tracking_number='TRACK123',
            delivery_address='123 Main St',
            estimated_date='2024-08-01',
            delivery_date='2024-08-02'
        )
        self.history = DeliveryHistory.objects.create(
            description='Delivered',
            change_date='2024-08-01',
            delivery=self.delivery  # Asegúrate de asignar una instancia de Delivery
        )

    def test_delivery_history_serializer(self):
        serializer = DeliveryHistorySerializer(self.history)
        data = serializer.data
        self.assertEqual(data['description'], 'Delivered')
        self.assertEqual(data['change_date'][:10], '2024-07-30')

class PaymentModeTypeSerializerTests(TestCase):

    def setUp(self):
        self.payment_mode = PaymentModeType.objects.create(description='Credit Card')

    def test_payment_mode_type_serializer(self):
        serializer = PaymentModeTypeSerializer(self.payment_mode)
        self.assertEqual(serializer.data['description'], 'Credit Card')

class EmailSerializerTests(TestCase):

    def test_email_serializer(self):
        data = {
            'subject': 'Test Subject',
            'message': 'Test Message',
            'to_email': 'test@example.com'
        }
        serializer = EmailSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['subject'], 'Test Subject')

class PasswordResetRequestSerializerTests(TestCase):

    def test_password_reset_request_serializer(self):
        data = {'email': 'test@example.com'}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['email'], 'test@example.com')

class PasswordResetConfirmSerializerTests(TestCase):

    def test_password_reset_confirm_serializer(self):
        data = {'new_password': 'new_password123', 'confirm_password': 'new_password123'}
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['new_password'], 'new_password123')

class MessageSerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.conversation = Conversation.objects.create(user=self.user, name='Test Conversation')
        self.message = Message.objects.create(sender=self.user, content='Test Message', conversation=self.conversation)

    def test_message_serializer(self):
        serializer = MessageSerializer(self.message)
        data = serializer.data
        self.assertEqual(data['content'], 'Test Message')
        self.assertEqual(data['sender']['username'], self.user.username)

class ConversationSerializerTests(TestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        self.conversation = Conversation.objects.create(user=self.user, name='Test Conversation')
        self.message = Message.objects.create(sender=self.user, content='Test Message', conversation=self.conversation)

    def test_conversation_serializer(self):
        serializer = ConversationSerializer(self.conversation)
        data = serializer.data
        self.assertEqual(data['name'], 'Test Conversation')
        self.assertEqual(data['user']['username'], self.user.username)
        self.assertEqual(len(data['messages']), 1)  # Assuming one Message
