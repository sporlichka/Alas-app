from rest_framework import serializers
from .models import *
from django.core.validators import MinLengthValidator, EmailValidator


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "phone",
            "identification_number",
            "is_staff",
            "adress"
        ]
        extra_kwargs = {
            "password": {"write_only": True}, 
            "id": {"read_only": True}, 
        }
    def create(self, validated_data):
       
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            identification_number=validated_data.get("identification_number"),
            phone=validated_data.get("phone"),
            adress=validated_data.get("adress"),
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    identification_number = serializers.CharField(
        min_length=6,
        validators=[MinLengthValidator(6)]
    )
    phone= serializers.CharField(
        min_length=6,
        validators=[MinLengthValidator(6)]
    )
    adress = serializers.CharField(
        min_length=6,
        validators=[MinLengthValidator(6)]
    )
  
    class Meta:
        model = CustomUser
        fields = ['identification_number', 'phone', 'adress'] 
        
    def update(self, instance, validated_data):
       
        allowed_fields = ['identification_number', 'phone', 'adress']

        for field in allowed_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance
        
class ShoeModelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoeModelType
        fields = ["id", "model"]
class BrandTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandType
        fields = ["id", "description"]

class ColorTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorType
        fields = ["id", "description"]

class SizeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizeType
        fields = ["id", "size"]


class ProductSerializer(serializers.ModelSerializer):
    model = serializers.PrimaryKeyRelatedField(queryset=ShoeModelType.objects.all())
    brand = serializers.PrimaryKeyRelatedField(queryset=BrandType.objects.all())
    color = serializers.PrimaryKeyRelatedField(queryset=ColorType.objects.all())
    size = serializers.PrimaryKeyRelatedField(queryset=SizeType.objects.all())

    class Meta:
        model = Product
        fields = [
            "id",
            "price",
            "stock",
            "image",
            "detail",
            "model",
            "brand",
            "size",
            "color"
        ]
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock must be a non-negative integer.")
        return value
    
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['brand'] = BrandTypeSerializer(instance.brand).data if instance.brand else None
        representation['model'] = ShoeModelTypeSerializer(instance.model).data if instance.model else None
        representation['size'] = SizeTypeSerializer(instance.size).data if instance.size else None
        representation['color'] = ColorTypeSerializer(instance.color).data if instance.color else None
        return representation
    
class CartDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    cart = serializers.PrimaryKeyRelatedField(queryset=Cart.objects.all()) 
    
    class Meta:
        model = CartDetail
        fields = [
            "id",
            "quantity",
            "product",
            "cart"
        ]


class CartSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items = CartDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = "__all__"

class DeliveryStatusTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryStatusType
        fields = ["id", "description", "change_date"]


class DeliverySerializer(serializers.ModelSerializer):
    delivery_status = serializers.SlugRelatedField(slug_field='description', queryset=DeliveryStatusType.objects.all())

    class Meta:
        model = Delivery
        fields = ["id", "purchase", "tracking_number", "delivery_address", "estimated_date", "delivery_date", "delivery_status",]

class PurchaseDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    purchase = serializers.PrimaryKeyRelatedField(queryset=Purchase.objects.all()) 
    

    class Meta:
        model = PurchaseDetail
        fields = ["id",
                  "product", 
                  "quantity", 
                  "price",
                  "purchase"
        ]
        
class PurchaseSerializer(serializers.ModelSerializer):
    user=UserSerializer()
    payment_type=serializers.PrimaryKeyRelatedField(queryset=PaymentModeType.objects.all())
    details= PurchaseDetailSerializer(many=True, read_only=True)
    delivery= DeliverySerializer()
    

    class Meta:
        model = Purchase
        fields = [
            "id",
            "invoice_number",
            "date",
            "user",
            "total",
            "details",
            "payment_type",
            "delivery"
           
        ]
        
class DeliveryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryHistory
        fields = ["id", "description", "change_date"]   

class PaymentModeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentModeType
        fields = ["id", "description"] 
        
class EmailSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=255)
    message = serializers.CharField()
    to_email = serializers.EmailField()  
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):

    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)  

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'conversation']
    
    def validate(self, data):
        conversation = data.get('conversation')
        if conversation and not Conversation.objects.filter(id=conversation.id).exists():
            raise serializers.ValidationError("The conversation does not exist.")
        if conversation and conversation.closed_at:
            raise serializers.ValidationError("Cannot add a message to a closed conversation.")
        return data

class ConversationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) 
    messages = MessageSerializer(many=True, read_only=True)  

    class Meta:
        model = Conversation
        fields = ['id','name', 'user', 'created_at', 'closed_at', 'messages', 'open']