from django.urls import path

from .views import TextByKeyView
from .views import TextView

urlpatterns = [
    path("all/", view=TextView.as_view({"get": "list"}), name="text-list"),
    path(
        "<str:key>/",
        view=TextByKeyView.as_view({"get": "list"}),
        name="text-by-key",
    ),
]
