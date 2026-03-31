from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Company, Expense
from .serializers import UserSerializer, CompanySerializer, ExpenseSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', 'Employee') == 'Employee':
            return Expense.objects.filter(user=user)
        return Expense.objects.all()

    def perform_create(self, serializer):
        # Calculate mock conversion rate
        amount = serializer.validated_data.get('amount')
        currency = serializer.validated_data.get('currency', 'USD')
        user = self.request.user
        base_currency = getattr(user.company, 'base_currency', 'USD')
        
        base_amount = amount
        if currency != base_currency:
            if currency == 'EUR' and base_currency == 'USD':
                base_amount = float(amount) * 1.1
            elif currency == 'INR' and base_currency == 'USD':
                base_amount = float(amount) * 0.012
        
        serializer.save(user=user, base_amount=base_amount)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        expense = self.get_object()
        expense.status = 'Approved'
        expense.approved_by = request.user
        expense.save()
        return Response({'status': 'expense approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        expense = self.get_object()
        expense.status = 'Rejected'
        expense.approved_by = request.user
        expense.save()
        return Response({'status': 'expense rejected'})
