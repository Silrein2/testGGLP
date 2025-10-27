import json

from django.contrib import admin
from django.utils.safestring import mark_safe

from bee_safe.custom_admin.admin import custom_admin

from .models import PhishingAnnotatedEmail
from .models import PhishingGameResult
from .models import PhishingIndicator


@admin.register(PhishingAnnotatedEmail)
# @admin.register(PhishingAnnotatedEmail, site=custom_admin)
class PhishingAnnotatedEmailAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at")
    readonly_fields = ("authoring_tool",)
    fields = ("title", "image", "authoring_tool")

    class Media:
        js = (
            "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js",
            "phishing/js/admin_phishing_authoring.js",
        )
        css = {"all": ("phishing/css/admin_phishing_authoring.css",)}

    def authoring_tool(self, obj):
        if not obj.pk or not obj.image:
            return mark_safe(
                "<p><em>Upload and save the image first to enable authoring tool.</em></p>"
            )
        existing = list(obj.indicators.values("x1", "y1", "x2", "y2", "label"))
        html = f"""
        <div id="phishing-authoring-root">
          <div id="phishing-canvas-wrap" data-image-url="{obj.image.url}" data-indicators='{json.dumps(existing)}'>
            <canvas id="phishing-canvas"></canvas>
          </div>
          <div id="phishing-authoring-controls">
            <button type="button" id="phishing-new-rect">New Box</button>
            <button type="button" id="phishing-clear">Clear All</button>
            <span class="hint">Double-click a rect to edit label. Select and press Delete to remove.</span>
          </div>
          <input type="hidden" id="phishing-indicators-hidden" name="phishing_indicators" value='{json.dumps(existing)}'>
        </div>
        """
        return mark_safe(html)

    authoring_tool.short_description = "Authoring tool (draw boxes & labels)"

    def save_model(self, request, obj, form, change):
        """
        Save the PhishingAnnotatedEmail; then parse hidden field "phishing_indicators"
        and sync PhishingIndicator rows.
        """
        super().save_model(request, obj, form, change)

        raw = request.POST.get("phishing_indicators")
        if raw is None:
            return

        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = []

        PhishingIndicator.objects.filter(email=obj).delete()
        to_create = [
            PhishingIndicator(
                email=obj,
                x1=float(i.get("x1", 0.0)),
                y1=float(i.get("y1", 0.0)),
                x2=float(i.get("x2", 0.0)),
                y2=float(i.get("y2", 0.0)),
                label=i.get("label", ""),
            )
            for i in parsed
        ]
        PhishingIndicator.objects.bulk_create(to_create)


@admin.register(PhishingIndicator)
# @admin.register(PhishingIndicator, site=custom_admin)
class PhishingIndicatorAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "label", "x1", "y1", "x2", "y2", "created_at")
    readonly_fields = ("email", "label", "x1", "y1", "x2", "y2", "created_at")


@admin.register(PhishingGameResult)
# @admin.register(PhishingGameResult, site=custom_admin)
class PhishingGameResultAdmin(admin.ModelAdmin):
    list_display = ("id", "player", "email", "score", "total_time", "created_at")
    list_filter = ("created_at", "email")
    search_fields = ("player__username",)
