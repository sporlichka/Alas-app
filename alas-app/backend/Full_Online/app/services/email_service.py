from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMessage


class EmailService:
    def __init__(self, subject, message, to_email):
        self.subject = subject
        self.message = message
        self.to_email = to_email

    def send_email(self):
        try:

            html_message = render_to_string(
                "email-template.html",
                {
                    "title": self.subject,
                    "content": self.message,
                },
            )

            email = EmailMessage(
                subject=self.subject,
                body=html_message,
                from_email=settings.EMAIL_HOST_USER,
                to=[self.to_email],
            )
            email.content_subtype = "html"
            email.send(fail_silently=False)
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
