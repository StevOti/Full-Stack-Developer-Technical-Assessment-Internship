from django.conf import settings
from django.db import models


class Field(models.Model):
    class Stage(models.TextChoices):
        PLANTED = 'planted', 'Planted'
        GROWING = 'growing', 'Growing'
        READY = 'ready', 'Ready'
        HARVESTED = 'harvested', 'Harvested'

    name = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=255)
    planting_date = models.DateField()
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.PLANTED)
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='assigned_fields',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
