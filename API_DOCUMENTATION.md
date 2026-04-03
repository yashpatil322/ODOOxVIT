# ODOOxVIT: SaaS API Documentation

This documentation covers the explicit production-grade endpoints built dynamically via Django REST Framework and the Custom Token mapping schema. All private endpoints strictly require the `Authorization: Bearer <token>` header to be passed by the client.

---

## 🔐 1. Authentication & Onboarding
The system operates using `rest_framework_simplejwt`, enforcing short-lived Access Tokens (24h) and long-lived Refresh tokens (7 Days).

### Create Company & Admin Profile
- **`POST /api/auth/signup/`**
- **Description:** Entry point for new organizations. Bootstraps a default Company, dynamically evaluates Country to establish currency boundaries, and builds the initial `Admin` user object.
- **Payload:**
  ```json
  {
      "email": "ceo@corp.com",
      "password": "secure_password",
      "company_name": "Corp Inc.",
      "country": "united kingdom"
  }
  ```
- **Returns:** Native JWT access/refresh mapping pairs.

### Obtain JSON Web Token
- **`POST /api/auth/token/`**
- **Description:** Allows previously created profiles to authenticate sequentially.
- **Payload:** `email`, `password`.
- **Returns:** `{ "access": "<jwt_string>", "refresh": "<jwt_string>" }`

---

## 🏛️ 2. Organization Logic
Endpoints built around managing structural constraints and personnel allocations underneath a Tenant boundary.

### Users & Hierarchies
- **`GET /api/users/`** (Requires Admin/Manager Privilege)
- **Description:** Returns JSON list of subordinates tied explicitly to the requestor's `company_id`.
- **`POST /api/users/`** 
- **Description:** Admin endpoint to dynamically invite/create new Employee schemas and assign them Manager ForeignKeys recursively.

### Smart Approval Rules Configuration
- **`GET | POST | PATCH /api/rules/`**
- **Description:** Grants Admins explicit write access against `ApprovalRule` entities dynamically defining:
  - `rule_type`: (Percentage, VIP, Hybrid, Policy).
  - `condition_config`: A pure JSON dictionary housing thresholds (ex. `{"threshold_amount": 1000}`).

---

## 💸 3. Expense Lifecycle Engine
The core sequence executing the fundamental SaaS business logic.

### Submit & Index Claims
- **`GET /api/expenses/`**
  - **Employee Return:** Extracts and returns only Claims owned by `request.user`.
  - **Manager Return:** Filters up and returns team-scaled Claims originating underneath their direct hierarchical tree.
- **`POST /api/expenses/`**
  - **Description:** Central entry point. Accepts standard inputs *(amount, currency, category)*. The `perform_create()` architecture catches the request, natively establishes the exact `base_amount` via calculating external API differentials, and natively mints `ApprovalStep` node sequences.

### Manager Override & Sign-off Execution
Instead of raw updates against expenses, Managers manipulate specific Node Sequence entries.

- **`GET /api/approvals/`**
  - **Description:** Pulls localized `ApprovalStep` objects mapped *only* to the interacting Manager ensuring queue isolation.
- **`POST /api/approvals/<id>/approve/`**
  - **Description:** Explicit custom ViewSet Action. Triggers asynchronous database locking. Moves sequence to step 2, or sets overall `Expense.status = 'Approved'` if final sequential member.
- **`POST /api/approvals/<id>/reject/`**
  - **Description:** Hard-fails an entire chain structurally and dumps events simultaneously to `AuditLog`.

---

## 🛡️ 4. Immutable Records
- **`GET /api/audit/`** (Admin Strictly)
- **Description:** Generates read-only feeds mapping `AuditLog` outputs outlining precise timestamp executions (`Expense Submitted`, `Step Approved`, `Expense Fully Rejected`). Used to feed the React Dashboard Analytics overview.
