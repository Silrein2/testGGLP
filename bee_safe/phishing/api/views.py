from django.db.models import Avg
from django.db.models import Count
from django.db.models import Max
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingGameResult
from bee_safe.phishing.models import PhishingIndicator

from .serializers import PhishingAnnotatedEmailSerializer
from .serializers import PhishingGameResultSerializer
from .serializers import PhishingIndicatorSerializer


class PhishingEmailViewSet(viewsets.ModelViewSet):
    queryset = PhishingAnnotatedEmail.objects.all().order_by("-created_at")
    serializer_class = PhishingAnnotatedEmailSerializer
    permission_classes = [
        permissions.IsAdminUser | permissions.AllowAny
    ]  # GET for all, write for admin


class PhishingIndicatorViewSet(viewsets.ModelViewSet):
    queryset = PhishingIndicator.objects.all().select_related("email")
    serializer_class = PhishingIndicatorSerializer
    permission_classes = [permissions.IsAdminUser | permissions.AllowAny]


class PhishingResultViewSet(viewsets.ModelViewSet):
    queryset = PhishingGameResult.objects.all().select_related("player", "email")
    serializer_class = PhishingGameResultSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(player=user)

    @action(detail=False, methods=["get"])
    def leaderboard(self, request):
        top = (
            PhishingGameResult.objects.values("player__username")
            .annotate(best_score=Max("score"))
            .order_by("-best_score")[:10]
        )
        return Response(top)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total_games = PhishingGameResult.objects.count()
        highest = PhishingGameResult.objects.aggregate(Max("score"))["score__max"] or 0
        avg_score = (
            PhishingGameResult.objects.aggregate(Avg("score"))["score__avg"] or 0
        )
        distinct_players = (
            PhishingGameResult.objects.values("player").distinct().count()
        )
        return Response(
            {
                "total_games": total_games,
                "highest_score": highest,
                "average_score": round(avg_score, 2),
                "distinct_players": distinct_players,
            },
        )
