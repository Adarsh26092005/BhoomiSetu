# NLAMS — Organizations & Users Architecture

## 1. Core Identity & Multi-Tenancy Architecture

NLAMS enforces a strict sovereign dual-axis identity model:

```
+-------------------------------------------------------------+
|                      User Account                           |
+-------------------------------------------------------------+
| AccountType:                                                |
|   - GOVERNMENT_OFFICER (Statutory/administrative personnel) |
|   - PIA_USER (Implementing agency/concessionaire liaison)   |
|                                                             |
| UserRole (12 Canonical Roles):                              |
|   1. SUPER_ADMIN                                            |
|   2. CENTRAL_OFFICER                                        |
|   3. STATE_OFFICER                                          |
|   4. DISTRICT_OFFICER                                       |
|   5. PROJECT_IMPLEMENTING_AGENCY                            |
|   6. LAND_ACQUISITION_OFFICER                               |
|   7. SURVEY_OFFICER                                         |
|   8. REVENUE_OFFICER                                        |
|   9. VERIFICATION_OFFICER                                   |
|   10. FINANCE_OFFICER                                       |
|   11. R_AND_R_OFFICER                                       |
|   12. VIEWER                                                |
+-------------------------------------------------------------+
```

### 1.1 Invariants & Security Boundaries
1. **Single Authentication Endpoint**: All users log in via `POST /api/v1/auth/login`. No bifurcated entry points exist.
2. **AccountType vs UserRole**:
   - `AccountType` distinguishes statutory public servants from external contractors/concessionaires.
   - `UserRole` represents the sovereign RBAC authorization tier.
   - `PIA_USER` accounts are restricted to `PROJECT_IMPLEMENTING_AGENCY` or `VIEWER` roles.
   - `PIA_USER` administrators are prohibited from creating government officer accounts or escalating privileges across organizational boundaries.
3. **Password Security**: Cleartext passwords are never stored or logged. Bcrypt hashing with cost factor 12 is applied on creation/update. `passwordHash` is excluded from all DTO serialization.
4. **Session Revocation on Deactivation**: Deactivating a user immediately revokes all active `AuthSession` records in the database.

---

## 2. Organization Hierarchy & Lifecycle

### 2.1 Organization Classifications
- `CENTRAL_MINISTRY`: Union-level nodal entities (e.g., MoRTH, MoR).
- `STATE_AUTHORITY`: State government infrastructure authorities (e.g., MSRDC, KRDCL).
- `DISTRICT_AUTHORITY`: District Collectorates & Competent Authorities for Land Acquisition (CALA).
- `PROJECT_IMPLEMENTING_AGENCY`: Concessionaires, EPC contractors, and executing agencies (e.g., NHAI, DFCCIL, L&T, Tata Projects).

### 2.2 Organization Approval Lifecycle
```
                 Public Registration
                         │
                         ▼
               ┌───────────────────┐
               │ PENDING_APPROVAL  │  (Liaison user inactive)
               └─────────┬─────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
      Admin Review            Admin Rejection
             │                       │
             ▼                       ▼
     ┌──────────────┐        ┌──────────────┐
     │    ACTIVE    │        │   REJECTED   │
     └───────┬──────┘        └──────────────┘
             │
      Compliance Hold
             │
             ▼
     ┌──────────────┐
     │  SUSPENDED   │
     └───────┬──────┘
             │
      Reactivation
             │
             ▼
     ┌──────────────┐
     │    ACTIVE    │
     └──────────────┘
```

---

## 3. Project Assignment Model

Project assignments use the dedicated `ProjectAssignment` model:
- Mapped as `(projectId, userId)` unique composite key.
- Contains assigned working role, assignment timestamp, active state, and assigning officer.
- Allows officers and PIA personnel to be assigned to multiple infrastructure projects without altering their parent organizational affiliation or canonical system role.

---

## 4. Implemented vs Future Systems Matrix

| Subsystem / Capability | Current Implementation Status | Notes |
| :--- | :--- | :--- |
| **Organization Provisioning** | **Implemented** (Step 18) | Admin CRUD, status lifecycle, state/district filtering. |
| **PIA Public Onboarding** | **Implemented** (Step 18) | `POST /api/v1/organizations/pia/register` with `PENDING_APPROVAL`. |
| **User Management** | **Implemented** (Step 18) | Role validation, bcrypt cost 12, session revocation. |
| **Project Assignment** | **Implemented** (Step 18) | Mapped via `ProjectAssignment` model. |
| **Audit Logging** | **Implemented** (Step 18) | Recorded in `AuditLog` for administrative mutations. |
| **External MCA / GST / CIN** | *Future Integration* | Simulated in UI / noted as pending statutory API integration. |
| **PFMS / Treasury Integration** | *Future Integration* | Scheduled for compensation step. |
| **Aadhaar / e-KYC Integration** | *Future Integration* | Scheduled for citizen / beneficiary portal. |
| **Digital Signature / DSC** | *Future Integration* | Scheduled for formal award / gazette notices. |
