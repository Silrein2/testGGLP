from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins
from bee_safe.quizzes.managers import QuizQuestionManager

from .question import Question


class QuizQuestion(mixins.TimeStampedModel):
    PENALTY_POINTS = 20

    question = models.ForeignKey(
        "quizzes.Question",
        on_delete=models.CASCADE,
        verbose_name=_("Question"),
    )
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        verbose_name=_("User"),
    )
    base_score = models.IntegerField(default=200, verbose_name=_("Base score"))
    seconds_spent = models.IntegerField(default=0, verbose_name=_("Seconds spent"))
    wrong_count = models.IntegerField(default=0, verbose_name=_("Wrong count"))
    is_correct = models.BooleanField(default=False, verbose_name=_("Is correct"))
    score = models.IntegerField(default=0, verbose_name=_("Score"))

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Quiz question")
        verbose_name_plural = _("Quiz questions")

    def __str__(self):
        return f"{self.question.question_type}: {self.question.text}"

    objects = QuizQuestionManager()

    def calculate_score(self):
        time_penalty = (self.seconds_spent // 10) * 10
        correctness_penalty = self.wrong_count * self.PENALTY_POINTS
        raw_score = self.base_score - time_penalty - correctness_penalty
        return max(20, raw_score)

    def save(self, *args, **kwargs):
        self.score = self.calculate_score()
        super().save(*args, **kwargs)


class MatchAnswerProgress(mixins.TimeStampedModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        limit_choices_to={"question_type": Question.MATCH},
        related_name="answer_progress",
    )
    option_a = models.CharField()
    option_b = models.CharField()

    class Meta(mixins.TimeStampedModel.Meta):
        unique_together = ("user", "question", "option_a", "option_b")
        verbose_name = _("Match answer progress")
        verbose_name_plural = _("Match answer progresses")

    def __str__(self):
        return f"{self.user} - {self.option_a} ↔ {self.option_b}"
