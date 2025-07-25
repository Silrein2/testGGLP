from django.urls import include
from django.urls import path

from .views import QuestionView
from .views import TextView

urlpatterns = [
    path("question/", view=QuestionView.as_view(), name="next-question"),
    path("texts/", view=TextView.as_view({"get": "list"}), name="text-list"),
]
