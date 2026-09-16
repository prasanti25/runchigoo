import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
application = get_wsgi_application()


def prepare_database():
    """Prepare a newly attached production database once on a cold start."""
    if not (os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")):
        return

    from django.core.management import call_command
    from django.db import connection

    if "api_user" not in connection.introspection.table_names():
        call_command("migrate", interactive=False, verbosity=0)

    admin_email = os.getenv("RUCHIGO_ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("RUCHIGO_ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        return

    from api.models import User

    admin, _ = User.objects.get_or_create(
        email=admin_email,
        defaults={
            "username": admin_email,
            "role": User.Role.ADMIN,
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
        },
    )
    changed = False
    for field, value in {
        "username": admin_email,
        "role": User.Role.ADMIN,
        "is_active": True,
        "is_staff": True,
        "is_superuser": True,
    }.items():
        if getattr(admin, field) != value:
            setattr(admin, field, value)
            changed = True
    if not admin.check_password(admin_password):
        admin.set_password(admin_password)
        changed = True
    if changed:
        admin.save()


prepare_database()

# Vercel's Python runtime looks for a WSGI callable named ``app``.
app = application
