# Internship Learning Platform

A full-stack internship learning platform built with Django REST Framework + React (Vite).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Django 5.1 + Django REST Framework |
| Database | PostgreSQL 17 |
| Cache/Broker | Redis |
| Task Queue | Celery + Celery Beat |
| Auth | JWT (djangorestframework-simplejwt) |
| PDF | ReportLab |
| Calendar | Google Calendar API |
| Web Server | Nginx + Gunicorn |

## Roles

- **Student** — Browse courses, enroll, attend sessions, submit assignments, track progress, download certificates
- **Faculty** — Manage sessions (with Google Meet), create MCQ assignments, view submissions
- **Admin** — Manage users, create/assign courses, view platform stats

---

## Quick Start (Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 17
- Redis

### Backend Setup

```bash
cd internship_platform

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials, email settings, etc.

# Create PostgreSQL database
createdb internship_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Edit .env if needed (default: VITE_API_BASE_URL=http://localhost:8000/api)

# Start development server
npm run dev
```

### Start Celery (in separate terminals)

```bash
# Worker
cd internship_platform
celery -A config worker --loglevel=info

# Beat scheduler (for session reminders)
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register/` | Public |
| POST | `/api/auth/login/` | Public |
| POST | `/api/auth/logout/` | Authenticated |
| POST | `/api/auth/token/refresh/` | Public |
| GET/PATCH | `/api/auth/me/` | Authenticated |
| GET | `/api/auth/users/` | Admin |
| PATCH | `/api/auth/users/<id>/toggle-active/` | Admin |

### Courses
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/courses/` | Authenticated |
| POST | `/api/courses/` | Admin |
| GET/PUT/DELETE | `/api/courses/<id>/` | Authenticated / Admin |
| POST | `/api/courses/<id>/enroll/` | Student |
| GET | `/api/courses/<id>/students/` | Faculty, Admin |

### Sessions
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/sessions/` | Authenticated |
| POST | `/api/sessions/` | Faculty |
| GET/PUT/DELETE | `/api/sessions/<id>/` | Authenticated / Faculty |

### Assignments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/assignments/` | Authenticated |
| POST | `/api/assignments/` | Faculty |
| GET | `/api/assignments/<id>/` | Authenticated |
| POST | `/api/assignments/<id>/submit/` | Student |
| GET | `/api/assignments/<id>/results/` | Faculty, Admin |

### Progress
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/progress/` | Student |
| GET | `/api/progress/<course_id>/` | Student |
| POST | `/api/progress/session/<session_id>/complete/` | Student |

### Certificates
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/certificates/` | Student |
| GET | `/api/certificates/<id>/download/` | Student |

---

## API Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful."
}
```

---

## Google Calendar Integration

1. Create a Google Cloud project and enable the Calendar API
2. Create a Service Account and download the JSON key file
3. Share your Google Calendar with the service account email
4. Set `GOOGLE_CALENDAR_CREDENTIALS_JSON=path/to/credentials.json` in `.env`
5. Set `GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com`

When a faculty member creates a session, the platform automatically:
- Creates a Google Calendar event
- Generates a Google Meet conference link
- Stores the event ID for future updates/deletions

---

## Certificate Generation

Certificates are auto-generated when a student's `progress_percent` reaches 100%.

The Celery task `generate_certificate(student_id, course_id)`:
1. Creates a `Certificate` record with a unique UUID
2. Generates a PDF using ReportLab (landscape A4, styled)
3. Saves to `media/certificates/`
4. Sends the certificate via email with PDF attachment

---

## Email Notifications

Triggered automatically via Celery tasks:

| Event | Task |
|-------|------|
| Student enrolls | `send_enrollment_email` |
| New session created | `send_session_notification_email` |
| 1 hour before session | `send_session_reminder_email` (via Beat) |
| Certificate generated | `send_certificate_email` |

---

## Production Deployment (Ubuntu VPS)

```bash
# Install system dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql-17 redis-server nginx

# Clone and setup
git clone <repo> /var/www/internship_platform
cd /var/www/internship_platform/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure production settings
cp .env.example .env
# Set DEBUG=False, configure DB, email, etc.

# Collect static files
python manage.py collectstatic --noinput
python manage.py migrate

# Setup Nginx
sudo cp nginx/internship_platform.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/internship_platform.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Build frontend
cd frontend && npm install && npm run build
# Copy dist/ to /var/www/internship_platform/frontend/dist/

# Setup systemd services for Gunicorn, Celery worker, and Celery beat
# (see deployment docs)
```

---

## Project Structure

```
.
├── internship_platform/          # Django backend
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── celery.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── users/               # Auth, JWT, roles
│   │   ├── courses/             # Course & enrollment
│   │   ├── sessions/            # Live sessions + Google Calendar
│   │   ├── assignments/         # MCQ assignments + auto-grading
│   │   ├── progress/            # Progress tracking
│   │   ├── certificates/        # PDF generation
│   │   └── notifications/       # Celery email tasks
│   ├── media/
│   └── requirements.txt
│
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── api/                 # Axios + endpoints
│   │   ├── components/common/   # Shared UI
│   │   ├── pages/
│   │   │   ├── student/
│   │   │   ├── faculty/
│   │   │   └── admin/
│   │   ├── hooks/               # Custom hooks
│   │   ├── store/               # Zustand auth store
│   │   ├── routes/              # Protected route wrappers
│   │   └── utils/
│   └── package.json
│
└── nginx/
    └── internship_platform.conf
```
