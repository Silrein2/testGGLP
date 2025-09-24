import json

from import_export import fields
from import_export import resources
from import_export.widgets import CharWidget
from modeltranslation.utils import get_translation_fields

from bee_safe.contrib import mixins
from config.settings.base import LANGUAGES

from .models import Answer
from .models import Question


class QuestionResource(mixins.TranslatedModelResourceMixin, resources.ModelResource):
    answer = fields.Field(
        column_name="answer",
        attribute=None,
        widget=CharWidget(),
    )

    class Meta:
        model = Question
        text_translation_fields = get_translation_fields("title")
        fields = (
            "id",
            *tuple(text_translation_fields),
            "answer",
        )

    def get_supported_languages(self):
        return [lang[0] for lang in LANGUAGES]

    def dehydrate_answer(self, obj):
        text_translation_fields = get_translation_fields("text")
        bee_safe_text_translation_fields = get_translation_fields("bee_safe_text")

        result = []
        for option in obj.answer.all():
            option_data = {
                "id": option.pk,
                "texts": {
                    field: getattr(option, field, "") or ""
                    for field in text_translation_fields
                },
                "bee_safe_texts": {
                    field: getattr(option, field, "") or ""
                    for field in bee_safe_text_translation_fields
                },
                "is_correct": option.is_correct,
            }
            result.append(option_data)

        return json.dumps(result, ensure_ascii=False)

    def import_field(self, field, obj, data, is_m2m=False, **kwargs):
        result = super().import_field(field, obj, data, is_m2m, **kwargs)
        obj._import_answer_data = data.get("answer", "")

        return result

    def after_save_instance(self, instance, *args, **kwargs):
        # Clear existing related data
        instance.answer.all().delete()

        # Translatable fields
        text_translation_fields = get_translation_fields("text")
        bee_safe_text_translation_fields = get_translation_fields("bee_safe_text")

        # Import Answer
        if hasattr(instance, "_import_answer_data") and instance._import_answer_data:
            try:
                answer_list = json.loads(instance._import_answer_data)
                for option_data in answer_list:
                    option = Answer(question=instance)
                    texts = option_data.get("texts", {})
                    for field_name in text_translation_fields:
                        setattr(option, field_name, texts.get(field_name, ""))
                    bee_safe_texts = option_data.get("bee_safe_texts", {})
                    for field_name in bee_safe_text_translation_fields:
                        setattr(option, field_name, bee_safe_texts.get(field_name, ""))
                    option.is_correct = option_data.get("is_correct", False)
                    option.save()
            except json.JSONDecodeError:
                pass
            delattr(instance, "_import_answer_data")

    def get_instance(self, instance_loader, row):
        instance = super().get_instance(instance_loader, row)
        if hasattr(instance, "_import_answer_data"):
            delattr(instance, "_import_answer_data")
        return instance
