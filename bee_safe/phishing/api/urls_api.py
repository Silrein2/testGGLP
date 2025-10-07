from django.urls import include
from django.urls import path

from .views import ScoreView

urlpatterns = [
    path(
        "score/",
        view=ScoreView.as_view(),
        name="score-phishing",
    ),
]
