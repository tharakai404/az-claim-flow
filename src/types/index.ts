// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'CALL_CENTER_AGENT'
  | 'VIRTUAL_ASSESSOR'
  | 'PHYSICAL_ASSESSOR'
  | 'DESK_ENGINEER'
  | 'GARAGE_COORDINATOR'
  | 'CLAIM_EXPERT'
  | 'FRAUD_ANALYST'
  | 'NORMAL_PROCESSOR'
  | 'SUPERVISOR'
  | 'ADMIN'
  | 'CUSTOMER';

export type UserStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'ON_LEAVE' | 'OFFLINE';

export type Team =
  | 'CALL_CENTER'
  | 'VIRTUAL_ASSESSOR'
  | 'PHYSICAL_ASSESSOR'
  | 'DESK_ENGINEERS'
  | 'GARAGE_COORDINATOR'
  | 'CLAIM_EXPERT'
  | 'FRAUD_MANAGEMENT'
  | 'NORMAL_PROCESSING';

export type ClaimCategory = 'SIMPLE' | 'CORE' | 'COMPLEX';

export type ClaimStatus =
  | 'NOT_ASSIGNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER_RESPONSE'
  | 'WAITING_ESTIMATE'
  | 'VIRTUAL_INSPECTION'
  | 'PHYSICAL_INSPECTION_REQUESTED'
  | 'PHYSICAL_INSPECTION_IN_PROGRESS'
  | 'OFFER_GENERATED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'ESTIMATE_UNDER_REVIEW'
  | 'ESTIMATE_APPROVED'
  | 'GARAGE_INSPECTION_SCHEDULED'
  | 'GARAGE_INSPECTION_IN_PROGRESS'
  | 'FRAUD_REVIEW'
  | 'EXPERT_REVIEW'
  | 'PAYMENT_PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'PENDING';

export type QueueType =
  | 'INCOMING'
  | 'OUTGOING'
  | 'PENDING'
  | 'ACTION_REQUIRED'
  | 'COMPLETED';

export type DocumentStatus = 'REQUESTED' | 'UPLOADED' | 'APPROVED' | 'REJECTED';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
export type LiabilityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type FraudStatus = 'CLEAR' | 'SUSPECT' | 'CONFIRMED';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: Team;
  status: UserStatus;
  avatar?: string;
  activeClaims: number;
  lastRoundRobinIndex?: number;
}

export interface Policy {
  policyNumber: string;
  policyHolderName: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  coverageType: string;
  deductible: number;
  sumInsured: number;
  expiryDate: string;
  isActive: boolean;
}

export interface AccidentDetails {
  dateTime: string;
  location: string;
  description: string;
  thirdPartyInvolved: boolean;
  policeReportNumber?: string;
  injuriesReported: boolean;
}

export interface Assignment {
  id: string;
  claimId: string;
  assignedTo: string; // userId
  assignedToName: string;
  assignedToTeam: Team;
  assignedBy: string; // userId
  assignedByName: string;
  reason: string;
  timestamp: string;
  isActive: boolean;
}

export interface Document {
  id: string;
  claimId: string;
  name: string;
  type: string;
  requestedBy?: string;
  requestedAt?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  status: DocumentStatus;
  url?: string;
  notes?: string;
}

export interface Offer {
  id: string;
  claimId: string;
  amount: number;
  generatedAt: string;
  generatedBy: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  garageEstimateUrl?: string;
}

export interface Inspection {
  id: string;
  claimId: string;
  type: 'SELF' | 'VIRTUAL' | 'PHYSICAL' | 'GARAGE';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledAt?: string;
  completedAt?: string;
  assignedTo?: string;
  location?: string;
  liabilityStatus: LiabilityStatus;
  fraudStatus: FraudStatus;
  notes?: string;
  estimateAmount?: number;
}

export interface TimelineEvent {
  id: string;
  claimId: string;
  event: string;
  description: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  status?: ClaimStatus;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  claimId?: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface SLA {
  claimId: string;
  targetHours: number;
  startedAt: string;
  dueAt: string;
  completedAt?: string;
  isBreached: boolean;
  remainingHours: number;
}

export interface Claim {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  category?: ClaimCategory;
  policy: Policy;
  accident: AccidentDetails;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerToken: string; // secure token for portal access
  createdAt: string;
  updatedAt: string;
  assignments: Assignment[];
  currentAssignees: string[]; // userIds
  documents: Document[];
  timeline: TimelineEvent[];
  inspections: Inspection[];
  offers: Offer[];
  queue: QueueType;
  sla: SLA;
  liabilityStatus: LiabilityStatus;
  fraudStatus: FraudStatus;
  settlementAmount?: number;
  rejectionReason?: string;
  notes?: string;
  tags?: string[];
}

export interface QueueStats {
  incoming: number;
  outgoing: number;
  pending: number;
  actionRequired: number;
  completed: number;
}

export interface DashboardStats {
  totalClaims: number;
  activeClaims: number;
  pendingClaims: number;
  completedToday: number;
  slaBreached: number;
  fraudAlerts: number;
  avgProcessingHours: number;
  paymentsPending: number;
}
