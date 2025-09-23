from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class FakeBossConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bee_safe.fake_boss"
    verbose_name = _("Fake Boss")
