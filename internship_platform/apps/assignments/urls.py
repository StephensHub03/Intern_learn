"""
URL patterns for the assignments app.
"""
from django.urls import path
from .views import (
    AssignmentListCreateView,
    AssignmentDetailView,
    AssignmentSubmitView,
    AssignmentResultsView,
    MySubmissionView,
)

urlpatterns = [
    path('', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('<int:pk>/submit/', AssignmentSubmitView.as_view(), name='assignment-submit'),
    path('<int:pk>/results/', AssignmentResultsView.as_view(), name='assignment-results'),
    path('<int:pk>/my-result/', MySubmissionView.as_view(), name='assignment-my-result'),
]
