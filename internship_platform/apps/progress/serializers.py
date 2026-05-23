"""
Serializers for the progress app.
"""
from rest_framework import serializers
from apps.courses.serializers import CourseSerializer
from apps.sessions.serializers import LiveSessionSerializer
from apps.assignments.serializers import AssignmentSerializer
from .models import Progress


class ProgressSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    completed_sessions_detail = LiveSessionSerializer(
        source='completed_sessions', many=True, read_only=True
    )
    completed_assignments_detail = AssignmentSerializer(
        source='completed_assignments', many=True, read_only=True
    )
    total_sessions = serializers.SerializerMethodField()
    total_assignments = serializers.SerializerMethodField()

    class Meta:
        model = Progress
        fields = (
            'id', 'course', 'course_detail', 'progress_percent',
            'completed_sessions', 'completed_sessions_detail',
            'completed_assignments', 'completed_assignments_detail',
            'total_sessions', 'total_assignments', 'last_updated',
        )

    def get_total_sessions(self, obj):
        return obj.course.sessions.count()

    def get_total_assignments(self, obj):
        return obj.course.assignments.count()
