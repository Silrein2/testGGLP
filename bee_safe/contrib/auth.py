from rest_framework.authentication import SessionAuthentication


class SwaggerSessionAuthentication(SessionAuthentication):
    """
    Enables SessionAuthentication only for Swagger UI requests.
    """

    def authenticate(self, request):
        if request.path.startswith("/api/docs/") or request.path.startswith(
            "/api/schema/",
        ):
            return super().authenticate(request)
        return None  # ignore session authentication for all other requests
