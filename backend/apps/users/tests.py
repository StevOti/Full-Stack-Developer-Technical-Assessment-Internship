from django.test import TestCase
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APIClient

from .models import User


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_password = 'Test1234!'
        self.admin = User.objects.create_user(
            email='admin@smartseason.com',
            password=self.admin_password,
            role=User.Role.ADMIN,
        )

    def test_create_user_defaults_to_agent_role(self):
        user = User.objects.create_user(email='agent@smartseason.com', password='Test1234!')

        self.assertEqual(user.role, User.Role.AGENT)
        self.assertTrue(user.check_password('Test1234!'))

    def test_login_endpoint_returns_tokens_for_valid_credentials(self):
        response = self.client.post(
            '/api/auth/login/',
            {'email': self.admin.email, 'password': self.admin_password},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_seed_users_command_creates_demo_accounts(self):
        call_command('seed_users')

        self.assertTrue(User.objects.filter(email='admin@smartseason.com', role=User.Role.ADMIN).exists())
        self.assertTrue(User.objects.filter(email='agent@smartseason.com', role=User.Role.AGENT).exists())

    def test_seed_users_command_is_idempotent(self):
        call_command('seed_users')
        call_command('seed_users')

        self.assertEqual(User.objects.filter(email='admin@smartseason.com').count(), 1)
        self.assertEqual(User.objects.filter(email='agent@smartseason.com').count(), 1)
