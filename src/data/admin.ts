/**
 * @file admin.ts
 * @description Mock data and fixture items for Admin Users, Roles, and Audit Logs.
 */

export interface OperatorUser {
  id: string
  name: string
  email: string
  initials: string
  avatar?: string
  role: string
  roleLabel: string
  department: string
  mfaType: string
  status: "active" | "pending" | "suspended" | string
  lastSession: string
  ingressIp: string
  location: string
}

export const ADMIN_OPERATORS: OperatorUser[] = [
  {
    id: "usr_adm_01",
    name: "Sarah Jenkins",
    email: "sarah.j@apexcommerce.io",
    initials: "SJ",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "super_admin",
    roleLabel: "Super Admin",
    department: "Operations & Security Engineering",
    mfaType: "FIDO2 YubiKey 5C",
    status: "active",
    lastSession: "Active Now",
    ingressIp: "198.51.100.42",
    location: "New York, US",
  },
  {
    id: "usr_adm_02",
    name: "Marcus Vance",
    email: "marcus.v@apexcommerce.io",
    initials: "MV",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "finance_lead",
    roleLabel: "Finance Lead",
    department: "Treasury & Reconciliations",
    mfaType: "TOTP Authenticator",
    status: "active",
    lastSession: "14m ago",
    ingressIp: "203.0.113.88",
    location: "London, UK",
  },
  {
    id: "usr_adm_03",
    name: "Elena Rostova",
    email: "elena.r@apexcommerce.io",
    initials: "ER",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "ops_director",
    roleLabel: "Operations Director",
    department: "Logistics & Fulfillment",
    mfaType: "Hardware Token",
    status: "active",
    lastSession: "1h ago",
    ingressIp: "198.51.100.99",
    location: "Berlin, DE",
  },
]

export interface AuditLogEntry {
  id: string
  action: string
  actor: string
  actorEmail: string
  resource: string
  resourceId: string
  ipAddress: string
  timestamp: string
  status: "success" | "denied" | "warning" | string
}

export const ADMIN_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud_90821",
    action: "refund.issued",
    actor: "Marcus Vance",
    actorEmail: "marcus.v@apexcommerce.io",
    resource: "OrderRefund",
    resourceId: "ref_89201A ($189.00)",
    ipAddress: "203.0.113.88",
    timestamp: "14:10:02 EST",
    status: "success",
  },
  {
    id: "aud_90820",
    action: "role.permission_changed",
    actor: "Sarah Jenkins",
    actorEmail: "sarah.j@apexcommerce.io",
    resource: "UserRole",
    resourceId: "usr_adm_02 (Finance Lead)",
    ipAddress: "198.51.100.42",
    timestamp: "13:42:19 EST",
    status: "success",
  },
  {
    id: "aud_90819",
    action: "api_key.created",
    actor: "Elena Rostova",
    actorEmail: "elena.r@apexcommerce.io",
    resource: "WarehouseAPIKey",
    resourceId: "key_east1_sync",
    ipAddress: "198.51.100.99",
    timestamp: "12:15:44 EST",
    status: "success",
  },
]
