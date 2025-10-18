import threading

from djoser.views import TokenCreateView as DjoserTokenCreateView
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from bee_safe.users.api.serializers import BusinessUnitSerializer
from bee_safe.users.api.serializers import CustomTokenRequestSerializer
from bee_safe.users.api.serializers import CustomTokenResponseSerializer
from bee_safe.users.api.serializers import LanguageSerializer
from bee_safe.users.api.serializers import UserSerializer
from bee_safe.users.models import EmailDomain
from bee_safe.users.models import User
from config.settings.base import LANGUAGES


class BusinessUnitView(
    GenericViewSet,
    RetrieveModelMixin,
    ListModelMixin,
):
    authentication_classes = []
    permission_classes = []

    serializer_class = BusinessUnitSerializer

    def get_queryset(self, *args, **kwargs):
        return BusinessUnitSerializer.Meta.model.objects.all()

    @extend_schema(
        responses=BusinessUnitSerializer,
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class LanguageListView(APIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = LanguageSerializer(many=True)

    def get(self, request):
        languages = [{"code": code, "name": name} for code, name in LANGUAGES]
        return Response(languages)


class UserViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = "username"

    def get_queryset(self, *args, **kwargs):
        assert isinstance(self.request.user.id, int)
        return self.queryset.filter(id=self.request.user.id)

    @action(detail=False)
    def state(self, request):
        serializer = UserSerializer(request.user.state, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class CustomTokenCreateView(DjoserTokenCreateView):
    @extend_schema(
        request=CustomTokenRequestSerializer,
        responses={200: CustomTokenResponseSerializer},
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get("email").lower()
        business_unit_id = request.data.get("business_unit_id")
        request.data["password"] = "P@55w0rd"  # noqa: S105

        try:
            EmailDomain.objects.get(domain=email.split("@")[1])
            user = User.objects.get(
                email=email,
                # https://github.com/Gameka-games/amway-bee-safe-backend/issues/24
#                 business_unit_id=business_unit_id,
            )

            # https://github.com/Gameka-games/amway-bee-safe-backend/issues/25
            # We skip password check
            # if not user.check_password(request.data["password"]):
            #     raise User.DoesNotExist  # noqa: TRY301

            # https://github.com/Gameka-games/amway-bee-safe-backend/issues/24
            if user.business_unit_id != business_unit_id:
                user.business_unit_id = business_unit_id
                user.save()
        except User.DoesNotExist:
            user = User.objects.create_user(
                username="",
                email=email,
                password=request.data["password"],
                business_unit_id=business_unit_id,
            )
        serializer = CustomTokenRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if user.business_unit.id != serializer.validated_data["business_unit_id"]:
            raise ValidationError({"business_unit_id": ["Invalid business unit ID."]})

        token, _ = Token.objects.get_or_create(user=user)

        def mark_not_first_login():
            if user.is_first_login:
                user.is_first_login = False
                user.save()

        threading.Timer(0.1, mark_not_first_login).start()

        data = {
            "auth_token": token.key,
        }
        serializer = UserSerializer(user.state, context={"request": request})
        data.update(serializer.data)

        return Response(data, status=200)
