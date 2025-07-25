from django.urls import path

from .views import BusinessUnitView
from .views import LanguageListView
from .views import TextView
from .views import UserViewSet

urlpatterns = [
    path(
        "business-units/",
        BusinessUnitView.as_view({"get": "list"}),
        name="business-units",
    ),
    path("languages/", LanguageListView.as_view(), name="language-list"),
    path("texts/", TextView.as_view({"get": "list"}), name="text-list"),
    path("state/", UserViewSet.as_view({"get": "state"}), name="user-state"),
]
