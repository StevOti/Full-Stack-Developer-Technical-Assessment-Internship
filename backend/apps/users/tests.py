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
        self.assertEqual(response.data['user']['role'], User.Role.ADMIN)
        self.assertEqual(response.data['user']['email'], self.admin.email)

    def test_register_endpoint_creates_user_and_returns_tokens(self):
        payload = {
            'email': 'newagent@smartseason.com',
            'password': 'Welcome123!',
            'first_name': 'New',
            'last_name': 'Agent',
            'role': User.Role.AGENT,
        }

        response = self.client.post('/api/auth/register/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], payload['email'])
        self.assertTrue(User.objects.filter(email=payload['email'], role=User.Role.AGENT).exists())

    def test_register_preflight_allows_localhost_dev_origin(self):
        response = self.client.options(
            '/api/auth/register/',
            HTTP_ORIGIN='http://localhost:5174',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['access-control-allow-origin'], 'http://localhost:5174')
        self.assertIn('POST', response['access-control-allow-methods'])

    def test_seed_users_command_creates_demo_accounts(self):
        call_command('seed_users')

        self.assertTrue(User.objects.filter(email='admin@smartseason.com', role=User.Role.ADMIN).exists())
        self.assertTrue(User.objects.filter(email='agent@smartseason.com', role=User.Role.AGENT).exists())

    def test_seed_users_command_is_idempotent(self):
        call_command('seed_users')
        call_command('seed_users')

        self.assertEqual(User.objects.filter(email='admin@smartseason.com').count(), 1)
        self.assertEqual(User.objects.filter(email='agent@smartseason.com').count(), 1)
