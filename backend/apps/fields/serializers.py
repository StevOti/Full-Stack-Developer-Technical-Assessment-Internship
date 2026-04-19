from datetime import date

from rest_framework import serializers

from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = (
            'id',
            'name',
            'crop_type',
            'planting_date',
            'stage',
            'assigned_agent',
            'notes',
            'updated_at',
            'created_at',
            'status',
        )
        read_only_fields = ('id', 'updated_at', 'created_at')

    def get_status(self, obj):
        if obj.stage == Field.Stage.HARVESTED:
            return 'Completed'

        days_since_planting = (date.today() - obj.planting_date).days
        if obj.stage == Field.Stage.GROWING and days_since_planting > 60:
            return 'At Risk'

        return 'Active'
