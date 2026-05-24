"""
URL configuration for internship_platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/sessions/', include('apps.sessions.urls')),
    path('api/assignments/', include('apps.assignments.urls')),
    path('api/progress/', include('apps.progress.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)