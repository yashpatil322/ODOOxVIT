# Reimbursement Management System (RMS) - Platform Workflow

This document explicitly traces the end-to-end journey of data and user interactions within the Reimbursement Management SaaS Platform. It covers how a company is born on the platform, how employees interact with the smart receipt system, and how the logic engine resolves claims securely.

---

## 🚀 1. The Onboarding Flow (Admins & Company Setup)
*The platform utilizes a multi-tenant architecture. Every user belongs to a specific `Company`, completely isolating data boundaries.*

1. **Sign Up (`/auth`):** An executive or IT manager visits the React Frontend and fills out the "Create Company" form (Inputting Email, Password, Company Name, and Operating Country).
2. **Dynamic Configuration:** 
   - The Django Backend receives this payload.
   - It silently pings the external `RESTCountries API` to determine what currency the input Country uses (e.g., "United Kingdom" automatically locks the Company `base_currency` to `GBP`).
3. **Role Assignment:** A new `Company` Tenant is mapped in the Postgres-compliant schema, and the creator is minted as the `Admin`.
4. **JWT Handshake:** The backend returns an encrypted JSON Web Token (`access` and `refresh`) to the browser. The frontend stores this strictly, mapping it into every future API request headers (`Authorization: Bearer <token>`).

---

## 👥 2. Organizational Expansion (The Hierarchy)
*Before expenses can be processed, the reporting structure must be built.*

1. **Admin Dashboard:** The `Admin` automatically has permissions to hit `POST /api/users/`.
2. **User Creation:** They create new user models assigning strict `<Roles>`: `Manager` and `Employee`.
3. **Manager Alignment:** Most importantly, they bind an `Employee` to a specific `Manager` using a Self-Referencing ForeignKey. This explicit linkage is what powers the automated Approval Engine later.

---

## 💸 3. The Expense Submission Flow (Employees)
*This is the core operational feature of the platform. Employees only see their own isolated data.*

1. **The OCR Intercept:** An Employee navigates to `/expenses` and clicks "Submit Claim". They drag and drop an image of a receipt into the Modal.
2. **Data Extraction (Mocked):** The system spins up an "Extraction" state. In a real-world scenario, this POSTs the media to `Tesseract` or `AWS Textract`, pulling the `amount`, `date`, and `vendor`. The UI auto-populates the input fields to save time.
3. **Base Currency Conversion (The API Engine):** 
   - The Employee verifies the data (e.g., `500 INR` for a taxi in India) and submits it.
   - Django intercepts this `POST /api/expenses/`.
   - It checks the Company's `base_currency` (e.g., `USD`). Because the submission is `INR`, it pings an external Exchange Rate pipeline (mocked logically here) to compute the exact `base_amount` (e.g., `$6.00`).
   - The Database logs both the original input `500 INR` and the finalized `base_amount`.
4. **Triggering the Smart Matrix:**
   - The system checks: *Who is this Employee's Manager?*
   - It natively mints a new relational object called an `ApprovalStep`, assigning it to that specific Manager and binding it to this Expense (setting its order to `Step 1`).

---

## ⚖️ 4. The Approval Engine Flow (Managers & Logic Rules)
*Managers do not query all expenses; they query their isolated action queues.*

1. **The Queue (`/approvals`):** The Manager logs in. Their dashboard hits `GET /api/approvals/`. The Django backend strips out all noise and *only* returns pending `ApprovalStep` objects where `approver == Manager.id`.
2. **Action Vectors:** The Manager reviews the line item (viewing the natively converted `base_amount`) and clicks **Approve**.
3. **Sequence Resolution:**
   - `POST /api/approvals/<id>/approve/` is fired.
   - The Backend secures the Database Lock, flips the `ApprovalStep.status` to `Approved`.
   - **The Engine Check:** It asks, *Are there any more sequence steps required for this Expense?* (Did the Admin set a Policy rule that expenses over $500 require Director sign-off too?). 
   - If **Yes**, it generates `Step 2` and alerts the Director.
   - If **No**, it finalizes the loop, updating the core `Expense.status` to `Approved`.

---

## 🛡️ 5. The Audit Log (The Black Box)
- Throughout this entire lifecycle, Django native `Signals` are firing silently in the background mapping every single mutation.
- When the Employee creates the expense, when the conversion API hits, when the Manager approves it—a read-only `AuditLog` row is generated containing the exact timestamp, the exact `User ID` responsible, and the context.
- Admins can query this at any time to guarantee 100% platform tracking integrity.
