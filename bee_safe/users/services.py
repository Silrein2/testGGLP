class UserStateService:
    def __init__(self, user):
        self.user = user

    def get_state(self):
        return {
            "email": self.user.email,
            "business_unit_id": self.user.business_unit.id,
            "business_unit": self.user.business_unit.name,
            "is_first_login": self.user.is_first_login,
            "highest_score_quizzes": self.user.highest_score_quizzes,
            "total_seconds_at_highest_score_quizzes": self.user.total_seconds_at_highest_score_quizzes,
            "times_played_quizzes": self.user.times_played_quizzes,
        }
