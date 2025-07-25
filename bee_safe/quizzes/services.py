from django.apps import apps


class QuestionService:
    def __init__(self, question):
        self.question = question
        self.MCQOption = apps.get_model("quizzes", "MCQOption")
        self.MatchOptionPair = apps.get_model("quizzes", "MatchOptionPair")
        self.Question = apps.get_model("quizzes", "Question")

    def _get_mcq_options(self):
        return self.MCQOption.objects.filter(question=self.question)

    def _get_match_pairs(self):
        return self.MatchOptionPair.objects.filter(question=self.question)

    def get_answer_options(self):
        if self.question.question_type == self.Question.MATCH:
            return self._get_match_pairs()
        return self._get_mcq_options()


class MatchAnswerProgressService:
    def __init__(self, user, question):
        self.user = user
        self.question = question

    def submit_pair(self, option_a, option_b, seconds_spent, wrong_count):
        from bee_safe.quizzes.models import MatchAnswerProgress  # noqa: PLC0415
        from bee_safe.quizzes.models import Question  # noqa: PLC0415
        from bee_safe.quizzes.models import QuizQuestion  # noqa: PLC0415

        MatchAnswerProgress.objects.create(
            user=self.user,
            question=self.question,
            option_a=option_a,
            option_b=option_b,
        )

        correct_pairs = {
            (pair.option_a, pair.option_b) for pair in self.question.match_pairs.all()
        }
        user_pairs = set(
            MatchAnswerProgress.objects.filter(
                user=self.user,
                question=self.question,
            ).values_list("option_a", "option_b"),
        )

        if user_pairs == correct_pairs:
            QuizQuestion.objects.get_or_create(
                user=self.user,
                question=self.question,
                seconds_spent=seconds_spent,
                wrong_count=wrong_count,
                is_correct=True,
            )
            next_q = Question.objects.get_next_question(user=self.user)
            return {
                "completed": True,
                "next_question": next_q,
            }

        return {
            "completed": False,
        }
