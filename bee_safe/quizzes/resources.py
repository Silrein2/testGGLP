import json

from import_export import fields
from import_export import resources
from import_export.widgets import CharWidget
from modeltranslation.utils import get_translation_fields

from bee_safe.contrib import mixins
from config.settings.base import LANGUAGES

from .models import MatchOptionPair
from .models import MCQOption
from .models import Question
from .models import Text


class QuestionResource(mixins.TranslatedModelResourceMixin, resources.ModelResource):
    mcq_options = fields.Field(
        column_name="mcq_options",
        attribute=None,
        widget=CharWidget(),
    )
    match_pairs = fields.Field(
        column_name="match_pairs",
        attribute=None,
        widget=CharWidget(),
    )

    class Meta:
        model = Question
        text_translation_fields = get_translation_fields("text")
        fields = (
            "id",
            "question_type",
            *tuple(text_translation_fields),
            "mcq_options",
            "match_pairs",
        )

    def get_supported_languages(self):
        return [lang[0] for lang in LANGUAGES]

    def dehydrate_mcq_options(self, obj):
        if obj.question_type != Question.MCQ:
            return ""

        text_translation_fields = get_translation_fields("text")

        result = []
        for option in obj.mcq_options.all():
            option_data = {
                "id": option.pk,
                "texts": {
                    field: getattr(option, field, "") or ""
                    for field in text_translation_fields
                },
                "is_correct": option.is_correct,
            }
            result.append(option_data)

        return json.dumps(result, ensure_ascii=False)

    def dehydrate_match_pairs(self, obj):
        if obj.question_type != Question.MATCH:
            return ""

        option_a_fields = get_translation_fields("option_a")
        option_b_fields = get_translation_fields("option_b")

        result = []
        for pair in obj.match_pairs.all():
            pair_data = {
                "id": pair.pk,
                "option_a": {
                    field: getattr(pair, field, "") or "" for field in option_a_fields
                },
                "option_b": {
                    field: getattr(pair, field, "") or "" for field in option_b_fields
                },
            }
            result.append(pair_data)

        return json.dumps(result, ensure_ascii=False)

    def import_field(self, field, obj, data, is_m2m=False, **kwargs):
        result = super().import_field(field, obj, data, is_m2m, **kwargs)

        if field.column_name == "mcq_options":
            obj._import_mcq_data = data.get("mcq_options", "")
        elif field.column_name == "match_pairs":
            obj._import_match_data = data.get("match_pairs", "")

        return result

    def after_save_instance(self, instance, *args, **kwargs):
        instance.mcq_options.all().delete()
        instance.match_pairs.all().delete()

        text_translation_fields = get_translation_fields("text")
        option_a_fields = get_translation_fields("option_a")
        option_b_fields = get_translation_fields("option_b")

        if hasattr(instance, "_import_mcq_data") and instance._import_mcq_data:
            try:
                mcq_list = json.loads(instance._import_mcq_data)
                for option_data in mcq_list:
                    option = MCQOption(question=instance)
                    texts = option_data.get("texts", {})
                    for field_name in text_translation_fields:
                        setattr(option, field_name, texts.get(field_name, ""))
                    option.is_correct = option_data.get("is_correct", False)
                    option.save()
            except json.JSONDecodeError:
                pass
            delattr(instance, "_import_mcq_data")

        if hasattr(instance, "_import_match_data") and instance._import_match_data:
            try:
                pair_list = json.loads(instance._import_match_data)
                for pair_data in pair_list:
                    pair = MatchOptionPair(question=instance)
                    option_a_texts = pair_data.get("option_a", {})
                    option_b_texts = pair_data.get("option_b", {})
                    for field_a, field_b in zip(option_a_fields, option_b_fields):
                        setattr(pair, field_a, option_a_texts.get(field_a, ""))
                        setattr(pair, field_b, option_b_texts.get(field_b, ""))
                    pair.save()
            except json.JSONDecodeError:
                pass
            delattr(instance, "_import_match_data")

    def get_instance(self, instance_loader, row):
        instance = super().get_instance(instance_loader, row)
        if hasattr(instance, "_import_mcq_data"):
            delattr(instance, "_import_mcq_data")
        if hasattr(instance, "_import_match_data"):
            delattr(instance, "_import_match_data")
        return instance


class TextResource(
    mixins.TranslatedModelResourceMixin,
    resources.ModelResource,
):
    class Meta:
        model = Text
