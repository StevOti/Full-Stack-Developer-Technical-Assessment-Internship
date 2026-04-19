from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        AGENT = 'agent', 'Field Agent'

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.AGENT)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
