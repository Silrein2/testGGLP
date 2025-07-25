from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import QuerySet
from django.shortcuts import render
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import DetailView
from django.views.generic import RedirectView
from django.views.generic import UpdateView
from djoser.views import UserViewSet

from bee_safe.users.models import User


class UserDetailView(LoginRequiredMixin, DetailView):
    model = User
    slug_field = "username"
    slug_url_kwarg = "username"


user_detail_view = UserDetailView.as_view()


class UserUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = User
    fields = ["name"]
    success_message = _("Information successfully updated")

    def get_success_url(self) -> str:
        assert self.request.user.is_authenticated  # type guard
        return self.request.user.get_absolute_url()

    def get_object(self, queryset: QuerySet | None = None) -> User:
        assert self.request.user.is_authenticated  # type guard
        return self.request.user


user_update_view = UserUpdateView.as_view()


class UserRedirectView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self) -> str:
        return reverse("users:detail", kwargs={"username": self.request.user.username})


user_redirect_view = UserRedirectView.as_view()


class ActivateUserView(UserViewSet):
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", self.get_serializer_context())
        kwargs["data"] = {"uid": self.kwargs["uid"], "token": self.kwargs["token"]}
        return serializer_class(*args, **kwargs)

    def activation(self, request, uid, token, *args, **kwargs):
        try:
            super().activation(request, *args, **kwargs)
            success = True
            message = "Account successfully activated!"
        except Exception:
            success = False
            message = "Activation failed."

        domain = request.get_host().split(":")[0]
        home_url = "http://" + domain

        context = {
            "uid": uid,
            "token": token,
            "success": success,
            "message": message,
            "domain": domain,
            "home_url": home_url,
        }

        return render(request, "users/activation_result.html", context)


@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetFormView(View):
    def get(self, request, uid, token):
        return render(
            request,
            "users/password_reset_confirm_form.html",
            {"uid": uid, "token": token},
        )
