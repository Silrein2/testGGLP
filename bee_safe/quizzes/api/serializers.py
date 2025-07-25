from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from bee_safe.quizzes.models import MCQOption
from bee_safe.quizzes.models import Question
from bee_safe.quizzes.models import QuizQuestion
from bee_safe.quizzes.models import Text


class MCQOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQOption
        fields = ["id", "text", "is_correct"]


class MatchPairSplitField(serializers.Field):
    def to_representation(self, value):
        options_a = []
        options_b = []

        for pair in value.all():
            options_a.append(pair.option_a)
            options_b.append(pair.option_b)

        return {
            "options_a": options_a,
            "options_b": options_b,
        }


class QuestionSerializer(serializers.ModelSerializer):
    mcq_options = MCQOptionSerializer(many=True, read_only=True)
    match_pairs = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "question_type", "text", "mcq_options", "match_pairs"]

    @extend_schema_field(
        {
            "type": "object",
            "properties": {
                "options_a": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "options_b": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
        },
    )
    def get_match_pairs(self, obj):
        if obj.question_type == Question.MATCH:
            return MatchPairSplitField().to_representation(obj.match_pairs)
        return []


class TextSerializer(serializers.ModelSerializer[Text]):
    class Meta:
        model = Text
        fields = ["key", "text"]


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


class MCQAnswerSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate(self, data):
        question = self.context["question"]
        option_id = data["id"]

        try:
            option = MCQOption.objects.get(id=option_id, question=question)
        except MCQOption.DoesNotExist:
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


class MatchAnswerSerializer(serializers.Serializer):
    option_a = serializers.CharField()
    option_b = serializers.CharField()

    def validate(self, data):
        question = self.context["question"]
        user = self.context["user"]
        option_a = data["option_a"]
        option_b = data["option_b"]

        if not question.match_pairs.filter(
            option_a=option_a,
            option_b=option_b,
        ).exists():
            msg = "Incorrect match pair."
            raise serializers.ValidationError(msg)

        from bee_safe.quizzes.models import MatchAnswerProgress  # noqa: PLC0415

        if MatchAnswerProgress.objects.filter(
            user=user,
            question=question,
            option_a=option_a,
            option_b=option_b,
        ).exists():
            msg = "Pair already submitted."
            raise serializers.ValidationError(msg)

        return data
