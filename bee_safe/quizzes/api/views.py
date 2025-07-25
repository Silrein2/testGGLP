from django.db.models import Sum
from django.utils.translation import gettext_lazy as _
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample
from drf_spectacular.utils import OpenApiResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from bee_safe.quizzes.api.serializers import AnswerSubmissionSerializer
from bee_safe.quizzes.api.serializers import MatchAnswerSerializer
from bee_safe.quizzes.api.serializers import MCQAnswerSerializer
from bee_safe.quizzes.api.serializers import QuestionSerializer
from bee_safe.quizzes.api.serializers import TextSerializer
from bee_safe.quizzes.models import Question
from bee_safe.quizzes.models import QuizQuestion
from bee_safe.quizzes.models import Text

mcq_example = OpenApiExample(
    "MCQ Answer",
    value={
        "id": 1,
        "answer": {"id": 13},
        "seconds_spent": 20,
        "wrong_count": 0,
    },
    request_only=True,
)

match_example = OpenApiExample(
    "Match Answer",
    value={
        "id": 666,
        "answer": {"option_a": "Greavard", "option_b": "Ghost"},
        "seconds_spent": 20,
        "wrong_count": 0,
    },
    request_only=True,
)


@extend_schema(
    methods=["GET"],
    responses={
        200: QuestionSerializer,
        204: OpenApiResponse(description="No more questions available."),
    },
    description="Returns the next unanswered question for the authenticated user.",
)
@extend_schema(
    methods=["POST"],
    request=OpenApiTypes.OBJECT,
    responses={
        200: OpenApiResponse(
            description="Answer submitted successfully. Next question."
        ),
        202: OpenApiResponse(description="Answer submitted successfully."),
        204: OpenApiResponse(description="No more questions available."),
        400: OpenApiResponse(description="Invalid answer."),
    },
    examples=[mcq_example, match_example],
    description="Submit a correct answer to a question. Only correct answers are accepted.",
)
class QuestionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        question = Question.objects.get_next_question(user=request.user)

        if not question:
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AnswerSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        answer_data = serializer.validated_data["answer"]
        seconds_spent = serializer.validated_data["seconds_spent"]
        wrong_count = serializer.validated_data["wrong_count"]

        if question.question_type == Question.MCQ:
            answer_serializer = MCQAnswerSerializer(
                data=answer_data,
                context={"question": question, "user": request.user},
            )
            answer_serializer.is_valid(raise_exception=True)
            is_correct = answer_serializer.validated_data["option"].is_correct

            QuizQuestion.objects.get_or_create(
                user=request.user,
                question=question,
                defaults={
                    "seconds_spent": seconds_spent,
                    "wrong_count": wrong_count,
                    "is_correct": is_correct,
                },
            )

        elif question.question_type == Question.MATCH:
            answer_serializer = MatchAnswerSerializer(
                data=answer_data,
                context={"question": question, "user": request.user},
            )
            answer_serializer.is_valid(raise_exception=True)

            from bee_safe.quizzes.services import MatchAnswerProgressService  # noqa

            result = MatchAnswerProgressService(
                user=request.user,
                question=question,
            ).submit_pair(
                option_a=answer_data["option_a"],
                option_b=answer_data["option_b"],
                seconds_spent=seconds_spent,
                wrong_count=wrong_count,
            )

            if result["completed"]:
                next_q = result["next_question"]
                if not next_q:
                    final_score = QuizQuestion.objects.filter(
                        user=request.user,
                    ).aggregate(
                        total_score=Sum("score"),
                        total_seconds=Sum("seconds_spent"),
                    )
                    request.user.update_score_quizzes(
                        final_score["total_score"],
                        final_score["total_seconds"],
                    )
                    QuizQuestion.objects.filter(user=request.user).delete()
                    return Response(
                        data=request.user.state, status=status.HTTP_204_NO_CONTENT
                    )
                return Response(
                    QuestionSerializer(next_q).data,
                    status=status.HTTP_200_OK,
                )
            return Response(
                _("Correct pair recorded. More pairs required."),
                status=status.HTTP_202_ACCEPTED,
            )

        next_q = Question.objects.get_next_question(user=request.user)
        if not next_q:
            final_score = QuizQuestion.objects.filter(
                user=request.user,
            ).aggregate(
                total_score=Sum("score"),
                total_seconds=Sum("seconds_spent"),
            )
            request.user.update_score_quizzes(
                final_score["total_score"],
                final_score["total_seconds"],
            )
            QuizQuestion.objects.filter(user=request.user).delete()
            return Response(data=request.user.state, status=status.HTTP_204_NO_CONTENT)
        return Response(
            QuestionSerializer(next_q).data,
            status=status.HTTP_202_ACCEPTED,
        )


class TextView(
    GenericViewSet,
    RetrieveModelMixin,
    ListModelMixin,
):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = TextSerializer

    def get_queryset(self, *args, **kwargs):
        return Text.objects.all()

    @extend_schema(
        responses=TextSerializer,
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
