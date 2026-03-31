# Changelog

All notable changes to the **Reimbursement Management System** will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Frontend SPA Integration:**
  - Initialized a brand new React application utilizing Vite in the `frontend/` directory.
  - Implemented `AuthContext.jsx` for local state persistence and mock demonstration.
  - Formulated routing structure (`react-router-dom`) between Unauthenticated (`AuthPage`) and Protected (`Layout`, `Dashboard`, `Expenses`, `Approvals`, `Settings`) views.
  - Developed premium aesthetic Vanilla CSS using `global.css` equipped with dark mode color palettes, glassmorphism patterns, and responsive Flex/Grid patterns.
  - Simulated async OCR technology layout (`ExpenseModal`) and built out API requests for automatic country/currency configuration during signup.
  
- **Backend Infrastructure (Django):**
  - Scaffolding of complete basic backend system utilizing Django, SQLite3, and Django REST Framework nested inside the `backend/` directory.
  - Created customized `AbstractUser` database model in `api/models.py` dictating strict `Admin`, `Manager`, and `Employee` choices to enforce authorization logic.
  - Created `Company` and `Expense` tables featuring dynamic relationship bindings (`ForeignKey`) to the users, alongside `base_amount` and `currency` metadata processing.
  - Constructed basic ViewSets for Companies, Users, and Expenses alongside nested action endpoints for `@action(detail=True)` logic defining `.approve()` and `.reject()`.
  
### Changed
- **Folder Restructuring:**
  - Renamed the legacy Python FastAPI implementation from `reimbursement-system` to `fastapi_backend_old` to prevent conflicting architecture operations.
  - Configured `backend/core/settings.py` strictly allowing `CORS_ALLOW_ALL_ORIGINS = True` to enable smooth cross-origin connection to the new `frontend/`. 

### Fixed
- **Git Mismatch & Restoration:**
  - Successfully fully rebuilt and restored the untracked `frontend/` environment after a git stash collision temporarily detached `package-lock.json` files and evicted the src components representing the React source arrays. 
