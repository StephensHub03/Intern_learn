"""
Views for the assignments app.
"""
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.permissions import IsFacultyOrAdmin
from apps.users.utils import success_response, error_response
from apps.courses.models import Enrollment
from .models import Assignment, Question, Submission, Answer
from .serializers import (
    AssignmentSerializer,
    AssignmentCreateSerializer,
    SubmissionCreateSerializer,
    SubmissionSerializer,
)


class AssignmentListCreateView(APIView):
    """
    GET  /api/assignments/  - List assignments
    POST /api/assignments/  - Create assignment (faculty)
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role == 'faculty':
            assignments = Assignment.objects.filter(
                course__faculty=request.user
            ).prefetch_related('questions')
        elif request.user.role == 'student':
            enrolled_course_ids = request.user.enrollments.filter(
                is_active=True
            ).values_list('course_id', flat=True)
            assignments = Assignment.objects.filter(
                course_id__in=enrolled_course_ids
            ).prefetch_related('questions')
        else:
            assignments = Assignment.objects.all().prefetch_related('questions')

        serializer = AssignmentSerializer(
            assignments, many=True, context={'request': request}
        )
        return success_response(data=serializer.data)

    def post(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return error_response('Only faculty can create assignments.', status.HTTP_403_FORBIDDEN)

        serializer = AssignmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save(created_by=request.user)

        return success_response(
            data=AssignmentSerializer(assignment, context={'request': request}).data,
            message='Assignment created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class AssignmentDetailView(APIView):
    """GET /api/assignments/<id>/ - Retrieve an assignment."""
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk):
        try:
            return Assignment.objects.prefetch_related('questions').get(pk=pk)
        except Assignment.DoesNotExist:
            return None

    def get(self, request, pk):
        assignment = self.get_object(pk)
        if not assignment:
            return error_response('Assignment not found.', status.HTTP_404_NOT_FOUND)

        # Students must be enrolled
        if request.user.role == 'student':
            if not Enrollment.objects.filter(
                student=request.user,
                course=assignment.course,
                is_active=True,
            ).exists():
                return error_response('You are not enrolled in this course.', status.HTTP_403_FORBIDDEN)

        serializer = AssignmentSerializer(assignment, context={'request': request})
        return success_response(data=serializer.data)


class AssignmentSubmitView(APIView):
    """POST /api/assignments/<id>/submit/ - Student submits answers."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        if request.user.role != 'student':
            return error_response('Only students can submit assignments.', status.HTTP_403_FORBIDDEN)

        try:
            assignment = Assignment.objects.prefetch_related('questions').get(pk=pk)
        except Assignment.DoesNotExist:
            return error_response('Assignment not found.', status.HTTP_404_NOT_FOUND)

        # Check enrollment
        if not Enrollment.objects.filter(
            student=request.user,
            course=assignment.course,
            is_active=True,
        ).exists():
            return error_response('You are not enrolled in this course.', status.HTTP_403_FORBIDDEN)

        # Check due date
        if timezone.now() > assignment.due_date:
            return error_response('Assignment submission deadline has passed.')

        # Check if already submitted
        if Submission.objects.filter(student=request.user, assignment=assignment).exists():
            return error_response('You have already submitted this assignment.')

        serializer = SubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        answers_data = serializer.validated_data['answers']
        question_ids = {a['question_id'] for a in answers_data}
        questions = {q.id: q for q in assignment.questions.filter(id__in=question_ids)}

        # Validate all questions belong to this assignment
        for answer in answers_data:
            if answer['question_id'] not in questions:
                return error_response(
                    f"Question {answer['question_id']} does not belong to this assignment."
                )

        # Create submission
        submission = Submission.objects.create(
            student=request.user,
            assignment=assignment,
        )

        # Create answers and calculate score
        total_score = 0
        answer_objects = []
        for answer_data in answers_data:
            question = questions[answer_data['question_id']]
            is_correct = answer_data['selected_option'] == question.correct_option
            if is_correct:
                total_score += question.marks
            answer_objects.append(
                Answer(
                    submission=submission,
                    question=question,
                    selected_option=answer_data['selected_option'],
                )
            )

        Answer.objects.bulk_create(answer_objects)
        submission.score = total_score
        submission.is_evaluated = True
        submission.save()

        # Signal will trigger progress update (via post_save)
        return success_response(
            data=SubmissionSerializer(submission).data,
            message=f'Assignment submitted. Score: {total_score}/{assignment.total_marks}',
            status_code=status.HTTP_201_CREATED,
        )


class AssignmentResultsView(APIView):
    """GET /api/assignments/<id>/results/ - View all submissions (faculty, admin)."""
    permission_classes = (IsAuthenticated, IsFacultyOrAdmin)

    def get(self, request, pk):
        try:
            assignment = Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return error_response('Assignment not found.', status.HTTP_404_NOT_FOUND)

        if request.user.role == 'faculty' and assignment.course.faculty != request.user:
            return error_response('Access denied.', status.HTTP_403_FORBIDDEN)

        submissions = Submission.objects.filter(
            assignment=assignment
        ).select_related('student').prefetch_related('answers__question')

        serializer = SubmissionSerializer(submissions, many=True)
        return success_response(data=serializer.data)


class MySubmissionView(APIView):
    """GET /api/assignments/<id>/my-result/ - Student views their own submission."""
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        try:
            assignment = Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return error_response('Assignment not found.', status.HTTP_404_NOT_FOUND)

        try:
            submission = Submission.objects.prefetch_related(
                'answers__question'
            ).get(assignment=assignment, student=request.user)
        except Submission.DoesNotExist:
            return error_response(
                'No submission found. Please attempt the assignment first.',
                status.HTTP_404_NOT_FOUND
            )

        serializer = SubmissionSerializer(submission)
        return success_response(data=serializer.data)
