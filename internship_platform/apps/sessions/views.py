"""
Views for the sessions app.
"""
import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.utils import success_response, error_response
from apps.notifications.tasks import send_session_notification_email
from .models import LiveSession
from .serializers import LiveSessionSerializer, LiveSessionCreateSerializer
from .google_calendar import (
    create_calendar_event,
    delete_calendar_event,
    update_calendar_event,
    get_google_calendar_authorization_url,
    exchange_google_calendar_code,
    get_connection_status,
)

logger = logging.getLogger(__name__)


class LiveSessionListCreateView(APIView):
    """
    GET  /api/sessions/       — List sessions (role-filtered)
    POST /api/sessions/       — Create a session (faculty/admin)
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role == 'faculty':
            sessions = LiveSession.objects.filter(course__faculty=request.user)
        elif request.user.role == 'student':
            enrolled_ids = request.user.enrollments.filter(
                is_active=True
            ).values_list('course_id', flat=True)
            sessions = LiveSession.objects.filter(course_id__in=enrolled_ids)
        else:
            sessions = LiveSession.objects.all()

        serializer = LiveSessionSerializer(sessions, many=True)
        return success_response(data=serializer.data)

    def post(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return error_response('Only faculty can create sessions.', status.HTTP_403_FORBIDDEN)

        serializer = LiveSessionCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        # ── Google Calendar / Meet link (non-blocking) ────────────────────
        try:
            event_id, meet_link = create_calendar_event(session)
            logger.info(
                'Session %s created | event_id=%s | meet_link=%s',
                session.id, event_id, meet_link,
            )
        except Exception as exc:
            logger.error('create_calendar_event raised unexpectedly: %s', exc)

        # Reload from DB so the serializer sees the saved meet_link
        session.refresh_from_db()

        # Notify enrolled students asynchronously
        send_session_notification_email.delay(session.id)

        return success_response(
            data=LiveSessionSerializer(session).data,
            message='Session created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class LiveSessionDetailView(APIView):
    """
    GET    /api/sessions/<id>/  — Retrieve
    PUT    /api/sessions/<id>/  — Update (faculty/admin)
    DELETE /api/sessions/<id>/  — Delete (faculty/admin)
    """
    permission_classes = (IsAuthenticated,)

    def _get_session(self, pk, user):
        try:
            session = LiveSession.objects.get(pk=pk)
        except LiveSession.DoesNotExist:
            return None, 'Session not found.'
        if user.role == 'faculty' and session.course.faculty != user:
            return None, 'Access denied.'
        return session, None

    def get(self, request, pk):
        session, err = self._get_session(pk, request.user)
        if err:
            return error_response(err, status.HTTP_404_NOT_FOUND)
        return success_response(data=LiveSessionSerializer(session).data)

    def put(self, request, pk):
        if request.user.role not in ('faculty', 'admin'):
            return error_response('Only faculty can update sessions.', status.HTTP_403_FORBIDDEN)

        session, err = self._get_session(pk, request.user)
        if err:
            return error_response(err, status.HTTP_404_NOT_FOUND)

        serializer = LiveSessionCreateSerializer(
            session, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        try:
            update_calendar_event(session)
        except Exception as exc:
            logger.error('update_calendar_event failed: %s', exc)

        return success_response(
            data=LiveSessionSerializer(session).data,
            message='Session updated successfully.',
        )

    def delete(self, request, pk):
        if request.user.role not in ('faculty', 'admin'):
            return error_response('Only faculty can delete sessions.', status.HTTP_403_FORBIDDEN)

        session, err = self._get_session(pk, request.user)
        if err:
            return error_response(err, status.HTTP_404_NOT_FOUND)

        if session.google_event_id:
            try:
                delete_calendar_event(session.google_event_id)
            except Exception as exc:
                logger.error('delete_calendar_event failed: %s', exc)

        session.delete()
        return success_response(message='Session deleted successfully.')


# ─── Google Calendar OAuth endpoints ─────────────────────────────────────────

class GoogleCalendarConnectView(APIView):
    """
    GET /api/sessions/calendar/connect/?next=/faculty/dashboard
    Returns the Google OAuth consent URL.
    Faculty/admin only.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return error_response('Only faculty can connect Google Calendar.', status.HTTP_403_FORBIDDEN)

        next_path = request.query_params.get('next', '')
        try:
            url = get_google_calendar_authorization_url(next_path=next_path)
            return success_response(data={'authorization_url': url})
        except FileNotFoundError as exc:
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            logger.error('GoogleCalendarConnectView error: %s', exc)
            return error_response('Could not build authorization URL.', status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleCalendarCallbackView(APIView):
    """
    GET /api/sessions/calendar/callback/?code=...&state=...
    Exchanges the OAuth code for a token and saves it.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        if not code or not state:
            return error_response('Missing code or state parameter.', status.HTTP_400_BAD_REQUEST)

        try:
            _creds, state_data = exchange_google_calendar_code(code, state)
            next_path = state_data.get('next_path', '')
            return success_response(
                data={'next_path': next_path},
                message='Google Calendar connected successfully.',
            )
        except Exception as exc:
            logger.error('GoogleCalendarCallbackView error: %s', exc)
            return error_response('Failed to exchange authorization code.', status.HTTP_400_BAD_REQUEST)


class GoogleCalendarStatusView(APIView):
    """
    GET /api/sessions/calendar/status/
    Returns the current Google Calendar connection status.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return success_response(data=get_connection_status())
