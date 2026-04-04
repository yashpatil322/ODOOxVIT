# Reimbursement Management System

A multi-tenant reimbursement workflow backend built with FastAPI, SQLAlchemy (async), Alembic, and optional Celery workers.

This project is designed to demonstrate:
- Multi-tenant data boundaries
- Expense submission and approval workflows
- Configurable workflow steps (manager, specific approver, quorum)
- Database migrations with Alembic
- Async API architecture with clear service boundaries

## Tech Stack

- Python 3.10+
- FastAPI
- SQLAlchemy 2.x (async)
- SQLite (default local database)
- Alembic
- Celery + Redis (optional async task execution)

## Project Layout

```text
backend/legacy_fastapi/
  app/
    api/
      v1/
        endpoints/
          expenses.py
          workflows.py
          seed.py
    core/
      config.py
    db/
      database.py
    models/
    schemas/
    services/
      state_machine.py
    tasks/
      currency.py
      ocr.py
  alembic/
    versions/
  worker/
    celery_app.py
  alembic.ini
  requirements.txt
```

## Runtime Configuration

Core settings are in app/core/config.py.

Important defaults:
- API prefix: /api/v1
- Async DB URI: sqlite+aiosqlite:///.../reimbursement.db
- Sync DB URI: sqlite:///.../reimbursement.db
- Celery broker/result: redis://localhost:6379/0

The SQLite path is built as an absolute project path, so DB resolution is stable regardless of your current terminal folder.

## Data Model Overview

Main entities:
- Tenant: Organizational boundary for all records.
- Role: Permission model (Admin, Manager, Employee examples in seed).
- User: Belongs to tenant and role; can have manager_id.
- Workflow: Approval process definition per tenant.
- WorkflowStep: Ordered steps and rule configuration.
- Expense: Reimbursement request and status lifecycle.
- ApprovalLog: Audit trail of per-step decisions.

Expense status progression:
- PENDING: Created but not attached to active review.
- UNDER_REVIEW: Workflow started and awaiting decisions.
- APPROVED: All required steps completed.
- REJECTED: Any step rejects.

## Authentication Model (Current)

This project currently uses mock header-based identity:
- Header name: x-user-id
- Value: User UUID

User lookup is implemented in app/api/deps.py.

Notes:
- This is intentionally simple for local development and workflow testing.
- It is not production-grade authentication.

## Workflow Engine Behavior

The state machine is implemented in app/services/state_machine.py.

Current rule handling:
- SPECIFIC_APPROVER: Allowed only if approver_id matches rule_config.user_id.
- MANAGER: Allowed only if approver_id matches submitter.manager_id.
- PERCENTAGE_QUORUM: Completes when approved count reaches rule_config.required_count.

Approval operation behavior:
1. Validates expense has workflow.
2. Validates step exists and belongs to expense workflow.
3. Validates approver authorization for the step.
4. Writes ApprovalLog.
5. If rejected, expense becomes REJECTED immediately.
6. If approved, checks if next step exists.
7. If no next step, expense becomes APPROVED; otherwise remains UNDER_REVIEW.

## API Endpoints

Base prefix: /api/v1

Health:
- GET /health

Seed:
- POST /api/v1/seed/
  - Creates tenant, roles, users, default workflow, and steps.
  - If already seeded, returns existing IDs (idempotent behavior).

Expenses:
- POST /api/v1/expenses/
  - Create expense for current user.
  - Automatically attaches first workflow found for tenant.
- GET /api/v1/expenses/me
  - List current user expenses.
- GET /api/v1/expenses/{expense_id}
  - Get one expense (tenant-scoped).
- POST /api/v1/expenses/{expense_id}/approve
  - Submit approval/rejection for a workflow step.

Workflows:
- GET /api/v1/workflows/
  - List tenant workflows with steps.
- GET /api/v1/workflows/{workflow_id}
  - Get one workflow with steps.
- POST /api/v1/workflows/
  - Create workflow and associated steps.

Interactive API docs:
- /docs
- /redoc

## Local Setup

From `backend/legacy_fastapi`:

1. Create virtual environment

```powershell
python -m venv venv
```

2. Activate virtual environment (PowerShell)

```powershell
.\venv\Scripts\Activate.ps1
```

3. Install dependencies

```powershell
pip install -r requirements.txt
```

4. Run migrations

```powershell
alembic upgrade head
```

5. Start API server

```powershell
uvicorn app.main:app --reload
```

6. Open docs

- http://127.0.0.1:8000/docs

## Optional: Run Celery Worker

If Redis is running locally:

```powershell
celery -A worker.celery_app.celery_app worker --loglevel=info
```

Available task modules:
- app.tasks.ocr.process_receipt_ocr
- app.tasks.currency.fetch_daily_exchange_rates

## Quick Functional Test Flow

1. Seed data

```powershell
$base='http://127.0.0.1:8000'
$seed=Invoke-RestMethod -Method Post -Uri "$base/api/v1/seed/"
$emp=$seed.employee_user_id
$mgr=$seed.manager_user_id
$adm=$seed.admin_user_id
```

2. Create expense as employee

```powershell
$expenseBody = @{ amount='75.00'; currency='eur'; receipt_url=$null } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "$base/api/v1/expenses/" -Headers @{ 'x-user-id'=$emp } -ContentType 'application/json' -Body $expenseBody
```

3. Get workflow and approve steps

```powershell
$wf = Invoke-RestMethod -Method Get -Uri "$base/api/v1/workflows/$($created.workflow_id)" -Headers @{ 'x-user-id'=$emp }
$first=$wf.steps[0].id
$second=$wf.steps[1].id

Invoke-RestMethod -Method Post -Uri "$base/api/v1/expenses/$($created.id)/approve" -Headers @{ 'x-user-id'=$mgr } -ContentType 'application/json' -Body (@{ step_id=$first; status='APPROVED'; comments='manager ok'} | ConvertTo-Json)
$final = Invoke-RestMethod -Method Post -Uri "$base/api/v1/expenses/$($created.id)/approve" -Headers @{ 'x-user-id'=$adm } -ContentType 'application/json' -Body (@{ step_id=$second; status='APPROVED'; comments='admin ok'} | ConvertTo-Json)
$final
```

Expected result:
- expense_status should be APPROVED

## Migrations

Existing migration history includes:
- Initial schema
- Workflow-to-expense link and audit timestamp additions

Common commands:

```powershell
alembic upgrade head
alembic downgrade -1
alembic current
alembic history
```

## Implementation Notes

- The project currently prioritizes deterministic local behavior over production hardening.
- Password hashing in seed is deterministic PBKDF2 to avoid environment-specific bcrypt issues.
- Role permissions are stored as JSON for flexibility.
- Tenant boundary checks are enforced on sensitive reads/writes in key endpoints.

## Known Gaps (Production Hardening)

Recommended upgrades for production use:
- Replace mock x-user-id with real auth (JWT/OIDC).
- Add authorization policies by role and resource.
- Move from SQLite to PostgreSQL/MySQL for multi-user workloads.
- Add structured logging and tracing.
- Add test suite (unit + integration + workflow regression tests).
- Add request validation/error envelope standards.
- Add CI checks for linting, type checks, and migration drift.

## Troubleshooting

1. Could not open requirements.txt
- Ensure you run pip install from backend/legacy_fastapi.

2. Database tables missing
- Run alembic upgrade head.

3. x-user-id invalid or user not found
- Seed first using POST /api/v1/seed/.
- Reuse returned employee/manager/admin IDs.

4. Celery worker not consuming tasks
- Verify Redis is running.
- Verify CELERY_BROKER_URL and CELERY_RESULT_BACKEND.

## License

No explicit license file is currently included in this repository.
Add a LICENSE file before public distribution.
