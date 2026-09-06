import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard (Unit)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const all12Roles: UserRole[] = [
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
    UserRole.LAND_ACQUISITION_OFFICER,
    UserRole.SURVEY_OFFICER,
    UserRole.REVENUE_OFFICER,
    UserRole.VERIFICATION_OFFICER,
    UserRole.FINANCE_OFFICER,
    UserRole.R_AND_R_OFFICER,
    UserRole.VIEWER,
  ];

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required on the route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if empty roles array is configured', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if required roles exist but no user is attached to request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.SUPER_ADMIN]);
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow access for each of the 12 canonical roles when authorized', () => {
    for (const role of all12Roles) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([role]);
      const context = createMockContext({
        id: 'test-user-id',
        role: role,
        organizationId: 'org-id-1',
      });
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('should throw ForbiddenException if user role does not match required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER]);

    const context = createMockContext({
      id: 'test-user-id',
      role: UserRole.VIEWER,
      organizationId: 'org-id-1',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      /Access denied: requires one of the following roles \[SUPER_ADMIN, CENTRAL_OFFICER\]/,
    );
  });
});
