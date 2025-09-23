from django.apps import apps


class QuestionService:
    def __init__(self, question):
        self.question = question
        self.Answer = apps.get_model("fake_boss", "Answer")

    def get_answer_options(self):
        return self.Answer.objects.filter(question=self.question)
