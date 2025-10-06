from django.urls import include
from django.urls import path

from .views import QuestionViewset
from .views import ScoreView

urlpatterns = [
    path("question/", view=QuestionViewset.as_view({"get": "list"}), name="questions"),
    path(
        "score/",
        view=ScoreView.as_view(),
        name="submit-score",
    ),
]
