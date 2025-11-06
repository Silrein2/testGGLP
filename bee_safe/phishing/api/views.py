from django.db.models import Avg
from django.db.models import Max
from django.utils.translation import gettext_lazy as _
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample
from drf_spectacular.utils import OpenApiResponse
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from bee_safe.phishing.api.serializers import PhishingAnnotatedEmailAnswerSerializer
from bee_safe.phishing.api.serializers import PhishingAnnotatedEmailSerializer
from bee_safe.phishing.api.serializers import PhishingIndicatorSerializer
from bee_safe.phishing.api.serializers import ScorePhishingSerializer
from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingAnnotatedEmailAnswer
from bee_safe.phishing.models import PhishingIndicator
from bee_safe.phishing.services import PhishingEmailAnswerService
from bee_safe.users.api.serializers import UserSerializer


class ScoreView(APIView):
    authentication_classes = [TokenAuthentication]

    @extend_schema(request=ScorePhishingSerializer)
    def post(self, request):
        user = request.user
        serializer = ScorePhishingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.update_score_phishing(
            serializer.validated_data["score"],
            serializer.validated_data["seconds"],
            serializer.validated_data["total_score"],
            serializer.validated_data["times_played"],
        )
        user_serializer = UserSerializer(user.state, context={"request": request})
        return Response(user_serializer.data)


class PhishingEmailViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API endpoint for fetching phishing emails and their associated indicators.
    Only supports GET (list & retrieve).
    """

    queryset = (
        PhishingAnnotatedEmail.objects.all()
        .prefetch_related("indicators")
        .order_by("-created_at")
    )
    serializer_class = PhishingAnnotatedEmailSerializer
    permission_classes = [permissions.AllowAny]


@extend_schema(
    responses={
        200: OpenApiResponse(
            description="An indicator is submitted.",
            response=OpenApiTypes.OBJECT,
            examples=[
                OpenApiExample(
                    "Example 1",
                    value={
                        "email": "pain@amway.com",
                        "business_unit_id": 1,
                        "business_unit": "Chicken",
                        "is_first_login": False,
                        "quizzes": {
                            "current_score_quizzes": 0,
                            "total_score_quizzes": 0,
                            "total_questions_answered_this_session": 0,
                            "highest_score_quizzes": 0,
                            "total_seconds_at_highest_score_quizzes": 0,
                            "times_played_quizzes": 0,
                        },
                        "phishing": {
                            "current_score_phishing": -25,
                            "total_score_phishing": 75,
                            "highest_score_phishing": 100,
                            "total_seconds_at_highest_score_phishing": 5,
                            "times_played_phishing": 1,
                            "is_correct": False,
                        },
                        "fake_boss": {
                            "total_score_fake_boss": 0,
                            "total_seconds_fake_boss": 0,
                            "best_total_seconds_fake_boss": 0,
                        },
                        "total_score_all": 75,
                    },
                ),
            ],
        ),
    },
)
class PhishingAnnotatedEmailAnswerView(APIView):
    authentication_classes = [TokenAuthentication]

    @extend_schema(request=PhishingAnnotatedEmailAnswerSerializer)
    def post(self, request):
        serializer = PhishingAnnotatedEmailAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        is_correct = PhishingEmailAnswerService(user).submit_answer(
            serializer.validated_data["id"],
            serializer.validated_data["answer"]["id"],
            serializer.validated_data["seconds_spent"],
            serializer.validated_data["is_last_email"],
        )
        response = {}
        response.update(user.state)
        response["phishing"].update({"is_correct": is_correct})
        return Response(response)
