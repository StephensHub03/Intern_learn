"""
Assignment, Question, Submission, and Answer models.
"""
from django.db import models
from django.conf import settings
from apps.courses.models import Course


class Assignment(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='assignments',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_assignments',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.course.title}'

    @property
    def total_marks(self):
        return self.questions.aggregate(
            total=models.Sum('marks')
        )['total'] or 0


class Question(models.Model):
    OPTION_CHOICES = [
        ('a', 'A'),
        ('b', 'B'),
        ('c', 'C'),
        ('d', 'D'),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)
    marks = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'questions'

    def __str__(self):
        return f'Q: {self.question_text[:50]}'


class Submission(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
    )
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions',
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(default=0)
    is_evaluated = models.BooleanField(default=False)

    class Meta:
        db_table = 'submissions'
        unique_together = ('student', 'assignment')

    def __str__(self):
        return f'{self.student.username} - {self.assignment.title}'


class Answer(models.Model):
    OPTION_CHOICES = [
        ('a', 'A'),
        ('b', 'B'),
        ('c', 'C'),
        ('d', 'D'),
    ]

    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name='answers',
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
    )
    selected_option = models.CharField(max_length=1, choices=OPTION_CHOICES)

    class Meta:
        db_table = 'answers'
        unique_together = ('submission', 'question')

    def __str__(self):
        return f'Answer: {self.selected_option} for Q{self.question_id}'

    @property
    def is_correct(self):
        return self.selected_option == self.question.correct_option
