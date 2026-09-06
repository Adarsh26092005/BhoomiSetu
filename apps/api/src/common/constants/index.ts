// ==============================================================================
// NLAMS — National Land Acquisition & Management System
// Locked Domain Constants & Enums
// ==============================================================================

/**
 * Locked System User Roles (12 Roles)
 * STRICT RULE: Do not invent or rename domain roles.
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CENTRAL_OFFICER = 'CENTRAL_OFFICER',
  STATE_OFFICER = 'STATE_OFFICER',
  DISTRICT_OFFICER = 'DISTRICT_OFFICER',
  PROJECT_IMPLEMENTING_AGENCY = 'PROJECT_IMPLEMENTING_AGENCY',
  LAND_ACQUISITION_OFFICER = 'LAND_ACQUISITION_OFFICER',
  SURVEY_OFFICER = 'SURVEY_OFFICER',
  REVENUE_OFFICER = 'REVENUE_OFFICER',
  VERIFICATION_OFFICER = 'VERIFICATION_OFFICER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  R_AND_R_OFFICER = 'R_AND_R_OFFICER',
  VIEWER = 'VIEWER',
}

/**
 * Account Categories
 * Differentiates Government Officers from Project Implementing Agency / Company accounts.
 */
export enum AccountType {
  GOVERNMENT_OFFICER = 'GOVERNMENT_OFFICER',
  PIA_USER = 'PIA_USER',
}

/**
 * Locked Organization Types (4 Types)
 * Role and Organization Type are distinct concepts.
 */
export enum OrganizationType {
  CENTRAL_MINISTRY = 'CENTRAL_MINISTRY',
  STATE_AUTHORITY = 'STATE_AUTHORITY',
  DISTRICT_AUTHORITY = 'DISTRICT_AUTHORITY',
  PROJECT_IMPLEMENTING_AGENCY = 'PROJECT_IMPLEMENTING_AGENCY',
}

/**
 * Organization Registration & Approval Lifecycle Statuses
 */
export enum OrganizationStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Locked Project Acquisition Lifecycle Statuses (17 Statuses)
 * STRICT RULE: Do not invent or rename project statuses.
 */
export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_SCRUTINY = 'UNDER_SCRUTINY',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  DISTRICT_APPROVAL = 'DISTRICT_APPROVAL',
  STATE_APPROVAL = 'STATE_APPROVAL',
  CENTRAL_APPROVAL = 'CENTRAL_APPROVAL',
  NOTIFICATION_ISSUED = 'NOTIFICATION_ISSUED',
  AWARD_DECLARED = 'AWARD_DECLARED',
  COMPENSATION_ASSESSED = 'COMPENSATION_ASSESSED',
  COMPENSATION_DISBURSED = 'COMPENSATION_DISBURSED',
  POSSESSION_PENDING = 'POSSESSION_PENDING',
  POSSESSION_COMPLETED = 'POSSESSION_COMPLETED',
  R_AND_R_IN_PROGRESS = 'R_AND_R_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

/**
 * Locked Cadastral Parcel Lifecycle Statuses (10 Statuses)
 * STRICT RULE: Do not invent or rename parcel statuses.
 */
export enum ParcelStatus {
  IDENTIFIED = 'IDENTIFIED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFIED = 'VERIFIED',
  DISPUTED = 'DISPUTED',
  UNDER_ACQUISITION = 'UNDER_ACQUISITION',
  AWARD_DECLARED = 'AWARD_DECLARED',
  COMPENSATION_PENDING = 'COMPENSATION_PENDING',
  COMPENSATION_PAID = 'COMPENSATION_PAID',
  POSSESSION_PENDING = 'POSSESSION_PENDING',
  POSSESSION_TAKEN = 'POSSESSION_TAKEN',
}

export const API_VERSION = 'v1';
export const DEFAULT_API_PREFIX = 'api/v1';
