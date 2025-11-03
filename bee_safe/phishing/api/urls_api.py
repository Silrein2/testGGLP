from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PhishingEmailViewSet
from .views import ScoreView

router = DefaultRouter()
router.register(r"emails", PhishingEmailViewSet, basename="phishing-email")

urlpatterns = [
    path(
        "score/",
        view=ScoreView.as_view(),
        name="score-phishing",
    ),
    path("api/phishing/", include(router.urls)),
]
