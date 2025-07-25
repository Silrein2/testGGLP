from django.conf import settings
from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from bee_safe.quizzes.api.urls_api import urlpatterns as quizzes_urls
from bee_safe.users.api.urls_api import urlpatterns as users_urls

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# router.register("users", UserViewSet)


app_name = "api"
urlpatterns = router.urls

user_patterns = [
    path("users/", include(users_urls)),
    path("quizzes/", include(quizzes_urls)),
]

urlpatterns += user_patterns
