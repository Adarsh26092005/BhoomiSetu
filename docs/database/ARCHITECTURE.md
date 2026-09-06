# NLAMS Database Architecture & Domain Schema Documentation

**System**: National Land Acquisition & Management System (NLAMS)  
**ORM / Engine**: Prisma ORM v6  
**Target Database**: PostgreSQL 16+ with PostGIS 3.4+ Spatial Extensions  
**Precision**: Exact Fixed-Point Financial Decimals (`DECIMAL(18,2)` & `DECIMAL(12,4)` for Area in Hectares)

---

## 1. Architectural Overview

NLAMS is a national multi-jurisdictional land acquisition lifecycle orchestration engine. The relational database schema connects the complete statutory pipeline:

```
[Organization Hierarchy]
       │
       ▼
    [Users] ──────────► [Audit Logs & Telemetry]
       │
       ▼
   [Projects] ───────► [Spatial Corridors (PostGIS)]
       │
       ├────────────────────────┬─────────────────────────┬────────────────────────┐
       ▼                        ▼                         ▼                        ▼
[Cadastral Parcels]     [Project Documents]      [Workflow Tasks & SLA]     [R&R Cases]
       │                        │                         │                        │
       ├──────────────┐         ├──────────────┐          ├──────────────┐         ├──────────────┐
       ▼              ▼         ▼              ▼          ▼              ▼         ▼              ▼
 [Landowners]   [GIS Polygons] [Doc Versions] [Verifications] [History]  [Comments] [Households] [Benefits]
       │
       ▼
[Compensation Assessments]
       │
       ├────────────────────────┐
       ▼                        ▼
[Landowner Entitlements]  [Payment Transactions (PFMS)]
       │
       ▼
[Section 38 Possession Records] ──► [Form 22 Handover Certificates]
```

---

## 2. Locked Canonical Domain Enums

The database schema preserves all locked enums established in Steps 1–15 with 100% fidelity:

| Enum Name | Canonical Values | Statutory & Domain Purpose |
| :--- | :--- | :--- |
| **`UserRole`** | `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`, `DISTRICT_OFFICER`, `PROJECT_IMPLEMENTING_AGENCY`, `LAND_ACQUISITION_OFFICER`, `SURVEY_OFFICER`, `REVENUE_OFFICER`, `VERIFICATION_OFFICER`, `FINANCE_OFFICER`, `R_AND_R_OFFICER`, `VIEWER` (12 Roles) | Functional role-based access control and desk responsibility across administrative levels. |
| **`AccountType`** | `GOVERNMENT_OFFICER`, `PIA_USER` (2 Types) | Account categorization differentiating official government personnel from Project Implementing Agency / corporate concessionaire accounts. |
| **`OrganizationType`** | `CENTRAL_MINISTRY`, `STATE_AUTHORITY`, `DISTRICT_AUTHORITY`, `PROJECT_IMPLEMENTING_AGENCY` (4 Types) | Institutional jurisdiction and multi-tiered governance structure. |
| **`OrganizationStatus`** | `PENDING_APPROVAL`, `ACTIVE`, `REJECTED`, `SUSPENDED` (4 Statuses) | Registration and administrative verification lifecycle for implementing agencies and partner bodies. |
| **`ProjectStatus`** | `DRAFT`, `SUBMITTED`, `UNDER_SCRUTINY`, `DOCUMENT_VERIFICATION`, `DISTRICT_APPROVAL`, `STATE_APPROVAL`, `CENTRAL_APPROVAL`, `NOTIFICATION_ISSUED`, `AWARD_DECLARED`, `COMPENSATION_ASSESSED`, `COMPENSATION_DISBURSED`, `POSSESSION_PENDING`, `POSSESSION_COMPLETED`, `R_AND_R_IN_PROGRESS`, `COMPLETED`, `REJECTED`, `ON_HOLD` (17 Statuses) | RFCTLARR Act 2013 statutory project lifecycle progression. |
| **`ParcelStatus`** | `IDENTIFIED`, `VERIFICATION_PENDING`, `VERIFIED`, `DISPUTED`, `UNDER_ACQUISITION`, `AWARD_DECLARED`, `COMPENSATION_PENDING`, `COMPENSATION_PAID`, `POSSESSION_PENDING`, `POSSESSION_TAKEN` (10 Statuses) | Cadastral plot acquisition, dispute, and handover state machine. |

> [!NOTE]
> **Implementation Scope Notice**: Data-level jurisdiction scoping, multi-tenant query filtering, and PIA self-registration workflows are planned for Step 18+ and are not yet implemented. Step 17A establishes the prerequisite database and auth token schema foundation.

---

## 3. Data Dictionary & Entity Inventory (26 Models)

### A. Organizations & Identity
1. **`Organization` (`organizations`)**: Multi-tiered government and agency entities supporting self-referencing hierarchy (`parentId` → `Organization`).
2. **`User` (`users`)**: User identity with Argon2/Bcrypt `passwordHash`, role, organization relation, and audit trails.

### B. Project & Cadastral Space
3. **`Project` (`projects`)**: Core linear corridor / project record with scope in hectares (`Decimal(12,4)`), state, JSON districts array, and PostGIS boundary bounds.
4. **`Parcel` (`parcels`)**: Cadastral survey/khasra land plots with area, classification (`LandType`), centroid coordinates, and GeoJSON polygon boundaries. Composite unique key `[projectId, surveyNumber]`.

### C. Landowners & Normalized Ownership Join
5. **`Landowner` (`landowners`)**: Normalized citizen record storing name, village, bank linkage state, and masked government reference (`aadhaarLast4`).
6. **`ParcelLandowner` (`parcel_landowners`)**: Explicit many-to-many join model storing exact `ownershipPercentage` (`Decimal(5,2)`), `eligibleAreaHectares` (`Decimal(12,4)`), and verification state. Composite unique key `[parcelId, landownerId]`.

### D. Document Vault & Object Storage
7. **`Document` (`documents`)**: Metadata record mapped to object storage (`storageKey` in MinIO/S3), category, and verification state.
8. **`DocumentVersion` (`document_versions`)**: Immutable version register with SHA-256 integrity checksums. Composite unique key `[documentId, versionNumber]`.
9. **`DocumentActivity` (`document_activities`)**: Audit trail of scrutiny actions, rejections, and supersessions.

### E. Workflow & Citizen Charter SLA Engine
10. **`WorkflowTask` (`workflow_tasks`)**: Multi-stage review tasks with statutory SLA targets (`dueAt`, `slaDays`, `slaStatus`).
11. **`WorkflowHistory` (`workflow_history`)**: State-change transitions recording actor, old/new status, and statutory remarks.
12. **`WorkflowComment` (`workflow_comments`)**: Threaded scrutiny remarks per desk review.

### F. Financial Compensation Ledger
13. **`CompensationAssessment` (`compensation_assessments`)**: Statutory award determination containing:
    - Base Market Value (`totalMarketValueInr`)
    - 100% Solatium under Section 30(1) (`solatiumAmountInr`)
    - 12% Additional Interest under Section 30(3) (`additionalCompensationInr`)
    - Statutory Crop/Structure Allowances (`statutoryBenefitsInr`)
    - Capital Deductions (`deductionsInr`)
    - Gross Assessed & Net Payable (`Decimal(18,2)`)
14. **`LandownerCompensation` (`landowner_compensations`)**: Individual landowner entitlement calculating proportional share based on verified parcel equity.
15. **`CompensationPaymentTransaction` (`compensation_payment_transactions`)**: PFMS Direct Benefit Transfer (DBT) and Section 77 escrow transactions with unique `transactionReference`.

### G. Possession & Section 38 Handover
16. **`PossessionRecord` (`possession_records`)**: Physical site handover tracking with Form 22 certificate linkage and readiness verification.
17. **`PossessionChecklistItem` (`possession_checklist_items`)**: Blocking pre-possession compliance checks (e.g., 100% compensation deposited, stay order cleared).
18. **`PossessionTimelineEvent` (`possession_timeline_events`)**: Chronological site inspection and notice service timeline.
19. **`PossessionRemark` (`possession_remarks`)**: Field officer site observations and boundary demarcation remarks.

### H. Rehabilitation & Resettlement (Second Schedule)
20. **`RAndRCase` (`randr_cases`)**: Project-level R&R scheme tracking total affected and eligible families.
21. **`AffectedHousehold` (`affected_households`)**: Enumerated census family unit recording family size, vulnerable members, and relocation requirements.
22. **`RAndREntitlement` (`randr_entitlements`)**: Statutory Second Schedule entitlement allotments.
23. **`RAndRBenefit` (`randr_benefits`)**: Financial and physical benefit delivery (housing grants, subsistence allowances, transport grants).

### I. Notifications & Enterprise Audit
24. **`Notification` (`notifications`)**: System alerts and workflow SLA escalation notices.
25. **`AuditLog` (`audit_logs`)**: Semi-structured audit log capturing actor, entity, `previousState`, `newState`, IP, and `correlationId`.
26. **`SystemHealth` (`system_health`)**: Node telemetry and database readiness probe.

---

## 4. PostGIS Spatial Architecture & Indexing Strategy

NLAMS leverages PostGIS extension `postgis` in PostgreSQL.

### Geometry Representations:
1. **Cadastral Plots (`Parcel.spatialGeometry`)**:
   Stored as GeoJSON in Prisma, and converted to native PostGIS `GEOMETRY(Polygon, 4326)` in PostgreSQL.
2. **Project Corridors (`Project.spatialBounds`)**:
   Stored as GeoJSON `MultiPolygon` / `LineString` for corridor envelope queries.

### Spatial Migration SQL (To be executed upon PostgreSQL connection):
```sql
-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add Native Geometry Columns (if not using pure GeoJSON JSONB queries)
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS geom geometry(Polygon, 4326);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 4326);

-- Populate Geometry from GeoJSON
UPDATE parcels SET geom = ST_SetSRID(ST_GeomFromGeoJSON(spatial_geometry::text), 4326) WHERE spatial_geometry IS NOT NULL;
UPDATE projects SET geom = ST_SetSRID(ST_GeomFromGeoJSON(spatial_bounds::text), 4326) WHERE spatial_bounds IS NOT NULL;

-- Create PostGIS GiST Spatial Indexes
CREATE INDEX IF NOT EXISTS idx_parcels_geom_gist ON parcels USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_projects_geom_gist ON projects USING GIST (geom);
```

---

## 5. Foreign Key & Deletion Integrity Policy

To safeguard statutory government records against accidental data loss:
- **`onDelete: Restrict`** is enforced on all statutory core relations (`Organization`, `User`, `Project`, `Parcel`, `Landowner`, `CompensationAssessment`, `PossessionRecord`, `RAndRCase`).
- **`onDelete: Cascade`** is strictly limited to tightly-coupled sub-records owned entirely by the parent (`DocumentVersion` under `Document`, `WorkflowHistory` under `WorkflowTask`, `PossessionChecklistItem` under `PossessionRecord`, `RAndREntitlement` under `RAndRCase`).
- **`onDelete: SetNull`** is used for optional auditor/verifier references (`verifiedBy`, `assessingOfficer`).

---

## 6. Migration Lifecycle

```bash
# 1. Validate Schema
npx prisma validate

# 2. Format Schema
npx prisma format

# 3. Generate Prisma Client
npx prisma generate

# 4. Apply Migration in Dev (Requires running PostgreSQL server)
npx prisma migrate dev --name init_nlams_domain_schema
```
