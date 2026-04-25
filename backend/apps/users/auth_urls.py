from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import RegisterAPIView, SmartSeasonTokenObtainPairView

urlpatterns = [
    # JWT login, refresh, and registration endpoints for the frontend app.
    path('login/', SmartSeasonTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
