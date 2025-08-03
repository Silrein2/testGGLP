from django import forms

from .models import YesNoAnswer


class YesNoAnswerForm(forms.ModelForm):
    class Meta:
        model = YesNoAnswer
        fields = ["statement", "is_yes"]

    def has_changed(self):
        return True
