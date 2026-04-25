from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrAssignedAgent(BasePermission):
    def has_permission(self, request, view):
        # Only authenticated admins can create fields; other methods defer to object checks.
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == 'POST':
            return getattr(request.user, 'role', None) == 'admin'
        return True

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)

        if user_role == 'admin':
            return True

        # Field agents may only read or update the field assigned to them.
        if request.method == 'DELETE':
            return False

        if request.method in SAFE_METHODS:
            return obj.assigned_agent_id == request.user.id

        return obj.assigned_agent_id == request.user.id
