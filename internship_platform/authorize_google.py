"""
One-time script to authorize Google Calendar access.
Run: python authorize_google.py
"""
import os, sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
import django
django.setup()

from django.conf import settings

CLIENT_SECRET = os.path.join(settings.BASE_DIR, 'google_client_secret.json')
TOKEN_PATH    = os.path.join(settings.BASE_DIR, 'credentials', 'google_token.json')
SCOPES        = ['https://www.googleapis.com/auth/calendar']

def main():
    print('=' * 60)
    print('Google Calendar Authorization')
    print('=' * 60)

    if not os.path.exists(CLIENT_SECRET):
        print(f'ERROR: {CLIENT_SECRET} not found.')
        sys.exit(1)

    from google_auth_oauthlib.flow import InstalledAppFlow
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)

    print('\nOpening browser for Google authorization...')
    print('Sign in with the Google account that owns the calendar.\n')

    creds = flow.run_local_server(port=8888, prompt='consent', open_browser=True)

    os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)
    with open(TOKEN_PATH, 'w') as f:
        f.write(creds.to_json())

    print(f'\n✅ Token saved to: {TOKEN_PATH}')
    print('Google Calendar is now connected!')

    from googleapiclient.discovery import build
    service = build('calendar', 'v3', credentials=creds)
    cal = service.calendars().get(calendarId='primary').execute()
    print(f'✅ Connected to calendar: {cal.get("summary")} ({cal.get("id")})')

if __name__ == '__main__':
    main()
