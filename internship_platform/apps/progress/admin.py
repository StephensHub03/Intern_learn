from django.contrib import admin
from .models import Progress


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'progress_percent', 'last_updated')
    list_filter = ('course',)
    search_fields = ('student__username', 'course__title')
