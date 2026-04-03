# Implementation Plan: Reimbursement Management System (RMS) - Production SaaS

This strategic plan outlines the systematic elevation of the current prototype to an enterprise-grade SaaS platform utilizing PostgreSQL, robust Django REST Framework (DRF) APIs, JWT Authentication, dynamic Approval Engines, and a clean professional React frontend.

## Phase 1: Foundational Architecture & Database Design
*Target: Establish a highly scalable relational database structure mapping the complex hierarchy and rule engines.*

1.  **Environment Setup & PostgreSQL Integration:**
    *   Swap SQLite3 for PostgreSQL in `backend/core/settings.py`.
    *   Install `psycopg2-binary`.
    *   Implement `djangorestframework-simplejwt` for secure tokenized routing.
2.  **Enterprise Schema Design (`api/models.py`):**
    *   `Company`: Core tenant model `(id, name, base_currency, country, created_at)`.
    *   `Role`: RBAC definitions `(id, name: Admin/Manager/Employee, permissions_json)`.
    *   `User`: Extended abstract user `(id, email, company, role, manager_id)`.
    *   `Expense`: Base claim `(id, user_id, amount, base_amount, currency, status, receipt_url, created_at)`.
    *   `ExpenseItem`: Granular breakdown `(id, expense_id, category, description, amount)`.
    *   `ApprovalRule`: Workflow logic `(id, company_id, rule_type: Percentage/VIP/Hybrid, context_json)`.
    *   `ApprovalStep`: Sequence tracking `(id, expense_id, approver_id, step_order, status, created_at)`.
    *   `AuditLog`: Immutable history `(id, entity, entity_id, action, performed_by, timestamp)`.
3.  **Migration & Validation:**
    *   Generate and apply initial migrations strictly tracking referential integrities.

## Phase 2: Core Backend Engine Construction
*Target: Build secure, modular, and RESTful APIs reflecting real-world scalable logic.*

1.  **Authentication & Onboarding API:**
    *   `POST /api/auth/signup/`: Handles Company creation, assigns the Admin role, invokes the Country API to lock currency, and returns JWT pairs.
    *   `POST /api/auth/token/`: Login mechanism returning Access/Refresh JWTs.
2.  **Expense Lifecycle & OCR Processing:**
    *   Integrate `pytesseract` (Tesseract integration) or mock the interface for parsing uploaded `/receipts/` locally.
    *   `POST /api/expenses/`: Takes multipar/form-data. Triggers static currency conversion using Exchange Rates API.
3.  **Dynamic Approval Matrix:**
    *   Develop a `services/approval_engine.py` to evaluate steps.
    *   If `User == Manager`, generate Step 1.
    *   Apply `ApprovalRule` configs (e.g. VIP override triggers automatic chain completion).
    *   `POST /api/approvals/<id>/action/`: Submits 'Approve' or 'Reject', pushing the workflow to the next step or finalizing.
4.  **Logging & Analytics:**
    *   Utilize Django Signals (`post_save`) to write to `AuditLog`.
    *   Create aggregation endpoints for the Analytics Dashboard (`/api/analytics/department-spend/`).

## Phase 3: Professional Frontend Revamp
*Target: Replace the current neon/glassmorphism UI with a clean, flat, enterprise aesthetic.*

1.  **Styling & State Migration:**
    *   Rewrite `global.css` for a "Clean Professional UI" (Think Stripe or Vercel dashboard: crisp whites, pale gray backgrounds, subtle borders, stark black text, standardized primary blues).
    *   Strip `AuthContext.jsx` of local-storage mock logic and replace it with Axios/Fetch interceptor logic tying into `/api/auth/token/`.
2.  **Role-Based Dashboards:**
    *   **Admin View:** Configuration tables for Users, Organization Hierarchy trees, and Approval Rule generators.
    *   **Manager View:** Dedicated "Queue" visualizing pending `ApprovalStep` lines with contextual `AuditLog` history.
    *   **Employee View:** Clean submission forms featuring Drag & Drop file uploads triggering the backend OCR queue.

## Phase 4: Security, QA & Delivery
*Target: Harden the ecosystem.*

1.  **Security Measures:**
    *   Implement Object-Level Permissions (`IsOwnerOrReadOnly` or `IsCompanyAdmin`) across all DRF views.
    *   Sanitize inputs and secure media routes `/media/receipts/`.
2.  **Final Polish:**
    *   Clean folder architecture.
    *   Produce thorough API Documentation (Swagger/OpenAPI).
    *   Provide explicit local setup instructions linking Postgres.
