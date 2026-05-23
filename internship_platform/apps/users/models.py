"""
User models for the internship platform.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', null=True, blank=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_faculty(self):
        return self.role == 'faculty'

    @property
    def is_admin_user(self):
        return self.role == 'admin'
