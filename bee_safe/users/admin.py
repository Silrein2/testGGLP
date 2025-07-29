from allauth.account.decorators import secure_admin_login
from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from import_export.admin import ImportExportModelAdmin
from modeltranslation.admin import TabbedTranslationAdmin
from unfold.admin import ModelAdmin
from unfold.decorators import action
from unfold.forms import AdminPasswordChangeForm

from bee_safe.custom_admin.admin import custom_admin

from .forms import UserAdminChangeForm
from .forms import UserAdminCreationForm
from .models import BusinessUnit
from .models import Text
from .models import User
from .resources import BusinessUnitResource
from .resources import TextResource
from .resources import UserResource

if settings.DJANGO_ADMIN_FORCE_ALLAUTH:
    # Force the `admin` sign in process to go through the `django-allauth` workflow:
    # https://docs.allauth.org/en/latest/common/admin.html#admin
    admin.autodiscover()
    admin.site.login = secure_admin_login(admin.site.login)  # type: ignore[method-assign]


@admin.register(User)
@admin.register(User, site=custom_admin)
class UserAdmin(
    BaseUserAdmin,
    ModelAdmin,
    ImportExportModelAdmin,
):
    resource_class = UserResource
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm
    change_password_form = AdminPasswordChangeForm
    fieldsets = (
        (
            None,
            {
                "fields": (
                    # "username",
                    "email",
                    "business_unit",
                    "password",
                ),
            },
        ),
        (
            _("Personal info"),
            {
                "fields": ("name",),
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    # "groups",
                    # "user_permissions",
                ),
            },
        ),
        (
            _("Scores (Quizzes)"),
            {
                "fields": (
                    "highest_score_quizzes",
                    "total_seconds_at_highest_score_quizzes",
                    "times_played_quizzes",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    # "username",
                    "email",
                    "business_unit",
                    # "password1",
                    # "password2",
                ),
            },
        ),
    )
    list_display = [
        # "username",
        "email",
        "business_unit",
        "is_active",
        "is_superuser",
        "is_staff",
    ]
    list_display_links = ["email", "business_unit"]
    search_fields = ["email", "business_unit", "name"]
    readonly_fields = ["date_joined", "last_login"]
    actions = ["run_reset_scores"]

    @action(
        description="Reset scores",
    )
    def run_reset_scores(self, request, queryset):
        for user in queryset:
            user.highest_score_quizzes = 0
            user.total_seconds_at_highest_score_quizzes = 0
            user.times_played_quizzes = 0
            user.save(
                update_fields=[
                    "highest_score_quizzes",
                    "total_seconds_at_highest_score_quizzes",
                    "times_played_quizzes",
                ],
            )

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.is_superuser:  # pyright: ignore  # noqa: PGH003
            if "delete_selected" in actions:
                del actions["delete_selected"]
        return actions


admin.site.unregister(Group)


@admin.register(Group)
# @admin.register(Group, site=custom_admin)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


@admin.register(Text)
@admin.register(Text, site=custom_admin)
class TextAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = TextResource
    list_display = ("key", "text")

    def has_delete_permission(self, request, obj=None):
        if obj and obj.key == Text.WELCOME_KEY:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(BusinessUnit)
@admin.register(BusinessUnit, site=custom_admin)
class BusinessUnitAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = BusinessUnitResource
    list_display = ("name", "description")
