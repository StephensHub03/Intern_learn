"""
Certificate model.
"""
import uuid
from django.db import models
from django.conf import settings
from apps.courses.models import Course


class Certificate(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)

    class Meta:
        db_table = 'certificates'
        unique_together = ('student', 'course')

    def __str__(self):
        return f'Certificate: {self.student.username} - {self.course.title}'
