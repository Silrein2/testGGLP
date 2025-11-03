from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.phishing.models import PhishingIndicator


@register(PhishingIndicator)
class PhishingIndicatorTranslationOptions(TranslationOptions):
    fields = ("label",)
