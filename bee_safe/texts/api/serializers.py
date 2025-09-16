from rest_framework import serializers

from bee_safe.texts.models import Text


class TextSerializer(serializers.ModelSerializer[Text]):
    key = serializers.CharField(source="key.name", read_only=True)

    class Meta:
        model = Text
        fields = ["key", "text", "order"]
