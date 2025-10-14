from django.db import models

from bee_safe.users.models import User


class PhishingAnnotatedEmail(models.Model):
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="phishing_emails/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"PhishingEmail #{self.pk}"


class PhishingIndicator(models.Model):
    """
    Coordinates stored normalized: 0.0..1.0 relative to the image natural width/height.
    (x1,y1) top-left, (x2,y2) bottom-right.
    """

    email = models.ForeignKey(
        PhishingAnnotatedEmail, on_delete=models.CASCADE, related_name="indicators"
    )
    x1 = models.FloatField(help_text="Normalized left (0..1)")
    y1 = models.FloatField(help_text="Normalized top (0..1)")
    x2 = models.FloatField(help_text="Normalized right (0..1)")
    y2 = models.FloatField(help_text="Normalized bottom (0..1)")
    label = models.CharField(max_length=200, help_text="Label text for this indicator")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("id",)

    def __str__(self):
        return f"{self.label} [{self.x1:.3f},{self.y1:.3f}→{self.x2:.3f},{self.y2:.3f}]"


class PhishingGameResult(models.Model):
    player = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    email = models.ForeignKey(
        PhishingAnnotatedEmail, null=True, blank=True, on_delete=models.SET_NULL
    )
    score = models.IntegerField()
    total_time = models.FloatField(help_text="seconds")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-score", "-created_at")

    def __str__(self):
        who = self.player.username if self.player else "Anonymous"
        return f"{who} — {self.score} pts"
