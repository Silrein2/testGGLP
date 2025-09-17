from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from modeltranslation.admin import TabbedTranslationAdmin
from unfold.admin import ModelAdmin
from unfold.contrib.import_export.forms import ExportForm
from unfold.contrib.import_export.forms import ImportForm

from bee_safe.custom_admin.admin import custom_admin

from .models import Key
from .models import Text
from .resources import TextResource


@admin.register(Key)
@admin.register(Key, site=custom_admin)
class KeyAdmin(ModelAdmin, ImportExportModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm


@admin.register(Text)
@admin.register(Text, site=custom_admin)
class TextAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = TextResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ("key", "text", "order")
    ordering = ("key", "order")
    search_fields = ("key__name", "text")
    list_filter = ("key",)
