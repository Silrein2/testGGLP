from django.apps import apps
from django.db import transaction
from django.db.models import F


class UserStateService:
    def __init__(self, user):
        self.user = user

    def get_state(self):
        # identical to your original method
        return {
            "email": self.user.email,
            "business_unit_id": self.user.business_unit.id,
            "business_unit": self.user.business_unit.name,
            "is_first_login": self.user.is_first_login,
            "quizzes": {
                "current_score_quizzes": self.user.current_score_quizzes,
                "total_score_quizzes": self.user.total_score_quizzes,
                "total_questions_answered_this_session": self.user.total_questions_answered_this_session,
                "highest_score_quizzes": self.user.highest_score_quizzes,
                "total_seconds_at_highest_score_quizzes": self.user.total_seconds_at_highest_score_quizzes,
                "times_played_quizzes": self.user.times_played_quizzes,
            },
            "phishing": {
                "current_score_phishing": self.user.current_score_phishing,
                "total_score_phishing": self.user.total_score_phishing,
                "highest_score_phishing": self.user.highest_score_phishing,
                "total_seconds_at_highest_score_phishing": self.user.total_seconds_at_highest_score_phishing,
                "times_played_phishing": self.user.times_played_phishing,
            },
            "fake_boss": {
                "total_score_fake_boss": self.user.total_score_fake_boss,
                "total_seconds_fake_boss": self.user.total_seconds_fake_boss,
                "best_total_seconds_fake_boss": self.user.best_total_seconds_fake_boss,
            },
            "total_score_all": self.user.total_score_all,
        }

    def reset_quizzes(self):
        QuizQuestion = apps.get_model("quizzes", "QuizQuestion")
        MatchAnswerProgress = apps.get_model("quizzes", "MatchAnswerProgress")

        with transaction.atomic():
            QuizQuestion.objects.filter(user=self.user).delete()
            MatchAnswerProgress.objects.filter(user=self.user).delete()

            self.user.refresh_from_db()
            self.user.current_score_quizzes = 0
            self.user.total_score_quizzes = 0
            self.user.total_questions_answered_this_session = 0
            self.user.save(
                update_fields=[
                    "current_score_quizzes",
                    "total_score_quizzes",
                    "total_questions_answered_this_session",
                ]
            )

    def reset_phishing(self):
        PhishingAnnotatedEmailAnswer = apps.get_model(
            "phishing",
            "PhishingAnnotatedEmailAnswer",
        )

        with transaction.atomic():
            PhishingAnnotatedEmailAnswer.objects.filter(user=self.user).delete()
            self.user.refresh_from_db()
            self.user.current_score_phishing = 0
            self.user.total_score_phishing = 0
            self.user.save(
                update_fields=[
                    "current_score_phishing",
                    "total_score_phishing",
                ],
            )

    def reset_fake_boss(self):
        self.user.refresh_from_db()
        self.user.total_score_fake_boss = 0
        self.user.total_seconds_fake_boss = 0
        self.user.save(
            update_fields=[
                "total_score_fake_boss",
                "total_seconds_fake_boss",
            ],
        )

    def reset_session(self):
        self.reset_quizzes()
        self.reset_phishing()
        self.reset_fake_boss()

    def reset_state(self):
        self.reset_quizzes()
        self.user.refresh_from_db()
        self.user.times_played_quizzes = 0
        self.user.highest_score_quizzes = 0
        self.user.total_seconds_at_highest_score_quizzes = 0
        self.user.best_total_seconds_fake_boss = 0
        self.user.save(
            update_fields=[
                "times_played_quizzes",
                "highest_score_quizzes",
                "total_seconds_at_highest_score_quizzes",
                "best_total_seconds_fake_boss",
            ],
        )
        self.reset_phishing()
        self.user.highest_score_phishing = 0
        self.user.total_seconds_at_highest_score_phishing = 0
        self.user.times_played_phishing = 0
        self.user.save(
            update_fields=[
                "highest_score_phishing",
                "total_seconds_at_highest_score_phishing",
                "times_played_phishing",
            ],
        )
        self.reset_fake_boss()

    def update_score_quizzes(self, score, seconds, total_score):
        with transaction.atomic():
            self.user.refresh_from_db()
            new_total = total_score
            self.user.current_score_quizzes = score
            self.user.total_score_quizzes = new_total

            if new_total > self.user.highest_score_quizzes:
                self.user.highest_score_quizzes = new_total
                self.user.total_seconds_at_highest_score_quizzes = seconds

            self.user.save(
                update_fields=[
                    "current_score_quizzes",
                    "total_score_quizzes",
                    "highest_score_quizzes",
                    "total_seconds_at_highest_score_quizzes",
                ],
            )

    def update_score_phishing(
        self,
        score,
        seconds,
        total_score,
    ):
        with transaction.atomic():
            self.user.refresh_from_db()
            new_total = total_score
            self.user.current_score_phishing = score
            self.user.total_score_phishing = new_total

            if new_total > self.user.highest_score_phishing:
                self.user.highest_score_phishing = new_total
                self.user.total_seconds_at_highest_score_phishing = seconds

            self.user.save(
                update_fields=[
                    "current_score_phishing",
                    "total_score_phishing",
                    "highest_score_phishing",
                    "total_seconds_at_highest_score_phishing",
                ],
            )

    def update_score_fake_boss(self, score, seconds):
        with transaction.atomic():
            self.user.refresh_from_db()
            self.user.total_score_fake_boss = score
            self.user.total_seconds_fake_boss = seconds
            self.user.best_total_seconds_fake_boss = min(
                [
                    s
                    for s in (seconds, self.user.best_total_seconds_fake_boss)
                    if s != 0
                ],
                default=self.user.best_total_seconds_fake_boss,
            )
            self.user.save(
                update_fields=[
                    "total_score_fake_boss",
                    "total_seconds_fake_boss",
                    "best_total_seconds_fake_boss",
                ]
            )
