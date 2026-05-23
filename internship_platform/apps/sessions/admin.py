from django.contrib import admin
from .models import LiveSession


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'scheduled_at', 'duration_minutes', 'meet_link')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
