# NLAMS — Organizations & Users API Reference

## 1. Organizations Management

### `POST /api/v1/organizations/pia/register`
- **Access**: Public
- **Description**: Self-registration endpoint for Project Implementing Agencies / Concessionaires.
- **Payload**:
```json
{
  "organizationName": "Larsen & Toubro Infrastructure Projects Ltd",
  "registrationCode": "PIA-LT-001",
  "state": "Maharashtra",
  "district": "Mumbai City",
  "officeAddress": "L&T House, Ballard Estate, Mumbai",
  "adminFullName": "Vikramaditya Patil",
  "adminEmail": "liaison@lntecc.com",
  "adminPhone": "+91-9876543210",
  "adminDesignation": "Chief Project Manager",
  "adminPassword": "SecurePassword123!"
}
```
- **Lifecycle Outcome**: Creates organization with `status: PENDING_APPROVAL` and liaison user with `isActive: false`.

---

### `GET /api/v1/organizations`
- **Access**: Bearer JWT (Authenticated)
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 20)
  - `type`: `CENTRAL_MINISTRY` | `STATE_AUTHORITY` | `DISTRICT_AUTHORITY` | `PROJECT_IMPLEMENTING_AGENCY`
  - `status`: `PENDING_APPROVAL` | `ACTIVE` | `REJECTED` | `SUSPENDED`
  - `state`: string
  - `district`: string
  - `search`: string

---

### `GET /api/v1/organizations/:id`
- **Access**: Bearer JWT (Authenticated)
- **Returns**: Organization details, hierarchy (`parent`, `children`), user counts, and active project counts.

---

### `POST /api/v1/organizations`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`
- **Description**: Administrative creation/provisioning of government entities (Central Ministries, State Authorities, District Collectorates).

---

### `PATCH /api/v1/organizations/:id`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`
- **Description**: Updates organizational details, jurisdiction boundary, or hierarchy.

---

### `POST /api/v1/organizations/:id/approve`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`
- **Description**: Transitions a `PENDING_APPROVAL` organization to `ACTIVE`, enables liaison user login, and writes an audit log.

---

### `POST /api/v1/organizations/:id/reject`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`
- **Description**: Transitions a `PENDING_APPROVAL` organization to `REJECTED` and records rejection rationale.

---

### `POST /api/v1/organizations/:id/suspend`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`
- **Description**: Transitions an `ACTIVE` organization to `SUSPENDED`, deactivating all associated officer sessions.

---

### `POST /api/v1/organizations/:id/activate`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`
- **Description**: Restores a `SUSPENDED` organization to `ACTIVE`.

---

## 2. Users Management

### `GET /api/v1/users`
- **Access**: Bearer JWT (Authenticated)
- **Query Parameters**:
  - `page`, `limit`, `search`
  - `accountType`: `GOVERNMENT_OFFICER` | `PIA_USER`
  - `role`: Canonical 12 `UserRole` enum values
  - `organizationId`: string
  - `isActive`: boolean

---

### `GET /api/v1/users/:id`
- **Access**: Bearer JWT (Authenticated)
- **Returns**: User profile metadata and active project assignments. Note: `passwordHash` is strictly excluded.

---

### `POST /api/v1/users`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`, `DISTRICT_OFFICER`, `PROJECT_IMPLEMENTING_AGENCY`
- **Security Boundary**:
  - `SUPER_ADMIN` / Government Admins can provision statutory government officers.
  - `PIA_USER` administrators are constrained strictly to their own `organizationId` and can only assign `PROJECT_IMPLEMENTING_AGENCY` or `VIEWER` roles.
  - Cross-boundary creation of government officers by PIA accounts is forbidden.

---

### `PATCH /api/v1/users/:id`
- **Access**: Authorized administrators.
- **Security Boundary**: Users are prohibited from escalating their own role or modifying privileged roles arbitrarily.

---

### `POST /api/v1/users/:id/activate`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`, `PROJECT_IMPLEMENTING_AGENCY`

---

### `POST /api/v1/users/:id/deactivate`
- **Access**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`, `PROJECT_IMPLEMENTING_AGENCY`
- **Security Action**: Sets `isActive: false` and immediately revokes all active auth sessions in the database.

---

## 3. Project Assignment Endpoints

### `GET /api/v1/users/:id/project-assignments`
- **Description**: Returns all projects and working roles mapped to the user.

### `POST /api/v1/users/:id/project-assignments`
- **Payload**:
```json
{
  "projectId": "proj-uuid-1",
  "role": "LAND_ACQUISITION_OFFICER",
  "isActive": true
}
```

### `PATCH /api/v1/users/:id/project-assignments/:assignmentId`
- **Description**: Updates working assignment role or active flag.

### `POST /api/v1/users/:id/project-assignments/:assignmentId/deactivate`
- **Description**: Revokes working assignment on a project while preserving audit history.
