from django.apps import apps


class UserStateService:
    def __init__(self, user):
        self.user = user

    def get_state(self):
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
            "total_score_all": self.user.total_score_all,
        }

    def reset_quizzes(self):
        QuizQuestion = apps.get_model("quizzes", "QuizQuestion")
        QuizQuestion.objects.filter(user=self.user).delete()

        MatchAnswerProgress = apps.get_model("quizzes", "MatchAnswerProgress")
        MatchAnswerProgress.objects.filter(user=self.user).delete()

        self.user.current_score_quizzes = 0
        self.user.total_score_quizzes = 0
        self.user.total_questions_answered_this_session = 0

        self.user.save()

    def reset_state(self):
        self.reset_quizzes()

        self.user.times_played_quizzes = 0

        self.user.highest_score_quizzes = 0
        self.user.total_seconds_at_highest_score_quizzes = 0

        self.user.save()

    def update_score_quizzes(self, score, seconds, total_score):
        self.user.current_score_quizzes = score
        self.user.total_score_quizzes = total_score
        if total_score > self.user.highest_score_quizzes:
            self.user.highest_score_quizzes = total_score
            self.user.total_seconds_at_highest_score_quizzes = seconds
        self.user.save()
