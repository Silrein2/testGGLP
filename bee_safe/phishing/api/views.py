from drf_spectacular.utils import extend_schema
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from bee_safe.users.api.serializers import UserSerializer

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
        )
        user_serializer = UserSerializer(user.state, context={"request": request})

        return Response(user_serializer.data)
