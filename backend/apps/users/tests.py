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

    def test_refresh_endpoint_returns_new_access_token(self):
        login_response = self.client.post(
            '/api/auth/login/',
            {'email': self.admin.email, 'password': self.admin_password},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(
            '/api/auth/refresh/',
            {'refresh': login_response.data['refresh']},
            format='json',
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

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
        self.assertIn(response['access-control-allow-origin'], ['*', 'http://localhost:5174'])
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


class UserListEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_password = 'Test1234!'
        self.admin = User.objects.create_user(
            email='admin@smartseason.com',
            password=self.admin_password,
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            email='agent@smartseason.com',
            password='Test1234!',
            role=User.Role.AGENT,
        )

    def _authenticate(self, email, password='Test1234!'):
        response = self.client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_can_list_users(self):
        self._authenticate(self.admin.email, self.admin_password)

        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_can_filter_users_by_role(self):
        self._authenticate(self.admin.email, self.admin_password)

        response = self.client.get('/api/users/?role=agent')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['role'], User.Role.AGENT)

    def test_agent_cannot_list_users(self):
        self._authenticate(self.agent.email)

        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PublicEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_ok(self):
        response = self.client.get('/health/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_contact_submission_accepts_valid_payload(self):
        response = self.client.post(
            '/api/contact/',
            {
                'full_name': 'Grace Hopper',
                'email': 'grace@example.com',
                'phone': '+254700000000',
                'topic': 'Technical Issue',
                'message': 'I need help with an issue on the dashboard.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['id'].startswith('contact-'))
        self.assertIn('submission', response.data)

    def test_contact_submission_rejects_invalid_topic(self):
        response = self.client.post(
            '/api/contact/',
            {
                'full_name': 'Grace Hopper',
                'email': 'grace@example.com',
                'topic': 'Other',
                'message': 'This message is long enough to pass length validation.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('topic', response.data)
