from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class PhishingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bee_safe.phishing"
    verbose_name = _("Phishing")
