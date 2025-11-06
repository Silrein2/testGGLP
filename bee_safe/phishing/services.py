from django.db import transaction
from django.db.models import Sum
from rest_framework.exceptions import ValidationError

from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingAnnotatedEmailAnswer
from bee_safe.phishing.models import PhishingIndicator


class PhishingEmailAnswerService:
    def __init__(self, user):
        self.user = user

    def submit_answer(self, email_id, indicator_id, seconds_spent, is_last_email=False):
        is_correct = False

        with transaction.atomic():
            try:
                email = PhishingAnnotatedEmail.objects.get(id=email_id)
                indicator = PhishingIndicator.objects.get(id=indicator_id)
            except (
                PhishingAnnotatedEmail.DoesNotExist,
                PhishingIndicator.DoesNotExist,
            ):
                raise ValidationError("Invalid email or indicator.")
            if PhishingAnnotatedEmailAnswer.objects.filter(
                email=email,
                user=self.user,
                indicator=indicator,
            ).exists():
                raise ValidationError("Indicator for this email already submitted.")
            answer, _ = PhishingAnnotatedEmailAnswer.objects.get_or_create(
                email=email,
                user=self.user,
                indicator=indicator,
            )
            if (
                indicator.x1 <= 0.0
                and indicator.y1 <= 0.0
                and indicator.x2 <= 0.0
                and indicator.y2 <= 0.0
            ):
                answer.score = -25
                is_correct = False
            else:
                answer.score = 100
                is_correct = True

            answer.save()

            total_score = PhishingAnnotatedEmailAnswer.objects.filter(
                email=email,
                user=self.user,
            ).aggregate(total_score=Sum("score"))["total_score"]

            total_score = max(0, total_score)

            self.user.update_score_phishing(
                answer.score,
                seconds_spent,
                total_score,
                is_last_email,
            )

        return is_correct
