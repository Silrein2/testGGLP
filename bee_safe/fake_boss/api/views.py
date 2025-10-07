from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from bee_safe.fake_boss.models import Question
from bee_safe.users.api.serializers import UserSerializer
from bee_safe.users.models import User

from .serializers import QuestionSerializer
from .serializers import ScoreFakeBossSerializer


class QuestionViewset(viewsets.ViewSet):
    @extend_schema(responses=QuestionSerializer)
    def list(self, request):
        queryset = Question.objects.all()
        serializer = QuestionSerializer(queryset, many=True)
        return Response(serializer.data)


class ScoreView(APIView):
    authentication_classes = [TokenAuthentication]

    @extend_schema(request=ScoreFakeBossSerializer)
    def post(self, request):
        user = request.user
        serializer = ScoreFakeBossSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.update_score_fake_boss(
            serializer.validated_data["score"],
            serializer.validated_data["seconds"],
        )
        user_serializer = UserSerializer(user.state, context={"request": request})

        return Response(user_serializer.data)
