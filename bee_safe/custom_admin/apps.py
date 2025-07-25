from django.apps import AppConfig


class CustomAdminConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bee_safe.custom_admin"
