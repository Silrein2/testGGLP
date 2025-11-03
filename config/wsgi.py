"""
WSGI config for bee_safe project.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It exposes a module-level variable
named ``application``. Django's ``runserver`` and WSGI servers discover
this application via the ``WSGI_APPLICATION`` setting.

This version uses WhiteNoise to serve static and media files for intranet-only deployment.
"""

import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(BASE_DIR / "bee_safe"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

application = get_wsgi_application()

from config.settings import base

application = WhiteNoise(application, root=base.STATIC_ROOT, prefix=base.STATIC_URL)
application.add_files(base.MEDIA_ROOT, prefix=base.MEDIA_URL)
