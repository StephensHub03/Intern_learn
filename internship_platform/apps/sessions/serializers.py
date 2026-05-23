"""
Serializers for the sessions app.
"""
from rest_framework import serializers
from apps.courses.serializers import CourseSerializer
from .models import LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = LiveSession
        fields = (
            'id', 'course', 'course_detail', 'title', 'description',
            'meet_link', 'scheduled_at', 'google_event_id',
            'duration_minutes', 'created_at',
        )
        read_only_fields = ('id', 'meet_link', 'google_event_id', 'created_at')


class LiveSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = ('id', 'course', 'title', 'description', 'scheduled_at', 'duration_minutes')

    def validate_course(self, value):
        request = self.context.get('request')
        if request and request.user.role == 'faculty':
            if value.faculty != request.user:
                raise serializers.ValidationError(
                    'You can only create sessions for your own courses.'
                )
        return value
