"""
URL patterns for the certificates app.
"""
from django.urls import path
from .views import CertificateListView, CertificateDownloadView

urlpatterns = [
    path('', CertificateListView.as_view(), name='certificate-list'),
    path('<int:pk>/download/', CertificateDownloadView.as_view(), name='certificate-download'),
]
