from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from apps.fields.views import DashboardView
from apps.users.contact_api import ContactSubmissionAPIView


def health_check(_request):
    # Lightweight probe used by hosting platforms and smoke tests.
    return JsonResponse({'status': 'ok'})


def service_root(_request):
    return JsonResponse(
        {
            'service': 'SmartSeason API',
            'status': 'ok',
            'health': '/health/',
            'auth': '/api/auth/login/',
            'dashboard': '/api/dashboard/',
        }
    )

urlpatterns = [
    # Public and authenticated API routes are mounted here.
    path('', service_root, name='service-root'),
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.auth_urls')),
    path('api/users/', include('apps.users.urls')),
    # Public contact form submissions are handled separately from auth.
    path('api/contact/', ContactSubmissionAPIView.as_view(), name='contact'),
    path('api/fields/', include('apps.fields.urls')),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
]
