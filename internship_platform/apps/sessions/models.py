"""
LiveSession model.
"""
from django.db import models
from apps.courses.models import Course


class LiveSession(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='sessions',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    meet_link = models.URLField(blank=True, null=True)
    scheduled_at = models.DateTimeField()
    google_event_id = models.CharField(max_length=255, blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'live_sessions'
        ordering = ['scheduled_at']

    def __str__(self):
        return f'{self.title} - {self.course.title}'
