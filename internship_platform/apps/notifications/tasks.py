"""
Celery tasks for email notifications.
"""
import logging
from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_enrollment_email(self, student_id, course_id):
    """Send a welcome email when a student enrolls in a course."""
    try:
        from apps.users.models import User
        from apps.courses.models import Course

        student = User.objects.get(pk=student_id)
        course = Course.objects.get(pk=course_id)

        subject = f'Welcome to {course.title}!'
        body = f"""
Dear {student.get_full_name() or student.username},

Congratulations! You have successfully enrolled in the course:

  📚 {course.title}

You can now access all course materials, live sessions, and assignments
through your student dashboard.

Course Details:
- Title: {course.title}
- Description: {course.description[:200]}...

Happy learning!

Best regards,
Internship Learning Platform
        """.strip()

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.email],
        )
        email.send(fail_silently=False)
        logger.info(f'Enrollment email sent to {student.email} for course {course.title}')

    except Exception as exc:
        logger.error(f'send_enrollment_email failed: {exc}')
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_session_notification_email(self, session_id):
    """Notify all enrolled students when a new session is scheduled."""
    try:
        from apps.sessions.models import LiveSession
        from apps.courses.models import Enrollment

        session = LiveSession.objects.select_related('course').get(pk=session_id)
        enrollments = Enrollment.objects.filter(
            course=session.course, is_active=True
        ).select_related('student')

        for enrollment in enrollments:
            student = enrollment.student
            subject = f'New Live Session: {session.title}'
            body = f"""
Dear {student.get_full_name() or student.username},

A new live session has been scheduled for your course "{session.course.title}":

  📅 Session: {session.title}
  🕐 Date & Time: {session.scheduled_at.strftime('%B %d, %Y at %I:%M %p UTC')}
  ⏱  Duration: {session.duration_minutes} minutes
  🔗 Meet Link: {session.meet_link or 'Will be provided soon'}

Description: {session.description or 'No description provided.'}

See you there!

Best regards,
Internship Learning Platform
            """.strip()

            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[student.email],
            )
            email.send(fail_silently=True)

        logger.info(
            f'Session notification sent to {enrollments.count()} students for session {session.title}'
        )

    except Exception as exc:
        logger.error(f'send_session_notification_email failed: {exc}')
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_session_reminder_email(self, session_id):
    """Send a reminder email 1 hour before a live session (scheduled via Celery Beat)."""
    try:
        from apps.sessions.models import LiveSession
        from apps.courses.models import Enrollment

        session = LiveSession.objects.select_related('course').get(pk=session_id)
        enrollments = Enrollment.objects.filter(
            course=session.course, is_active=True
        ).select_related('student')

        for enrollment in enrollments:
            student = enrollment.student
            subject = f'⏰ Reminder: "{session.title}" starts in 1 hour!'
            body = f"""
Dear {student.get_full_name() or student.username},

This is a reminder that your live session starts in 1 hour:

  📅 Session: {session.title}
  🕐 Time: {session.scheduled_at.strftime('%B %d, %Y at %I:%M %p UTC')}
  🔗 Join Link: {session.meet_link or 'Check your dashboard'}

Don't be late!

Best regards,
Internship Learning Platform
            """.strip()

            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[student.email],
            )
            email.send(fail_silently=True)

        logger.info(f'Reminder emails sent for session {session.title}')

    except Exception as exc:
        logger.error(f'send_session_reminder_email failed: {exc}')
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_certificate_email(self, certificate_id):
    """Send a certificate email with the PDF attached."""
    try:
        import os
        from django.conf import settings as django_settings
        from apps.certificates.models import Certificate

        certificate = Certificate.objects.select_related('student', 'course').get(
            pk=certificate_id
        )
        student = certificate.student
        course = certificate.course

        subject = f'🎓 Your Certificate for "{course.title}"'
        body = f"""
Dear {student.get_full_name() or student.username},

Congratulations on completing the course "{course.title}"!

Your certificate of completion is attached to this email.

Certificate Details:
- Certificate ID: {certificate.certificate_id}
- Course: {course.title}
- Issued On: {certificate.issued_at.strftime('%B %d, %Y')}

You can also download your certificate from your dashboard at any time.

Well done and keep learning!

Best regards,
Internship Learning Platform
        """.strip()

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.email],
        )

        # Attach PDF if available
        if certificate.pdf_file:
            pdf_path = os.path.join(django_settings.MEDIA_ROOT, str(certificate.pdf_file))
            if os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as f:
                    email.attach(
                        f'certificate_{certificate.certificate_id}.pdf',
                        f.read(),
                        'application/pdf',
                    )

        email.send(fail_silently=False)
        logger.info(f'Certificate email sent to {student.email}')

    except Exception as exc:
        logger.error(f'send_certificate_email failed: {exc}')
        raise self.retry(exc=exc)


@shared_task
def schedule_session_reminders():
    """
    Periodic task: schedule reminder emails for sessions starting in ~1 hour.
    Run this every 15 minutes via Celery Beat.
    """
    from datetime import timedelta
    from django.utils import timezone
    from apps.sessions.models import LiveSession

    now = timezone.now()
    window_start = now + timedelta(minutes=55)
    window_end = now + timedelta(minutes=65)

    upcoming_sessions = LiveSession.objects.filter(
        scheduled_at__gte=window_start,
        scheduled_at__lte=window_end,
    )

    for session in upcoming_sessions:
        send_session_reminder_email.delay(session.id)

    logger.info(f'Scheduled reminders for {upcoming_sessions.count()} sessions')


@shared_task
def auto_create_meet_links():
    """
    Periodic task: auto-create Google Meet links for sessions starting
    within the next 10 minutes that don't have a Meet link yet.
    Run every 5 minutes via Celery Beat.
    """
    from datetime import timedelta
    from django.utils import timezone
    from apps.sessions.models import LiveSession
    from apps.sessions.google_calendar import create_calendar_event

    now = timezone.now()
    window_end = now + timedelta(minutes=10)

    sessions = LiveSession.objects.filter(
        scheduled_at__gte=now,
        scheduled_at__lte=window_end,
        meet_link__isnull=True,
        google_event_id__isnull=True,
    )

    count = 0
    for session in sessions:
        try:
            event_id, meet_link = create_calendar_event(session)
            if meet_link:
                count += 1
                logger.info(
                    'auto_create_meet_links: session %s → %s', session.id, meet_link
                )
        except Exception as exc:
            logger.error('auto_create_meet_links failed for session %s: %s', session.id, exc)

    logger.info('auto_create_meet_links: processed %d sessions', count)
    return count
