from django.contrib import admin
from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'faculty', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('student__username', 'course__title')
