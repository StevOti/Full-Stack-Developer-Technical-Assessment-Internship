from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .auth_serializers import RegisterSerializer, SmartSeasonTokenObtainPairSerializer, serialize_user


class SmartSeasonTokenObtainPairView(TokenObtainPairView):
    serializer_class = SmartSeasonTokenObtainPairSerializer


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Create the user, then issue the same token payload used at login.
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token = SmartSeasonTokenObtainPairSerializer.get_token(user)
        return Response(
            {
                'access': str(token.access_token),
                'refresh': str(token),
                'user': serialize_user(user),
            },
            status=status.HTTP_201_CREATED,
        )
