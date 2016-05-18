import logging

from django.conf import settings
from django.http import Http404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, api_view


LOG_PING_WHITELIST = getattr(settings, 'LOG_PING_WHITELIST', [
    'testpilot.newfeedback',
    'testpilot.main-install'
])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_ping(request, logger_name):
    """Accept and log metrics pings"""
    if logger_name not in LOG_PING_WHITELIST:
        raise Http404

    extra = {'uid': request.user.id}
    extra.update(request.data)
    logging.getLogger(logger_name).info('', extra=extra)
    return Response({'status': 'ok'})
