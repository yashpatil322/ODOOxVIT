# Project Analysis & Architecture

This document serves as a comprehensive overview of the `ODOOxVIT` Reimbursement Management System's architecture, relationships, and design rules. It is designed to be parsed quickly to understand the entire ecosystem without analyzing the raw codebase locally.

## 1. System Components

The application functions across two decoupled spaces: `frontend/` (React SPA) and `backend/` (single backend root with classified backend types).

Backend classification:
- `backend/` -> active Django REST backend (`api/`, `core/`, `manage.py`)
- `backend/legacy_fastapi/` -> archived FastAPI implementation (legacy reference only)

### A. The Frontend Interface
- **Framework:** Vite + React + React Router DOM
- **Design Philosophy:** Premium, sophisticated layout utilizing Glassmorphism. Strict avoidance of ad-hoc utility classes in favor of robust, highly semantic Vanilla CSS stored within `global.css`.
- **State Management:** Currently utilizing `AuthContext.jsx` integrated with a mock `localStorage` mechanism for `user`, `company`, and `expenses` configurations. Set up to easily swap out to use `fetch` targeting the backend URLs below.
- **Key Modules:**
  - `Layout.jsx` / `Dashboard.jsx`: Base navigation logic and high-level widgets plotting total pending vs approved funds.
  - `AuthPage.jsx`: Multi-login form and automatic country/currency configuration upon Company Signup. 
  - `Expenses.jsx`: A form-flow configured to test generic uploads along with asynchronous simulated OCR parsing to generate amounts and vendors automatically natively. Gives you access to tracking logs.
  - `Approvals.jsx`: Restricted environment logic utilizing `role === 'Manager'` to grant access to approve/reject claims.

### B. The Django REST Backend
- **Framework:** Django `6.x` + Django REST Framework + CORS Headers.
- **Database:** Standard SQLite3 configured for local execution and immediate prototyping without needing Dockerized databases.
- **Entity Relationship Model:**
  1. **Company:** `<id, name, base_currency, country>`
     - Serves as the organizational root node.
  2. **User (Abstract):** `<id, email, username, role, company_id (FK), manager_id (FK to self)>`
     - Overrides default Django `auth_user` model, incorporating hierarchal recursion mapping to establish reporting lines (`subordinates`). Roles are rigorously bounded (`Admin`, `Manager`, `Employee`).
  3. **Expense:** `<id, user_id (FK), amount, currency, base_amount, status, category, approved_by_id (FK)>`
     - Bound one-to-many logically. Handled by serializers that execute automatic Mock logic in the `perform_create()` to convert currencies statically to `base_amount`.

### C. Smart Approval Matrix
The logic exists within `Settings.jsx` and outlines three core thresholds for Admin logic overriding:
- **Percentage Rule:** Configures dynamic thresholds (e.g. 60% of group required for approval threshold met).
- **Specific Approver (VIP):** Skips hierarchy steps if an escalated individual signs off on the expense (e.g. CFO mapping). 
- **Hybrid Rule:** Logic integrating OR boundaries between Percentage and VIP flows to speed up processing logic dynamically.
