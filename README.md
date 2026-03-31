# Reimbursement Management System (ODOOxVIT)

An automated digital platform engineered to replace manual, error-prone expense reporting with a streamlined submission and approval workflow. The system facilitates employee expense submission with simulated OCR, manager sequential approvals, and company-level multi-currency tracking and conversion.

## 🚀 Project Overview

The Reimbursement Management application is partitioned into two distinctive stacks configured for scalability and separation of concerns:

- **Frontend:** A React Single Page Application built with Vite. Features a premium glassmorphic UI, dynamic Framer Motion animations, and role-based access control flows.
- **Backend:** A robust Django application paired with Django REST Framework (DRF) and SQLite3, supplying secure database models and RESTful APIs for managing users, companies, and hierarchical expense approvals.

## 📦 System Architecture

- **Roles & Permissions:** 
  - `Admin`: System architect (auto-created on signup). Can manage users, define reporting lines, and set approval rules (percentage-based or VIP bypass).
  - `Manager`: Reviews the team's expenses converted to the base currency. Can approve/reject.
  - `Employee`: Submits expenses with an OCR-simulated flow (auto-extracting fields) and views their history.

- **Workflow Routing:** Expense -> Manager -> Specific Approver / Finance (Sequential).
- **Multi-Currency Mechanism:** Determines base company currency via external Country API dynamically during onboarding and simulates real-time conversion rates against foreign submissions.

## ⚙️ Getting Started

### 1. Running the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The application will securely be served at [http://localhost:5173/](http://localhost:5173/).

### 2. Running the Backend (Django + SQLite3)
```bash
cd backend

# Create Virtual Environment & Activate 
python -m venv venv
# On Windows:
.\venv\Scripts\activate 
# On Unix or MacOS:
# source venv/bin/activate

# Install Dependencies
pip install django djangorestframework django-cors-headers

# Apply Migrations and Run Server
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
The Django REST APIs will execute at `http://127.0.0.1:8000/api/`.

## 📌 Important Notes

- The previous FastAPI backend iteration has been preserved under `fastapi_backend_old/` for historical tracking if required. The active canonical backend is strictly placed inside `backend/`.
- Frontend initially executes on local mock `AuthContext.jsx` state to allow instant UX prototyping. It is intended to be retrofitted to query the active `backend/api/` network later.

---
*For extensive details on the database schemas, API routes, and design choices, please consult the `ARCHITECTURE.md` file.*
