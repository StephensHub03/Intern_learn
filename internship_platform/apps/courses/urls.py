"""
URL patterns for the courses app.
"""
from django.urls import path
from .views import CourseListCreateView, CourseDetailView, EnrollView, CourseStudentsView

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('<int:pk>/enroll/', EnrollView.as_view(), name='course-enroll'),
    path('<int:pk>/students/', CourseStudentsView.as_view(), name='course-students'),
]
