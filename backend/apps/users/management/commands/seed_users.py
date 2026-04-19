from django.core.management.base import BaseCommand

from apps.users.models import User


class Command(BaseCommand):
    help = 'Seed demo admin and field agent users.'

    def handle(self, *args, **options):
        users = [
            {
                'email': 'admin@smartseason.com',
                'password': 'Test1234!',
                'role': User.Role.ADMIN,
                'first_name': 'Demo',
                'last_name': 'Admin',
            },
            {
                'email': 'agent@smartseason.com',
                'password': 'Test1234!',
                'role': User.Role.AGENT,
                'first_name': 'Demo',
                'last_name': 'Agent',
            },
        ]

        for user_data in users:
            user, _ = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'role': user_data['role'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                },
            )
            user.role = user_data['role']
            user.first_name = user_data['first_name']
            user.last_name = user_data['last_name']
            user.set_password(user_data['password'])
            user.save(update_fields=['role', 'first_name', 'last_name', 'password'])
            self.stdout.write(self.style.SUCCESS(f'Seeded {user.email}'))
