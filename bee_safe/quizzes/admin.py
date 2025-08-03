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
from unfold.contrib.import_export.forms import SelectableFieldsExportForm

from bee_safe.custom_admin.admin import custom_admin

from .forms import YesNoAnswerForm
from .models import MatchOptionPair
from .models import MCQOption
from .models import Question
from .models import QuizQuestion
from .models import Text
from .models import YesNoAnswer
from .resources import QuestionResource
from .resources import TextResource


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


@admin.register(Text)
@admin.register(Text, site=custom_admin)
class TextAdmin(ModelAdmin, ImportExportModelAdmin, TabbedTranslationAdmin):
    resource_class = TextResource
    list_display = ("key", "text")

    def has_delete_permission(self, request, obj=None):
        if obj and (
            obj.key in (Text.RIGHT_ANSWER, Text.WRONG_ANSWER, Text.YES, Text.NO)
        ):
            return False
        return super().has_delete_permission(request, obj)


@admin.register(QuizQuestion)
class QuizQuestionAdmin(ModelAdmin):
    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
