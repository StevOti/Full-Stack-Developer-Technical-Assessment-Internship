from collections import Counter

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Field
from .permissions import IsAdminOrAssignedAgent
from .serializers import FieldSerializer


def get_scoped_fields(user):
    queryset = Field.objects.select_related('assigned_agent').order_by('-updated_at')
    if user.is_authenticated and getattr(user, 'role', None) == 'agent':
        return queryset.filter(assigned_agent=user)
    return queryset


class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAssignedAgent]

    def get_queryset(self):
        return get_scoped_fields(self.request.user)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = get_scoped_fields(request.user)
        serialized_fields = FieldSerializer(queryset, many=True).data

        status_breakdown = Counter(field['status'] for field in serialized_fields)
        stage_breakdown = Counter(field.stage for field in queryset)

        return Response(
            {
                'total_fields': queryset.count(),
                'status_breakdown': {
                    'active': status_breakdown.get('Active', 0),
                    'at_risk': status_breakdown.get('At Risk', 0),
                    'completed': status_breakdown.get('Completed', 0),
                },
                'stage_breakdown': {
                    'planted': stage_breakdown.get(Field.Stage.PLANTED, 0),
                    'growing': stage_breakdown.get(Field.Stage.GROWING, 0),
                    'ready': stage_breakdown.get(Field.Stage.READY, 0),
                    'harvested': stage_breakdown.get(Field.Stage.HARVESTED, 0),
                },
            }
        )
