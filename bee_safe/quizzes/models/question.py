from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins
from bee_safe.quizzes.managers import QuestionManager
from bee_safe.quizzes.services import QuestionService


class Question(mixins.TimeStampedModel):
    MCQ = "MCQ"
    MATCH = "MATCH"
    YES_NO = "YES_NO"

    QUESTION_TYPES = [
        (MCQ, _("MCQ")),
        (MATCH, _("Match option pairs")),
        (YES_NO, _("Yes or no")),
    ]

    text = models.TextField(verbose_name=_("Question text"))
    question_type = models.CharField(choices=QUESTION_TYPES)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Question")
        verbose_name_plural = _("Questions")

    def __str__(self):
        return f"{self.question_type}: {self.text}"

    objects = QuestionManager()

    @property
    def answer_options(self):
        return QuestionService(self).get_answer_options()


class MCQOption(mixins.TimeStampedModel):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="mcq_options",
        limit_choices_to={"question_type": Question.MCQ},
    )
    text = models.CharField(verbose_name=_("Option text"))
    is_correct = models.BooleanField(default=False)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("MCQ option")
        verbose_name_plural = _("MCQ options")

    def __str__(self):
        return self.text


class MatchOptionPair(mixins.TimeStampedModel):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="match_pairs",
        limit_choices_to={"question_type": Question.MATCH},
    )
    option_a = models.CharField(verbose_name=_("Left side"))
    option_b = models.CharField(verbose_name=_("Right side"))

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Match option pair")
        verbose_name_plural = _("Match option pairs")
        constraints = [
            models.UniqueConstraint(
                fields=["question", "option_a", "option_b"],
                name="unique_match_pair_forward",
            ),
            models.UniqueConstraint(
                fields=["question", "option_b", "option_a"],
                name="unique_match_pair_reverse",
            ),
        ]

    def __str__(self):
        return f"{self.option_a} ↔ {self.option_b}"


class YesNoAnswer(mixins.TimeStampedModel):
    question = models.OneToOneField(
        Question,
        on_delete=models.CASCADE,
        related_name="yes_no_answer",
        limit_choices_to={"question_type": Question.YES_NO},
        verbose_name=_("Question"),
    )
    statement = models.TextField(verbose_name=_("Statement"), blank=True, default="")
    is_yes = models.BooleanField(verbose_name=_("Is 'Yes' the correct answer?"))

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Yes/No answer")
        verbose_name_plural = _("Yes/No answers")

    def __str__(self):
        return _("Yes") if self.is_yes else _("No")
