from django.db.models import Avg
from django.db.models import Max
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingIndicator
from bee_safe.users.api.serializers import UserSerializer

from .serializers import PhishingAnnotatedEmailSerializer
from .serializers import PhishingIndicatorSerializer
from .serializers import ScorePhishingSerializer


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
