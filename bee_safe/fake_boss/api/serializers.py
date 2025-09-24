import random

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from bee_safe.fake_boss.models import Answer
from bee_safe.fake_boss.models import Question
from bee_safe.fake_boss.models import QuizQuestion


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "text", "bee_safe_text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    answer = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "answer",
        ]


class AnswerSubmissionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    answer = serializers.DictField()
    seconds_spent = serializers.IntegerField()
    wrong_count = serializers.IntegerField()

    def validate_id(self, value):
        try:
            question = Question.objects.get(pk=value)
        except Question.DoesNotExist:
            msg = "Question not found."
            raise serializers.ValidationError(msg)  # noqa: B904
        self.context["question"] = question
        return value

    def validate(self, attrs):
        question = self.context.get("question")
        if not question:
            msg = "Question is required."
            raise serializers.ValidationError(msg)
        attrs["question"] = question
        return attrs


class AnswerSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate(self, data):
        question = self.context["question"]
        option_id = data["id"]

        try:
            option = Answer.objects.get(id=option_id, question=question)
        except Answer.DoesNotExist:
            msg = "Invalid option."
            raise serializers.ValidationError(msg)  # noqa: B904

        if not option.is_correct:
            msg = "Incorrect answer."
            raise serializers.ValidationError(msg)

        if QuizQuestion.objects.filter(
            question=question,
            user=self.context["user"],
        ).exists():
            msg = "Option already submitted."
            raise serializers.ValidationError(msg)

        return {"option": option}
