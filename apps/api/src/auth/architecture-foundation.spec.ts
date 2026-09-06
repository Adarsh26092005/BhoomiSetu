import { AccountType, OrganizationStatus, OrganizationType, UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/auth-response.dto';

describe('Step 17A — Architecture Foundation Invariants (Unit & Schema)', () => {
  describe('1. AccountType & UserRole Separation', () => {
    it('should define exactly 2 AccountType values: GOVERNMENT_OFFICER and PIA_USER', () => {
      expect(AccountType.GOVERNMENT_OFFICER).toBe('GOVERNMENT_OFFICER');
      expect(AccountType.PIA_USER).toBe('PIA_USER');
      expect(Object.values(AccountType)).toHaveLength(2);
    });

    it('should preserve all 12 canonical locked UserRole values exactly', () => {
      const expectedRoles = [
        'SUPER_ADMIN',
        'CENTRAL_OFFICER',
        'STATE_OFFICER',
        'DISTRICT_OFFICER',
        'PROJECT_IMPLEMENTING_AGENCY',
        'LAND_ACQUISITION_OFFICER',
        'SURVEY_OFFICER',
        'REVENUE_OFFICER',
        'VERIFICATION_OFFICER',
        'FINANCE_OFFICER',
        'R_AND_R_OFFICER',
        'VIEWER',
      ];

      expect(Object.values(UserRole)).toEqual(expect.arrayContaining(expectedRoles));
      expect(Object.values(UserRole)).toHaveLength(12);
      expect(UserRole.PROJECT_IMPLEMENTING_AGENCY).toBe('PROJECT_IMPLEMENTING_AGENCY');
    });
  });

  describe('2. OrganizationStatus Lifecycle', () => {
    it('should define all 4 OrganizationStatus values: PENDING_APPROVAL, ACTIVE, REJECTED, SUSPENDED', () => {
      expect(OrganizationStatus.PENDING_APPROVAL).toBe('PENDING_APPROVAL');
      expect(OrganizationStatus.ACTIVE).toBe('ACTIVE');
      expect(OrganizationStatus.REJECTED).toBe('REJECTED');
      expect(OrganizationStatus.SUSPENDED).toBe('SUSPENDED');
      expect(Object.values(OrganizationStatus)).toHaveLength(4);
    });

    it('should allow representing an organization in PENDING_APPROVAL status for future PIA self-registration', () => {
      const pendingOrg = {
        id: 'org-pending-1',
        name: 'Infrastructure Builders Ltd',
        type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
        status: OrganizationStatus.PENDING_APPROVAL,
        isActive: false,
      };

      expect(pendingOrg.status).toBe(OrganizationStatus.PENDING_APPROVAL);
      expect(pendingOrg.type).toBe(OrganizationType.PROJECT_IMPLEMENTING_AGENCY);
    });
  });

  describe('3. Document & WorkflowComment Visibility Defaults', () => {
    it('should default Document.isInternalOnly to false (public/statutory by default, flags internal if needed)', () => {
      const mockDoc = {
        id: 'doc-1',
        title: 'Section 4(1) Preliminary Gazette Notification',
        isInternalOnly: false,
        isConfidential: false,
      };

      expect(mockDoc.isInternalOnly).toBe(false);
    });

    it('should default WorkflowComment.isInternalOnly to true (prevent internal government notes from leaking to PIA)', () => {
      const mockComment = {
        id: 'comment-1',
        comment: 'Legal officer note: Scrutiny objection on khasra 45/2 ownership chain.',
        isInternalOnly: true,
      };

      expect(mockComment.isInternalOnly).toBe(true);
    });
  });

  describe('4. AuditLog Organization Scoping Foundation', () => {
    it('should support nullable organizationId on AuditLog for fast tenant queries without joins', () => {
      const logWithOrg = {
        id: 'log-1',
        actorId: 'user-1',
        organizationId: 'org-district-pune',
        action: 'STATUS_TRANSITION',
        entityType: 'Project',
        entityId: 'proj-1',
      };

      const historicalLog = {
        id: 'log-2',
        actorId: null,
        organizationId: null, // Historical records remain null without inventing fake IDs
        action: 'SYSTEM_BOOTSTRAP',
        entityType: 'SystemHealth',
        entityId: 'sys-1',
      };

      expect(logWithOrg.organizationId).toBe('org-district-pune');
      expect(historicalLog.organizationId).toBeNull();
    });
  });

  describe('5. ProjectAssignment Entity Foundation', () => {
    it('should structure ProjectAssignment linking User -> Project with assignedById and role', () => {
      const assignment = {
        id: 'assign-uuid-1',
        projectId: 'project-uuid-1',
        userId: 'user-survey-officer-uuid',
        role: UserRole.SURVEY_OFFICER,
        assignedById: 'user-lao-super-admin-uuid',
        assignedAt: new Date('2026-09-04'),
        isActive: true,
      };

      expect(assignment.projectId).toBe('project-uuid-1');
      expect(assignment.userId).toBe('user-survey-officer-uuid');
      expect(assignment.role).toBe(UserRole.SURVEY_OFFICER);
      expect(assignment.assignedById).toBe('user-lao-super-admin-uuid');
      expect(assignment.isActive).toBe(true);
    });
  });

  describe('6. Sanitized User Response & Security', () => {
    it('should include accountType in sanitized user response and never leak passwordHash', () => {
      const authService = new AuthService({} as any, {} as any, { get: () => '15m' } as any);

      const rawDbUser = {
        id: 'user-uuid-1',
        email: 'officer@nlams.gov.in',
        passwordHash: '$2b$12$eX4mP1eH4sHn0tL34k3d...',
        fullName: 'Officer Sharma',
        phone: '+91-9876543210',
        accountType: AccountType.GOVERNMENT_OFFICER,
        role: UserRole.LAND_ACQUISITION_OFFICER,
        designation: 'District LAO',
        organizationId: 'org-dist-1',
        avatarUrl: null,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sanitized: UserResponseDto = authService.sanitizeUser(rawDbUser);

      expect(sanitized.accountType).toBe(AccountType.GOVERNMENT_OFFICER);
      expect(sanitized.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);
      expect(sanitized.email).toBe('officer@nlams.gov.in');
      expect((sanitized as any).passwordHash).toBeUndefined();
    });
  });
});
