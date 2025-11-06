from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins
from bee_safe.users.models import User


class PhishingAnnotatedEmail(mixins.TimeStampedModel):
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="phishing_emails/")

    class Meta(mixins.TimeStampedModel.Meta):
        ordering = ("id",)
        verbose_name = _("Phishing email")
        verbose_name_plural = _("Phishing emails")

    def __str__(self):
        return f"Phishing email titled: {self.title}"


class PhishingIndicator(mixins.TimeStampedModel):
    """
    Coordinates stored normalized: 0.0..1.0 relative to the image natural width/height.
    (x1,y1) top-left, (x2,y2) bottom-right.
    """

    email = models.ForeignKey(
        PhishingAnnotatedEmail,
        on_delete=models.CASCADE,
        related_name="indicators",
    )
    x1 = models.FloatField(help_text="Normalized left (0..1)", default=0.0)
    y1 = models.FloatField(help_text="Normalized top (0..1)", default=0.0)
    x2 = models.FloatField(help_text="Normalized right (0..1)", default=0.0)
    y2 = models.FloatField(help_text="Normalized bottom (0..1)", default=0.0)
    label = models.CharField(max_length=200, help_text="Label text for this indicator")

    class Meta(mixins.TimeStampedModel.Meta):
        ordering = ("id",)
        verbose_name = _("Phishing indicator")
        verbose_name_plural = _("Phishing indicators")

    def __str__(self):
        return f"{self.label} [{self.x1:.3f},{self.y1:.3f}→{self.x2:.3f},{self.y2:.3f}]"


class PhishingAnnotatedEmailAnswer(mixins.TimeStampedModel):
    """Answer to a single email by a single user."""

    email = models.ForeignKey(PhishingAnnotatedEmail, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    indicator = models.ForeignKey(PhishingIndicator, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Submitted indicator")
        verbose_name_plural = _("Submitted indicators")

    def __str__(self):
        return f"Answer to {self.email} by {self.user}"
