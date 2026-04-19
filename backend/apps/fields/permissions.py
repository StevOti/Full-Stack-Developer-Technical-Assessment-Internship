from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrAssignedAgent(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == 'POST':
            return getattr(request.user, 'role', None) == 'admin'
        return True

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'admin':
            return True
        if request.method in SAFE_METHODS:
            return obj.assigned_agent_id == request.user.id
        return obj.assigned_agent_id == request.user.id
