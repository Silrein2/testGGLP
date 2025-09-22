from drf_spectacular.utils import extend_schema
from rest_framework.authentication import TokenAuthentication
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from bee_safe.texts.api.serializers import TextSerializer
from bee_safe.texts.models import Text


class TextView(
    GenericViewSet,
    RetrieveModelMixin,
    ListModelMixin,
):
    authentication_classes = []
    permission_classes = []
    serializer_class = TextSerializer

    def get_queryset(self):
        return Text.objects.all().order_by("key__name", "order")

    @extend_schema(
        responses=TextSerializer,
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class TextByKeyView(GenericViewSet, ListModelMixin):
    authentication_classes = []
    permission_classes = []
    serializer_class = TextSerializer

    def get_queryset(self):
        key = self.kwargs.get("key")
        return Text.objects.filter(key__name=key).order_by("key__name", "order")

    @extend_schema(
        responses=TextSerializer,
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
