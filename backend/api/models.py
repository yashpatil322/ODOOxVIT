from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    base_currency = models.CharField(max_length=10, default="USD")
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Employee', 'Employee'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Employee')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return f"{self.email} ({self.role})"

class Expense(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Escalated', 'Escalated'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    currency = models.CharField(max_length=10, default="USD")
    base_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    receipt_url = models.URLField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Expense #{self.id} | {self.user.email} | {self.amount} {self.currency}"

class ExpenseItem(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='items')
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])

    def __str__(self):
        return f"{self.description} ({self.amount})"

class ApprovalRule(models.Model):
    RULE_TYPES = (
        ('Percentage', 'Percentage-based'),
        ('VIP', 'Specific Approver Bypass'),
        ('Hybrid', 'Hybrid AND/OR Logic'),
        ('Policy', 'Amount-based Policy'),
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='approval_rules')
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    condition_config = models.JSONField(help_text="JSON payload containing rule configuration (e.g. {'percentage': 60} or {'threshold': 5000})")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.company.name} - {self.rule_type}"

class ApprovalStep(models.Model):
    STEP_STATUS = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Skipped', 'Skipped (VIP Override)'),
    )
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='approval_steps')
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_approvals')
    step_order = models.PositiveIntegerField(help_text="Sequence index for sequential routing")
    status = models.CharField(max_length=20, choices=STEP_STATUS, default='Pending')
    comments = models.TextField(null=True, blank=True)
    action_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['step_order']

    def __str__(self):
        return f"Step {self.step_order} for Exp #{self.expense.id} by {self.approver.email}"

class CurrencyRate(models.Model):
    base_currency = models.CharField(max_length=10)
    target_currency = models.CharField(max_length=10)
    rate = models.DecimalField(max_digits=15, decimal_places=6)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('base_currency', 'target_currency')

    def __str__(self):
        return f"1 {self.base_currency} = {self.rate} {self.target_currency}"

class AuditLog(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='audit_logs', null=True)
    action = models.CharField(max_length=255)
    entity_name = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=50)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.entity_name} ({self.entity_id}) - {self.action}"
