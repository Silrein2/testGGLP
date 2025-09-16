from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.users.models import BusinessUnit


@register(BusinessUnit)
class BusinessUnitTranslationOptions(TranslationOptions):
    fields = ("name", "description")
