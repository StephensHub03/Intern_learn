"""
Custom permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allow access only to students."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'student'
        )


class IsFaculty(BasePermission):
    """Allow access only to faculty members."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'faculty'
        )


class IsAdmin(BasePermission):
    """Allow access only to admins."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsFacultyOrAdmin(BasePermission):
    """Allow access to faculty or admin."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('faculty', 'admin')
        )


class IsStudentOrAdmin(BasePermission):
    """Allow access to students or admin."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('student', 'admin')
        )
