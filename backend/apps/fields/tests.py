from datetime import date, timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User

from .models import Field
from .serializers import FieldSerializer


class FieldSerializerTests(TestCase):
    def test_completed_status_when_harvested(self):
        field = Field.objects.create(
            name='North Block',
            crop_type='Maize',
            planting_date=date.today() - timedelta(days=10),
            stage=Field.Stage.HARVESTED,
        )

        self.assertEqual(FieldSerializer(field).data['status'], 'Completed')

    def test_at_risk_status_for_old_growing_field(self):
        field = Field.objects.create(
            name='South Block',
            crop_type='Beans',
            planting_date=date.today() - timedelta(days=61),
            stage=Field.Stage.GROWING,
        )

        self.assertEqual(FieldSerializer(field).data['status'], 'At Risk')

    def test_active_status_for_other_fields(self):
        field = Field.objects.create(
            name='East Block',
            crop_type='Wheat',
            planting_date=date.today() - timedelta(days=20),
            stage=Field.Stage.PLANTED,
        )

        self.assertEqual(FieldSerializer(field).data['status'], 'Active')


class FieldAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@smartseason.com',
            password='Test1234!',
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            email='agent@smartseason.com',
            password='Test1234!',
            role=User.Role.AGENT,
        )
        self.other_agent = User.objects.create_user(
            email='other@smartseason.com',
            password='Test1234!',
            role=User.Role.AGENT,
        )
        self.assigned_field = Field.objects.create(
            name='Assigned Field',
            crop_type='Maize',
            planting_date=date.today() - timedelta(days=15),
            stage=Field.Stage.GROWING,
            assigned_agent=self.agent,
        )
        self.unassigned_field = Field.objects.create(
            name='Unassigned Field',
            crop_type='Rice',
            planting_date=date.today() - timedelta(days=10),
            stage=Field.Stage.PLANTED,
            assigned_agent=self.other_agent,
        )

    def _login(self, email, password='Test1234!'):
        response = self.client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_agent_only_sees_assigned_fields(self):
        self._login(self.agent.email)

        response = self.client.get('/api/fields/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.assigned_field.name)

    def test_admin_sees_all_fields(self):
        self._login(self.admin.email)

        response = self.client.get('/api/fields/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_can_create_field(self):
        self._login(self.admin.email)

        response = self.client.post(
            '/api/fields/',
            {
                'name': 'New Block',
                'crop_type': 'Sorghum',
                'planting_date': str(date.today()),
                'stage': Field.Stage.PLANTED,
                'assigned_agent': self.agent.id,
                'notes': 'Freshly created by admin',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Field.objects.filter(name='New Block').count(), 1)

    def test_agent_can_update_assigned_field(self):
        self._login(self.agent.email)

        response = self.client.patch(
            f'/api/fields/{self.assigned_field.id}/',
            {
                'stage': Field.Stage.READY,
                'notes': 'Field is ready for harvest',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assigned_field.refresh_from_db()
        self.assertEqual(self.assigned_field.stage, Field.Stage.READY)
        self.assertEqual(self.assigned_field.notes, 'Field is ready for harvest')

    def test_agent_cannot_create_field(self):
        self._login(self.agent.email)

        response = self.client.post(
            '/api/fields/',
            {
                'name': 'Blocked Field',
                'crop_type': 'Sorghum',
                'planting_date': str(date.today()),
                'stage': Field.Stage.PLANTED,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_agent_cannot_delete_assigned_field(self):
        self._login(self.agent.email)

        response = self.client.delete(f'/api/fields/{self.assigned_field.id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Field.objects.filter(id=self.assigned_field.id).exists())

    def test_agent_cannot_delete_unassigned_field(self):
        self._login(self.agent.email)

        response = self.client.delete(f'/api/fields/{self.unassigned_field.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Field.objects.filter(id=self.unassigned_field.id).exists())

    def test_admin_can_delete_field(self):
        self._login(self.admin.email)

        response = self.client.delete(f'/api/fields/{self.assigned_field.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Field.objects.filter(id=self.assigned_field.id).exists())


class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@smartseason.com',
            password='Test1234!',
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            email='agent@smartseason.com',
            password='Test1234!',
            role=User.Role.AGENT,
        )
        Field.objects.create(
            name='Old Growing Field',
            crop_type='Maize',
            planting_date=date.today() - timedelta(days=70),
            stage=Field.Stage.GROWING,
            assigned_agent=self.agent,
        )
        Field.objects.create(
            name='Ready Field',
            crop_type='Beans',
            planting_date=date.today() - timedelta(days=20),
            stage=Field.Stage.READY,
            assigned_agent=self.agent,
        )

    def _login(self, email, password='Test1234!'):
        response = self.client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_dashboard_returns_all_fields(self):
        self._login(self.admin.email)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_fields'], 2)
        self.assertEqual(response.data['status_breakdown']['at_risk'], 1)
        self.assertEqual(response.data['status_breakdown']['active'], 1)

    def test_agent_dashboard_returns_assigned_fields_only(self):
        self._login(self.agent.email)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_fields'], 2)
        self.assertEqual(response.data['stage_breakdown']['growing'], 1)
        self.assertEqual(response.data['stage_breakdown']['ready'], 1)
