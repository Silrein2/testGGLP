from django.urls import include
from django.urls import path

from .views import QuestionView

urlpatterns = [
    path("question/", view=QuestionView.as_view(), name="next-question"),
]
