import json

from django.contrib import admin
from django.utils.html import escape
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TabbedTranslationAdmin
from modeltranslation.admin import TranslationTabularInline
from unfold.admin import ModelAdmin
from unfold.admin import TabularInline

from bee_safe.custom_admin.admin import custom_admin
from bee_safe.phishing.models import PhishingAnnotatedEmail
from bee_safe.phishing.models import PhishingIndicator
from config.settings.base import LANGUAGES


class PhishingIndicatorInline(TabularInline, TranslationTabularInline):
    model = PhishingIndicator
    fields = ("label",)
    verbose_name = _("Wrong label")
    verbose_name_plural = _("Wrong labels")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(x1__lte=0.0, y1__lte=0.0, x2__lte=0.0, y2__lte=0.0)


@admin.register(PhishingAnnotatedEmail)
@admin.register(PhishingAnnotatedEmail, site=custom_admin)
class PhishingAnnotatedEmailAdmin(ModelAdmin):
    list_display = ("title", "created_at")
    readonly_fields = ("authoring_tool",)
    fields = ("title", "image", "authoring_tool")
    inlines = [PhishingIndicatorInline]

    class Media:
        js = (
            "phishing/js/fabric.min.js",
            "phishing/js/admin_phishing_authoring.js",
        )
        css = {"all": ("phishing/css/admin_phishing_authoring.css",)}

    def authoring_tool(self, obj):
        import json

        # Access the PhishingIndicator model from the object's indicators manager
        IndicatorModel = obj.indicators.model

        if not obj.pk or not obj.image:
            return mark_safe(
                "<p><em>Upload and save the image first to enable authoring tool.</em></p>",
            )

        # 1. Dynamically identify all translated label fields (e.g., 'label_en', 'label_fr')
        # This finds fields that start with 'label_' and are not the base 'label'
        translation_fields = [
            f.name
            for f in IndicatorModel._meta.fields
            if f.name.startswith("label_") and f.name != "label"
        ]

        # 2. Extract language codes from the field names (e.g., 'label_en' -> 'en')
        lang_codes = [field.split("label_")[1] for field in translation_fields]

        # 3. Define the list of fields to fetch
        fetch_fields = ["x1", "y1", "x2", "y2"] + translation_fields

        # 4. Fetch the data from the database
        existing_data = list(obj.indicators.values(*fetch_fields))

        # 5. Restructure the fetched data into the required 'labelTranslations' format for the JS
        existing = []
        for item in existing_data:
            translations = {}
            for field_name in translation_fields:
                # Map the database field (e.g., 'label_en') to the language code ('en')
                code = field_name.split("label_")[1]
                translations[code] = item.get(field_name, "")

            existing.append(
                {
                    "x1": item["x1"],
                    "y1": item["y1"],
                    "x2": item["x2"],
                    "y2": item["y2"],
                    "labelTranslations": translations,
                },
            )

        json_existing = json.dumps(existing)
        json_languages = json.dumps(lang_codes)  # Use dynamically derived codes

        # Use the restructured JSON data in the HTML output
        html = f"""
        <div id="phishing-authoring-root">
            <div id="phishing-canvas-wrap"
                data-image-url="{obj.image.url}"
                data-indicators="{escape(json_existing)}"
                data-languages='{json_languages}'>
                <canvas id="phishing-canvas"></canvas>
            </div>
            <div id="phishing-authoring-controls">
                <button type="button" id="phishing-new-rect">New Box</button>
                <button type="button" id="phishing-clear">Clear All</button>
                <span class="hint">Double-click a rect to edit labels. Select and press Delete to remove.</span>
            </div>
            <input type="hidden" id="phishing-indicators-hidden" name="phishing_indicators"
                value='{escape(json_existing)}'>
        </div>
        """
        return mark_safe(html)

    authoring_tool.short_description = "Authoring tool (draw boxes & labels)"

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        raw = request.POST.get("phishing_indicators")
        if not raw:
            return

        try:
            parsed = json.loads(raw)
        except Exception:
            return

        PhishingIndicator.objects.filter(email=obj).delete()

        new_indicators = []
        for i in parsed:
            translations = i.get("labelTranslations", {})
            indicator = PhishingIndicator(
                email=obj,
                x1=i.get("x1", 0.0),
                y1=i.get("y1", 0.0),
                x2=i.get("x2", 0.0),
                y2=i.get("y2", 0.0),
            )
            for lang, _ in LANGUAGES:
                setattr(indicator, f"label_{lang}", translations.get(lang, ""))
            new_indicators.append(indicator)

        PhishingIndicator.objects.bulk_create(new_indicators)


@admin.register(PhishingIndicator)
@admin.register(PhishingIndicator, site=custom_admin)
class PhishingIndicatorAdmin(ModelAdmin, TabbedTranslationAdmin):
    list_display = ("id", "email", "label", "x1", "y1", "x2", "y2", "created_at")
    readonly_fields = ("email", "label", "x1", "y1", "x2", "y2", "created_at")
