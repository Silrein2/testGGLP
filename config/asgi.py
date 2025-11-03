import os
import sys
from pathlib import Path

from django.conf import settings
from django.core.asgi import get_asgi_application
from starlette.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(BASE_DIR / "bee_safe"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

django_application = get_asgi_application()

media_app = StaticFiles(directory=settings.MEDIA_ROOT, html=True)


async def application(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith(settings.MEDIA_URL):
            # Strip the MEDIA_URL prefix
            scope["path"] = path[len(settings.MEDIA_URL) :]
            await media_app(scope, receive, send)
        else:
            await django_application(scope, receive, send)
    elif scope["type"] == "websocket":
        from config.websocket import websocket_application

        await websocket_application(scope, receive, send)
    else:
        raise NotImplementedError(f"Unknown scope type {scope['type']}")
