from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from bee_safe.quizzes.models import MatchOptionPair
from bee_safe.quizzes.models import MCQOption
from bee_safe.quizzes.models import Question
from bee_safe.quizzes.models import YesNoAnswer


@register(Question)
class QuestionTranslationOptions(TranslationOptions):
    fields = ("text",)


@register(MCQOption)
class MCQOptionTranslationOptions(TranslationOptions):
    fields = ("text",)


@register(MatchOptionPair)
class MatchOptionPairTranslationOptions(TranslationOptions):
    fields = ("option_a", "option_b")


@register(YesNoAnswer)
class YesNoAnswerTranslationOptions(TranslationOptions):
    fields = ("statement",)
