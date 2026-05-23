"""
Views for the progress app.
"""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.permissions import IsStudent
from apps.users.utils import success_response, error_response
from apps.courses.models import Course
from .models import Progress
from .serializers import ProgressSerializer
from .utils import mark_session_complete


class ProgressListView(APIView):
    """GET /api/progress/ - List all progress records for the current student."""
    permission_classes = (IsAuthenticated, IsStudent)

    def get(self, request):
        progress_records = Progress.objects.filter(
            student=request.user
        ).select_related('course').prefetch_related(
            'completed_sessions', 'completed_assignments'
        )
        serializer = ProgressSerializer(progress_records, many=True)
        return success_response(data=serializer.data)


class ProgressDetailView(APIView):
    """GET /api/progress/<course_id>/ - Get progress for a specific course."""
    permission_classes = (IsAuthenticated, IsStudent)

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return error_response('Course not found.', status.HTTP_404_NOT_FOUND)

        progress, _ = Progress.objects.get_or_create(
            student=request.user, course=course
        )
        serializer = ProgressSerializer(progress)
        return success_response(data=serializer.data)


class MarkSessionCompleteView(APIView):
    """POST /api/progress/session/<session_id>/complete/ - Mark a session as attended."""
    permission_classes = (IsAuthenticated, IsStudent)

    def post(self, request, session_id):
        from apps.sessions.models import LiveSession
        from apps.courses.models import Enrollment

        try:
            session = LiveSession.objects.get(pk=session_id)
        except LiveSession.DoesNotExist:
            return error_response('Session not found.', status.HTTP_404_NOT_FOUND)

        if not Enrollment.objects.filter(
            student=request.user, course=session.course, is_active=True
        ).exists():
            return error_response('You are not enrolled in this course.', status.HTTP_403_FORBIDDEN)

        new_percent = mark_session_complete(request.user, session)
        return success_response(
            data={'progress_percent': new_percent},
            message='Session marked as completed.',
        )
