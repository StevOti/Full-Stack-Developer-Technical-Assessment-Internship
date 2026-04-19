from django.contrib import admin

from .models import Field


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'stage', 'assigned_agent', 'updated_at')
    list_filter = ('stage', 'crop_type')
    search_fields = ('name', 'crop_type')
    autocomplete_fields = ('assigned_agent',)
