from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, CompanyViewSet, ExpenseViewSet, 
    ApprovalStepViewSet, ApprovalRuleViewSet, AuditLogViewSet
)
from .views import SignupView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'approvals', ApprovalStepViewSet, basename='approvalstep')
router.register(r'rules', ApprovalRuleViewSet, basename='approvalrule')
router.register(r'audit', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    # Auth Endpoints
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Core Endpoints
    path('', include(router.urls)),
]
