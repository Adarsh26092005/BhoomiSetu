import {
  PrismaClient,
  UserRole,
  AccountType,
  OrganizationType,
  OrganizationStatus,
  AdminJurisdictionLevel,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedDemoData } from './demo-seed';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;
const DEFAULT_DEV_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'DevAdmin@NLAMS2026!';

async function main() {
  console.log('🌱 Starting NLAMS Development Database Seeding (DEVELOPMENT ONLY)...');

  const defaultPasswordHash = await bcrypt.hash(DEFAULT_DEV_PASSWORD, BCRYPT_SALT_ROUNDS);
  const kaAdminPasswordHash = await bcrypt.hash('NLAMS@KA2026#Admin', BCRYPT_SALT_ROUNDS);
  const mhAdminPasswordHash = await bcrypt.hash('NLAMS@MH2026#Admin', BCRYPT_SALT_ROUNDS);

  // ============================================================================
  // 1. Create Core Administrative Organizations
  // ============================================================================
  const centralMinistry = await prisma.organization.upsert({
    where: { code: 'ORG-CENTRAL-MORTH' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000001',
      code: 'ORG-CENTRAL-MORTH',
      name: 'Ministry of Road Transport and Highways (MoRTH)',
      type: OrganizationType.CENTRAL_MINISTRY,
      status: OrganizationStatus.ACTIVE,
      state: 'National',
      district: 'New Delhi',
      isActive: true,
    },
  });

  const stateAuthorityMaha = await prisma.organization.upsert({
    where: { code: 'ORG-STATE-MAHA' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000002',
      code: 'ORG-STATE-MAHA',
      name: 'Maharashtra State Road Development Corporation (MSRDC)',
      type: OrganizationType.STATE_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  const stateAuthorityKarnataka = await prisma.organization.upsert({
    where: { code: 'ORG-STATE-KARNATAKA' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000005',
      code: 'ORG-STATE-KARNATAKA',
      name: 'Karnataka Revenue Department & Land Records Authority',
      type: OrganizationType.STATE_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  const districtAuthorityThane = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-THANE' },
    update: {},
    create: {
      id: 'a1000000-0000-4000-a000-000000000003',
      code: 'ORG-DIST-THANE',
      name: 'District Collectorate Thane - Land Acquisition Division',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Thane',
      parentId: stateAuthorityMaha.id,
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
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  // ============================================================================
  // 2. Create / Upsert Administrative Areas & District Mappings
  // ============================================================================
  const karnatakaArea = await prisma.administrativeArea.upsert({
    where: { code: 'KA-AREA-01' },
    update: {
      name: 'Karnataka Area',
      state: 'Karnataka',
      description: 'Development/demo administrative area covering Bengaluru, Mysuru and Hampi.',
      active: true,
    },
    create: {
      id: 'b1000000-0000-4000-a000-000000000001',
      code: 'KA-AREA-01',
      name: 'Karnataka Area',
      state: 'Karnataka',
      description: 'Development/demo administrative area covering Bengaluru, Mysuru and Hampi.',
      active: true,
    },
  });

  const karnatakaDistricts = ['Bengaluru', 'Mysuru', 'Hampi'];
  for (const district of karnatakaDistricts) {
    await prisma.administrativeAreaDistrict.upsert({
      where: {
        administrativeAreaId_district: {
          administrativeAreaId: karnatakaArea.id,
          district,
        },
      },
      update: {},
      create: {
        administrativeAreaId: karnatakaArea.id,
        district,
      },
    });
  }

  const maharashtraArea = await prisma.administrativeArea.upsert({
    where: { code: 'MH-AREA-01' },
    update: {
      name: 'Maharashtra Area',
      state: 'Maharashtra',
      description: 'Development/demo administrative area covering Mumbai, Pune and Panvel.',
      active: true,
    },
    create: {
      id: 'b1000000-0000-4000-a000-000000000002',
      code: 'MH-AREA-01',
      name: 'Maharashtra Area',
      state: 'Maharashtra',
      description: 'Development/demo administrative area covering Mumbai, Pune and Panvel.',
      active: true,
    },
  });

  const maharashtraDistricts = ['Mumbai', 'Pune', 'Panvel'];
  for (const district of maharashtraDistricts) {
    await prisma.administrativeAreaDistrict.upsert({
      where: {
        administrativeAreaId_district: {
          administrativeAreaId: maharashtraArea.id,
          district,
        },
      },
      update: {},
      create: {
        administrativeAreaId: maharashtraArea.id,
        district,
      },
    });
  }

  // ============================================================================
  // 3. Create / Upsert Area-Scoped Super Admins
  // ============================================================================
  const kaSuperAdmin = await prisma.user.upsert({
    where: { email: 'ka.superadmin@nlams.gov.in' },
    update: {
      fullName: 'Karnataka Area Super Admin',
      phone: '+91-9000000001',
      role: UserRole.SUPER_ADMIN,
      accountType: AccountType.GOVERNMENT_OFFICER,
      designation: 'Super Admin',
      organizationId: stateAuthorityKarnataka.id,
      passwordHash: kaAdminPasswordHash,
      isActive: true,
    },
    create: {
      id: 'u1000000-0000-4000-a000-000000000091',
      email: 'ka.superadmin@nlams.gov.in',
      passwordHash: kaAdminPasswordHash,
      fullName: 'Karnataka Area Super Admin',
      phone: '+91-9000000001',
      role: UserRole.SUPER_ADMIN,
      accountType: AccountType.GOVERNMENT_OFFICER,
      designation: 'Super Admin',
      organizationId: stateAuthorityKarnataka.id,
      isActive: true,
    },
  });

  const existingKaAssignment = await prisma.superAdminAssignment.findFirst({
    where: { userId: kaSuperAdmin.id, administrativeAreaId: karnatakaArea.id },
  });
  if (existingKaAssignment) {
    await prisma.superAdminAssignment.update({
      where: { id: existingKaAssignment.id },
      data: {
        jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
        isPrimary: true,
        isActive: true,
      },
    });
  } else {
    await prisma.superAdminAssignment.create({
      data: {
        id: 'saa-ka-superadmin-01',
        userId: kaSuperAdmin.id,
        administrativeAreaId: karnatakaArea.id,
        jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
        isPrimary: true,
        isActive: true,
      },
    });
  }

  const mhSuperAdmin = await prisma.user.upsert({
    where: { email: 'mh.superadmin@nlams.gov.in' },
    update: {
      fullName: 'Maharashtra Area Super Admin',
      phone: '+91-9000000002',
      role: UserRole.SUPER_ADMIN,
      accountType: AccountType.GOVERNMENT_OFFICER,
      designation: 'Super Admin',
      organizationId: stateAuthorityMaha.id,
      passwordHash: mhAdminPasswordHash,
      isActive: true,
    },
    create: {
      id: 'u1000000-0000-4000-a000-000000000092',
      email: 'mh.superadmin@nlams.gov.in',
      passwordHash: mhAdminPasswordHash,
      fullName: 'Maharashtra Area Super Admin',
      phone: '+91-9000000002',
      role: UserRole.SUPER_ADMIN,
      accountType: AccountType.GOVERNMENT_OFFICER,
      designation: 'Super Admin',
      organizationId: stateAuthorityMaha.id,
      isActive: true,
    },
  });

  const existingMhAssignment = await prisma.superAdminAssignment.findFirst({
    where: { userId: mhSuperAdmin.id, administrativeAreaId: maharashtraArea.id },
  });
  if (existingMhAssignment) {
    await prisma.superAdminAssignment.update({
      where: { id: existingMhAssignment.id },
      data: {
        jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
        isPrimary: true,
        isActive: true,
      },
    });
  } else {
    await prisma.superAdminAssignment.create({
      data: {
        id: 'saa-mh-superadmin-01',
        userId: mhSuperAdmin.id,
        administrativeAreaId: maharashtraArea.id,
        jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
        isPrimary: true,
        isActive: true,
      },
    });
  }

  // ============================================================================
  // 4. Create Representative Seed Users for all 12 canonical roles
  // ============================================================================
  const seedUsers = [
    {
      id: 'u1000000-0000-4000-a000-000000000001',
      email: 'superadmin@nlams.gov.in',
      fullName: 'Dev Super Administrator (Central)',
      phone: '+91-9800000001',
      role: UserRole.SUPER_ADMIN,
      designation: 'Principal System Administrator (Central Dev)',
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
      organizationId: stateAuthorityMaha.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000004',
      email: 'district.officer@nlams.gov.in',
      fullName: 'Dev District Officer',
      phone: '+91-9800000004',
      role: UserRole.DISTRICT_OFFICER,
      designation: 'District Collector & Magistrate (Dev)',
      organizationId: districtAuthorityThane.id,
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
      organizationId: districtAuthorityThane.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000007',
      email: 'survey.officer@nlams.gov.in',
      fullName: 'Dev Cadastral Survey Officer',
      phone: '+91-9800000007',
      role: UserRole.SURVEY_OFFICER,
      designation: 'Deputy Superintendent of Land Records (Dev)',
      organizationId: districtAuthorityThane.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000008',
      email: 'revenue.officer@nlams.gov.in',
      fullName: 'Dev Revenue Officer (Tahsildar)',
      phone: '+91-9800000008',
      role: UserRole.REVENUE_OFFICER,
      designation: 'Tahsildar & Revenue Administrator (Dev)',
      organizationId: districtAuthorityThane.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000009',
      email: 'verification.officer@nlams.gov.in',
      fullName: 'Dev Title Verification Officer',
      phone: '+91-9800000009',
      role: UserRole.VERIFICATION_OFFICER,
      designation: 'Legal & Scrutiny Officer (Dev)',
      organizationId: districtAuthorityThane.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000010',
      email: 'finance.officer@nlams.gov.in',
      fullName: 'Dev Finance & Disbursement Officer',
      phone: '+91-9800000010',
      role: UserRole.FINANCE_OFFICER,
      designation: 'Chief Accounts & Treasury Officer (Dev)',
      organizationId: stateAuthorityMaha.id,
    },
    {
      id: 'u1000000-0000-4000-a000-000000000011',
      email: 'randr.officer@nlams.gov.in',
      fullName: 'Dev R&R Administrator',
      phone: '+91-9800000011',
      role: UserRole.R_AND_R_OFFICER,
      designation: 'Commissioner of Rehabilitation & Resettlement (Dev)',
      organizationId: stateAuthorityMaha.id,
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
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        designation: user.designation,
        organizationId: user.organizationId,
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: defaultPasswordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        designation: user.designation,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    // If Central Super Admin, assign Central jurisdiction
    if (user.role === UserRole.SUPER_ADMIN && user.email === 'superadmin@nlams.gov.in') {
      const existingCentralAssignment = await prisma.superAdminAssignment.findFirst({
        where: { userId: createdUser.id },
      });
      if (existingCentralAssignment) {
        await prisma.superAdminAssignment.update({
          where: { id: existingCentralAssignment.id },
          data: {
            jurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
            administrativeAreaId: null,
            isPrimary: true,
            isActive: true,
          },
        });
      } else {
        await prisma.superAdminAssignment.create({
          data: {
            id: 'saa-central-superadmin-01',
            userId: createdUser.id,
            administrativeAreaId: null,
            jurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
            isPrimary: true,
            isActive: true,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded 5 administrative organizations, 2 AdministrativeAreas (KA-AREA-01, MH-AREA-01) with district mappings.`);
  console.log(`✅ Seeded 2 Area-scoped Super Admins (ka.superadmin@nlams.gov.in, mh.superadmin@nlams.gov.in) and ${seedUsers.length} canonical role users.`);

  // Seed realistic demo acquisition data
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error('❌ Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

