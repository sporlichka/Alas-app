from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import *


@admin.register(ColorType)
class ColorTypeAdmin(admin.ModelAdmin):
    list_display = ("description",)
    ordering = ("description",)


@admin.register(BrandType)
class BrandTypeAdmin(admin.ModelAdmin):
    list_display = ("description",)
    ordering = ("description",)


@admin.register(SizeType)
class SizeTypeAdmin(admin.ModelAdmin):
    list_display = ("size",)
    ordering = ("size",)


@admin.register(ShoeModelType)
class ShoeModelTypeAdmin(admin.ModelAdmin):
    list_display = ("model",)
    ordering = ("model",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "model",
        "brand",
        "color",
        "size",
        "price",
        "stock",
        "image",
        "detail",
    )
    list_filter = ("brand", "color", "size")
    search_fields = (
        "model__model",
        "brand__description",
        "color__description",
        "size__size",
    )
    ordering = ("model", "brand", "color", "size")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "date")
    search_fields = ("user__email", "date")
    ordering = ("-date",)


@admin.register(CartDetail)
class CartDetailAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity")
    list_filter = ("cart__user", "product__model")
    search_fields = ("cart__user__email", "product__model__model")
    ordering = ("cart", "product")


@admin.register(PaymentModeType)
class PaymentModeTypeAdmin(admin.ModelAdmin):
    list_display = ("description",)
    ordering = ("description",)


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "date", "user", "total", "payment_type")
    list_filter = ("date", "user", "payment_type")
    search_fields = ("invoice_number", "user__email")
    ordering = ("-date",)


@admin.register(PurchaseDetail)
class PurchaseDetailAdmin(admin.ModelAdmin):
    list_display = ("purchase", "product", "quantity", "price")
    list_filter = ("purchase__user", "product__model")
    search_fields = ("purchase__user__email", "product__model__model")
    ordering = ("purchase", "product")


@admin.register(DeliveryStatusType)
class DeliveryStatusTypeAdmin(admin.ModelAdmin):
    list_display = ("description",)
    list_filter = ("description",)
    ordering = ("description",)


@admin.register(get_user_model())
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("email", "adress")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
    list_display = ("username", "email", "is_staff", "adress")
    search_fields = ("username", "email", "adress")


@admin.register(DeliveryHistory)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("id", "description", "change_date")
    list_filter = ("description", "change_date")
    search_fields = ("description", "change_date")
    ordering = ("-change_date",)


@admin.register(Conversation)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "closed_at", "open")
    list_filter = ("user", "open")
    search_fields = ("user", "open")
    ordering = ("-created_at",)


@admin.register(Message)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "created_at", "content")
    list_filter = ("sender", "conversation")
    search_fields = ("sender", "conversation")
    ordering = ("-created_at",)
