# NLAMS — Jurisdiction-Aware Data Isolation & Area-Based Access Control Architecture

## Executive Summary

The National Land Acquisition & Management System (**NLAMS**) implements enterprise-grade, server-side jurisdiction-aware data isolation and area-based access control. In compliance with statutory land acquisition governance under the RFCTLARR Act 2013 and Sovereign Indian e-Governance security benchmarks:
- A user's **effective jurisdiction** strictly determines the boundary of records they can read, query, export, verify, disburse, approve, or analyze.
- Data isolation is enforced at the **database query layer (Prisma WHERE clauses)** and validated through **direct IDOR security guards** on every entity.
- The 12 canonical `UserRole` values remain preserved without synthetic sub-roles.
- Super Admins are scoped dynamically through `SuperAdminAssignment` mapped to `AdministrativeArea` and `AdministrativeAreaDistrict` records.

---

## 1. Canonical Roles & Super Admin Model

### 1.1 Canonical Roles Preserved
The platform retains exactly 12 canonical roles:
1. `SUPER_ADMIN`: Central or Area-scoped statutory administrator.
2. `CENTRAL_OFFICER`: Central Ministry (MoRD / DoLR) nodal official with national scope.
3. `STATE_OFFICER`: State Authority officer with statewide statutory jurisdiction.
4. `DISTRICT_OFFICER`: Collectorate / SLAO nodal officer with district jurisdiction.
5. `LAND_ACQUISITION_OFFICER`: Special Land Acquisition Officer (SLAO).
6. `SURVEY_OFFICER`: Cadastral ground-truthing and survey officer.
7. `REVENUE_OFFICER`: Tehsildar / Village land records officer.
8. `VERIFICATION_OFFICER`: Title & statutory scrutiny officer.
9. `FINANCE_OFFICER`: Direct Benefit Transfer (PFMS DBT) disbursement officer.
10. `R_AND_R_OFFICER`: Rehabilitation & Resettlement officer.
11. `PROJECT_IMPLEMENTING_AGENCY`: Concessionaire / nodal agency project officer.
12. `VIEWER`: Statutory read-only auditor.

### 1.2 Super Admin Jurisdiction Scoping
Super Admins are scoped via the `AdminJurisdictionLevel` enum:
- `CENTRAL`: Nationwide sovereign administrative authority across all states, districts, and projects.
- `STATE_AREA`: Scoped to a defined `AdministrativeArea` (e.g. `MH-01`, `MH-02`, `UP-01`).

```
+-------------------------------------------------------------+
|                      User (SUPER_ADMIN)                     |
+-------------------------------------------------------------+
                              | 1
                              |
                              v 1..* (Active = true)
+-------------------------------------------------------------+
|                    SuperAdminAssignment                     |
|  - jurisdictionLevel: CENTRAL | STATE_AREA                  |
|  - isPrimary: boolean                                       |
|  - isActive: boolean                                        |
+-------------------------------------------------------------+
                              | 0..1
                              |
                              v
+-------------------------------------------------------------+
|                     AdministrativeArea                      |
|  - code: "MH-01"                                            |
|  - name: "Western Maharashtra Zone"                         |
|  - state: "Maharashtra"                                     |
+-------------------------------------------------------------+
                              | 1
                              |
                              v 1..*
+-------------------------------------------------------------+
|                 AdministrativeAreaDistrict                  |
|  - district: "Pune"                                         |
|  - district: "Satara"                                       |
|  - district: "Kolhapur"                                     |
+-------------------------------------------------------------+
```

---

## 2. Real-World Case Study: MH-01 vs MH-02 vs MH-03

Consider Maharashtra partitioned into administrative zones:
- **MH-01 (Western Maharashtra Zone)**: Pune, Satara, Kolhapur, Sangli, Solapur.
- **MH-02 (Konkan / MMR Zone)**: Mumbai City, Mumbai Suburban, Thane, Palghar, Raigad.
- **MH-03 (Vidarbha Zone)**: Nagpur, Wardha, Amravati, Chandrapur, Yavatmal.

### Isolation Rules:
1. **Super Admin Assigned to MH-01 (`pune.admin@nlams.gov.in`)**:
   - Querying `/api/v1/users` returns only officers stationed in Pune, Satara, Kolhapur, etc.
   - Querying `/api/v1/parcels` or `/api/v1/projects` returns only cadastral plots and corridors traversing MH-01 districts.
   - Cannot view, approve, or modify officers or parcels registered under MH-02 (Thane / Mumbai) or MH-03 (Nagpur).
   - Any attempt to access `/api/v1/parcels/:id` belonging to Thane returns `403 Forbidden`.

2. **Super Admin with CENTRAL Level (`delhi.admin@nlams.gov.in`)**:
   - Unrestricted national scope across MH-01, MH-02, MH-03, UP-01, etc.
   - Authorized to provision new Administrative Areas and assign Super Admin boundaries.

---

## 3. Onboarding & Approval Routing Workflow

Self-registration for Officers and Project Implementing Agencies (PIAs) creates explicit `ApprovalRequest` records routed strictly to the corresponding Administrative Area Super Admin(s):

```
       [Public Registration Form]
     (State: Maharashtra, District: Pune)
                  |
                  v
       [Jurisdiction Engine Resolution]
   findAreaByStateAndDistrict("Maharashtra", "Pune")
                  |
                  v
         Resolved: MH-01 Area
   Approvers: [MH-01 Super Admin User IDs]
                  |
                  v
       [Create ApprovalRequest]
     - requestType: OFFICER_REGISTRATION
     - state: "Maharashtra"
     - district: "Pune"
     - administrativeAreaId: <MH-01 ID>
     - status: PENDING
     - User.isActive: false
                  |
                  v
     [MH-01 Super Admin Dashboard Queue]
    /api/v1/approval-requests?status=PENDING
                  |
                  v
   [Approve Request: POST /api/v1/approval-requests/:id/approve]
     - ApprovalRequest.status -> APPROVED
     - User.isActive -> true
     - AuditLog: APPROVE_ONBOARDING_REQUEST
```

---

## 4. Query Filter Scoping & IDOR Prevention

### 4.1 Server-Side Database Scoping (`JurisdictionService`)
Every query across projects, parcels, organizations, users, approval requests, and audit logs applies Prisma database-level WHERE clauses built from `resolveEffectiveScope(user)`:

| Entity | Central Scope | State Area (MH-01) Scope | State Scope | District Scope | PIA Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Projects** | All Projects | `state = MH AND districts && [Pune, Satara, ...]` | `state = MH` | `state = MH AND district = Pune OR assigned` | `orgId = agencyOrgId OR assigned` |
| **Parcels** | All Parcels | `state = MH AND district IN [Pune, Satara, ...]` | `state = MH` | `state = MH AND district = Pune OR assigned` | `project.orgId = agencyOrgId OR assigned` |
| **Users** | All Users | `org.state = MH AND org.district IN [Pune, ...]` | `org.state = MH` | `org.district = Pune` | `orgId = user.orgId` |
| **Orgs** | All Orgs | `state = MH AND district IN [Pune, ...]` | `state = MH` | `district = Pune` | `id = user.orgId` |
| **Approval Requests** | All Requests | `administrativeAreaId = MH01 OR (state = MH AND district IN [Pune, ...])` | `state = MH` | `district = Pune` | Own Org Requests |

### 4.2 In-Depth IDOR Prevention Matrix
If an actor directly manipulates a URL parameter (e.g. `GET /api/v1/parcels/thane-parcel-uuid` by an MH-01 administrator):
1. `findOne` fetches the target parcel.
2. `jurisdictionService.canAccessParcel(scope, parcel)` evaluates jurisdictional overlap.
3. Because Thane is not in MH-01's authorized district list `['Pune', 'Satara', 'Kolhapur']`, the method immediately throws `ForbiddenException('Forbidden: You do not have jurisdictional authority to access this parcel')`.
4. Zero unauthorized data leakage occurs.

---

## 5. Security Invariants & Compliance Rules

1. **Server-Side Enforcement Only**: Client-side claims are never trusted for boundary checks. All scopes are dynamically resolved from the authenticated user's active database assignments.
2. **Revocation & Inactivity**: If a `SuperAdminAssignment` record has `isActive: false`, the user immediately falls back to their statutory organization scope and loses administrative area elevation.
3. **Audit Trail Immutability**: All approvals, rejections, jurisdiction assignments, and administrative area creations are permanently logged to `AuditLog` with actor ID, timestamps, before/after state snapshots, and correlation IDs.
4. **No Synthesized Sub-Roles**: Clean separation between statutory role classification (`UserRole`) and jurisdictional boundary assignment (`AdministrativeArea`).
