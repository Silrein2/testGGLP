"""
WSGI config for bee_safe project.

This configuration serves:
 - Static files via WhiteNoise (cached, immutable)
 - User-uploaded media via custom lightweight WSGI wrapper
"""

import mimetypes
import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application
from django.http import HttpResponseNotFound
from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

# Initialize Django
application = get_wsgi_application()

# --- WhiteNoise for static files ------------------------------------------------
from config.settings import base

static_prefix = (
    base.STATIC_URL if base.STATIC_URL.endswith("/") else base.STATIC_URL + "/"
)
media_prefix = base.MEDIA_URL if base.MEDIA_URL.endswith("/") else base.MEDIA_URL + "/"

application = WhiteNoise(
    application,
    root=base.STATIC_ROOT,
    prefix=static_prefix,
)

# --- Custom dynamic MEDIA serving layer ----------------------------------------
MEDIA_ROOT = Path(base.MEDIA_ROOT)
MEDIA_URL = media_prefix


def media_app(environ, start_response):
    """Serve MEDIA files dynamically (user uploads)."""
    path_info = environ.get("PATH_INFO", "")
    if not path_info.startswith(MEDIA_URL):
        return application(environ, start_response)

    rel_path = path_info[len(MEDIA_URL) :].lstrip("/")
    file_path = MEDIA_ROOT / rel_path

    if not file_path.exists() or not file_path.is_file():
        response = HttpResponseNotFound("Not found")
        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"Not found"]

    mime_type, _ = mimetypes.guess_type(str(file_path))
    mime_type = mime_type or "application/octet-stream"

    # Return file as streaming response (efficient)
    start_response(
        "200 OK",
        [
            ("Content-Type", mime_type),
            ("Cache-Control", "no-cache, no-store, must-revalidate"),
            ("Pragma", "no-cache"),
            ("Expires", "0"),
        ],
    )
    with open(file_path, "rb") as f:
        yield from iter(lambda: f.read(8192), b"")


# --- Final composition: static + media -----------------------------------------
def full_app(environ, start_response):
    path_info = environ.get("PATH_INFO", "")
    if path_info.startswith(MEDIA_URL):
        return media_app(environ, start_response)
    return application(environ, start_response)


application = full_app
