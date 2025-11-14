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
            answer, created = PhishingAnnotatedEmailAnswer.objects.get_or_create(
                email=email,
                user=self.user,
                indicator=indicator,
            )
            tolerance = 0.03
            if PhishingIndicator.objects.filter(
                email=email,
                x1__gte=indicator.x1 - tolerance,
                x1__lte=indicator.x1 + tolerance,
                y1__gte=indicator.y1 - tolerance,
                y1__lte=indicator.y1 + tolerance,
                x2__gte=indicator.x2 - tolerance,
                x2__lte=indicator.x2 + tolerance,
                y2__gte=indicator.y2 - tolerance,
                y2__lte=indicator.y2 + tolerance,
                label=indicator.label,
            ).exists():
                if (
                    indicator_id == indicator.id
                    and abs(x1 - indicator.x1) < tolerance
                    and abs(y1 - indicator.y1) < tolerance
                    and abs(x2 - indicator.x2) < tolerance
                    and abs(y2 - indicator.y2) < tolerance
                ):
                    if not created:
                        raise ValidationError(
                            "The correct indicator for this email already submitted.",
                        )
                    answer.score = 100
                    is_correct = True
                else:
                    answer.score = -25
                    is_correct = False
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
