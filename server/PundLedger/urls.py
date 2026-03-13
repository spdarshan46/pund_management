from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def health(request):
    return HttpResponse("PUNDX API running")

urlpatterns = [
    path('', health, name='health'),
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('punds/', include('punds.urls')),
    path('finance/', include('finance.urls')),
]
