from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from modeltranslation.admin import TabbedTranslationAdmin
from modeltranslation.admin import TranslationStackedInline
from modeltranslation.admin import TranslationTabularInline
from unfold.admin import ModelAdmin
from unfold.admin import StackedInline
from unfold.admin import TabularInline
from unfold.contrib.import_export.forms import ExportForm
from unfold.contrib.import_export.forms import ImportForm

from bee_safe.custom_admin.admin import custom_admin

from .models import Answer
from .models import Question
from .resources import QuestionResource


class AnswerInline(TabularInline, TranslationTabularInline):
    model = Answer
    extra = 4
    fields = ["text", "is_correct"]


@admin.register(Question)
@admin.register(Question, site=custom_admin)
class QuestionAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = QuestionResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    inlines = [AnswerInline]
    list_display = ["text"]
    search_fields = ["text"]

    def get_inline_instances(self, request, obj=None):
        return [
            AnswerInline(self.model, self.admin_site),
        ]
