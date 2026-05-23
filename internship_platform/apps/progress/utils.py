"""
Utility functions for progress tracking.
"""
import logging

logger = logging.getLogger(__name__)


def update_student_progress(student, course):
    """
    Update or create a Progress record for a student/course pair.
    Triggers certificate generation if progress reaches 100%.
    """
    from .models import Progress
    from apps.assignments.models import Submission
    from apps.certificates.tasks import generate_certificate

    progress, _ = Progress.objects.get_or_create(student=student, course=course)

    # Add completed assignments
    completed_assignment_ids = Submission.objects.filter(
        student=student,
        assignment__course=course,
        is_evaluated=True,
    ).values_list('assignment_id', flat=True)

    progress.completed_assignments.set(completed_assignment_ids)
    new_percent = progress.save_progress()

    logger.info(
        f'Progress updated: {student.username} in {course.title} → {new_percent}%'
    )

    # Trigger certificate generation at 100%
    if new_percent >= 100.0:
        generate_certificate.delay(student.id, course.id)

    return new_percent


def mark_session_complete(student, session):
    """Mark a live session as completed for a student."""
    from .models import Progress

    progress, _ = Progress.objects.get_or_create(
        student=student, course=session.course
    )
    progress.completed_sessions.add(session)
    new_percent = progress.save_progress()

    if new_percent >= 100.0:
        from apps.certificates.tasks import generate_certificate
        generate_certificate.delay(student.id, session.course.id)

    return new_percent
