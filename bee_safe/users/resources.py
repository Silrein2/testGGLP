from import_export import resources

from bee_safe.contrib import mixins

from .models import BusinessUnit
from .models import Text
from .models import User


class UserResource(
    resources.ModelResource,
):
    class Meta:
        model = User


class BusinessUnitResource(
    mixins.TranslatedModelResourceMixin,
    resources.ModelResource,
):
    class Meta:
        model = BusinessUnit
        exclude = (
            "id",
            "created_at",
            "updated_at",
        )


class TextResource(
    mixins.TranslatedModelResourceMixin,
    resources.ModelResource,
):
    class Meta:
        model = Text
