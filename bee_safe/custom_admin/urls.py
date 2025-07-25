from django.urls import path

from .admin import custom_admin

urlpatterns = [
    path("", view=custom_admin.urls, name="custom_admin"),
]
