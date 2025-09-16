from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.texts.models import Text


@register(Text)
class TextTranslationOptions(TranslationOptions):
    fields = ("text",)
