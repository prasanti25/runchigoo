from pathlib import Path

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import FileResponse, HttpResponse
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def spa_index_view(request, path=""):
    normalized_path = (path or "").strip("/")
    if normalized_path and "." in Path(normalized_path).name:
        for candidate_root in [Path(settings.BASE_DIR).parent / "dist", Path(settings.BASE_DIR) / "dist"]:
            candidate = candidate_root / normalized_path
            if candidate.exists() and candidate.is_file():
                return FileResponse(candidate.open("rb"))

    candidates = [
        Path(settings.BASE_DIR).parent / "dist" / "index.html",
        Path(settings.BASE_DIR) / "dist" / "index.html",
        Path(settings.BASE_DIR) / "templates" / "spa" / "index.html",
    ]
    for candidate in candidates:
        if candidate.exists():
            return HttpResponse(candidate.read_text(encoding="utf-8"), content_type="text/html")
    return HttpResponse("<!doctype html><html><head><meta charset=\"utf-8\"><title>RuchiGo</title></head><body><div id=\"root\"></div></body></html>", content_type="text/html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [re_path(r"^(?!api/|admin/|api/v1/|api/schema/|api/docs/|media/|static/).*$", spa_index_view)]
