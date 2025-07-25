from django.apps import apps
from django.db import models


class QuestionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related("mcq_options", "match_pairs")

    def get_next_question(self, user):
        QuizQuestion = apps.get_model("quizzes", "QuizQuestion")

        questions = self.get_queryset().all()
        for question in questions:
            if not QuizQuestion.objects.filter(
                user=user,
                question=question,
            ).exists():
                return question

        return None


class QuizQuestionManager(models.Manager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .prefetch_related("question__mcq_options", "question__match_pairs")
        )
