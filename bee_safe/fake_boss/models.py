from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins
from bee_safe.fake_boss.services import QuestionService


class Question(mixins.TimeStampedModel):
    text = models.TextField(verbose_name=_("Question text"))

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Question")
        verbose_name_plural = _("Questions")

    def __str__(self):
        return self.text

    @property
    def answer_options(self):
        return QuestionService(self).get_answer_options()


class Answer(mixins.TimeStampedModel):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answer",
    )
    text = models.CharField(verbose_name=_("Option text"))
    is_correct = models.BooleanField(default=False)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Answer option")
        verbose_name_plural = _("Answer options")

    def __str__(self):
        return self.text
