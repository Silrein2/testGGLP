from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample
from drf_spectacular.utils import OpenApiResponse
from drf_spectacular.utils import extend_schema
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from bee_safe.phishing.api.serializers import PhishingAnnnotatedEmailStartEndSerializer
from bee_safe.phishing.api.serializers import PhishingAnnotatedEmailAnswerSerializer
from bee_safe.phishing.api.serializers import PhishingAnnotatedEmailSerializer
from bee_safe.phishing.api.serializers import ScorePhishingSerializer
from bee_safe.phishing.models import PhishingAnnotatedEmail
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
        )
        user_serializer = UserSerializer(user.state, context={"request": request})
        return Response(user_serializer.data)


class PhishingAnnotatedEmailView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request, format=None):
        """
        Phishing emails and their associated indicators.
        """

        emails = (
            PhishingAnnotatedEmail.objects.all()
            .prefetch_related("indicators")
            .order_by("-created_at")
        )
        serializer = PhishingAnnotatedEmailSerializer(emails, many=True)
        return Response(serializer.data)

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
    @extend_schema(request=PhishingAnnotatedEmailAnswerSerializer)
    def post(self, request):
        """Submit an indicator."""

        serializer = PhishingAnnotatedEmailAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        is_correct = PhishingEmailAnswerService(user).submit_answer(
            serializer.validated_data["id"],
            serializer.validated_data["answer"]["id"],
            serializer.validated_data["seconds_spent"],
        )
        response = {}
        response.update(user.state)
        response["phishing"].update({"is_correct": is_correct})
        return Response(response)


class PhishingAnnotatedEmailStartEndView(APIView):
    authentication_classes = [TokenAuthentication]

    @extend_schema(request=PhishingAnnnotatedEmailStartEndSerializer)
    def post(self, request):
        """
        Tells the backend if a user has started or ended a Phishing game.

        Must be called first before any indicator is submitted.
        Must be called last after all indicators are submitted.

        `Start` and `end` cannot be `true` at the same time.
        """

        serializer = PhishingAnnnotatedEmailStartEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]

        user = request.user
        response = {}

        if start and not end:
            user.reset_phishing()
            response.update({"start": True})

        if end and not start:
            user.times_played_phishing += 1
            user.save(update_fields=["times_played_phishing"])
            response.update({"end": True})

        response.update(user.state)
        return Response(response)
