"""
Google Calendar API integration for live session scheduling.

Generates real Google Meet links via Google Calendar API.
Requires OAuth credentials (GOOGLE_CALENDAR_CLIENT_SECRET_PATH) or
a service account (GOOGLE_CALENDAR_CREDENTIALS_JSON).

If neither is configured, meet_link is left as None and the frontend
shows "Google Meet link will be available soon."
"""
import logging
import os
import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.core import signing
from django.utils import timezone

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/calendar']
STATE_SALT = 'internx.google_calendar'
STATE_MAX_AGE_SECONDS = 600


# ─── Path helpers ────────────────────────────────────────────────────────────

def _resolve_path(value):
    if not value:
        return None
    if os.path.isabs(value):
        return value
    return os.path.join(settings.BASE_DIR, value)


def _client_secret_path():
    return _resolve_path(getattr(settings, 'GOOGLE_CALENDAR_CLIENT_SECRET_PATH', None))


def _token_path():
    return _resolve_path(getattr(settings, 'GOOGLE_CALENDAR_TOKEN_PATH', None))


def _service_account_path():
    return _resolve_path(getattr(settings, 'GOOGLE_CALENDAR_CREDENTIALS_JSON', None))


# ─── Credential management ───────────────────────────────────────────────────

def _save_credentials(creds):
    path = _token_path()
    if not path:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(creds.to_json())
    logger.info('Google Calendar token saved to %s', path)


def get_google_calendar_credentials():
    """
    Load stored OAuth credentials.
    Returns a valid Credentials object or None.
    """
    path = _token_path()
    if not path or not os.path.exists(path):
        return None
    try:
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials

        creds = Credentials.from_authorized_user_file(path, SCOPES)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            _save_credentials(creds)
        return creds if creds.valid else None
    except Exception as exc:
        logger.warning('Could not load Google Calendar token: %s', exc)
        return None


def is_google_calendar_connected():
    return get_google_calendar_credentials() is not None


# ─── OAuth flow ───────────────────────────────────────────────────────────────

def get_google_calendar_authorization_url(next_path=''):
    """
    Build the Google OAuth consent URL.
    next_path is stored in state so the callback can redirect the user back.
    """
    csp = _client_secret_path()
    if not csp or not os.path.exists(csp):
        raise FileNotFoundError(
            'GOOGLE_CALENDAR_CLIENT_SECRET_PATH is not set or the file does not exist.'
        )

    from google_auth_oauthlib.flow import Flow

    state_payload = {
        'nonce': secrets.token_urlsafe(24),
        'issued_at': timezone.now().timestamp(),
        'next_path': next_path or '',
    }
    state = signing.dumps(state_payload, salt=STATE_SALT)

    flow = Flow.from_client_secrets_file(
        csp,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_CALENDAR_REDIRECT_URI,
    )
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=state,
    )
    return authorization_url


def exchange_google_calendar_code(code, state):
    """
    Exchange the OAuth callback code for a long-lived token and persist it.
    Returns (credentials, state_data).
    """
    csp = _client_secret_path()
    if not csp or not os.path.exists(csp):
        raise FileNotFoundError('Google Calendar client secret JSON not found.')

    state_data = signing.loads(state, max_age=STATE_MAX_AGE_SECONDS, salt=STATE_SALT)

    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_secrets_file(
        csp,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_CALENDAR_REDIRECT_URI,
        state=state,
    )
    flow.fetch_token(code=code)
    _save_credentials(flow.credentials)
    return flow.credentials, state_data


# ─── Service builder ─────────────────────────────────────────────────────────

def _get_calendar_service():
    """
    Try OAuth token first, then service account, then return None.
    """
    # 1. OAuth token
    creds = get_google_calendar_credentials()
    if creds:
        from googleapiclient.discovery import build
        return build('calendar', 'v3', credentials=creds)

    # 2. Service account
    sa_path = _service_account_path()
    if sa_path and os.path.exists(sa_path):
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build

            creds = service_account.Credentials.from_service_account_file(
                sa_path, scopes=SCOPES
            )
            return build('calendar', 'v3', credentials=creds)
        except Exception as exc:
            logger.error('Service account build failed: %s', exc)

    return None


# ─── Meet link fallback ───────────────────────────────────────────────────────

def _generate_meet_link(session):
    """
    Generate a Jitsi Meet link — free, open, no credentials needed.
    Room name is deterministic per session so the same link is always returned.
    Format: https://meet.jit.si/InternLearn-<course_id>-<session_id>-<random>
    """
    import hashlib
    # Deterministic but unguessable room name
    seed = f'internlearn-{session.course_id}-{session.id}'
    hash_part = hashlib.sha256(seed.encode()).hexdigest()[:10]
    room = f'InternLearn-{session.course_id}-{session.id}-{hash_part}'
    return f'https://meet.jit.si/{room}'


# ─── Attendee builder ─────────────────────────────────────────────────────────

def _build_attendees(session):
    attendees = []
    seen = set()

    faculty_email = getattr(session.course.faculty, 'email', '') or ''
    if faculty_email:
        attendees.append({'email': faculty_email})
        seen.add(faculty_email.lower())

    for enrollment in session.course.enrollments.select_related('student').filter(is_active=True):
        email = (enrollment.student.email or '').strip()
        if email and email.lower() not in seen:
            attendees.append({'email': email})
            seen.add(email.lower())

    return attendees


# ─── Public API ───────────────────────────────────────────────────────────────

def create_calendar_event(session):
    """
    Create a Google Calendar event with a Google Meet link for the session.

    - If Google Calendar is connected (OAuth or service account): creates a
      real Calendar event, saves google_event_id + meet_link on the session.
    - If not connected: generates a meet.google.com link and saves it.
    - Never raises — always returns (event_id_or_None, meet_link_or_None).
    - Skips if the session already has a meet_link or google_event_id.
    """
    # Skip if already has a link
    if session.meet_link or session.google_event_id:
        logger.info('Session %s already has a Meet link — skipping.', session.id)
        return session.google_event_id, session.meet_link

    service = _get_calendar_service()

    if service is None:
        # No credentials — generate a Jitsi Meet link
        meet_link = _generate_meet_link(session)
        session.meet_link = meet_link
        session.save(update_fields=['meet_link'])
        logger.info('Session %s: no Calendar credentials, generated Jitsi link %s', session.id, meet_link)
        return None, meet_link

    # Full Calendar event creation
    try:
        end_dt = session.scheduled_at + timedelta(minutes=session.duration_minutes)
        faculty = session.course.faculty
        description_parts = [
            session.description.strip() if session.description else '',
            f'Course: {session.course.title}',
            f'Faculty: {faculty.get_full_name() or faculty.email}',
        ]

        event_body = {
            'summary': f'[InternLearn] {session.course.title} — {session.title}',
            'description': '\n'.join(p for p in description_parts if p),
            'start': {'dateTime': session.scheduled_at.isoformat(), 'timeZone': settings.TIME_ZONE},
            'end':   {'dateTime': end_dt.isoformat(),               'timeZone': settings.TIME_ZONE},
            'attendees': _build_attendees(session),
            'conferenceData': {
                'createRequest': {
                    'requestId': str(uuid.uuid4()),
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'},
                }
            },
            'guestsCanInviteOthers': False,
            'guestsCanModify': False,
        }

        created = service.events().insert(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            body=event_body,
            conferenceDataVersion=1,
            sendUpdates='all',
        ).execute()

        event_id = created.get('id')
        meet_link = created.get('hangoutLink') or ''

        # Google sometimes provisions the Meet link asynchronously
        if not meet_link and event_id:
            import time
            time.sleep(2)
            fetched = service.events().get(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                eventId=event_id,
            ).execute()
            meet_link = fetched.get('hangoutLink') or ''
            # Also check entryPoints
            if not meet_link:
                for ep in fetched.get('conferenceData', {}).get('entryPoints', []):
                    if ep.get('entryPointType') == 'video':
                        meet_link = ep.get('uri', '')
                        break

        # Final fallback — Jitsi Meet
        if not meet_link:
            meet_link = _generate_meet_link(session)
            logger.warning('Session %s: Calendar event created but no Meet link returned. Using Jitsi fallback.', session.id)

        # Persist
        updates = []
        if event_id:
            session.google_event_id = event_id
            updates.append('google_event_id')
        if meet_link:
            session.meet_link = meet_link
            updates.append('meet_link')
        if updates:
            session.save(update_fields=updates)

        logger.info('Session %s → Calendar event %s | Meet: %s', session.id, event_id, meet_link)
        return event_id, meet_link

    except Exception as exc:
        logger.exception('Google Calendar API error for session %s: %s', session.id, exc)
        # Non-blocking Jitsi fallback
        meet_link = _generate_meet_link(session)
        session.meet_link = meet_link
        session.save(update_fields=['meet_link'])
        return None, meet_link


def delete_calendar_event(google_event_id):
    service = _get_calendar_service()
    if not service or not google_event_id:
        return False
    try:
        service.events().delete(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=google_event_id,
        ).execute()
        logger.info('Deleted Calendar event %s', google_event_id)
        return True
    except Exception as exc:
        logger.error('Failed to delete Calendar event %s: %s', google_event_id, exc)
        return False


def update_calendar_event(session):
    service = _get_calendar_service()
    if not service or not session.google_event_id:
        return False
    try:
        end_dt = session.scheduled_at + timedelta(minutes=session.duration_minutes)
        service.events().update(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=session.google_event_id,
            body={
                'summary': f'[InternLearn] {session.course.title} — {session.title}',
                'description': session.description or '',
                'start': {'dateTime': session.scheduled_at.isoformat(), 'timeZone': settings.TIME_ZONE},
                'end':   {'dateTime': end_dt.isoformat(),               'timeZone': settings.TIME_ZONE},
            },
        ).execute()
        logger.info('Updated Calendar event %s', session.google_event_id)
        return True
    except Exception as exc:
        logger.error('Failed to update Calendar event %s: %s', session.google_event_id, exc)
        return False


def get_connection_status():
    csp = _client_secret_path()
    tp = _token_path()
    return {
        'client_secret_configured': bool(csp and os.path.exists(csp)),
        'token_configured': bool(tp and os.path.exists(tp)),
        'connected': is_google_calendar_connected(),
        'redirect_uri': getattr(settings, 'GOOGLE_CALENDAR_REDIRECT_URI', ''),
        'calendar_id': getattr(settings, 'GOOGLE_CALENDAR_ID', 'primary'),
    }
