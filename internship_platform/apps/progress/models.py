"""
Progress model for tracking student course completion.
"""
from django.db import models
from django.conf import settings
from apps.courses.models import Course
from apps.sessions.models import LiveSession
from apps.assignments.models import Assignment


class Progress(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress_records',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='progress_records',
    )
    completed_sessions = models.ManyToManyField(
        LiveSession,
        blank=True,
        related_name='completed_by',
    )
    completed_assignments = models.ManyToManyField(
        Assignment,
        blank=True,
        related_name='completed_by',
    )
    progress_percent = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'progress'
        unique_together = ('student', 'course')

    def __str__(self):
        return f'{self.student.username} - {self.course.title}: {self.progress_percent:.1f}%'

    def calculate_progress(self):
        """Compute progress_percent based on completed sessions and assignments."""
        total_sessions = self.course.sessions.count()
        total_assignments = self.course.assignments.count()
        total_items = total_sessions + total_assignments

        if total_items == 0:
            return 0.0

        completed = (
            self.completed_sessions.count() + self.completed_assignments.count()
        )
        return round((completed / total_items) * 100, 2)

    def save_progress(self):
        """Recalculate and save progress_percent."""
        self.progress_percent = self.calculate_progress()
        self.save(update_fields=['progress_percent', 'last_updated'])
        return self.progress_percent
