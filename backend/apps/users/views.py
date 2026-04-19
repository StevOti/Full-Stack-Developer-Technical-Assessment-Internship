from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import User
from .permissions import IsAdminRole
from .serializers import UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = User.objects.all().order_by('email')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset
