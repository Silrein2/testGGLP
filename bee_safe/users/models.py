from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from bee_safe.contrib import mixins
from bee_safe.users.managers import UserManager
from bee_safe.users.services import UserStateService


class BusinessUnit(mixins.TimeStampedModel):
    name = models.CharField(unique=True)
    description = models.TextField(default="", blank=True)

    def __str__(self):
        return self.name

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Business unit")
        verbose_name_plural = _("Business units")


class EmailDomain(mixins.TimeStampedModel):
    domain = models.CharField(unique=True)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Email domain")
        verbose_name_plural = _("Email domains")

    def __str__(self):
        return self.domain


class User(AbstractUser):
    """
    Default custom user model for bee_safe.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    email = models.EmailField(_("Email address"), unique=True)
    username = models.CharField(
        _("username"),
        blank=True,
        default="",
    )
    business_unit = models.ForeignKey(
        BusinessUnit,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="users",
    )
    is_first_login = models.BooleanField(default=True)

    # First and last name do not cover name patterns around the globe
    name = models.CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # No additional fields required

    current_score_quizzes = models.PositiveIntegerField(default=0)
    total_score_quizzes = models.PositiveIntegerField(default=0)
    total_questions_answered_this_session = models.PositiveIntegerField(default=0)
    highest_score_quizzes = models.PositiveIntegerField(default=0)
    total_seconds_at_highest_score_quizzes = models.PositiveIntegerField(default=0)
    times_played_quizzes = models.PositiveIntegerField(default=0)

    current_score_phishing = models.PositiveIntegerField(default=0)
    total_score_phishing = models.PositiveIntegerField(default=0)
    highest_score_phishing = models.PositiveIntegerField(default=0)
    total_seconds_at_highest_score_phishing = models.PositiveIntegerField(default=0)
    times_played_phishing = models.PositiveIntegerField(default=0)

    total_score_fake_boss = models.PositiveIntegerField(default=0)
    total_seconds_fake_boss = models.PositiveIntegerField(default=0)
    best_total_seconds_fake_boss = models.PositiveIntegerField(default=0)

    objects = UserManager()

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})

    @property
    def state(self):
        return UserStateService(self).get_state()

    @property
    def total_score_all(self):
        return (
            self.total_score_quizzes
            + self.total_score_phishing
            + self.total_score_fake_boss
        )

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.is_superuser and not self.is_staff:
            super().set_password("P@55w0rd")
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        if self.is_superuser or self.is_staff:
            super().set_password(raw_password)
        else:
            super().set_password("P@55w0rd")

    def reset_quizzes(self):
        return UserStateService(self).reset_quizzes()

    def reset_state(self):
        return UserStateService(self).reset_state()

    def reset_session(self):
        return UserStateService(self).reset_session()

    def update_score_quizzes(self, score, seconds, total_score):
        return UserStateService(self).update_score_quizzes(score, seconds, total_score)

    def update_score_phishing(self, score, seconds, total_score, times_played):
        return UserStateService(self).update_score_phishing(
            score,
            seconds,
            total_score,
            times_played,
        )

    def update_score_fake_boss(self, score, seconds):
        return UserStateService(self).update_score_fake_boss(score, seconds)
