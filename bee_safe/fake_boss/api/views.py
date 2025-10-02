from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response

from bee_safe.fake_boss.models import Question

from .serializers import QuestionSerializer


class QuestionViewset(viewsets.ViewSet):
    def list(self, request):
        queryset = Question.objects.all()
        serializer = QuestionSerializer(queryset, many=True)
        return Response(serializer.data)
