import { AccountType, UserRole } from '@prisma/client';

export interface JwtAccessPayload {
  sub: string;
  userId: string;
  accountType: AccountType;
  role: UserRole;
  organizationId: string;
  tokenType: 'access';
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  userId: string;
  sessionId: string;
  tokenType: 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  role: UserRole;
  designation: string;
  organizationId: string;
  avatarUrl?: string | null;
  isActive: boolean;
}
