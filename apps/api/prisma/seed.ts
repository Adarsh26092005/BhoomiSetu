import { PrismaClient, UserRole, OrganizationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;
const DEFAULT_DEV_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'DevAdmin@NLAMS2026!';

async function main() {
  console.log('🌱 Starting NLAMS Development Database Seeding (DEVELOPMENT ONLY)...');

  const passwordHash = await bcrypt.hash(DEFAULT_DEV_PASSWORD, BCRYPT_SALT_ROUNDS);

  // 1. Create Core Administrative Organizations
  const centralMinistry = await prisma.organization.upsert({
    where: { code: 'ORG-CENTRAL-MORTH' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000001',
      code: 'ORG-CENTRAL-MORTH',
      name: 'Ministry of Road Transport and Highways (MoRTH)',
      type: OrganizationType.CENTRAL_MINISTRY,
      state: 'National',
      district: 'New Delhi',
      isActive: true,
    },
  });

  const stateAuthority = await prisma.organization.upsert({
    where: { code: 'ORG-STATE-MAHA' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000002',
      code: 'ORG-STATE-MAHA',
      name: 'Maharashtra State Road Development Corporation (MSRDC)',
      type: OrganizationType.STATE_AUTHORITY,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  const districtAuthority = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-THANE' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000003',
      code: 'ORG-DIST-THANE',
      name: 'District Collectorate Thane - Land Acquisition Division',
      type: OrganizationType.DISTRICT_AUTHORITY,
      state: 'Maharashtra',
      district: 'Thane',
      parentId: stateAuthority.id,
      isActive: true,
    },
  });

  const piaOrg = await prisma.organization.upsert({
    where: { code: 'ORG-PIA-NHAI-MUM' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000004',
      code: 'ORG-PIA-NHAI-MUM',
      name: 'National Highways Authority of India (NHAI PIU Mumbai)',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  // 2. Create Representative Seed Users for all 12 canonical roles
  const seedUsers = [
    {
      id: 'u1000000-0000-4000-a000-000000000001',
      email: 'superadmin@nlams.gov.in',
      fullName: 'Dev Super Administrator',
      phone: '+91-9800000001',
      role: UserRole.SUPER_ADMIN,
      designation: 'Principal System Administrator (Dev)',
      organizationId: centralMinistry.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000002',
      email: 'central.officer@nlams.gov.in',
      fullName: 'Dev Central Officer',
      phone: '+91-9800000002',
      role: UserRole.CENTRAL_OFFICER,
      designation: 'Joint Secretary (Land Acquisition - Dev)',
      organizationId: centralMinistry.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000003',
      email: 'state.officer@nlams.gov.in',
      fullName: 'Dev State Officer',
      phone: '+91-9800000003',
      role: UserRole.STATE_OFFICER,
      designation: 'State Competent Authority (Dev)',
      organizationId: stateAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000004',
      email: 'district.officer@nlams.gov.in',
      fullName: 'Dev District Officer',
      phone: '+91-9800000004',
      role: UserRole.DISTRICT_OFFICER,
      designation: 'District Collector & Magistrate (Dev)',
      organizationId: districtAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000005',
      email: 'pia.officer@nlams.gov.in',
      fullName: 'Dev PIA Project Director',
      phone: '+91-9800000005',
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'General Manager - Projects (Dev)',
      organizationId: piaOrg.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000006',
      email: 'lao.officer@nlams.gov.in',
      fullName: 'Dev Land Acquisition Officer',
      phone: '+91-9800000006',
      role: UserRole.LAND_ACQUISITION_OFFICER,
      designation: 'Special Land Acquisition Officer (CALA - Dev)',
      organizationId: districtAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000007',
      email: 'survey.officer@nlams.gov.in',
      fullName: 'Dev Cadastral Survey Officer',
      phone: '+91-9800000007',
      role: UserRole.SURVEY_OFFICER,
      designation: 'Deputy Superintendent of Land Records (Dev)',
      organizationId: districtAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000008',
      email: 'revenue.officer@nlams.gov.in',
      fullName: 'Dev Revenue Officer (Tahsildar)',
      phone: '+91-9800000008',
      role: UserRole.REVENUE_OFFICER,
      designation: 'Tahsildar & Revenue Administrator (Dev)',
      organizationId: districtAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000009',
      email: 'verification.officer@nlams.gov.in',
      fullName: 'Dev Title Verification Officer',
      phone: '+91-9800000009',
      role: UserRole.VERIFICATION_OFFICER,
      designation: 'Legal & Scrutiny Officer (Dev)',
      organizationId: districtAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000010',
      email: 'finance.officer@nlams.gov.in',
      fullName: 'Dev Finance & Disbursement Officer',
      phone: '+91-9800000010',
      role: UserRole.FINANCE_OFFICER,
      designation: 'Chief Accounts & Treasury Officer (Dev)',
      organizationId: stateAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000011',
      email: 'randr.officer@nlams.gov.in',
      fullName: 'Dev R&R Administrator',
      phone: '+91-9800000011',
      role: UserRole.R_AND_R_OFFICER,
      designation: 'Commissioner of Rehabilitation & Resettlement (Dev)',
      organizationId: stateAuthority.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000012',
      email: 'viewer.officer@nlams.gov.in',
      fullName: 'Dev Read-Only Auditor / Viewer',
      phone: '+91-9800000012',
      role: UserRole.VIEWER,
      designation: 'Independent Oversight Auditor (Dev)',
      organizationId: centralMinistry.id,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        designation: user.designation,
        organizationId: user.organizationId,
        passwordHash,
        isActive: true,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        designation: user.designation,
        organizationId: user.organizationId,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded 4 administrative organizations and ${seedUsers.length} representative RBAC development users.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
