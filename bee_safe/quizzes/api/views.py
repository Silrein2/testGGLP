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

question_post_200_mcq = OpenApiExample(
    "Next question is MCQ",
    value={
        "next_question": {
            "id": 20,
            "question_type": "MCQ",
            "text": "BACKPAIN BECKY??",
            "mcq_options": [
                {"id": 5, "text": "Beckoning", "is_correct": False},
                {"id": 6, "text": "Becky", "is_correct": True},
                {"id": 7, "text": "Beckham", "is_correct": False},
                {"id": 8, "text": "Ricky", "is_correct": False},
            ],
            "match_pairs": [],
        },
        "email": "chicken@amway.com",
        "business_unit_id": 1,
        "business_unit": "Corporate Cringe",
        "is_first_login": False,
        "quizzes": {
            "current_score_quizzes": 180,
            "total_questions_answered_this_session": 1,
            "highest_score_quizzes": 180,
            "total_seconds_at_highest_score_quizzes": 20,
            "times_played_quizzes": 0,
        },
    },
    media_type="application/json",
)

question_post_200_match = OpenApiExample(
    "Next question is matching pairs",
    value={
        "next_question": {
            "id": 22,
            "question_type": "MATCH",
            "text": "Pokematch!",
            "mcq_options": [],
            "match_pairs": {
                "options_a": ["Goodra", "Snivy"],
                "options_b": ["Dragon", "Grass"],
            },
        },
        "email": "chicken@amway.com",
        "business_unit_id": 1,
        "business_unit": "Corporate Cringe",
        "is_first_login": False,
        "quizzes": {
            "current_score_quizzes": 360,
            "total_questions_answered_this_session": 2,
            "highest_score_quizzes": 360,
            "total_seconds_at_highest_score_quizzes": 40,
            "times_played_quizzes": 0,
        },
    },
    media_type="application/json",
)

question_post_200_no_more_questions = OpenApiExample(
    "No more questions",
    value={
        "next_question": {"question_type": None, "text": ""},
        "email": "chicken@amway.com",
        "business_unit_id": 1,
        "business_unit": "Corporate Cringe",
        "is_first_login": False,
        "quizzes": {
            "current_score_quizzes": 540,
            "total_questions_answered_this_session": 3,
            "highest_score_quizzes": 540,
            "total_seconds_at_highest_score_quizzes": 60,
            "times_played_quizzes": 1,
        },
    },
    media_type="application/json",
)


@extend_schema(
    methods=["GET"],
    responses={
        200: QuestionSerializer,
    },
    description="Returns the next unanswered question for the authenticated user.",
)
@extend_schema(
    methods=["POST"],
    request=OpenApiTypes.OBJECT,
    responses={
        200: OpenApiResponse(
            description="Answer submitted successfully. Next question.",
            response=OpenApiTypes.OBJECT,
            examples=[
                question_post_200_mcq,
                question_post_200_match,
                question_post_200_no_more_questions,
            ],
        ),
        202: OpenApiResponse(description="Match opton pair submitted successfully."),
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

        def end_of_questions_reached(user):
            next_q = Question.objects.get_next_question(user=user)
            response = {
                "next_question": QuestionSerializer(next_q).data,
            }
            current_score_quizzes = user.state["quizzes"]["current_score_quizzes"]
            total_questions_answered_this_session = user.state["quizzes"][
                "total_questions_answered_this_session"
            ]
            if not next_q:
                user.times_played_quizzes += 1
                user.save()
                user.reset_quizzes()
            response.update(user.state)
            response["quizzes"]["current_score_quizzes"] = current_score_quizzes
            response["quizzes"]["total_questions_answered_this_session"] = (
                total_questions_answered_this_session
            )
            return Response(response, status=status.HTTP_200_OK)

        def update_score_quizzes(user):
            final_score = QuizQuestion.objects.filter(
                user=user,
            ).aggregate(
                total_score=Sum("score"),
                total_seconds=Sum("seconds_spent"),
            )
            user.update_score_quizzes(
                final_score["total_score"] if final_score["total_score"] else 0,
                final_score["total_seconds"] if final_score["total_seconds"] else 0,
            )

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
            update_score_quizzes(request.user)
            request.user.total_questions_answered_this_session += 1
            request.user.save()

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
            update_score_quizzes(request.user)

            if result["completed"]:
                request.user.total_questions_answered_this_session += 1
                request.user.save()
                return end_of_questions_reached(request.user)

            return Response(
                _("Correct pair recorded. More pairs required."),
                status=status.HTTP_202_ACCEPTED,
            )

        return end_of_questions_reached(request.user)


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
