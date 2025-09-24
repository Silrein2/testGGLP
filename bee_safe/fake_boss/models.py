from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins
from bee_safe.fake_boss.services import QuestionService


class Question(mixins.TimeStampedModel):
    title = models.CharField(verbose_name=_("Question title"), default="")

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Question")
        verbose_name_plural = _("Questions")

    def __str__(self):
        return self.title

    @property
    def answer_options(self):
        return QuestionService(self).get_answer_options()


class Answer(mixins.TimeStampedModel):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answer",
    )
    text = models.CharField(verbose_name=_("Label text"))
    bee_safe_text = models.CharField(verbose_name=_("Bee Safe text"), default="")
    is_correct = models.BooleanField(default=False)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Answer label")
        verbose_name_plural = _("Answer labels")

    def __str__(self):
        return self.text

