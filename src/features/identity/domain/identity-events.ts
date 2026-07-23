export const IDENTITY_EVENTS = {
  USER_REGISTERED: "identity.user_registered",
  BUSINESS_PROFILE_CREATED: "identity.business_profile_created",
  BUSINESS_SUBMITTED: "identity.business_submitted",
  BUSINESS_APPROVED: "identity.business_approved",
  BUSINESS_REJECTED: "identity.business_rejected",
  ROLE_ASSIGNED: "identity.role_assigned",
  PROFILE_UPDATED: "identity.profile_updated",
  PASSWORD_CHANGED: "identity.password_changed",
  LOGIN_SUCCESS: "identity.login_success",
  LOGOUT: "identity.logout",
  EMAIL_VERIFIED: "identity.email_verified",
  PHONE_VERIFIED: "identity.phone_verified",
  STORE_CREATED: "identity.store_created",
  STORE_UPDATED: "identity.store_updated",
  WORKSPACE_CREATED: "identity.workspace_created",
  MEMBERSHIP_APPLIED: "identity.membership_applied",
  MEMBERSHIP_APPROVED: "identity.membership_approved",
  MEMBERSHIP_REJECTED: "identity.membership_rejected",
  MEMBERSHIP_SUSPENDED: "identity.membership_suspended",
  MEMBERSHIP_ACTIVATED: "identity.membership_activated",
  MEMBERSHIP_ARCHIVED: "identity.membership_archived",
} as const;

export type IdentityEventType = (typeof IDENTITY_EVENTS)[keyof typeof IDENTITY_EVENTS];

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
  userType: string;
  registeredAt: string;
}

export interface BusinessProfileCreatedPayload {
  businessProfileId: string;
  userId: string;
  businessName: string;
  userType: string;
}

export interface BusinessSubmittedPayload {
  businessProfileId: string;
  userId: string;
  businessName: string;
  userType: string;
}

export interface BusinessApprovedPayload {
  businessProfileId: string;
  userId: string;
  businessName: string;
  userType: string;
  approvedBy: string;
  approvedAt: string;
}

export interface BusinessRejectedPayload {
  businessProfileId: string;
  userId: string;
  businessName: string;
  userType: string;
  reason: string;
  rejectedBy: string;
}

export interface RoleAssignedPayload {
  userId: string;
  newRole: string;
  oldRole?: string;
  assignedBy: string;
}

export interface ProfileUpdatedPayload {
  userId: string;
  changedFields: string[];
}

export interface PasswordChangedPayload {
  userId: string;
  changedAt: string;
}

export interface LoginSuccessPayload {
  userId: string;
  role: string;
  ip: string;
  userAgent: string;
}

export interface LogoutPayload {
  userId: string;
  sessionId: string;
}

export interface EmailVerifiedPayload {
  userId: string;
  email: string;
}

export interface PhoneVerifiedPayload {
  userId: string;
  phone: string;
}

export interface StoreCreatedPayload {
  storeProfileId: string;
  storeName: string;
  businessProfileId: string;
}

export interface StoreUpdatedPayload {
  storeProfileId: string;
  changedFields: string[];
}

export interface WorkspaceCreatedPayload {
  workspaceId: string;
  businessProfileId: string;
  userId: string;
}

export type IdentityEventPayloads = {
  [IDENTITY_EVENTS.USER_REGISTERED]: UserRegisteredPayload;
  [IDENTITY_EVENTS.BUSINESS_PROFILE_CREATED]: BusinessProfileCreatedPayload;
  [IDENTITY_EVENTS.BUSINESS_SUBMITTED]: BusinessSubmittedPayload;
  [IDENTITY_EVENTS.BUSINESS_APPROVED]: BusinessApprovedPayload;
  [IDENTITY_EVENTS.BUSINESS_REJECTED]: BusinessRejectedPayload;
  [IDENTITY_EVENTS.ROLE_ASSIGNED]: RoleAssignedPayload;
  [IDENTITY_EVENTS.PROFILE_UPDATED]: ProfileUpdatedPayload;
  [IDENTITY_EVENTS.PASSWORD_CHANGED]: PasswordChangedPayload;
  [IDENTITY_EVENTS.LOGIN_SUCCESS]: LoginSuccessPayload;
  [IDENTITY_EVENTS.LOGOUT]: LogoutPayload;
  [IDENTITY_EVENTS.EMAIL_VERIFIED]: EmailVerifiedPayload;
  [IDENTITY_EVENTS.PHONE_VERIFIED]: PhoneVerifiedPayload;
  [IDENTITY_EVENTS.STORE_CREATED]: StoreCreatedPayload;
  [IDENTITY_EVENTS.STORE_UPDATED]: StoreUpdatedPayload;
  [IDENTITY_EVENTS.WORKSPACE_CREATED]: WorkspaceCreatedPayload;
};
