from django.db import transaction
from django.db.models import Sum
from rest_framework.exceptions import ValidationError

from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingAnnotatedEmailAnswer
from bee_safe.phishing.models import PhishingIndicator


class PhishingEmailAnswerService:
    def __init__(self, user):
        self.user = user

    def submit_answer(
        self,
        email_id,
        indicator_id,
        x1,
        y1,
        x2,
        y2,
        seconds_spent,
    ):
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

            answer, _ = PhishingAnnotatedEmailAnswer.objects.get_or_create(
                email=email,
                user=self.user,
                indicator=indicator,
            )

            previously_correct = answer.score == 100

            tolerance = 0.03
            is_indicator_match = (
                abs(x1 - indicator.x1) < tolerance
                and abs(y1 - indicator.y1) < tolerance
                and abs(x2 - indicator.x2) < tolerance
                and abs(y2 - indicator.y2) < tolerance
            )

            if previously_correct and is_indicator_match:
                raise ValidationError(
                    "The correct indicator for this email already submitted."
                )

            if is_indicator_match:
                answer.score = 100
                is_correct = True
            else:
                answer.score = -25
                is_correct = False

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
            )

        return is_correct
