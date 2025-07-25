from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.users.models import BusinessUnit
from bee_safe.users.models import Text


@register(Text)
class TextTranslationOptions(TranslationOptions):
    fields = ("text",)


@register(BusinessUnit)
class BusinessUnitTranslationOptions(TranslationOptions):
    fields = ("name", "description")
