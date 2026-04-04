from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from api.models import Company


class Command(BaseCommand):
    help = "Create or update shared demo data for local team development"

    def handle(self, *args, **options):
        User = get_user_model()

        company, _ = Company.objects.get_or_create(
            name="Demo Corp",
            defaults={
                "base_currency": "USD",
                "country": "united states",
            },
        )

        # Keep company defaults predictable across every teammate machine.
        if company.base_currency != "USD" or company.country.lower() != "united states":
            company.base_currency = "USD"
            company.country = "united states"
            company.save(update_fields=["base_currency", "country"])

        users = [
            {
                "email": "admin@demo.com",
                "username": "admin_demo",
                "role": "Admin",
                "password": "admin123",
                "manager_email": None,
            },
            {
                "email": "manager@demo.com",
                "username": "manager_demo",
                "role": "Manager",
                "password": "manager123",
                "manager_email": "admin@demo.com",
            },
            {
                "email": "employee1@demo.com",
                "username": "employee1_demo",
                "role": "Employee",
                "password": "employee123",
                "manager_email": "manager@demo.com",
            },
            {
                "email": "employee2@demo.com",
                "username": "employee2_demo",
                "role": "Employee",
                "password": "employee123",
                "manager_email": "manager@demo.com",
            },
        ]

        user_by_email = {}

        for item in users:
            user, _ = User.objects.get_or_create(
                email=item["email"],
                defaults={
                    "username": item["username"],
                    "role": item["role"],
                    "company": company,
                },
            )

            user.username = item["username"]
            user.role = item["role"]
            user.company = company
            user.set_password(item["password"])
            user.save()

            user_by_email[item["email"]] = user

        for item in users:
            if item["manager_email"]:
                user = user_by_email[item["email"]]
                manager = user_by_email[item["manager_email"]]
                if user.manager_id != manager.id:
                    user.manager = manager
                    user.save(update_fields=["manager"])

        self.stdout.write(self.style.SUCCESS("Demo seed complete."))
        self.stdout.write("Use these logins for local development:")
        self.stdout.write("- admin@demo.com / admin123")
        self.stdout.write("- manager@demo.com / manager123")
        self.stdout.write("- employee1@demo.com / employee123")
        self.stdout.write("- employee2@demo.com / employee123")
