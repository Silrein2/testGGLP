from django.conf import settings
from django.db import models
from import_export import fields
from modeltranslation.translator import translator


class TimeStampedModel(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TranslatedModelResourceMixin:
    """
    Mixin to dynamically add translated fields from django-modeltranslation,
    and apply `Meta.exclude` to remove fields from export.
    """

    base_fields = []

    def init_translation_fields(self):
        model = self._meta.model
        translation_opts = translator.get_options_for_model(model)
        translatable_fields = translation_opts.fields
        languages = [lang[0] for lang in settings.LANGUAGES]

        # Collect excluded fields from Meta.exclude
        excluded_fields = set(getattr(self.Meta, "exclude", []))

        # Initialize storage for translated field names
        self._translated_field_names = []

        # Add translated fields dynamically, skipping excluded ones
        for field in translatable_fields:
            for lang in languages:
                field_name = f"{field}_{lang}"
                if field_name not in excluded_fields:
                    self.fields[field_name] = fields.Field(
                        attribute=field_name,
                        column_name=field_name,
                    )
                    self._translated_field_names.append(field_name)

        # Get base fields from Meta.base_fields or self.base_fields
        base_fields = getattr(self.Meta, "base_fields", self.base_fields)

        # Add base fields, skipping excluded ones
        for field_name in base_fields:
            if field_name not in excluded_fields and field_name not in self.fields:
                self.fields[field_name] = fields.Field(
                    attribute=field_name,
                    column_name=field_name,
                )

        # Remove explicitly excluded fields from self.fields (just in case)
        for field_name in excluded_fields:
            self.fields.pop(field_name, None)

        # Set export_order: if defined in Meta, filter it; else use current fields keys
        export_order = getattr(self.Meta, "export_order", None)
        if export_order:
            # Keep only fields present in self.fields and not excluded
            self.Meta.export_order = [
                f for f in export_order if f in self.fields and f not in excluded_fields
            ]
        else:
            # Use all fields currently present, in insertion order, excluding excluded
            self.Meta.export_order = [
                f for f in self.fields.keys() if f not in excluded_fields
            ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.init_translation_fields()
