"""
ASGI config for bee_safe project.
Exposes the ASGI callable as a module-level variable named `application`.
Handles:
 - Django HTTP requests
 - Static files via WhiteNoise
 - User-uploaded media asynchronously
 - WebSocket connections
"""

import mimetypes
import os
import sys
from pathlib import Path

import aiofiles  # async file reading
from django.core.asgi import get_asgi_application
from django.http import HttpResponseNotFound
from whitenoise import WhiteNoise

# --- Setup paths ---
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(BASE_DIR / "bee_safe"))

# Load Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

# --- Django ASGI app (sync) ---
django_asgi_app = get_asgi_application()
# Wrap with WhiteNoise for static files
django_asgi_app = WhiteNoise(
    django_asgi_app,
    root=str(BASE_DIR / "bee_safe" / "static"),
    prefix="/static/",
)

# Import WebSocket app
# --- Media app ---
from django.conf import settings

from config.websocket import websocket_application  # noqa: E402

MEDIA_ROOT = Path(settings.MEDIA_ROOT)
MEDIA_URL = (
    settings.MEDIA_URL if settings.MEDIA_URL.endswith("/") else settings.MEDIA_URL + "/"
)


async def media_app(scope, receive, send):
    path_info = scope.get("path", "")
    rel_path = path_info[len(MEDIA_URL) :].lstrip("/")
    file_path = MEDIA_ROOT / rel_path

    if not file_path.exists() or not file_path.is_file():
        response = HttpResponseNotFound("Not found")
        await response(scope, receive, send)
        return

    mime_type, _ = mimetypes.guess_type(str(file_path))
    mime_type = mime_type or "application/octet-stream"

    headers = [
        (b"content-type", mime_type.encode("utf-8")),
        (b"cache-control", b"no-cache, no-store, must-revalidate"),
        (b"pragma", b"no-cache"),
        (b"expires", b"0"),
    ]

    await send({"type": "http.response.start", "status": 200, "headers": headers})

    async with aiofiles.open(file_path, "rb") as f:
        chunk = await f.read(8192)
        while chunk:
            await send({"type": "http.response.body", "body": chunk, "more_body": True})
            chunk = await f.read(8192)
    # Finish response
    await send({"type": "http.response.body", "body": b"", "more_body": False})


# --- Main ASGI router ---
async def application(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith(MEDIA_URL):
            await media_app(scope, receive, send)
        else:
            # Django ASGI app handles static + regular HTTP requests
            await django_asgi_app(scope, receive, send)
    elif scope["type"] == "websocket":
        await websocket_application(scope, receive, send)
    else:
        raise NotImplementedError(f"Unknown scope type {scope['type']}")
