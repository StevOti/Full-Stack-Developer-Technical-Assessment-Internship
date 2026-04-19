from django.urls import path

from .views import FieldViewSet

field_list = FieldViewSet.as_view({'get': 'list', 'post': 'create'})
field_detail = FieldViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'})

urlpatterns = [
    path('', field_list, name='field-list'),
    path('<int:pk>/', field_detail, name='field-detail'),
]
