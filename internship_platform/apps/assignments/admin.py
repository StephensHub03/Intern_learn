from django.contrib import admin
from .models import Assignment, Question, Submission, Answer


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'created_by')
    inlines = [QuestionInline]


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'submitted_at', 'score', 'is_evaluated')
    list_filter = ('is_evaluated',)
