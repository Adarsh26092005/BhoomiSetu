# NLAMS — Backend REST API & Database Engine

National Land Acquisition & Management System (NLAMS) Core Backend Engine built with **NestJS**, **TypeScript**, **Prisma ORM v6**, **PostgreSQL + PostGIS**, and **Redis**.

---

## 🏗️ Architecture Overview

The backend is architected as a modular NestJS engine with a normalized PostgreSQL + PostGIS database schema covering the complete statutory lifecycle of land acquisition.

```
apps/api/
├── prisma/
│   └── schema.prisma           # Complete 26-model domain database schema
├── src/
│   ├── common/                 # Shared filters, interceptors, pipes, constants, types
│   │   ├── constants/          # Locked domain roles (12), org types (4), statuses (17 & 10)
│   │   ├── filters/            # Global sanitized exception filters (HttpException & AllExceptions)
│   │   ├── interceptors/       # HTTP access logging & response transformation
│   │   └── types/              # Common API envelopes and health response contracts
│   ├── config/                 # Environment validation, app configuration & Redis settings
│   ├── database/               # PrismaService and global DatabaseModule
│   ├── health/                 # Health check & readiness probe controller (/api/v1/health)
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Bootstrap with Helmet, CORS, ValidationPipe, Swagger
├── test/
│   ├── app.e2e-spec.ts         # Supertest end-to-end test suite
│   └── jest-e2e.json           # Jest E2E configuration
└── package.json
```

For comprehensive data dictionaries, ER models, and PostGIS spatial indexing guides, see [docs/database/ARCHITECTURE.md](../../docs/database/ARCHITECTURE.md).

---

## 🗄️ Database Setup & Commands

### 1. Validate & Generate Prisma Client
```bash
cd apps/api
npx prisma validate
npx prisma format
npx prisma generate
```

### 2. Apply Migrations (Requires running PostgreSQL with PostGIS)
```bash
npx prisma migrate dev --name init_nlams_domain_schema
```

### 3. Launch Prisma Studio Database GUI
```bash
npx prisma studio
```

---

## 🚀 Quick Start

### 1. Configure Environment
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Install Dependencies
From the repository root:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run start:dev --prefix apps/api
```

The API will start at:
- **Base URL**: `http://localhost:3001/api/v1`
- **Health Probe**: `http://localhost:3001/api/v1/health`
- **Swagger Documentation**: `http://localhost:3001/api/v1/docs`

---

## 🧪 Testing

```bash
# End-to-end tests
npm run test:e2e --prefix apps/api

# Unit tests
npm run test --prefix apps/api
```

---

## 🔒 Locked Canonical Domain Enums

- **User Roles (12)**: `SUPER_ADMIN`, `CENTRAL_OFFICER`, `STATE_OFFICER`, `DISTRICT_OFFICER`, `PROJECT_IMPLEMENTING_AGENCY`, `LAND_ACQUISITION_OFFICER`, `SURVEY_OFFICER`, `REVENUE_OFFICER`, `VERIFICATION_OFFICER`, `FINANCE_OFFICER`, `R_AND_R_OFFICER`, `VIEWER`.
- **Organization Types (4)**: `CENTRAL_MINISTRY`, `STATE_AUTHORITY`, `DISTRICT_AUTHORITY`, `PROJECT_IMPLEMENTING_AGENCY`.
- **Project Statuses (17)**: `DRAFT`, `SUBMITTED`, `UNDER_SCRUTINY`, `DOCUMENT_VERIFICATION`, `DISTRICT_APPROVAL`, `STATE_APPROVAL`, `CENTRAL_APPROVAL`, `NOTIFICATION_ISSUED`, `AWARD_DECLARED`, `COMPENSATION_ASSESSED`, `COMPENSATION_DISBURSED`, `POSSESSION_PENDING`, `POSSESSION_COMPLETED`, `R_AND_R_IN_PROGRESS`, `COMPLETED`, `REJECTED`, `ON_HOLD`.
- **Parcel Statuses (10)**: `IDENTIFIED`, `VERIFICATION_PENDING`, `VERIFIED`, `DISPUTED`, `UNDER_ACQUISITION`, `AWARD_DECLARED`, `COMPENSATION_PENDING`, `COMPENSATION_PAID`, `POSSESSION_PENDING`, `POSSESSION_TAKEN`.
