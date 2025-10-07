from allauth.account.decorators import secure_admin_login
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
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
from .models import EmailDomain
from .models import User
from .resources import BusinessUnitResource
from .resources import UserResource

if settings.DJANGO_ADMIN_FORCE_ALLAUTH:
    # Force the `admin` sign in process to go through the `django-allauth` workflow:
    # https://docs.allauth.org/en/latest/common/admin.html#admin
    admin.autodiscover()
    admin.site.login = secure_admin_login(admin.site.login)  # type: ignore[method-assign]


@admin.register(EmailDomain)
@admin.register(EmailDomain, site=custom_admin)
class EmailDomainAdmin(ModelAdmin, ImportExportModelAdmin):
    pass


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
                    "current_score_quizzes",
                    "total_score_quizzes",
                    "total_questions_answered_this_session",
                    "highest_score_quizzes",
                    "total_seconds_at_highest_score_quizzes",
                    "times_played_quizzes",
                ),
            },
        ),
        (
            _("Scores (Phishing)"),
            {
                "fields": (
                    "current_score_phishing",
                    "total_score_phishing",
                    "highest_score_phishing",
                    "total_seconds_at_highest_score_phishing",
                    "times_played_phishing",
                ),
            },
        ),
        (
            _("Scores (Fake Boss)"),
            {
                "fields": (
                    "total_score_fake_boss",
                    "total_seconds_fake_boss",
                    "best_total_seconds_fake_boss",
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
    readonly_fields = [
        "date_joined",
        "last_login",
        "current_score_quizzes",
        "total_score_quizzes",
        "total_questions_answered_this_session",
        "highest_score_quizzes",
        "total_seconds_at_highest_score_quizzes",
        "times_played_quizzes",
        "current_score_phishing",
        "total_score_phishing",
        "highest_score_phishing",
        "total_seconds_at_highest_score_phishing",
        "times_played_phishing",
        "total_score_fake_boss",
        "total_seconds_fake_boss",
        "best_total_seconds_fake_boss",
    ]
    actions = [
        "run_reset_quizzes_scores",
        "run_reset_fake_boss_scores",
        "run_reset_user_states",
    ]

    @action(
        description="Reset Quizzes scores",
    )
    def run_reset_quizzes_scores(self, request, queryset):
        for user in queryset:
            user.reset_quizzes()

    @action(
        description="Reset Fake Boss scores",
    )
    def run_reset_fake_boss_scores(self, request, queryset):
        for user in queryset:
            user.reset_fake_boss()

    @action(description="Reset user states")
    def run_reset_user_states(self, request, queryset):
        for user in queryset:
            user.reset_state()

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


@admin.register(BusinessUnit)
@admin.register(BusinessUnit, site=custom_admin)
class BusinessUnitAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = BusinessUnitResource
    list_display = ("name", "description")
