from django import forms

from .models import YesNoAnswer


class YesNoAnswerForm(forms.ModelForm):
    class Meta:
        model = YesNoAnswer
        fields = ["is_yes"]

    def has_changed(self):
        return True
