from djoser.serializers import TokenCreateSerializer as DjoserTokenCreateSerializer
from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers
from rest_framework.serializers import ValidationError

from bee_safe.users.models import BusinessUnit
from bee_safe.users.models import User


class BusinessUnitSerializer(serializers.ModelSerializer[BusinessUnit]):
    class Meta:
        model = BusinessUnit
        fields = ["id", "name", "description"]


class LanguageSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()


class UserStateQuizzesSerializer(serializers.Serializer):
    current_score_quizzes = serializers.IntegerField()
    total_score_quizzes = serializers.IntegerField()
    total_questions_answered_this_session = serializers.IntegerField()
    highest_score_quizzes = serializers.IntegerField()
    total_seconds_at_highest_score_quizzes = serializers.IntegerField()
    times_played_quizzes = serializers.IntegerField()


class UserSerializer(serializers.ModelSerializer[User]):
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()
    business_unit = serializers.CharField()
    is_first_login = serializers.BooleanField()
    quizzes = UserStateQuizzesSerializer()
    total_score_all = serializers.IntegerField()

    class Meta:
        model = User
        fields = [
            "email",
            "business_unit_id",
            "business_unit",
            "is_first_login",
            "quizzes",
            "total_score_all",
        ]
        ref_name = "CustomUser"


@extend_schema_serializer(exclude_fields=["password"])
class CustomTokenRequestSerializer(DjoserTokenCreateSerializer):
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()

    def validate_business_unit_id(self, value):
        if not BusinessUnit.objects.filter(id=value).exists():
            raise ValidationError(_("Invalid business unit ID."))
        return value


class CustomTokenResponseSerializer(serializers.Serializer):
    auth_token = serializers.CharField()
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()
    business_unit = serializers.CharField()
    is_first_login = serializers.BooleanField()
    quizzes = UserStateQuizzesSerializer()
    total_score_all = serializers.IntegerField()
