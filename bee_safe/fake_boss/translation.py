from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.fake_boss.models import Answer
from bee_safe.fake_boss.models import Question


@register(Question)
class QuestionTranslationOptions(TranslationOptions):
    fields = ("text",)


@register(Answer)
class MCQOptionTranslationOptions(TranslationOptions):
    fields = ("text",)
