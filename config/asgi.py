"""
ASGI config for Bee Safe project.
Serves Django, WebSocket, static, and media files all from the same ASGI app.
No external Nginx or CDN required.
"""

import mimetypes
import os
import sys
from pathlib import Path

import aiofiles
from django.conf import settings
from django.core.asgi import get_asgi_application
from whitenoise import ASGIStaticFiles

# --- Base setup ---------------------------------------------------------------
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(BASE_DIR / "bee_safe"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

# --- Core ASGI apps -----------------------------------------------------------
django_application = get_asgi_application()

# Load WebSocket application (after Django)
from config.websocket import websocket_application  # noqa: E402

# --- Optional static serving (WhiteNoise for ASGI) ----------------------------
# Handles /static/
django_application = ASGIStaticFiles(
    django_application,
    root=settings.STATIC_ROOT,
    prefix=settings.STATIC_URL,
)


# --- Async media file server --------------------------------------------------
async def media_application(scope, receive, send):
    """
    Serve user-uploaded media files asynchronously from MEDIA_ROOT.
    """
    path = scope.get("path", "")
    rel_path = path[len(settings.MEDIA_URL) :].lstrip("/")
    file_path = Path(settings.MEDIA_ROOT) / rel_path

    # Validate path
    if not file_path.exists() or not file_path.is_file():
        await send(
            {
                "type": "http.response.start",
                "status": 404,
                "headers": [(b"content-type", b"text/plain; charset=utf-8")],
            },
        )
        await send(
            {
                "type": "http.response.body",
                "body": b"File not found",
            },
        )
        return

    content_type, _ = mimetypes.guess_type(str(file_path))
    content_type = content_type or "application/octet-stream"
    file_size = file_path.stat().st_size

    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [
                (b"content-type", content_type.encode()),
                (b"content-length", str(file_size).encode()),
                (b"cache-control", b"no-cache, no-store, must-revalidate"),
            ],
        },
    )

    async with aiofiles.open(file_path, "rb") as f:
        while True:
            chunk = await f.read(8192)
            if not chunk:
                break
            await send({"type": "http.response.body", "body": chunk, "more_body": True})

    await send({"type": "http.response.body", "body": b"", "more_body": False})


# --- Main ASGI router ---------------------------------------------------------
async def application(scope, receive, send):
    """
    Route ASGI requests:
    - HTTP /media/*  → async file streaming
    - HTTP others    → Django (via WhiteNoise)
    - WebSocket      → websocket_application
    """
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith(settings.MEDIA_URL):
            await media_application(scope, receive, send)
        else:
            await django_application(scope, receive, send)
    elif scope["type"] == "websocket":
        await websocket_application(scope, receive, send)
    else:
        msg = f"Unsupported ASGI scope type: {scope['type']}"
        raise NotImplementedError(msg)
