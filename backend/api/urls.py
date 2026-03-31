from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CompanyViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
