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

from .forms import YesNoAnswerForm
from .models import MatchOptionPair
from .models import MCQOption
from .models import Question
from .models import QuizQuestion
from .models import YesNoAnswer
from .resources import QuestionResource


class MCQOptionInline(TabularInline, TranslationTabularInline):
    model = MCQOption
    extra = 4
    fields = ["text", "is_correct"]


class MatchOptionPairInline(StackedInline, TranslationStackedInline):
    model = MatchOptionPair
    extra = 2
    fields = ["option_a", "option_b"]


class YesNoAnswerInline(TabularInline, TranslationTabularInline):
    model = YesNoAnswer
    form = YesNoAnswerForm
    extra = 1
    fields = ["statement", "is_yes"]


@admin.register(Question)
@admin.register(Question, site=custom_admin)
class QuestionAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = QuestionResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    inlines = [MatchOptionPairInline]
    list_display = ["text", "question_type"]
    ordering = ["id"]
    search_fields = ["text"]

    def get_inline_instances(self, request, obj=None):
        if obj and obj.question_type == Question.MATCH:
            return [
                MatchOptionPairInline(self.model, self.admin_site),
            ]
        if obj and obj.question_type == Question.YES_NO:
            return [
                YesNoAnswerInline(self.model, self.admin_site),
            ]
        return [
            MCQOptionInline(self.model, self.admin_site),
        ]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(ModelAdmin):
    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
