from django.shortcuts import get_object_or_404
from ..models import Cart, CartDetail, Product


class CartService:

    @staticmethod
    def create_cart(user):
        cart, created = Cart.objects.get_or_create(user=user)
        return cart, created

    @staticmethod
    def delete_cart(user):
        cart = get_object_or_404(Cart, user=user)
        cart_items = CartDetail.objects.filter(cart=cart)
        for cart_item in cart_items:
            product = cart_item.product
            product.stock += cart_item.quantity
            product.save()
        cart.delete()

    @staticmethod
    def add_product_to_cart(user, product_id, quantity):
        cart, _ = Cart.objects.get_or_create(user=user)
        product = get_object_or_404(Product, pk=product_id)

        if product.stock < quantity:
            raise ValueError(f"Insufficient stock for {product.model}")

        cart_item, created = CartDetail.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": quantity}
        )

        if not created:

            new_quantity = cart_item.quantity + quantity
            if product.stock >= new_quantity:
                cart_item.quantity = new_quantity
                cart_item.save()
            else:
                raise ValueError(
                    f"Insufficient stock to increase quantity of {product.model}"
                )
        else:
            new_quantity = quantity

    @staticmethod
    def remove_item_from_cart(item_id):
        item = get_object_or_404(CartDetail, id=item_id)
        product = item.product

        if item.quantity > 1:
            item.quantity -= 1
            item.save()
        else:

            product.stock += item.quantity
            product.save()
            item.delete()
