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
pip install -r requirements.txt

# Apply Migrations, Seed Shared Demo Users, and Run Server
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```
The Django REST APIs will execute at `http://127.0.0.1:8000/api/`.

Shared local development logins created by `seed_demo_data`:

- `admin@demo.com / admin123`
- `manager@demo.com / manager123`
- `employee1@demo.com / employee123`
- `employee2@demo.com / employee123`

### 2.1 One-Click Backend Setup (Windows)

From `backend/`, run one command to create venv, install dependencies, migrate, and seed shared demo users:

```powershell
.\setup_dev.ps1
```

Or run the batch launcher:

```cmd
setup_dev.bat
```

To setup and immediately start the backend server:

```powershell
.\setup_dev.ps1 -RunServer
```

### 3. Backend Folder Classification

The repository now enforces a single top-level backend folder:

- `backend/` (canonical backend root)
  - `backend/api/` + `backend/core/` + `backend/manage.py`: Active Django REST backend.
  - `backend/legacy_fastapi/`: Legacy FastAPI implementation retained for historical reference.

## 📌 Important Notes

- The previous FastAPI backend iteration has been moved under `backend/legacy_fastapi/` for historical tracking. The active canonical backend remains the Django app in `backend/`.
- Frontend initially executes on local mock `AuthContext.jsx` state to allow instant UX prototyping. It is intended to be retrofitted to query the active `backend/api/` network later.

---
*For extensive details on the database schemas, API routes, and design choices, please consult the `ARCHITECTURE.md` file.*
