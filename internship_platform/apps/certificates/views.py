"""
Views for the certificates app.
"""
import os
from django.http import FileResponse, Http404
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.permissions import IsStudent
from apps.users.utils import success_response, error_response
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateListView(APIView):
    """GET /api/certificates/ - List certificates for the current student."""
    permission_classes = (IsAuthenticated, IsStudent)

    def get(self, request):
        certificates = Certificate.objects.filter(
            student=request.user
        ).select_related('course')
        serializer = CertificateSerializer(
            certificates, many=True, context={'request': request}
        )
        return success_response(data=serializer.data)


class CertificateDownloadView(APIView):
    """GET /api/certificates/<id>/download/ - Download a certificate PDF."""
    permission_classes = (IsAuthenticated, IsStudent)

    def get(self, request, pk):
        try:
            certificate = Certificate.objects.get(pk=pk, student=request.user)
        except Certificate.DoesNotExist:
            return error_response('Certificate not found.', status.HTTP_404_NOT_FOUND)

        if not certificate.pdf_file:
            return error_response('Certificate PDF not yet generated.')

        file_path = os.path.join(settings.MEDIA_ROOT, str(certificate.pdf_file))
        if not os.path.exists(file_path):
            return error_response('Certificate file not found on server.')

        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
        )
        response['Content-Disposition'] = (
            f'attachment; filename="certificate_{certificate.certificate_id}.pdf"'
        )
        return response
