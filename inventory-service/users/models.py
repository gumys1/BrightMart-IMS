from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
	class Role(models.TextChoices):
		STAFF = "STAFF", "Staff"
		MANAGER = "MANAGER", "Manager"

	full_name = models.CharField(max_length=255)
	role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return self.get_full_name() or self.username
