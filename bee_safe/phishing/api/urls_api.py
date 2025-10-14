from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PhishingEmailViewSet
from .views import PhishingIndicatorViewSet
from .views import PhishingResultViewSet

router = DefaultRouter()
router.register(r"emails", PhishingEmailViewSet, basename="phishing-email")
router.register(r"indicators", PhishingIndicatorViewSet, basename="phishing-indicator")
router.register(r"results", PhishingResultViewSet, basename="phishing-result")

urlpatterns = [
    path("api/phishing/", include(router.urls)),
]
