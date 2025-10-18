from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

class CustomAuth(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # https://github.com/Gameka-games/amway-bee-safe-backend/issues/23
        # To prevent case sensitive, make username lowercase as User.save make username(email) lowercase
        if username:
            username = username.lower()
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(username=username)
        except UserModel.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None

    def user_can_authenticate(self, user):
        # Add your custom logic here, e.g., checking if the user is active or belongs to a specific group
        return user.is_active and user.is_staff
