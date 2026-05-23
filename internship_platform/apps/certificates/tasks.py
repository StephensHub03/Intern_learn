"""
Celery tasks for certificate generation.
"""
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_certificate(self, student_id, course_id):
    """
    Generate a PDF certificate for a student who completed a course.
    Triggered when progress_percent reaches 100%.
    """
    try:
        from apps.users.models import User
        from apps.courses.models import Course
        from .models import Certificate
        from .pdf_generator import generate_certificate_pdf
        from apps.notifications.tasks import send_certificate_email

        student = User.objects.get(pk=student_id)
        course = Course.objects.get(pk=course_id)

        # Idempotent: don't regenerate if already exists
        certificate, created = Certificate.objects.get_or_create(
            student=student,
            course=course,
        )

        if created or not certificate.pdf_file:
            pdf_path = generate_certificate_pdf(certificate)
            if pdf_path:
                certificate.pdf_file = pdf_path
                certificate.save(update_fields=['pdf_file'])
                logger.info(
                    f'Certificate generated for {student.username} in {course.title}'
                )
                # Send certificate email
                send_certificate_email.delay(certificate.id)
            else:
                raise Exception('PDF generation returned None')

        return {'certificate_id': str(certificate.certificate_id)}

    except Exception as exc:
        logger.error(f'generate_certificate failed: {exc}')
        raise self.retry(exc=exc)
