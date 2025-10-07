import random

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from bee_safe.fake_boss.models import Answer
from bee_safe.fake_boss.models import Question


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "text",
            "bee_safe_text",
            "is_correct",
        ]


class QuestionSerializer(serializers.ModelSerializer):
    answer_options = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "answer_options",
        ]


class ScoreFakeBossSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    seconds = serializers.IntegerField()
