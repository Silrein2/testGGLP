from django.urls import path

from .views import ActivateUserView
from .views import PasswordResetFormView
from .views import user_detail_view
from .views import user_redirect_view
from .views import user_update_view

app_name = "users"
urlpatterns = [
    path("~redirect/", view=user_redirect_view, name="redirect"),
    path("~update/", view=user_update_view, name="update"),
    path("<str:username>/", view=user_detail_view, name="detail"),
    path(
        "accounts/activate/<uid>/<token>",
        ActivateUserView.as_view({"get": "activation"}),
        name="activation",
    ),
    path(
        "accounts/reset/<uid>/<token>/",
        PasswordResetFormView.as_view(),
        name="password_reset_form",
    ),
]
