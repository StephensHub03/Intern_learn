"""
Utility functions for the users app.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON format:
    { "success": false, "data": null, "message": "..." }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_message = ''
        if isinstance(response.data, dict):
            # Flatten nested error messages
            messages = []
            for key, value in response.data.items():
                if isinstance(value, list):
                    messages.append(f"{key}: {', '.join(str(v) for v in value)}")
                else:
                    messages.append(str(value))
            error_message = ' | '.join(messages)
        elif isinstance(response.data, list):
            error_message = ', '.join(str(item) for item in response.data)
        else:
            error_message = str(response.data)

        response.data = {
            'success': False,
            'data': None,
            'message': error_message,
        }

    return response


def success_response(data=None, message='', status_code=status.HTTP_200_OK):
    """Return a standardized success response."""
    return Response(
        {
            'success': True,
            'data': data,
            'message': message,
        },
        status=status_code,
    )


def error_response(message='', status_code=status.HTTP_400_BAD_REQUEST):
    """Return a standardized error response."""
    return Response(
        {
            'success': False,
            'data': None,
            'message': message,
        },
        status=status_code,
    )
