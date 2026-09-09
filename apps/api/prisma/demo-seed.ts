import {
  PrismaClient,
  UserRole,
  AccountType,
  OrganizationType,
  OrganizationStatus,
  ProjectCategory,
  ProjectStatus,
  ParcelStatus,
  LandType,
  OwnershipVerificationStatus,
  DocumentCategory,
  DocumentVerificationStatus,
  WorkflowTaskStatus,
  WorkflowPriority,
  WorkflowSlaStatus,
  CompensationAssessmentStatus,
  CompensationPaymentStatus,
  PossessionStatus,
  PossessionType,
  SiteVerificationResult,
  RAndRStatus,
  RAndREligibilityStatus,
  RAndRBenefitType,
  RAndRBenefitStatus,
  RelocationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;
const DEFAULT_DEV_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'DevAdmin@NLAMS2026!';
const DEMO_LABEL = 'DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record.';

export async function seedDemoData() {
  console.log('🏛️  Seeding Realistic NLAMS Prototype Demo Data (Karnataka & Maharashtra)...');

  const defaultPasswordHash = await bcrypt.hash(DEFAULT_DEV_PASSWORD, BCRYPT_SALT_ROUNDS);

  // ============================================================================
  // 1. Ensure / Upsert Regional Organizations & PIA Accounts
  // ============================================================================
  const centralMinistry = await prisma.organization.findUnique({
    where: { code: 'ORG-CENTRAL-MORTH' },
  });
  if (!centralMinistry) {
    throw new Error('Central Ministry organization not found. Run base seed first.');
  }

  const stateAuthKarnataka = await prisma.organization.findUnique({
    where: { code: 'ORG-STATE-KARNATAKA' },
  });
  const stateAuthMaha = await prisma.organization.findUnique({
    where: { code: 'ORG-STATE-MAHA' },
  });

  // Karnataka PIA (KRDCL Bengaluru)
  const kaPiaOrg = await prisma.organization.upsert({
    where: { code: 'ORG-PIA-KRDCL-BLR' },
    update: {
      name: 'Karnataka Road Development Corporation Ltd (KRDCL Bengaluru PIU)',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000010',
      code: 'ORG-PIA-KRDCL-BLR',
      name: 'Karnataka Road Development Corporation Ltd (KRDCL Bengaluru PIU)',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
  });

  // Maharashtra PIA (NHAI Mumbai)
  const mhPiaOrg = await prisma.organization.upsert({
    where: { code: 'ORG-PIA-NHAI-MUM' },
    update: {
      name: 'National Highways Authority of India (NHAI PIU Mumbai)',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000004',
      code: 'ORG-PIA-NHAI-MUM',
      name: 'National Highways Authority of India (NHAI PIU Mumbai)',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: centralMinistry.id,
      isActive: true,
    },
  });

  // Regional District Authorities
  const distCollectorateBlr = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-BLR' },
    update: {
      name: 'District Collectorate Bengaluru Urban - Land Acquisition Division',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000011',
      code: 'ORG-DIST-BLR',
      name: 'District Collectorate Bengaluru Urban - Land Acquisition Division',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
  });

  const distCollectorateMys = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-MYS' },
    update: {
      name: 'District Collectorate Mysuru - Special Land Acquisition Cell',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Mysuru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000012',
      code: 'ORG-DIST-MYS',
      name: 'District Collectorate Mysuru - Special Land Acquisition Cell',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Mysuru',
      parentId: stateAuthKarnataka?.id || centralMinistry.id,
      isActive: true,
    },
  });

  const distCollectoratePun = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-PUN' },
    update: {
      name: 'District Collectorate Pune - Revenue & Land Acquisition Wing',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Pune',
      parentId: stateAuthMaha?.id || centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000013',
      code: 'ORG-DIST-PUN',
      name: 'District Collectorate Pune - Revenue & Land Acquisition Wing',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Pune',
      parentId: stateAuthMaha?.id || centralMinistry.id,
      isActive: true,
    },
  });

  const distCollectorateMum = await prisma.organization.upsert({
    where: { code: 'ORG-DIST-MUM' },
    update: {
      name: 'District Collectorate Mumbai Suburban - Land Acquisition Authority',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: stateAuthMaha?.id || centralMinistry.id,
      isActive: true,
    },
    create: {
      id: 'a1000000-0000-4000-a000-000000000014',
      code: 'ORG-DIST-MUM',
      name: 'District Collectorate Mumbai Suburban - Land Acquisition Authority',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      parentId: stateAuthMaha?.id || centralMinistry.id,
      isActive: true,
    },
  });

  // Ensure Karnataka PIA user for testing
  const kaPiaUser = await prisma.user.upsert({
    where: { email: 'ka.pia.officer@nlams.gov.in' },
    update: {
      fullName: 'Karnataka PIA Project Director (Dev)',
      phone: '+91-9800000021',
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      accountType: AccountType.PIA_USER,
      designation: 'Executive Director (Projects - KRDCL)',
      organizationId: kaPiaOrg.id,
      passwordHash: defaultPasswordHash,
      isActive: true,
    },
    create: {
      id: 'u1000000-0000-4000-a000-000000000021',
      email: 'ka.pia.officer@nlams.gov.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Karnataka PIA Project Director (Dev)',
      phone: '+91-9800000021',
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      accountType: AccountType.PIA_USER,
      designation: 'Executive Director (Projects - KRDCL)',
      organizationId: kaPiaOrg.id,
      isActive: true,
    },
  });

  // Get key officer accounts
  const centralOfficer = await prisma.user.findUnique({ where: { email: 'central.officer@nlams.gov.in' } });
  const mhPiaUser = await prisma.user.findUnique({ where: { email: 'pia.officer@nlams.gov.in' } });
  const laoOfficer = await prisma.user.findUnique({ where: { email: 'lao.officer@nlams.gov.in' } });
  const surveyOfficer = await prisma.user.findUnique({ where: { email: 'survey.officer@nlams.gov.in' } });
  const verificationOfficer = await prisma.user.findUnique({ where: { email: 'verification.officer@nlams.gov.in' } });
  const financeOfficer = await prisma.user.findUnique({ where: { email: 'finance.officer@nlams.gov.in' } });
  const randrOfficer = await prisma.user.findUnique({ where: { email: 'randr.officer@nlams.gov.in' } });
  const districtOfficer = await prisma.user.findUnique({ where: { email: 'district.officer@nlams.gov.in' } });

  const defaultActorId = centralOfficer?.id || 'u1000000-0000-4000-a000-000000000001';

  // ============================================================================
  // 2. Synthetic Landowners Pool
  // ============================================================================
  const syntheticOwnersData = [
    { id: 'lo-demo-ka-001', fullName: 'Ramesh Gowda', fatherOrSpouseName: 'Late Channappa Gowda', aadhaarLast4: '4812', village: 'Nelamangala', contactPhone: '+91-9845012341' },
    { id: 'lo-demo-ka-002', fullName: 'Anita Rao', fatherOrSpouseName: 'Venkatesh Rao', aadhaarLast4: '7190', village: 'Devanahalli', contactPhone: '+91-9845012342' },
    { id: 'lo-demo-ka-003', fullName: 'Suresh Kumar', fatherOrSpouseName: 'Krishnappa', aadhaarLast4: '3356', village: 'Yelahanka', contactPhone: '+91-9845012343' },
    { id: 'lo-demo-ka-004', fullName: 'Priya Hegde', fatherOrSpouseName: 'Raghavendra Hegde', aadhaarLast4: '8821', village: 'Nanjangud', contactPhone: '+91-9845012344' },
    { id: 'lo-demo-ka-005', fullName: 'Arjun Shetty', fatherOrSpouseName: 'Manjunath Shetty', aadhaarLast4: '1904', village: 'Hunsur', contactPhone: '+91-9845012345' },
    { id: 'lo-demo-ka-006', fullName: 'Basavaraj Patil', fatherOrSpouseName: 'Sharanappa Patil', aadhaarLast4: '6241', village: 'Kamalapura', contactPhone: '+91-9845012346' },
    { id: 'lo-demo-ka-007', fullName: 'Lakshmi Devi', fatherOrSpouseName: 'Late Narasimha Murthy', aadhaarLast4: '9032', village: 'Hosapete', contactPhone: '+91-9845012347' },
    { id: 'lo-demo-mh-001', fullName: 'Santosh Patil', fatherOrSpouseName: 'Anantrao Patil', aadhaarLast4: '5512', village: 'Kalyan', contactPhone: '+91-9820012341' },
    { id: 'lo-demo-mh-002', fullName: 'Sunita Deshmukh', fatherOrSpouseName: 'Prakash Deshmukh', aadhaarLast4: '4198', village: 'Bhiwandi', contactPhone: '+91-9820012342' },
    { id: 'lo-demo-mh-003', fullName: 'Ganesh Kadam', fatherOrSpouseName: 'Pandurang Kadam', aadhaarLast4: '7723', village: 'Haveli', contactPhone: '+91-9820012343' },
    { id: 'lo-demo-mh-004', fullName: 'Meena Shinde', fatherOrSpouseName: 'Late Eknath Shinde', aadhaarLast4: '2049', village: 'Mulshi', contactPhone: '+91-9820012344' },
    { id: 'lo-demo-mh-005', fullName: 'Vijay Gaikwad', fatherOrSpouseName: 'Tukaram Gaikwad', aadhaarLast4: '9180', village: 'Panvel Rural', contactPhone: '+91-9820012345' },
    { id: 'lo-demo-mh-006', fullName: 'Pooja Chavan', fatherOrSpouseName: 'Sanjay Chavan', aadhaarLast4: '3601', village: 'Uran', contactPhone: '+91-9820012346' },
  ];

  const landowners: Record<string, any> = {};
  for (const lo of syntheticOwnersData) {
    landowners[lo.id] = await prisma.landowner.upsert({
      where: { id: lo.id },
      update: {
        fullName: lo.fullName,
        fatherOrSpouseName: lo.fatherOrSpouseName,
        aadhaarLast4: lo.aadhaarLast4,
        village: lo.village,
        contactPhone: lo.contactPhone,
        bankAccountLinked: true,
        isVerified: true,
        metadata: { disclaimer: DEMO_LABEL, isSynthetic: true },
      },
      create: {
        id: lo.id,
        fullName: lo.fullName,
        fatherOrSpouseName: lo.fatherOrSpouseName,
        aadhaarLast4: lo.aadhaarLast4,
        village: lo.village,
        contactPhone: lo.contactPhone,
        bankAccountLinked: true,
        isVerified: true,
        metadata: { disclaimer: DEMO_LABEL, isSynthetic: true },
      },
    });
  }

  // ============================================================================
  // 3. SEED PROJECTS & PARCELS (5 Karnataka + 5 Maharashtra)
  // ============================================================================
  const demoProjects = [
    // ---------------- KARNATAKA ----------------
    {
      id: 'prj-ka-demo-001',
      code: 'DEMO-KA-PRJ-001',
      title: 'DEMO — Bengaluru Peripheral Road Expansion',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Four-lane ring corridor bypass connecting NH-44 to NH-75 around northern Bengaluru periphery.`,
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.NOTIFICATION_ISSUED,
      implementingAgencyOrgId: kaPiaOrg.id,
      state: 'Karnataka',
      districts: ['Bengaluru'],
      totalAreaHectares: 142.50,
      estimatedCompensationInr: 3200000000,
      disbursedCompensationInr: 0,
      notifiedOn: new Date('2025-11-15T00:00:00Z'),
      targetCompletionOn: new Date('2027-12-31T00:00:00Z'),
      assignedPiaUserId: kaPiaUser.id,
      parcels: [
        {
          surveyNumber: 'DEMO-BLR-101',
          khasraNumber: 'KH-101/A',
          village: 'Devanahalli',
          tehsil: 'Devanahalli',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 28.50,
          status: ParcelStatus.UNDER_ACQUISITION,
          marketRateInrPerHectare: 22000000,
          compensationInr: 627000000,
          lat: 13.0827,
          lng: 77.5877,
          ownerId: 'lo-demo-ka-001',
        },
        {
          surveyNumber: 'DEMO-BLR-102',
          khasraNumber: 'KH-102/B',
          village: 'Nelamangala',
          tehsil: 'Nelamangala',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.COMMERCIAL,
          areaHectares: 18.20,
          status: ParcelStatus.VERIFIED,
          marketRateInrPerHectare: 35000000,
          compensationInr: 637000000,
          lat: 13.0982,
          lng: 77.3912,
          ownerId: 'lo-demo-ka-002',
        },
        {
          surveyNumber: 'DEMO-BLR-103',
          khasraNumber: 'KH-103/C',
          village: 'Yelahanka',
          tehsil: 'Yelahanka',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.HOMESTEAD,
          areaHectares: 12.80,
          status: ParcelStatus.VERIFICATION_PENDING,
          marketRateInrPerHectare: 28000000,
          compensationInr: 358400000,
          lat: 13.1007,
          lng: 77.5963,
          ownerId: 'lo-demo-ka-003',
        },
        {
          surveyNumber: 'DEMO-BLR-104',
          khasraNumber: 'KH-104/D',
          village: 'Hosakote',
          tehsil: 'Hosakote',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 45.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 18000000,
          compensationInr: 810000000,
          lat: 13.0700,
          lng: 77.7980,
          ownerId: 'lo-demo-ka-001',
        },
        {
          surveyNumber: 'DEMO-BLR-105',
          khasraNumber: 'KH-105/E',
          village: 'Doddaballapura',
          tehsil: 'Doddaballapura',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.GOVERNMENT_WASTE,
          areaHectares: 38.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 15000000,
          compensationInr: 570000000,
          lat: 13.2925,
          lng: 77.5432,
          ownerId: 'lo-demo-ka-002',
        },
      ],
    },
    {
      id: 'prj-ka-demo-002',
      code: 'DEMO-KA-PRJ-002',
      title: 'DEMO — Bengaluru–Mysuru Infrastructure Corridor',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Multimodal industrial freight and expressway corridor linking Bengaluru urban hub with Mysuru logistics zone.`,
      category: ProjectCategory.INDUSTRIAL_CORRIDOR,
      status: ProjectStatus.COMPENSATION_DISBURSED,
      implementingAgencyOrgId: kaPiaOrg.id,
      state: 'Karnataka',
      districts: ['Bengaluru', 'Mysuru'],
      totalAreaHectares: 210.00,
      estimatedCompensationInr: 4800000000,
      disbursedCompensationInr: 4800000000,
      notifiedOn: new Date('2025-06-10T00:00:00Z'),
      targetCompletionOn: new Date('2027-06-30T00:00:00Z'),
      assignedPiaUserId: kaPiaUser.id,
      parcels: [
        {
          surveyNumber: 'DEMO-BLR-201',
          khasraNumber: 'KH-201/A',
          village: 'Bidadi',
          tehsil: 'Ramanagara',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 50.00,
          status: ParcelStatus.COMPENSATION_PAID,
          marketRateInrPerHectare: 24000000,
          compensationInr: 1200000000,
          lat: 12.7972,
          lng: 77.3824,
          ownerId: 'lo-demo-ka-003',
        },
        {
          surveyNumber: 'DEMO-BLR-202',
          khasraNumber: 'KH-202/B',
          village: 'Kengeri',
          tehsil: 'Bengaluru South',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.COMMERCIAL,
          areaHectares: 40.00,
          status: ParcelStatus.COMPENSATION_PAID,
          marketRateInrPerHectare: 30000000,
          compensationInr: 1200000000,
          lat: 12.9177,
          lng: 77.4838,
          ownerId: 'lo-demo-ka-002',
        },
        {
          surveyNumber: 'DEMO-BLR-203',
          khasraNumber: 'KH-203/C',
          village: 'Kumbalgodu',
          tehsil: 'Bengaluru South',
          district: 'Bengaluru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 35.00,
          status: ParcelStatus.COMPENSATION_PAID,
          marketRateInrPerHectare: 22000000,
          compensationInr: 770000000,
          lat: 12.8756,
          lng: 77.4478,
          ownerId: 'lo-demo-ka-001',
        },
        {
          surveyNumber: 'DEMO-MYS-204',
          khasraNumber: 'KH-204/D',
          village: 'Srirangapatna',
          tehsil: 'Srirangapatna',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 45.00,
          status: ParcelStatus.COMPENSATION_PAID,
          marketRateInrPerHectare: 18000000,
          compensationInr: 810000000,
          lat: 12.4181,
          lng: 76.6947,
          ownerId: 'lo-demo-ka-004',
        },
        {
          surveyNumber: 'DEMO-MYS-205',
          khasraNumber: 'KH-205/E',
          village: 'Mandya Rural',
          tehsil: 'Mandya',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 40.00,
          status: ParcelStatus.COMPENSATION_PAID,
          marketRateInrPerHectare: 20500000,
          compensationInr: 820000000,
          lat: 12.5218,
          lng: 76.8951,
          ownerId: 'lo-demo-ka-005',
        },
      ],
    },
    {
      id: 'prj-ka-demo-003',
      code: 'DEMO-KA-PRJ-003',
      title: 'DEMO — Mysuru Ring Road Development',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Outer bypass corridor mitigating congestion around Chamundi Hills and industrial suburbs.`,
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.AWARD_DECLARED,
      implementingAgencyOrgId: kaPiaOrg.id,
      state: 'Karnataka',
      districts: ['Mysuru'],
      totalAreaHectares: 88.20,
      estimatedCompensationInr: 1950000000,
      disbursedCompensationInr: 0,
      notifiedOn: new Date('2025-09-01T00:00:00Z'),
      targetCompletionOn: new Date('2028-03-31T00:00:00Z'),
      assignedPiaUserId: kaPiaUser.id,
      parcels: [
        {
          surveyNumber: 'DEMO-MYS-301',
          khasraNumber: 'KH-301/A',
          village: 'Nanjangud',
          tehsil: 'Nanjangud',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 25.20,
          status: ParcelStatus.AWARD_DECLARED,
          marketRateInrPerHectare: 22000000,
          compensationInr: 554400000,
          lat: 12.1190,
          lng: 76.6800,
          ownerId: 'lo-demo-ka-004',
        },
        {
          surveyNumber: 'DEMO-MYS-302',
          khasraNumber: 'KH-302/B',
          village: 'Hunsur',
          tehsil: 'Hunsur',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 23.00,
          status: ParcelStatus.AWARD_DECLARED,
          marketRateInrPerHectare: 21000000,
          compensationInr: 483000000,
          lat: 12.3072,
          lng: 76.2921,
          ownerId: 'lo-demo-ka-005',
        },
        {
          surveyNumber: 'DEMO-MYS-303',
          khasraNumber: 'KH-303/C',
          village: 'Varuna',
          tehsil: 'Mysuru',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.HOMESTEAD,
          areaHectares: 20.00,
          status: ParcelStatus.AWARD_DECLARED,
          marketRateInrPerHectare: 25000000,
          compensationInr: 500000000,
          lat: 12.2740,
          lng: 76.7320,
          ownerId: 'lo-demo-ka-004',
        },
        {
          surveyNumber: 'DEMO-MYS-304',
          khasraNumber: 'KH-304/D',
          village: 'Bannur',
          tehsil: 'Tirumakudalu Narasipura',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 20.00,
          status: ParcelStatus.AWARD_DECLARED,
          marketRateInrPerHectare: 20630000,
          compensationInr: 412600000,
          lat: 12.3330,
          lng: 76.8610,
          ownerId: 'lo-demo-ka-005',
        },
      ],
    },
    {
      id: 'prj-ka-demo-004',
      code: 'DEMO-KA-PRJ-004',
      title: 'DEMO — Mysuru Regional Connectivity Project',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Radial bypass and multimodal link connecting agricultural produce markets with Mysuru airport.`,
      category: ProjectCategory.URBAN_INFRASTRUCTURE,
      status: ProjectStatus.UNDER_SCRUTINY,
      implementingAgencyOrgId: kaPiaOrg.id,
      state: 'Karnataka',
      districts: ['Mysuru'],
      totalAreaHectares: 45.00,
      estimatedCompensationInr: 900000000,
      disbursedCompensationInr: 0,
      notifiedOn: null,
      targetCompletionOn: new Date('2028-12-31T00:00:00Z'),
      assignedPiaUserId: kaPiaUser.id,
      parcels: [
        {
          surveyNumber: 'DEMO-MYS-401',
          khasraNumber: 'KH-401/A',
          village: 'Kadur Rural',
          tehsil: 'Mysuru',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 15.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 20000000,
          compensationInr: 300000000,
          lat: 12.2280,
          lng: 76.6500,
          ownerId: 'lo-demo-ka-004',
        },
        {
          surveyNumber: 'DEMO-MYS-402',
          khasraNumber: 'KH-402/B',
          village: 'Maddur Boundary',
          tehsil: 'Mysuru',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 15.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 20000000,
          compensationInr: 300000000,
          lat: 12.2150,
          lng: 76.6720,
          ownerId: 'lo-demo-ka-005',
        },
        {
          surveyNumber: 'DEMO-MYS-403',
          khasraNumber: 'KH-403/C',
          village: 'Hullahalli',
          tehsil: 'Nanjangud',
          district: 'Mysuru',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 15.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 20000000,
          compensationInr: 300000000,
          lat: 12.1800,
          lng: 76.5500,
          ownerId: 'lo-demo-ka-004',
        },
      ],
    },
    {
      id: 'prj-ka-demo-005',
      code: 'DEMO-KA-PRJ-005',
      title: 'DEMO — Hampi Heritage Connectivity Project',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Eco-sensitive heritage tourism transport corridor along the Tungabhadra river basin at Hampi.`,
      category: ProjectCategory.URBAN_INFRASTRUCTURE,
      status: ProjectStatus.DOCUMENT_VERIFICATION,
      implementingAgencyOrgId: kaPiaOrg.id,
      state: 'Karnataka',
      districts: ['Hampi'],
      totalAreaHectares: 36.40,
      estimatedCompensationInr: 650000000,
      disbursedCompensationInr: 0,
      notifiedOn: null,
      targetCompletionOn: new Date('2028-06-30T00:00:00Z'),
      assignedPiaUserId: kaPiaUser.id,
      parcels: [
        {
          surveyNumber: 'DEMO-HMP-501',
          khasraNumber: 'KH-501/A',
          village: 'Kamalapura',
          tehsil: 'Hosapete',
          district: 'Hampi',
          state: 'Karnataka',
          landType: LandType.HOMESTEAD,
          areaHectares: 12.40,
          status: ParcelStatus.VERIFICATION_PENDING,
          marketRateInrPerHectare: 18000000,
          compensationInr: 223200000,
          lat: 15.3190,
          lng: 76.4780,
          ownerId: 'lo-demo-ka-006',
        },
        {
          surveyNumber: 'DEMO-HMP-502',
          khasraNumber: 'KH-502/B',
          village: 'Anegundi',
          tehsil: 'Gangavathi',
          district: 'Hampi',
          state: 'Karnataka',
          landType: LandType.AGRICULTURAL,
          areaHectares: 14.00,
          status: ParcelStatus.VERIFICATION_PENDING,
          marketRateInrPerHectare: 17500000,
          compensationInr: 245000000,
          lat: 15.3520,
          lng: 76.4950,
          ownerId: 'lo-demo-ka-007',
        },
        {
          surveyNumber: 'DEMO-HMP-503',
          khasraNumber: 'KH-503/C',
          village: 'Kadirampura',
          tehsil: 'Hosapete',
          district: 'Hampi',
          state: 'Karnataka',
          landType: LandType.GOVERNMENT_WASTE,
          areaHectares: 10.00,
          status: ParcelStatus.VERIFIED,
          marketRateInrPerHectare: 18180000,
          compensationInr: 181800000,
          lat: 15.3280,
          lng: 76.4520,
          ownerId: 'lo-demo-ka-006',
        },
      ],
    },

    // ---------------- MAHARASHTRA ----------------
    {
      id: 'prj-mh-demo-001',
      code: 'DEMO-MH-PRJ-001',
      title: 'DEMO — Mumbai Urban Infrastructure Expansion',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Elevated corridor and feeder system connecting Eastern Express Highway with coastal transport terminals.`,
      category: ProjectCategory.URBAN_INFRASTRUCTURE,
      status: ProjectStatus.POSSESSION_PENDING,
      implementingAgencyOrgId: mhPiaOrg.id,
      state: 'Maharashtra',
      districts: ['Mumbai'],
      totalAreaHectares: 65.00,
      estimatedCompensationInr: 7500000000,
      disbursedCompensationInr: 7500000000,
      notifiedOn: new Date('2025-01-20T00:00:00Z'),
      targetCompletionOn: new Date('2027-09-30T00:00:00Z'),
      assignedPiaUserId: mhPiaUser?.id || defaultActorId,
      parcels: [
        {
          surveyNumber: 'DEMO-MUM-101',
          khasraNumber: 'CTS-101/A',
          village: 'Kalyan',
          tehsil: 'Kalyan',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 18.00,
          status: ParcelStatus.POSSESSION_PENDING,
          marketRateInrPerHectare: 115000000,
          compensationInr: 2070000000,
          lat: 19.2403,
          lng: 73.1305,
          ownerId: 'lo-demo-mh-001',
        },
        {
          surveyNumber: 'DEMO-MUM-102',
          khasraNumber: 'CTS-102/B',
          village: 'Bhiwandi',
          tehsil: 'Bhiwandi',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 17.00,
          status: ParcelStatus.POSSESSION_PENDING,
          marketRateInrPerHectare: 115000000,
          compensationInr: 1955000000,
          lat: 19.2813,
          lng: 73.0483,
          ownerId: 'lo-demo-mh-002',
        },
        {
          surveyNumber: 'DEMO-MUM-103',
          khasraNumber: 'CTS-103/C',
          village: 'Kurla',
          tehsil: 'Kurla',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.HOMESTEAD,
          areaHectares: 15.00,
          status: ParcelStatus.POSSESSION_PENDING,
          marketRateInrPerHectare: 120000000,
          compensationInr: 1800000000,
          lat: 19.0728,
          lng: 72.8797,
          ownerId: 'lo-demo-mh-001',
        },
        {
          surveyNumber: 'DEMO-MUM-104',
          khasraNumber: 'CTS-104/D',
          village: 'Chembur',
          tehsil: 'Kurla',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 15.00,
          status: ParcelStatus.POSSESSION_PENDING,
          marketRateInrPerHectare: 11166666,
          compensationInr: 1675000000,
          lat: 19.0522,
          lng: 72.8994,
          ownerId: 'lo-demo-mh-002',
        },
      ],
    },
    {
      id: 'prj-mh-demo-002',
      code: 'DEMO-MH-PRJ-002',
      title: 'DEMO — Mumbai Metropolitan Connectivity Project',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. High-capacity arterial expressway connecting northern MMR industrial clusters with coastal logistics routes.`,
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.COMPENSATION_ASSESSED,
      implementingAgencyOrgId: mhPiaOrg.id,
      state: 'Maharashtra',
      districts: ['Mumbai'],
      totalAreaHectares: 115.80,
      estimatedCompensationInr: 5200000000,
      disbursedCompensationInr: 0,
      notifiedOn: new Date('2025-07-01T00:00:00Z'),
      targetCompletionOn: new Date('2028-01-15T00:00:00Z'),
      assignedPiaUserId: mhPiaUser?.id || defaultActorId,
      parcels: [
        {
          surveyNumber: 'DEMO-MUM-201',
          khasraNumber: 'CTS-201/A',
          village: 'Dombivli',
          tehsil: 'Kalyan',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 35.80,
          status: ParcelStatus.COMPENSATION_PENDING,
          marketRateInrPerHectare: 45000000,
          compensationInr: 1611000000,
          lat: 19.2094,
          lng: 73.0939,
          ownerId: 'lo-demo-mh-001',
        },
        {
          surveyNumber: 'DEMO-MUM-202',
          khasraNumber: 'CTS-202/B',
          village: 'Ghansoli',
          tehsil: 'Thane',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 30.00,
          status: ParcelStatus.COMPENSATION_PENDING,
          marketRateInrPerHectare: 50000000,
          compensationInr: 1500000000,
          lat: 19.1254,
          lng: 72.9992,
          ownerId: 'lo-demo-mh-002',
        },
        {
          surveyNumber: 'DEMO-MUM-203',
          khasraNumber: 'CTS-203/C',
          village: 'Mahape',
          tehsil: 'Thane',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 25.00,
          status: ParcelStatus.COMPENSATION_PENDING,
          marketRateInrPerHectare: 45000000,
          compensationInr: 1125000000,
          lat: 19.1128,
          lng: 73.0201,
          ownerId: 'lo-demo-mh-001',
        },
        {
          surveyNumber: 'DEMO-MUM-204',
          khasraNumber: 'CTS-204/D',
          village: 'Kopar Khairane',
          tehsil: 'Thane',
          district: 'Mumbai',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 25.00,
          status: ParcelStatus.COMPENSATION_PENDING,
          marketRateInrPerHectare: 38560000,
          compensationInr: 964000000,
          lat: 19.0980,
          lng: 73.0080,
          ownerId: 'lo-demo-mh-002',
        },
      ],
    },
    {
      id: 'prj-mh-demo-003',
      code: 'DEMO-MH-PRJ-003',
      title: 'DEMO — Pune Ring Road Development',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Greenfield 8-lane ring expressway decongesting Pune metropolitan region and bypass traffic.`,
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.POSSESSION_COMPLETED,
      implementingAgencyOrgId: mhPiaOrg.id,
      state: 'Maharashtra',
      districts: ['Pune'],
      totalAreaHectares: 175.00,
      estimatedCompensationInr: 3900000000,
      disbursedCompensationInr: 3900000000,
      notifiedOn: new Date('2024-11-10T00:00:00Z'),
      targetCompletionOn: new Date('2027-05-30T00:00:00Z'),
      assignedPiaUserId: mhPiaUser?.id || defaultActorId,
      parcels: [
        {
          surveyNumber: 'DEMO-PUN-301',
          khasraNumber: 'KH-301/A',
          village: 'Haveli',
          tehsil: 'Haveli',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 40.00,
          status: ParcelStatus.POSSESSION_TAKEN,
          marketRateInrPerHectare: 22000000,
          compensationInr: 880000000,
          lat: 18.5204,
          lng: 73.8567,
          ownerId: 'lo-demo-mh-003',
        },
        {
          surveyNumber: 'DEMO-PUN-302',
          khasraNumber: 'KH-302/B',
          village: 'Mulshi',
          tehsil: 'Mulshi',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 35.00,
          status: ParcelStatus.POSSESSION_TAKEN,
          marketRateInrPerHectare: 23000000,
          compensationInr: 805000000,
          lat: 18.5089,
          lng: 73.5134,
          ownerId: 'lo-demo-mh-004',
        },
        {
          surveyNumber: 'DEMO-PUN-303',
          khasraNumber: 'KH-303/C',
          village: 'Maval',
          tehsil: 'Maval',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 35.00,
          status: ParcelStatus.POSSESSION_TAKEN,
          marketRateInrPerHectare: 21500000,
          compensationInr: 752500000,
          lat: 18.7547,
          lng: 73.5412,
          ownerId: 'lo-demo-mh-003',
        },
        {
          surveyNumber: 'DEMO-PUN-304',
          khasraNumber: 'KH-304/D',
          village: 'Purandar',
          tehsil: 'Purandar',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 35.00,
          status: ParcelStatus.POSSESSION_TAKEN,
          marketRateInrPerHectare: 22000000,
          compensationInr: 770000000,
          lat: 18.2831,
          lng: 73.9742,
          ownerId: 'lo-demo-mh-004',
        },
        {
          surveyNumber: 'DEMO-PUN-305',
          khasraNumber: 'KH-305/E',
          village: 'Khed',
          tehsil: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 30.00,
          status: ParcelStatus.POSSESSION_TAKEN,
          marketRateInrPerHectare: 23083333,
          compensationInr: 692500000,
          lat: 18.8471,
          lng: 73.9090,
          ownerId: 'lo-demo-mh-003',
        },
      ],
    },
    {
      id: 'prj-mh-demo-004',
      code: 'DEMO-MH-PRJ-004',
      title: 'DEMO — Pune Regional Transport Corridor',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Industrial freight corridor and logistic terminal linking Chakan, Talegaon, and Ranjangaon belts.`,
      category: ProjectCategory.INDUSTRIAL_CORRIDOR,
      status: ProjectStatus.R_AND_R_IN_PROGRESS,
      implementingAgencyOrgId: mhPiaOrg.id,
      state: 'Maharashtra',
      districts: ['Pune'],
      totalAreaHectares: 98.60,
      estimatedCompensationInr: 2100000000,
      disbursedCompensationInr: 1050000000,
      notifiedOn: new Date('2025-03-12T00:00:00Z'),
      targetCompletionOn: new Date('2027-11-30T00:00:00Z'),
      assignedPiaUserId: mhPiaUser?.id || defaultActorId,
      parcels: [
        {
          surveyNumber: 'DEMO-PUN-401',
          khasraNumber: 'KH-401/A',
          village: 'Chakan',
          tehsil: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.HOMESTEAD,
          areaHectares: 25.00,
          status: ParcelStatus.UNDER_ACQUISITION,
          marketRateInrPerHectare: 22000000,
          compensationInr: 550000000,
          lat: 18.7606,
          lng: 73.8569,
          ownerId: 'lo-demo-mh-003',
        },
        {
          surveyNumber: 'DEMO-PUN-402',
          khasraNumber: 'KH-402/B',
          village: 'Talegaon Dabhade',
          tehsil: 'Maval',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.HOMESTEAD,
          areaHectares: 25.00,
          status: ParcelStatus.UNDER_ACQUISITION,
          marketRateInrPerHectare: 22000000,
          compensationInr: 550000000,
          lat: 18.7344,
          lng: 73.6767,
          ownerId: 'lo-demo-mh-004',
        },
        {
          surveyNumber: 'DEMO-PUN-403',
          khasraNumber: 'KH-403/C',
          village: 'Ranjangaon',
          tehsil: 'Shirur',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 24.60,
          status: ParcelStatus.UNDER_ACQUISITION,
          marketRateInrPerHectare: 20325203,
          compensationInr: 500000000,
          lat: 18.8139,
          lng: 74.2417,
          ownerId: 'lo-demo-mh-003',
        },
        {
          surveyNumber: 'DEMO-PUN-404',
          khasraNumber: 'KH-404/D',
          village: 'Shikrapur',
          tehsil: 'Shirur',
          district: 'Pune',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 24.00,
          status: ParcelStatus.UNDER_ACQUISITION,
          marketRateInrPerHectare: 20833333,
          compensationInr: 500000000,
          lat: 18.6980,
          lng: 74.1200,
          ownerId: 'lo-demo-mh-004',
        },
      ],
    },
    {
      id: 'prj-mh-demo-005',
      code: 'DEMO-MH-PRJ-005',
      title: 'DEMO — Panvel–Navi Mumbai Connectivity Project',
      description: `DEMO / ILLUSTRATIVE DATA — Not an actual government acquisition record. Access-controlled transit spine connecting Panvel junction with Navi Mumbai International Airport zone.`,
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.SUBMITTED,
      implementingAgencyOrgId: mhPiaOrg.id,
      state: 'Maharashtra',
      districts: ['Panvel'],
      totalAreaHectares: 52.30,
      estimatedCompensationInr: 1400000000,
      disbursedCompensationInr: 0,
      notifiedOn: null,
      targetCompletionOn: new Date('2028-09-30T00:00:00Z'),
      assignedPiaUserId: mhPiaUser?.id || defaultActorId,
      parcels: [
        {
          surveyNumber: 'DEMO-PNV-501',
          khasraNumber: 'KH-501/A',
          village: 'Panvel Rural',
          tehsil: 'Panvel',
          district: 'Panvel',
          state: 'Maharashtra',
          landType: LandType.AGRICULTURAL,
          areaHectares: 18.30,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 28000000,
          compensationInr: 512400000,
          lat: 18.9894,
          lng: 73.1175,
          ownerId: 'lo-demo-mh-005',
        },
        {
          surveyNumber: 'DEMO-PNV-502',
          khasraNumber: 'KH-502/B',
          village: 'Uran',
          tehsil: 'Uran',
          district: 'Panvel',
          state: 'Maharashtra',
          landType: LandType.COMMERCIAL,
          areaHectares: 17.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 28000000,
          compensationInr: 476000000,
          lat: 18.8780,
          lng: 72.9340,
          ownerId: 'lo-demo-mh-006',
        },
        {
          surveyNumber: 'DEMO-PNV-503',
          khasraNumber: 'KH-503/C',
          village: 'Taloja',
          tehsil: 'Panvel',
          district: 'Panvel',
          state: 'Maharashtra',
          landType: LandType.GOVERNMENT_WASTE,
          areaHectares: 17.00,
          status: ParcelStatus.IDENTIFIED,
          marketRateInrPerHectare: 24211764,
          compensationInr: 411600000,
          lat: 19.0520,
          lng: 73.1050,
          ownerId: 'lo-demo-mh-005',
        },
      ],
    },
  ];

  let totalParcelsCreated = 0;
  let totalDocsCreated = 0;
  let totalTasksCreated = 0;
  let totalCompensationCreated = 0;
  let totalPossessionCreated = 0;
  let totalRandrCreated = 0;

  for (const prj of demoProjects) {
    // 1. Upsert Project
    const project = await prisma.project.upsert({
      where: { code: prj.code },
      update: {
        title: prj.title,
        description: prj.description,
        category: prj.category,
        status: prj.status,
        implementingAgencyOrgId: prj.implementingAgencyOrgId,
        state: prj.state,
        districts: prj.districts,
        totalAreaHectares: prj.totalAreaHectares,
        estimatedCompensationInr: prj.estimatedCompensationInr,
        disbursedCompensationInr: prj.disbursedCompensationInr,
        notifiedOn: prj.notifiedOn,
        targetCompletionOn: prj.targetCompletionOn,
        metadata: { disclaimer: DEMO_LABEL, isDemoProject: true },
        isActive: true,
      },
      create: {
        id: prj.id,
        code: prj.code,
        title: prj.title,
        description: prj.description,
        category: prj.category,
        status: prj.status,
        implementingAgencyOrgId: prj.implementingAgencyOrgId,
        state: prj.state,
        districts: prj.districts,
        totalAreaHectares: prj.totalAreaHectares,
        estimatedCompensationInr: prj.estimatedCompensationInr,
        disbursedCompensationInr: prj.disbursedCompensationInr,
        notifiedOn: prj.notifiedOn,
        targetCompletionOn: prj.targetCompletionOn,
        metadata: { disclaimer: DEMO_LABEL, isDemoProject: true },
        isActive: true,
      },
    });

    // 2. Project Assignment for PIA User
    if (prj.assignedPiaUserId) {
      await prisma.projectAssignment.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: prj.assignedPiaUserId,
          },
        },
        update: { isActive: true },
        create: {
          projectId: project.id,
          userId: prj.assignedPiaUserId,
          role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
          assignedById: defaultActorId,
          isActive: true,
        },
      });
    }

    // 3. Project Document (Proposal / Notification)
    const docNumber = `DOC-${prj.code}-001`;
    const doc = await prisma.document.upsert({
      where: { documentNumber: docNumber },
      update: {
        title: `${prj.title} — Detailed Project Report & Alignment Map`,
        category: DocumentCategory.PROJECT_PROPOSAL,
        verificationStatus: DocumentVerificationStatus.VERIFIED,
      },
      create: {
        documentNumber: docNumber,
        title: `${prj.title} — Detailed Project Report & Alignment Map`,
        category: DocumentCategory.PROJECT_PROPOSAL,
        projectId: project.id,
        fileName: `${prj.code.toLowerCase()}_dpr_alignment.pdf`,
        fileType: 'PDF',
        fileSizeKb: 3420,
        mimeType: 'application/pdf',
        storageProvider: 'MINIO_S3',
        storageBucket: 'nlams-documents',
        storageKey: `demo/projects/${prj.code.toLowerCase()}/dpr.pdf`,
        currentVersion: 1,
        verificationStatus: DocumentVerificationStatus.VERIFIED,
        uploadedById: prj.assignedPiaUserId || defaultActorId,
        verifiedById: centralOfficer?.id || defaultActorId,
        verifiedAt: new Date(),
        remarks: `${DEMO_LABEL} Verified technical alignment.`,
        metadata: { disclaimer: DEMO_LABEL },
      },
    });
    totalDocsCreated++;

    // Document Version & Activity
    await prisma.documentVersion.upsert({
      where: {
        documentId_versionNumber: {
          documentId: doc.id,
          versionNumber: 1,
        },
      },
      update: {},
      create: {
        documentId: doc.id,
        versionNumber: 1,
        fileName: `${prj.code.toLowerCase()}_dpr_alignment.pdf`,
        fileSizeKb: 3420,
        mimeType: 'application/pdf',
        storageKey: `demo/projects/${prj.code.toLowerCase()}/dpr.pdf`,
        uploadedById: prj.assignedPiaUserId || defaultActorId,
        verificationStatus: DocumentVerificationStatus.VERIFIED,
        remarks: 'Initial demo DPR upload',
      },
    });

    // 4. Workflow Task for Project
    const taskTitle = `Statutory Land Scrutiny — ${prj.code}`;
    const existingTask = await prisma.workflowTask.findFirst({
      where: { projectId: project.id, taskType: 'SCRUTINY' },
    });
    if (!existingTask) {
      await prisma.workflowTask.create({
        data: {
          projectId: project.id,
          currentStage: prj.status,
          targetStage: ProjectStatus.NOTIFICATION_ISSUED,
          taskType: 'SCRUTINY',
          title: taskTitle,
          description: `${DEMO_LABEL} Verify cadastral survey records and issue Section 11 preliminary notification.`,
          assignedRoleId: UserRole.LAND_ACQUISITION_OFFICER,
          assignedOfficerId: laoOfficer?.id || defaultActorId,
          assignedOrgId: prj.state === 'Karnataka' ? distCollectorateBlr.id : distCollectorateMum.id,
          status: prj.status === ProjectStatus.SUBMITTED ? WorkflowTaskStatus.PENDING : WorkflowTaskStatus.COMPLETED,
          priority: WorkflowPriority.HIGH,
          slaDays: 14,
          slaStatus: WorkflowSlaStatus.ON_TRACK,
          dueAt: new Date(Date.now() + 14 * 86400000),
          completedAt: prj.status !== ProjectStatus.SUBMITTED ? new Date() : null,
          availableActions: ['APPROVE', 'REJECT', 'REQUEST_INFO'],
          remarks: `${DEMO_LABEL} Scrutiny in accordance with statutory guidelines.`,
          metadata: { disclaimer: DEMO_LABEL },
        },
      });
      totalTasksCreated++;
    }

    // 5. Create Parcels, Documents, Compensation, Possession, and R&R records
    for (const p of prj.parcels) {
      const parcel = await prisma.parcel.upsert({
        where: {
          projectId_surveyNumber: {
            projectId: project.id,
            surveyNumber: p.surveyNumber,
          },
        },
        update: {
          khasraNumber: p.khasraNumber,
          village: p.village,
          tehsil: p.tehsil,
          district: p.district,
          state: p.state,
          landType: p.landType,
          areaHectares: p.areaHectares,
          status: p.status,
          marketRateInrPerHectare: p.marketRateInrPerHectare,
          compensationInr: p.compensationInr,
          centroidLat: p.lat,
          centroidLng: p.lng,
          gisPolygonReference: `CADASTRE-${p.surveyNumber}`,
          spatialGeometry: {
            type: 'Polygon',
            coordinates: [
              [
                [p.lng - 0.002, p.lat - 0.002],
                [p.lng + 0.002, p.lat - 0.002],
                [p.lng + 0.002, p.lat + 0.002],
                [p.lng - 0.002, p.lat + 0.002],
                [p.lng - 0.002, p.lat - 0.002],
              ],
            ],
          },
          metadata: { disclaimer: DEMO_LABEL, isSyntheticParcel: true },
          isActive: true,
        },
        create: {
          projectId: project.id,
          surveyNumber: p.surveyNumber,
          khasraNumber: p.khasraNumber,
          village: p.village,
          tehsil: p.tehsil,
          district: p.district,
          state: p.state,
          landType: p.landType,
          areaHectares: p.areaHectares,
          status: p.status,
          marketRateInrPerHectare: p.marketRateInrPerHectare,
          compensationInr: p.compensationInr,
          centroidLat: p.lat,
          centroidLng: p.lng,
          gisPolygonReference: `CADASTRE-${p.surveyNumber}`,
          spatialGeometry: {
            type: 'Polygon',
            coordinates: [
              [
                [p.lng - 0.002, p.lat - 0.002],
                [p.lng + 0.002, p.lat - 0.002],
                [p.lng + 0.002, p.lat + 0.002],
                [p.lng - 0.002, p.lat + 0.002],
                [p.lng - 0.002, p.lat - 0.002],
              ],
            ],
          },
          metadata: { disclaimer: DEMO_LABEL, isSyntheticParcel: true },
          isActive: true,
        },
      });
      totalParcelsCreated++;

      // Parcel Landowner Join
      await prisma.parcelLandowner.upsert({
        where: {
          parcelId_landownerId: {
            parcelId: parcel.id,
            landownerId: p.ownerId,
          },
        },
        update: {
          ownershipPercentage: 100.0,
          eligibleAreaHectares: p.areaHectares,
          ownershipType: 'SOLE_OWNER',
          verificationStatus: OwnershipVerificationStatus.VERIFIED,
          remarks: `${DEMO_LABEL} Title verified from sub-registrar records.`,
        },
        create: {
          parcelId: parcel.id,
          landownerId: p.ownerId,
          ownershipPercentage: 100.0,
          eligibleAreaHectares: p.areaHectares,
          ownershipType: 'SOLE_OWNER',
          verificationStatus: OwnershipVerificationStatus.VERIFIED,
          remarks: `${DEMO_LABEL} Title verified from sub-registrar records.`,
        },
      });

      // Parcel Survey Document
      const pDocNum = `DOC-${p.surveyNumber}-SRV`;
      await prisma.document.upsert({
        where: { documentNumber: pDocNum },
        update: {
          title: `Cadastral Survey Map & Field Measurement Book — ${p.surveyNumber}`,
          category: DocumentCategory.SURVEY_RECORD,
          verificationStatus: DocumentVerificationStatus.VERIFIED,
        },
        create: {
          documentNumber: pDocNum,
          title: `Cadastral Survey Map & Field Measurement Book — ${p.surveyNumber}`,
          category: DocumentCategory.SURVEY_RECORD,
          projectId: project.id,
          parcelId: parcel.id,
          fileName: `${p.surveyNumber.toLowerCase()}_fmb_survey.pdf`,
          fileType: 'PDF',
          fileSizeKb: 1850,
          mimeType: 'application/pdf',
          storageProvider: 'MINIO_S3',
          storageBucket: 'nlams-documents',
          storageKey: `demo/parcels/${p.surveyNumber.toLowerCase()}/survey.pdf`,
          currentVersion: 1,
          verificationStatus: DocumentVerificationStatus.VERIFIED,
          uploadedById: surveyOfficer?.id || defaultActorId,
          verifiedById: verificationOfficer?.id || defaultActorId,
          verifiedAt: new Date(),
          remarks: `${DEMO_LABEL} Cadastral boundary verified.`,
          metadata: { disclaimer: DEMO_LABEL },
        },
      });
      totalDocsCreated++;

      // 6. Compensation Assessment (For projects at or beyond AWARD_DECLARED / COMPENSATION)
      if (
        project.status === ProjectStatus.AWARD_DECLARED ||
        project.status === ProjectStatus.COMPENSATION_ASSESSED ||
        project.status === ProjectStatus.COMPENSATION_DISBURSED ||
        project.status === ProjectStatus.POSSESSION_PENDING ||
        project.status === ProjectStatus.POSSESSION_COMPLETED ||
        project.status === ProjectStatus.R_AND_R_IN_PROGRESS ||
        project.status === ProjectStatus.COMPLETED
      ) {
        const assessmentNum = `COMP-${p.surveyNumber}`;
        const marketVal = Number(p.compensationInr) * 0.5;
        const solatium = marketVal; // 100% Solatium
        const totalPayable = marketVal + solatium;
        const isDisbursed =
          project.status === ProjectStatus.COMPENSATION_DISBURSED ||
          project.status === ProjectStatus.POSSESSION_PENDING ||
          project.status === ProjectStatus.POSSESSION_COMPLETED ||
          project.status === ProjectStatus.COMPLETED;

        const compAssessment = await prisma.compensationAssessment.upsert({
          where: { assessmentNumber: assessmentNum },
          update: {
            assessmentStatus: isDisbursed
              ? CompensationAssessmentStatus.DISBURSED
              : CompensationAssessmentStatus.AWARD_DECLARED,
            paymentStatus: isDisbursed
              ? CompensationPaymentStatus.DISBURSED
              : CompensationPaymentStatus.APPROVED,
            landAreaHectares: p.areaHectares,
            landClassification: p.landType,
            totalMarketValueInr: marketVal,
            solatiumAmountInr: solatium,
            additionalCompensationInr: 0,
            statutoryBenefitsInr: 0,
            deductionsInr: 0,
            totalAssessedAmountInr: totalPayable,
            totalPayableAmountInr: totalPayable,
            amountDisbursedInr: isDisbursed ? totalPayable : 0,
            amountPendingInr: isDisbursed ? 0 : totalPayable,
            assessmentDate: new Date('2025-08-01T00:00:00Z'),
            awardDeclaredDate: new Date('2025-09-01T00:00:00Z'),
            approvedDate: new Date('2025-09-15T00:00:00Z'),
            assessingOfficerId: laoOfficer?.id || defaultActorId,
            remarks: `${DEMO_LABEL} Section 26-30 award determination.`,
          },
          create: {
            assessmentNumber: assessmentNum,
            projectId: project.id,
            parcelId: parcel.id,
            awardId: `AWD-${p.surveyNumber}`,
            awardDate: new Date('2025-09-01T00:00:00Z'),
            awardAuthority: 'Competent Authority for Land Acquisition (CALA)',
            assessmentStatus: isDisbursed
              ? CompensationAssessmentStatus.DISBURSED
              : CompensationAssessmentStatus.AWARD_DECLARED,
            paymentStatus: isDisbursed
              ? CompensationPaymentStatus.DISBURSED
              : CompensationPaymentStatus.APPROVED,
            landAreaHectares: p.areaHectares,
            landClassification: p.landType,
            totalMarketValueInr: marketVal,
            solatiumAmountInr: solatium,
            additionalCompensationInr: 0,
            statutoryBenefitsInr: 0,
            deductionsInr: 0,
            totalAssessedAmountInr: totalPayable,
            totalPayableAmountInr: totalPayable,
            amountDisbursedInr: isDisbursed ? totalPayable : 0,
            amountPendingInr: isDisbursed ? 0 : totalPayable,
            assessmentDate: new Date('2025-08-01T00:00:00Z'),
            awardDeclaredDate: new Date('2025-09-01T00:00:00Z'),
            approvedDate: new Date('2025-09-15T00:00:00Z'),
            assessingOfficerId: laoOfficer?.id || defaultActorId,
            remarks: `${DEMO_LABEL} Section 26-30 award determination.`,
            metadata: { disclaimer: DEMO_LABEL },
          },
        });
        totalCompensationCreated++;

        // Landowner Compensation Entitlement
        const loComp = await prisma.landownerCompensation.upsert({
          where: {
            assessmentId_landownerId: {
              assessmentId: compAssessment.id,
              landownerId: p.ownerId,
            },
          },
          update: {
            ownershipShare: 1.0,
            eligibleAreaHectares: p.areaHectares,
            marketValueShareInr: marketVal,
            solatiumShareInr: solatium,
            additionalBenefitsInr: 0,
            deductionsInr: 0,
            payableAmountInr: totalPayable,
            disbursedAmountInr: isDisbursed ? totalPayable : 0,
            pendingAmountInr: isDisbursed ? 0 : totalPayable,
            paymentStatus: isDisbursed
              ? CompensationPaymentStatus.DISBURSED
              : CompensationPaymentStatus.APPROVED,
            bankReferenceMasked: 'SBI A/C •••• 5842 (PFMS Mapped)',
            remarks: `${DEMO_LABEL} 100% entitlement share.`,
          },
          create: {
            assessmentId: compAssessment.id,
            parcelId: parcel.id,
            landownerId: p.ownerId,
            ownershipShare: 1.0,
            eligibleAreaHectares: p.areaHectares,
            marketValueShareInr: marketVal,
            solatiumShareInr: solatium,
            additionalBenefitsInr: 0,
            deductionsInr: 0,
            payableAmountInr: totalPayable,
            disbursedAmountInr: isDisbursed ? totalPayable : 0,
            pendingAmountInr: isDisbursed ? 0 : totalPayable,
            paymentStatus: isDisbursed
              ? CompensationPaymentStatus.DISBURSED
              : CompensationPaymentStatus.APPROVED,
            bankReferenceMasked: 'SBI A/C •••• 5842 (PFMS Mapped)',
            remarks: `${DEMO_LABEL} 100% entitlement share.`,
          },
        });

        // Payment Transaction if Disbursed
        if (isDisbursed) {
          const txRef = `TXN-PFMS-${p.surveyNumber}`;
          await prisma.compensationPaymentTransaction.upsert({
            where: { transactionReference: txRef },
            update: {
              amountInr: totalPayable,
              paymentStatus: CompensationPaymentStatus.DISBURSED,
              transactedAt: new Date('2025-10-15T11:30:00Z'),
            },
            create: {
              assessmentId: compAssessment.id,
              entitlementId: loComp.id,
              landownerId: p.ownerId,
              transactionReference: txRef,
              amountInr: totalPayable,
              paymentStatus: CompensationPaymentStatus.DISBURSED,
              paymentMethod: 'PFMS_DBT',
              recordedById: financeOfficer?.id || defaultActorId,
              remarks: `${DEMO_LABEL} Direct Benefit Transfer via PFMS Treasury gateway.`,
              transactedAt: new Date('2025-10-15T11:30:00Z'),
            },
          });
        }
      }

      // 7. Possession Record (For projects at or beyond POSSESSION)
      if (
        project.status === ProjectStatus.POSSESSION_PENDING ||
        project.status === ProjectStatus.POSSESSION_COMPLETED ||
        project.status === ProjectStatus.COMPLETED
      ) {
        const isPossessionTaken =
          project.status === ProjectStatus.POSSESSION_COMPLETED ||
          project.status === ProjectStatus.COMPLETED;

        const possRecord = await prisma.possessionRecord.upsert({
          where: {
            projectId_parcelId: {
              projectId: project.id,
              parcelId: parcel.id,
            },
          },
          update: {
            possessionStatus: isPossessionTaken
              ? PossessionStatus.POSSESSION_TAKEN
              : PossessionStatus.POSSESSION_PENDING,
            possessionType: PossessionType.STATUTORY,
            landAreaHectares: p.areaHectares,
            landClassification: p.landType,
            assignedOfficerId: districtOfficer?.id || defaultActorId,
            scheduledDate: new Date('2025-11-20T00:00:00Z'),
            noticeDate: new Date('2025-10-25T00:00:00Z'),
            noticeReference: `NOT-SEC38-${p.surveyNumber}`,
            siteVerificationDate: new Date('2025-11-10T00:00:00Z'),
            siteVerificationOfficer: 'Shri V. S. Patil (CALA Inspector)',
            siteVerificationResult: SiteVerificationResult.VERIFIED,
            possessionDate: isPossessionTaken ? new Date('2025-12-05T00:00:00Z') : null,
            certificateId: isPossessionTaken ? `CERT-POSS-${p.surveyNumber}` : null,
            certificateDate: isPossessionTaken ? new Date('2025-12-05T00:00:00Z') : null,
            compensationStatus: 'DISBURSED',
            totalCompensationInr: p.compensationInr,
            disbursedCompensationInr: p.compensationInr,
            pendingCompensationInr: 0,
            readinessStatus: 'READY',
            remarks: `${DEMO_LABEL} Section 38 statutory physical possession.`,
          },
          create: {
            projectId: project.id,
            parcelId: parcel.id,
            possessionStatus: isPossessionTaken
              ? PossessionStatus.POSSESSION_TAKEN
              : PossessionStatus.POSSESSION_PENDING,
            possessionType: PossessionType.STATUTORY,
            landAreaHectares: p.areaHectares,
            landClassification: p.landType,
            assignedOfficerId: districtOfficer?.id || defaultActorId,
            scheduledDate: new Date('2025-11-20T00:00:00Z'),
            noticeDate: new Date('2025-10-25T00:00:00Z'),
            noticeReference: `NOT-SEC38-${p.surveyNumber}`,
            siteVerificationDate: new Date('2025-11-10T00:00:00Z'),
            siteVerificationOfficer: 'Shri V. S. Patil (CALA Inspector)',
            siteVerificationResult: SiteVerificationResult.VERIFIED,
            possessionDate: isPossessionTaken ? new Date('2025-12-05T00:00:00Z') : null,
            certificateId: isPossessionTaken ? `CERT-POSS-${p.surveyNumber}` : null,
            certificateDate: isPossessionTaken ? new Date('2025-12-05T00:00:00Z') : null,
            compensationStatus: 'DISBURSED',
            totalCompensationInr: p.compensationInr,
            disbursedCompensationInr: p.compensationInr,
            pendingCompensationInr: 0,
            readinessStatus: 'READY',
            remarks: `${DEMO_LABEL} Section 38 statutory physical possession.`,
            metadata: { disclaimer: DEMO_LABEL },
          },
        });
        totalPossessionCreated++;

        // Checklist Item
        const existingChecklist = await prisma.possessionChecklistItem.findFirst({
          where: { possessionId: possRecord.id },
        });
        if (!existingChecklist) {
          await prisma.possessionChecklistItem.create({
            data: {
              possessionId: possRecord.id,
              label: '100% Compensation Disbursed and PFMS DBT verified',
              status: 'MET',
              supportingRef: `TXN-PFMS-${p.surveyNumber}`,
              isBlocking: true,
              notes: `${DEMO_LABEL} Verification complete.`,
            },
          });
        }
      }
    }

    // 8. R&R Case (For R&R in Progress / Completed Projects)
    if (
      project.status === ProjectStatus.R_AND_R_IN_PROGRESS ||
      project.status === ProjectStatus.COMPLETED
    ) {
      const rnrCaseNum = `RNR-${prj.code}`;
      const isRnrCompleted = project.status === ProjectStatus.COMPLETED;
      const rnrCase = await prisma.rAndRCase.upsert({
        where: { caseNumber: rnrCaseNum },
        update: {
          status: isRnrCompleted ? RAndRStatus.COMPLETED : RAndRStatus.BENEFIT_IN_PROGRESS,
          eligibilityStatus: RAndREligibilityStatus.ELIGIBLE,
          totalAffectedFamilies: 12,
          totalEligibleFamilies: 12,
          benefitsApprovedInr: 60000000,
          benefitsDeliveredInr: isRnrCompleted ? 60000000 : 30000000,
          relocationStatus: isRnrCompleted ? RelocationStatus.COMPLETED : RelocationStatus.IN_PROGRESS,
          rAndRCompletionPercentage: isRnrCompleted ? 100.0 : 50.0,
          remarks: `${DEMO_LABEL} Resettlement colony site infrastructure development under RFCTLARR Section 31-42.`,
        },
        create: {
          caseNumber: rnrCaseNum,
          projectId: project.id,
          status: isRnrCompleted ? RAndRStatus.COMPLETED : RAndRStatus.BENEFIT_IN_PROGRESS,
          eligibilityStatus: RAndREligibilityStatus.ELIGIBLE,
          totalAffectedFamilies: 12,
          totalEligibleFamilies: 12,
          benefitsApprovedInr: 60000000,
          benefitsDeliveredInr: isRnrCompleted ? 60000000 : 30000000,
          relocationStatus: isRnrCompleted ? RelocationStatus.COMPLETED : RelocationStatus.IN_PROGRESS,
          rAndRCompletionPercentage: isRnrCompleted ? 100.0 : 50.0,
          remarks: `${DEMO_LABEL} Resettlement colony site infrastructure development under RFCTLARR Section 31-42.`,
          metadata: { disclaimer: DEMO_LABEL },
        },
      });
      totalRandrCreated++;

      // Household
      const firstParcel = await prisma.parcel.findFirst({ where: { projectId: project.id } });
      if (firstParcel) {
        const hhRef = `HH-${prj.code}-001`;
        await prisma.affectedHousehold.upsert({
          where: { householdReference: hhRef },
          update: {
            headOfHouseholdName: 'Santosh Patil (Synthetic Demo)',
            familySize: 5,
            affectedMembers: 5,
            vulnerableMemberCount: 1,
            livelihoodType: 'AGRICULTURE',
            relocationRequired: true,
            documentationStatus: 'COMPLETE',
          },
          create: {
            householdReference: hhRef,
            rAndRCaseId: rnrCase.id,
            projectId: project.id,
            parcelId: firstParcel.id,
            headOfHouseholdName: 'Santosh Patil (Synthetic Demo)',
            village: firstParcel.village,
            district: firstParcel.district,
            familySize: 5,
            affectedMembers: 5,
            vulnerableMemberCount: 1,
            livelihoodType: 'AGRICULTURE',
            relocationRequired: true,
            documentationStatus: 'COMPLETE',
            metadata: { disclaimer: DEMO_LABEL },
          },
        });
      }

      // R&R Benefit
      const existingBenefit = await prisma.rAndRBenefit.findFirst({
        where: { rAndRCaseId: rnrCase.id },
      });
      if (!existingBenefit) {
        await prisma.rAndRBenefit.create({
          data: {
            rAndRCaseId: rnrCase.id,
            benefitType: RAndRBenefitType.HOUSING_ASSISTANCE,
            status: isRnrCompleted ? RAndRBenefitStatus.DELIVERED : RAndRBenefitStatus.IN_PROGRESS,
            plannedValueInr: 60000000,
            approvedValueInr: 60000000,
            deliveredValueInr: isRnrCompleted ? 60000000 : 30000000,
            responsibleOfficerId: randrOfficer?.id || defaultActorId,
            remarks: `${DEMO_LABEL} Resettlement housing entitlement grant.`,
          },
        });
      }
    }
  }

  console.log('✅ Realistic Demo Data Seeding Completed Successfully:');
  console.log(`   - Projects: ${demoProjects.length} (5 Karnataka [KA-AREA-01], 5 Maharashtra [MH-AREA-01])`);
  console.log(`   - Parcels: ${totalParcelsCreated}`);
  console.log(`   - Documents: ${totalDocsCreated}`);
  console.log(`   - Workflow Tasks: ${totalTasksCreated}`);
  console.log(`   - Compensation Assessments: ${totalCompensationCreated}`);
  console.log(`   - Possession Records: ${totalPossessionCreated}`);
  console.log(`   - R&R Cases: ${totalRandrCreated}`);
}

if (require.main === module) {
  seedDemoData()
    .catch((e) => {
      console.error('❌ Error during demo seed execution:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
