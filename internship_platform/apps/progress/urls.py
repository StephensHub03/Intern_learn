"""
URL patterns for the progress app.
"""
from django.urls import path
from .views import ProgressListView, ProgressDetailView, MarkSessionCompleteView

urlpatterns = [
    path('', ProgressListView.as_view(), name='progress-list'),
    path('<int:course_id>/', ProgressDetailView.as_view(), name='progress-detail'),
    path('session/<int:session_id>/complete/', MarkSessionCompleteView.as_view(), name='session-complete'),
]
