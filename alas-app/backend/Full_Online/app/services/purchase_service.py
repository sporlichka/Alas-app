from ..models import Purchase, PurchaseDetail
from ..utils.utils import generate_invoice_number
from django.db.models import Sum, F


class PurchaseService:
    @staticmethod
    def create_purchase(user, invoice_number, payment_type_id, total):
        purchase = Purchase.objects.create(
            user=user,
            invoice_number=invoice_number,
            payment_type_id=payment_type_id,
            total=total,
        )
        return purchase

    @staticmethod
    def create_purchase_detail(purchase, product, quantity, price):
        purchase_detail = PurchaseDetail.objects.create(
            purchase=purchase, product=product, quantity=quantity, price=price
        )
        return purchase_detail

    @staticmethod
    def confirm_purchase(user, cart, payment_method_id):
        try:
            if cart.items.count() == 0:
                raise ValueError(
                    "There are no products in the cart to proceed with the purchase."
                )

            total = cart.items.aggregate(
                total=Sum(F("product__price") * F("quantity"))
            )["total"]

            for item in cart.items.all():
                if item.product.stock < item.quantity:
                    raise ValueError(
                        f"Insufficient stock for {item.product.model}, current stock: {item.product.stock} units."
                    )

            purchase = PurchaseService.create_purchase(
                user=user,
                invoice_number=generate_invoice_number(),
                payment_type_id=payment_method_id,
                total=total,
            )

            purchase_details = []
            for item in cart.items.all():
                purchase_detail = PurchaseService.create_purchase_detail(
                    purchase=purchase,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                )
                purchase_details.append(purchase_detail)

            for item in cart.items.all():
                item.product.stock -= item.quantity
                item.product.save()

            cart.items.all().delete()

            return purchase, purchase_details

        except Exception as e:
            raise e
