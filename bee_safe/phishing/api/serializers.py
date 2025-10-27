from rest_framework import serializers

from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingGameResult
from bee_safe.phishing.models import PhishingIndicator


class ScorePhishingSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    seconds = serializers.IntegerField()
    total_score = serializers.IntegerField()
    times_played = serializers.IntegerField()


class PhishingIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhishingIndicator
        fields = ["id", "x1", "y1", "x2", "y2", "label"]


class PhishingAnnotatedEmailSerializer(serializers.ModelSerializer):
    indicators = PhishingIndicatorSerializer(many=True, read_only=True)

    class Meta:
        model = PhishingAnnotatedEmail
        fields = ["id", "title", "image", "created_at", "indicators"]


class PhishingGameResultSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player.username", read_only=True)

    class Meta:
        model = PhishingGameResult
        fields = ["id", "player_name", "score", "total_time", "email", "created_at"]
