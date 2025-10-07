from rest_framework import serializers


class ScorePhishingSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    seconds = serializers.IntegerField()
    total_score = serializers.IntegerField()
