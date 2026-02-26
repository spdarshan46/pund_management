from django.urls import path
from .views import SetStructureView

urlpatterns = [
    path("<int:pund_id>/set-structure/", SetStructureView.as_view()),
]