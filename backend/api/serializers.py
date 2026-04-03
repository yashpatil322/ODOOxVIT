from rest_framework import serializers
from .models import User, Company, Expense, ExpenseItem, ApprovalStep, ApprovalRule, AuditLog, CurrencyRate

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    manager_name = serializers.CharField(source='manager.email', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'company', 'manager', 'manager_name']
        extra_kwargs = {'password': {'write_only': True}}

class ExpenseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseItem
        fields = ['id', 'category', 'description', 'amount']

class ApprovalStepSerializer(serializers.ModelSerializer):
    approver_email = serializers.CharField(source='approver.email', read_only=True)

    class Meta:
        model = ApprovalStep
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    items = ExpenseItemSerializer(many=True, required=False)
    approval_steps = ApprovalStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'user', 'user_email', 'amount', 'currency', 'base_amount', 'category', 'description', 'date', 'receipt_url', 'status', 'created_at', 'items', 'approval_steps']
        read_only_fields = ('base_amount', 'status', 'user')

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        expense = Expense.objects.create(**validated_data)
        for item_data in items_data:
            ExpenseItem.objects.create(expense=expense, **item_data)
        return expense

class ApprovalRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalRule
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    performed_by_email = serializers.CharField(source='performed_by.email', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
