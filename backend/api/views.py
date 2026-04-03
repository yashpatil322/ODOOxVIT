from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.utils import timezone

from .models import User, Company, Expense, ApprovalStep, ApprovalRule, AuditLog
from .serializers import (
    UserSerializer, CompanySerializer, ExpenseSerializer,
    ApprovalStepSerializer, ApprovalRuleSerializer, AuditLogSerializer
)

def log_audit(company, action_desc, entity_name, entity_id, user):
    AuditLog.objects.create(
        company=company,
        action=action_desc,
        entity_name=entity_name,
        entity_id=entity_id,
        performed_by=user
    )

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        company_name = request.data.get('company_name')
        country = request.data.get('country', 'united states')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Mock extracting base currency from RestCountries API locally or via fetching
        base_currency = 'USD'
        try:
            res = requests.get(f'https://restcountries.com/v3.1/name/{country}?fullText=true&fields=name,currencies', timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data and len(data) > 0 and 'currencies' in data[0]:
                    base_currency = list(data[0]['currencies'].keys())[0]
        except:
            pass
        
        company = Company.objects.create(name=company_name, base_currency=base_currency, country=country)
        username = email.split('@')[0]
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='Admin',
            company=company
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer

    def get_queryset(self):
        return Company.objects.filter(id=self.request.user.company_id)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Employee':
            return Expense.objects.filter(user=user)
        elif user.role == 'Manager':
            # Managers see their team's expenses or expenses assigned to them to approve
            return Expense.objects.filter(user__company=user.company)
        return Expense.objects.filter(user__company=user.company)

    def perform_create(self, serializer):
        user = self.request.user
        amount = serializer.validated_data.get('amount')
        currency = serializer.validated_data.get('currency', 'USD')
        base_currency = user.company.base_currency if user.company else 'USD'
        
        # Mock exchange rate api calculation
        base_amount = amount
        if currency != base_currency:
            base_amount = float(amount) * 1.1 # Default mock factor to prevent API lag during prototyping
            
        expense = serializer.save(user=user, base_amount=base_amount)
        log_audit(user.company, "Expense Submitted", "Expense", expense.id, user)

        # Sequential Workflow Generation
        # Simple step: Route directly to their Manager
        if user.manager:
            ApprovalStep.objects.create(
                expense=expense,
                approver=user.manager,
                step_order=1
            )
        else:
            # If no manager, auto-route to Admin or auto-approve?
            admins = User.objects.filter(company=user.company, role='Admin')
            if admins.exists():
                ApprovalStep.objects.create(
                    expense=expense,
                    approver=admins.first(),
                    step_order=1
                )

class ApprovalStepViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalStepSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['Manager', 'Admin']:
            return ApprovalStep.objects.filter(approver=user, status='Pending')
        return ApprovalStep.objects.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        step = self.get_object()
        expense = step.expense
        
        step.status = 'Approved'
        step.action_date = timezone.now()
        step.comments = request.data.get('comments', '')
        step.save()
        
        log_audit(request.user.company, "Step Approved", "ApprovalStep", step.id, request.user)

        # Check if there are further steps, or update expense status
        pending_steps = ApprovalStep.objects.filter(expense=expense, status='Pending')
        if not pending_steps.exists():
            expense.status = 'Approved'
            expense.save()
            log_audit(request.user.company, "Expense Fully Approved", "Expense", expense.id, request.user)

        return Response({'status': 'Approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        step = self.get_object()
        expense = step.expense
        
        step.status = 'Rejected'
        step.action_date = timezone.now()
        step.comments = request.data.get('comments', '')
        step.save()

        expense.status = 'Rejected'
        expense.save()
        log_audit(request.user.company, "Step Rejected", "ApprovalStep", step.id, request.user)
        log_audit(request.user.company, "Expense Fully Rejected", "Expense", expense.id, request.user)

        return Response({'status': 'Rejected'})

class ApprovalRuleViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalRuleSerializer

    def get_queryset(self):
        return ApprovalRule.objects.filter(company=self.request.user.company)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    
    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return AuditLog.objects.filter(company=self.request.user.company).order_by('-timestamp')
        return AuditLog.objects.none()
