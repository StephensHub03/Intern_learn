#!/bin/bash
# Start Celery Beat scheduler
cd /var/www/internship_platform/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.production

celery -A config beat \
    --loglevel=info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler \
    --logfile=/var/log/celery/beat.log \
    --pidfile=/run/celery/beat.pid
