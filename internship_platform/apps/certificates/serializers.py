"""
Serializers for the certificates app.
"""
from rest_framework import serializers
from apps.courses.serializers import CourseSerializer
from apps.users.serializers import UserSerializer
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            'id', 'student', 'student_detail', 'course', 'course_detail',
            'issued_at', 'certificate_id', 'pdf_file', 'download_url',
        )

    def get_download_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(f'/api/certificates/{obj.id}/download/')
        return None
