import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:

    @staticmethod
    def create_payment_intent(amount, currency="eur"):
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
            )
            return intent
        except Exception as e:
            raise e

    @staticmethod
    def confirm_payment_intent(payment_intent, payment_method):
        try:
            intent = stripe.PaymentIntent.confirm(
                payment_intent, payment_method=payment_method
            )
            return intent
        except Exception as e:
            raise e
