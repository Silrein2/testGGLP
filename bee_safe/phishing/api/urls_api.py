from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns

from bee_safe.phishing.api.views import PhishingAnnotatedEmailStartEndView
from bee_safe.phishing.api.views import PhishingAnnotatedEmailView
from bee_safe.phishing.api.views import ScoreView

router = DefaultRouter()

urlpatterns = [
    path("", include(router.urls)),
    path(
        "score/",
        view=ScoreView.as_view(),
        name="score-phishing",
    ),
    path(
        "emails/",
        view=PhishingAnnotatedEmailView.as_view(),
        name="phishing-emails",
    ),
    path(
        "emails/start-end",
        view=PhishingAnnotatedEmailStartEndView.as_view(),
    ),
]
