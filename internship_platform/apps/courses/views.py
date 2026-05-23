"""
Views for the courses app.
"""
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin, IsFaculty, IsStudent, IsFacultyOrAdmin
from apps.users.utils import success_response, error_response
from apps.users.models import User
from apps.notifications.tasks import send_enrollment_email
from .models import Course, Enrollment
from .serializers import CourseSerializer, CourseCreateSerializer, EnrollmentSerializer


class CourseListCreateView(APIView):
    """
    GET  /api/courses/  - List all active courses (authenticated)
    POST /api/courses/  - Create a course (admin only)
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role == 'faculty':
            courses = Course.objects.filter(faculty=request.user)
        elif request.user.role == 'student':
            courses = Course.objects.filter(is_active=True)
        else:
            courses = Course.objects.all()

        serializer = CourseSerializer(courses, many=True, context={'request': request})
        return success_response(data=serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            return error_response('Only admins can create courses.', status.HTTP_403_FORBIDDEN)

        serializer = CourseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validate faculty role
        faculty_id = request.data.get('faculty')
        if faculty_id:
            try:
                faculty = User.objects.get(pk=faculty_id, role='faculty')
            except User.DoesNotExist:
                return error_response('Invalid faculty user.')

        course = serializer.save()
        return success_response(
            data=CourseSerializer(course, context={'request': request}).data,
            message='Course created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class CourseDetailView(APIView):
    """
    GET    /api/courses/<id>/  - Retrieve a course
    PUT    /api/courses/<id>/  - Update a course (admin)
    DELETE /api/courses/<id>/  - Delete a course (admin)
    """
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return None

    def get(self, request, pk):
        course = self.get_object(pk)
        if not course:
            return error_response('Course not found.', status.HTTP_404_NOT_FOUND)
        serializer = CourseSerializer(course, context={'request': request})
        return success_response(data=serializer.data)

    def put(self, request, pk):
        if request.user.role != 'admin':
            return error_response('Only admins can update courses.', status.HTTP_403_FORBIDDEN)
        course = self.get_object(pk)
        if not course:
            return error_response('Course not found.', status.HTTP_404_NOT_FOUND)
        serializer = CourseCreateSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()
        return success_response(
            data=CourseSerializer(course, context={'request': request}).data,
            message='Course updated successfully.',
        )

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return error_response('Only admins can delete courses.', status.HTTP_403_FORBIDDEN)
        course = self.get_object(pk)
        if not course:
            return error_response('Course not found.', status.HTTP_404_NOT_FOUND)
        course.delete()
        return success_response(message='Course deleted successfully.')


class EnrollView(APIView):
    """POST /api/courses/<id>/enroll/ - Student enrolls in a course."""
    permission_classes = (IsAuthenticated, IsStudent)

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk, is_active=True)
        except Course.DoesNotExist:
            return error_response('Course not found or inactive.', status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'is_active': True},
        )

        if not created:
            if enrollment.is_active:
                return error_response('Already enrolled in this course.')
            else:
                enrollment.is_active = True
                enrollment.save()

        # Trigger async enrollment email
        send_enrollment_email.delay(request.user.id, course.id)

        return success_response(
            data=EnrollmentSerializer(enrollment).data,
            message='Enrolled successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class CourseStudentsView(APIView):
    """GET /api/courses/<id>/students/ - List enrolled students (faculty, admin)."""
    permission_classes = (IsAuthenticated, IsFacultyOrAdmin)

    def get(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return error_response('Course not found.', status.HTTP_404_NOT_FOUND)

        # Faculty can only see their own course students
        if request.user.role == 'faculty' and course.faculty != request.user:
            return error_response('Access denied.', status.HTTP_403_FORBIDDEN)

        enrollments = Enrollment.objects.filter(course=course, is_active=True).select_related('student')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return success_response(data=serializer.data)
