import uuid

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class ContactSubmissionSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, allow_blank=True, required=False)
    topic = serializers.CharField(max_length=60)
    message = serializers.CharField(max_length=2000)

    def validate_full_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Full name must be at least 3 characters long.')
        return value.strip()

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Message must be at least 10 characters long.')
        return value.strip()

    def validate_topic(self, value):
        allowed_topics = {'General Question', 'Field Support', 'Technical Issue', 'Partnership'}
        if value not in allowed_topics:
            raise serializers.ValidationError('Select a valid contact topic.')
        return value


class ContactSubmissionAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Validate the form and return a tracked acknowledgement id.
        serializer = ContactSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = serializer.validated_data
        submission_id = f"contact-{uuid.uuid4().hex[:12]}"

        return Response(
            {
                'id': submission_id,
                'message': 'Your message has been received. Our team will contact you soon.',
                'submission': payload,
            },
            status=status.HTTP_201_CREATED,
        )