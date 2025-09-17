from import_export import fields
from import_export import resources
from import_export.widgets import ForeignKeyWidget
from modeltranslation.utils import get_translation_fields

from bee_safe.contrib import mixins

from .models import Key
from .models import Text


class KeyWidget(ForeignKeyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if not value:
            return None
        obj, _ = self.model.objects.get_or_create(**{self.field: value})
        return obj


class TextResource(
    mixins.TranslatedModelResourceMixin,
    resources.ModelResource,
):
    key = fields.Field(
        column_name="key",
        attribute="key",
        widget=KeyWidget(Key, field="name"),
    )

    class Meta:
        model = Text
        text_translation_fields = get_translation_fields("text")
        fields = (
            "id",
            "key",
            *tuple(text_translation_fields),
            "order",
        )
