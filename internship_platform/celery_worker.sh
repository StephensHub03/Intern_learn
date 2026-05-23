#!/bin/bash
# Start Celery worker
cd /var/www/internship_platform/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.production

celery -A config worker \
    --loglevel=info \
    --concurrency=4 \
    --logfile=/var/log/celery/worker.log \
    --pidfile=/run/celery/worker.pid
