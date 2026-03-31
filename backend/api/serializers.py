from rest_framework import serializers
from .models import User, Company, Expense
from django.contrib.auth import authenticate

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'company', 'manager']

class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('base_amount', 'status', 'approved_by', 'user')
