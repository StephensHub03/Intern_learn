"""
Views for the users app (authentication).
"""
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
)
from .utils import success_response, error_response
from .permissions import IsAdmin


class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(
            data=UserSerializer(user).data,
            message='Registration successful.',
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """Login and obtain JWT tokens."""
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data=serializer.validated_data,
            message='Login successful.',
        )


class LogoutView(APIView):
    """Logout by blacklisting the refresh token."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return error_response('Refresh token is required.')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response(message='Logout successful.')
        except Exception:
            return error_response('Invalid or expired token.')


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return success_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = UserUpdateSerializer(
            request.user, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            data=UserSerializer(request.user).data,
            message='Profile updated successfully.',
        )


class UserListView(generics.ListAPIView):
    """Admin: list all users."""
    permission_classes = (IsAuthenticated, IsAdmin)
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data)


class UserDeactivateView(APIView):
    """Admin: deactivate a user."""
    permission_classes = (IsAuthenticated, IsAdmin)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            status_str = 'activated' if user.is_active else 'deactivated'
            return success_response(
                data=UserSerializer(user).data,
                message=f'User {status_str} successfully.',
            )
        except User.DoesNotExist:
            return error_response('User not found.', status.HTTP_404_NOT_FOUND)
