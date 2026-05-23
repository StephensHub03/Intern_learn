"""
URL patterns for the sessions app.
"""
from django.urls import path
from .views import (
    LiveSessionListCreateView,
    LiveSessionDetailView,
    GoogleCalendarConnectView,
    GoogleCalendarCallbackView,
    GoogleCalendarStatusView,
)

urlpatterns = [
    path('', LiveSessionListCreateView.as_view(), name='session-list-create'),
    path('<int:pk>/', LiveSessionDetailView.as_view(), name='session-detail'),

    # Google Calendar OAuth
    path('calendar/connect/',  GoogleCalendarConnectView.as_view(),  name='calendar-connect'),
    path('calendar/callback/', GoogleCalendarCallbackView.as_view(), name='calendar-callback'),
    path('calendar/status/',   GoogleCalendarStatusView.as_view(),   name='calendar-status'),
]
