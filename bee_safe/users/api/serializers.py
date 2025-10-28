from djoser.serializers import TokenCreateSerializer as DjoserTokenCreateSerializer
from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers

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


class UserStatePhishingSerializer(serializers.Serializer):
    current_score_phishing = serializers.IntegerField()
    total_score_phishing = serializers.IntegerField()
    highest_score_phishing = serializers.IntegerField()
    total_seconds_at_highest_score_phishing = serializers.IntegerField()
    times_played_phishing = serializers.IntegerField()


class UserStateFakeBossSerializer(serializers.Serializer):
    total_score_fake_boss = serializers.IntegerField()
    total_seconds_fake_boss = serializers.IntegerField()
    best_total_seconds_fake_boss = serializers.IntegerField()


class UserSerializer(serializers.ModelSerializer[User]):
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()
    business_unit = serializers.CharField()
    is_first_login = serializers.BooleanField()
    quizzes = UserStateQuizzesSerializer()
    phishing = UserStatePhishingSerializer()
    fake_boss = UserStateFakeBossSerializer()
    total_score_all = serializers.IntegerField()

    class Meta:
        model = User
        fields = [
            "email",
            "business_unit_id",
            "business_unit",
            "is_first_login",
            "quizzes",
            "phishing",
            "fake_boss",
            "total_score_all",
        ]
        ref_name = "CustomUser"


@extend_schema_serializer(exclude_fields=["password"])
class CustomTokenRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()

    def validate(self, attrs):
        email = attrs["email"].lower().strip()
        business_unit_id = attrs["business_unit_id"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found."})

        if user.business_unit_id is None:
            raise serializers.ValidationError(
                {"business_unit_id": "User has no assigned business unit."}
            )

        if str(user.business_unit_id) != str(business_unit_id):
            raise serializers.ValidationError(
                {
                    "business_unit_id": f"Invalid business unit ID. Expected {user.business_unit_id}."
                },
            )

        attrs["user"] = user
        return attrs


class CustomTokenResponseSerializer(serializers.Serializer):
    auth_token = serializers.CharField()
    email = serializers.EmailField()
    business_unit_id = serializers.IntegerField()
    business_unit = serializers.CharField()
    is_first_login = serializers.BooleanField()
    quizzes = UserStateQuizzesSerializer()
    phishing = UserStatePhishingSerializer()
    fake_boss = UserStateFakeBossSerializer()
    total_score_all = serializers.IntegerField()
