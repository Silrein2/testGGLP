from django.urls import include
from django.urls import path

from .views import QuestionViewset

urlpatterns = [
    path("question/", view=QuestionViewset.as_view({"get": "list"}), name="questions"),
]
