"""
Serializers for the courses app.
"""
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    faculty_detail = UserSerializer(source='faculty', read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'thumbnail',
            'faculty', 'faculty_detail', 'created_at',
            'is_active', 'enrollment_count', 'is_enrolled',
        )
        read_only_fields = ('id', 'created_at')

    def get_enrollment_count(self, obj):
        return obj.enrollments.filter(is_active=True).count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return obj.enrollments.filter(
                student=request.user, is_active=True
            ).exists()
        return False


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'faculty', 'is_active')


class EnrollmentSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source='student', read_only=True)
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            'id', 'student', 'student_detail', 'course',
            'course_detail', 'enrolled_at', 'is_active',
        )
        read_only_fields = ('id', 'enrolled_at')
