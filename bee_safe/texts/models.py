from django.db import models
from django.utils.translation import gettext as _

from bee_safe.contrib import mixins


class Key(mixins.TimeStampedModel):
    name = models.CharField(unique=True)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Key")
        verbose_name_plural = _("Keys")

    def __str__(self):
        return self.name


class Text(mixins.TimeStampedModel):
    text = models.TextField(default="", blank=True)
    key = models.ForeignKey(Key, on_delete=models.CASCADE, related_name="text")
    order = models.IntegerField(default=0)

    class Meta(mixins.TimeStampedModel.Meta):
        verbose_name = _("Text")
        verbose_name_plural = _("Texts")

    def __str__(self):
        return self.key.name
