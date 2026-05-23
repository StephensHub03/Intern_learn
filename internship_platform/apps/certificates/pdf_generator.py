"""
PDF certificate generator using ReportLab.
"""
import os
import logging
from io import BytesIO
from datetime import datetime

from django.conf import settings
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_CENTER

logger = logging.getLogger(__name__)

# Color palette
GOLD = HexColor('#C9A84C')
DARK_BLUE = HexColor('#1A2B5F')
LIGHT_BLUE = HexColor('#4A90D9')
CREAM = HexColor('#FDF8F0')


def generate_certificate_pdf(certificate):
    """
    Generate a PDF certificate and save it to media/certificates/.
    Returns the relative file path or None on failure.
    """
    try:
        student = certificate.student
        course = certificate.course
        student_name = student.get_full_name() or student.username
        course_name = course.title
        issue_date = certificate.issued_at.strftime('%B %d, %Y')
        cert_id = str(certificate.certificate_id)

        # Create output directory
        output_dir = os.path.join(settings.MEDIA_ROOT, 'certificates')
        os.makedirs(output_dir, exist_ok=True)

        filename = f'certificate_{cert_id}.pdf'
        filepath = os.path.join(output_dir, filename)

        # Page setup (landscape A4)
        page_width, page_height = landscape(A4)
        c = canvas.Canvas(filepath, pagesize=landscape(A4))

        # Background
        c.setFillColor(CREAM)
        c.rect(0, 0, page_width, page_height, fill=True, stroke=False)

        # Outer border
        c.setStrokeColor(GOLD)
        c.setLineWidth(8)
        c.rect(20, 20, page_width - 40, page_height - 40, fill=False, stroke=True)

        # Inner border
        c.setStrokeColor(DARK_BLUE)
        c.setLineWidth(2)
        c.rect(35, 35, page_width - 70, page_height - 70, fill=False, stroke=True)

        # Header background bar
        c.setFillColor(DARK_BLUE)
        c.rect(35, page_height - 130, page_width - 70, 95, fill=True, stroke=False)

        # Platform name
        c.setFillColor(GOLD)
        c.setFont('Helvetica-Bold', 28)
        c.drawCentredString(page_width / 2, page_height - 80, 'INTERNSHIP LEARNING PLATFORM')

        c.setFillColor(white)
        c.setFont('Helvetica', 14)
        c.drawCentredString(page_width / 2, page_height - 105, 'Certificate of Completion')

        # Decorative line
        c.setStrokeColor(GOLD)
        c.setLineWidth(3)
        c.line(100, page_height - 145, page_width - 100, page_height - 145)

        # "This is to certify that"
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica', 16)
        c.drawCentredString(page_width / 2, page_height - 185, 'This is to certify that')

        # Student name
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 38)
        c.drawCentredString(page_width / 2, page_height - 240, student_name)

        # Underline for name
        name_width = c.stringWidth(student_name, 'Helvetica-Bold', 38)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(
            page_width / 2 - name_width / 2 - 10,
            page_height - 248,
            page_width / 2 + name_width / 2 + 10,
            page_height - 248,
        )

        # "has successfully completed"
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica', 16)
        c.drawCentredString(
            page_width / 2, page_height - 285, 'has successfully completed the course'
        )

        # Course name
        c.setFillColor(LIGHT_BLUE)
        c.setFont('Helvetica-Bold', 26)
        c.drawCentredString(page_width / 2, page_height - 330, f'"{course_name}"')

        # Date
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica', 14)
        c.drawCentredString(
            page_width / 2, page_height - 375, f'Issued on: {issue_date}'
        )

        # Certificate ID
        c.setFillColor(HexColor('#888888'))
        c.setFont('Helvetica', 10)
        c.drawCentredString(
            page_width / 2, page_height - 400, f'Certificate ID: {cert_id}'
        )

        # Signature lines
        sig_y = 80
        # Left signature
        c.setStrokeColor(DARK_BLUE)
        c.setLineWidth(1)
        c.line(120, sig_y + 30, 280, sig_y + 30)
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(200, sig_y + 15, 'Course Instructor')
        c.setFont('Helvetica', 10)
        c.drawCentredString(200, sig_y, 'Signature')

        # Right signature
        c.line(page_width - 280, sig_y + 30, page_width - 120, sig_y + 30)
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(page_width - 200, sig_y + 15, 'Platform Director')
        c.setFont('Helvetica', 10)
        c.drawCentredString(page_width - 200, sig_y, 'Signature')

        # Bottom decorative line
        c.setStrokeColor(GOLD)
        c.setLineWidth(3)
        c.line(100, 55, page_width - 100, 55)

        c.save()

        relative_path = f'certificates/{filename}'
        logger.info(f'Certificate PDF generated: {relative_path}')
        return relative_path

    except Exception as e:
        logger.error(f'Failed to generate certificate PDF: {e}')
        return None
