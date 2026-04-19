from django.contrib import admin
from django.urls import include, path
from apps.fields.views import DashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.auth_urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/fields/', include('apps.fields.urls')),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
]
