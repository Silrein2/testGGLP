from import_export import resources

from bee_safe.contrib import mixins

from .models import Text


class TextResource(
    mixins.TranslatedModelResourceMixin,
    resources.ModelResource,
):
    class Meta:
        model = Text
