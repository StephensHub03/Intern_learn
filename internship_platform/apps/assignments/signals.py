"""
Signals for the assignments app.
Triggers progress update after a submission is saved.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Submission


@receiver(post_save, sender=Submission)
def update_progress_on_submission(sender, instance, created, **kwargs):
    """Update student progress when a submission is evaluated."""
    if created and instance.is_evaluated:
        from apps.progress.utils import update_student_progress
        update_student_progress(instance.student, instance.assignment.course)
