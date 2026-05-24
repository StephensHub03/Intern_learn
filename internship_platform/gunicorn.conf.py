"""
Gunicorn configuration for production deployment.
"""
import multiprocessing

# Server socket
bind = "unix:/run/gunicorn/internship_platform.sock"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "internship_platform"

# Server mechanics
daemon = False
umask = 0
user = None
group = None
tmp_upload_dir = None
