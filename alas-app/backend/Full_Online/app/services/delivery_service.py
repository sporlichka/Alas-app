from ..models import Delivery, DeliveryStatusType, DeliveryHistory
from datetime import date, timedelta


class DeliveryService:
    @staticmethod
    def create_delivery(purchase):
        initial_status = DeliveryStatusType.objects.create(description="P")
        delivery = Delivery.objects.create(
            purchase=purchase,
            tracking_number="TRK-" + str(purchase.id),
            delivery_address=purchase.user.adress,
            delivery_status=initial_status,
        )
        if initial_status.description == "P":
            delivery.estimated_date = date.today() + timedelta(days=3)
            delivery.save()

        return delivery

    @staticmethod
    def update_delivery_status_with_history(purchase, status_description):
        try:

            delivery = Delivery.objects.get(purchase=purchase)
            new_status, created = DeliveryStatusType.objects.get_or_create(
                description=status_description
            )
            delivery.delivery_status = new_status
            delivery.save()

            if status_description == "T":
                delivery.delivery_date = date.today()
                delivery.save()
                delivery.estimated_date = delivery.delivery_date + timedelta(days=3)
                delivery.save()

            if status_description == "C":
                delivery.delivery_date = date.today()
                delivery.save()
                delivery.estimated_date = date.today()
                delivery.save()

            DeliveryHistory.objects.create(
                delivery=delivery, description=status_description
            )
            delivery_history = DeliveryHistory.objects.filter(
                delivery=delivery
            ).order_by("-change_date")

            return delivery, delivery_history
        except Delivery.DoesNotExist:
            raise ValueError("Delivery not found")
