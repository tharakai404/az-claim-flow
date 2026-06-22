import { User, Claim, Notification } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ─── Users ────────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  // Call Center
  { id: 'u1', name: 'Sara Al Mansoori', email: 'sara@insure.ae', role: 'CALL_CENTER_AGENT', team: 'CALL_CENTER', status: 'AVAILABLE', activeClaims: 4 },
  { id: 'u2', name: 'Ahmed Hassan', email: 'ahmed@insure.ae', role: 'CALL_CENTER_AGENT', team: 'CALL_CENTER', status: 'BUSY', activeClaims: 7 },
  { id: 'u3', name: 'Fatima Al Zaabi', email: 'fatima@insure.ae', role: 'CALL_CENTER_AGENT', team: 'CALL_CENTER', status: 'AVAILABLE', activeClaims: 3 },
  // Virtual Assessors
  { id: 'u4', name: 'Khalid Ibrahim', email: 'khalid@insure.ae', role: 'VIRTUAL_ASSESSOR', team: 'VIRTUAL_ASSESSOR', status: 'AVAILABLE', activeClaims: 5 },
  { id: 'u5', name: 'Mariam Rashid', email: 'mariam@insure.ae', role: 'VIRTUAL_ASSESSOR', team: 'VIRTUAL_ASSESSOR', status: 'AWAY', activeClaims: 2 },
  // Physical Assessors
  { id: 'u6', name: 'Omar Al Farsi', email: 'omar@insure.ae', role: 'PHYSICAL_ASSESSOR', team: 'PHYSICAL_ASSESSOR', status: 'AVAILABLE', activeClaims: 3 },
  { id: 'u7', name: 'Noura Salem', email: 'noura@insure.ae', role: 'PHYSICAL_ASSESSOR', team: 'PHYSICAL_ASSESSOR', status: 'ON_LEAVE', activeClaims: 0 },
  // Desk Engineers
  { id: 'u8', name: 'Yousuf Al Blooshi', email: 'yousuf@insure.ae', role: 'DESK_ENGINEER', team: 'DESK_ENGINEERS', status: 'AVAILABLE', activeClaims: 6 },
  { id: 'u9', name: 'Hessa Al Nuaimi', email: 'hessa@insure.ae', role: 'DESK_ENGINEER', team: 'DESK_ENGINEERS', status: 'AVAILABLE', activeClaims: 4 },
  // Garage Coordinator
  { id: 'u10', name: 'Saeed Al Mazrouei', email: 'saeed@insure.ae', role: 'GARAGE_COORDINATOR', team: 'GARAGE_COORDINATOR', status: 'AVAILABLE', activeClaims: 5 },
  // Claim Expert
  { id: 'u11', name: 'Dr. Ali Al Shamsi', email: 'ali@insure.ae', role: 'CLAIM_EXPERT', team: 'CLAIM_EXPERT', status: 'AVAILABLE', activeClaims: 3 },
  { id: 'u12', name: 'Mona Al Kaabi', email: 'mona@insure.ae', role: 'CLAIM_EXPERT', team: 'CLAIM_EXPERT', status: 'BUSY', activeClaims: 8 },
  // Fraud Management
  { id: 'u13', name: 'Tariq Al Khoori', email: 'tariq@insure.ae', role: 'FRAUD_ANALYST', team: 'FRAUD_MANAGEMENT', status: 'AVAILABLE', activeClaims: 4 },
  // Normal Processing
  { id: 'u14', name: 'Reem Al Hajri', email: 'reem@insure.ae', role: 'NORMAL_PROCESSOR', team: 'NORMAL_PROCESSING', status: 'AVAILABLE', activeClaims: 5 },
  // Admin / Supervisor
  { id: 'u15', name: 'Mohammed Al Ameri', email: 'supervisor@insure.ae', role: 'SUPERVISOR', team: 'CALL_CENTER', status: 'AVAILABLE', activeClaims: 0 },
  { id: 'admin', name: 'System Admin', email: 'admin@insure.ae', role: 'ADMIN', team: 'CALL_CENTER', status: 'AVAILABLE', activeClaims: 0 },
];

export const ASSIGNMENT_REASONS = [
  'Initial Assignment',
  'Expertise Required',
  'Workload Balancing',
  'Escalation',
  'Re-assessment Required',
  'Fraud Investigation',
  'Customer Complaint',
  'SLA Breach Recovery',
  'Supervisor Override',
  'Technical Review',
];

const makeTimeline = (claimId: string) => [
  {
    id: uuidv4(), claimId,
    event: 'Claim Created',
    description: 'Claim initiated by call center agent.',
    actor: 'Sara Al Mansoori', actorRole: 'Call Center Agent',
    timestamp: '2026-06-20T09:00:00Z',
    status: 'NOT_ASSIGNED' as const,
  },
  {
    id: uuidv4(), claimId,
    event: 'Claim Assigned',
    description: 'Claim assigned to Virtual Assessor Team via Round Robin.',
    actor: 'System', actorRole: 'Auto Assignment Engine',
    timestamp: '2026-06-20T09:05:00Z',
    status: 'ASSIGNED' as const,
  },
];

// ─── Claims ───────────────────────────────────────────────────────────────────

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'c1',
    claimNumber: 'CLM-2026-001234',
    status: 'VIRTUAL_INSPECTION',
    category: 'CORE',
    policy: {
      policyNumber: 'POL-AE-2024-88431',
      policyHolderName: 'John Smith',
      vehicleRegistration: 'Dubai A 12345',
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2022,
      coverageType: 'Comprehensive', deductible: 1000, sumInsured: 80000,
      expiryDate: '2026-12-31', isActive: true,
    },
    accident: {
      dateTime: '2026-06-19T14:30:00Z',
      location: 'Sheikh Zayed Road, Dubai',
      description: 'Rear-end collision at traffic light. Minor damage to rear bumper.',
      thirdPartyInvolved: true, policeReportNumber: 'DXB-2026-44521', injuriesReported: false,
    },
    customerId: 'cust1', customerName: 'John Smith',
    customerEmail: 'john.smith@email.com', customerPhone: '+971501234567',
    customerToken: 'tok_c1_secure_abc123',
    createdAt: '2026-06-20T09:00:00Z', updatedAt: '2026-06-20T11:00:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c1', assignedTo: 'u4', assignedToName: 'Khalid Ibrahim', assignedToTeam: 'VIRTUAL_ASSESSOR', assignedBy: 'u1', assignedByName: 'Sara Al Mansoori', reason: 'Initial Assignment', timestamp: '2026-06-20T09:05:00Z', isActive: true },
    ],
    currentAssignees: ['u4'],
    documents: [
      { id: 'd1', claimId: 'c1', name: 'Police Report', type: 'POLICE_REPORT', requestedBy: 'u1', requestedAt: '2026-06-20T09:10:00Z', status: 'UPLOADED', uploadedBy: 'cust1', uploadedAt: '2026-06-20T10:00:00Z' },
    ],
    timeline: makeTimeline('c1'),
    inspections: [
      { id: 'ins1', claimId: 'c1', type: 'VIRTUAL', status: 'IN_PROGRESS', scheduledAt: '2026-06-20T11:00:00Z', assignedTo: 'u4', liabilityStatus: 'PENDING', fraudStatus: 'CLEAR' },
    ],
    offers: [],
    queue: 'INCOMING',
    sla: { claimId: 'c1', targetHours: 48, startedAt: '2026-06-20T09:00:00Z', dueAt: '2026-06-22T09:00:00Z', isBreached: false, remainingHours: 10 },
    liabilityStatus: 'PENDING', fraudStatus: 'CLEAR',
  },
  {
    id: 'c2',
    claimNumber: 'CLM-2026-001235',
    status: 'WAITING_CUSTOMER_RESPONSE',
    category: 'SIMPLE',
    policy: {
      policyNumber: 'POL-AE-2024-77320',
      policyHolderName: 'Aisha Rahman',
      vehicleRegistration: 'Abu Dhabi C 54321',
      vehicleMake: 'Nissan', vehicleModel: 'Patrol', vehicleYear: 2021,
      coverageType: 'Comprehensive', deductible: 1500, sumInsured: 120000,
      expiryDate: '2027-03-15', isActive: true,
    },
    accident: {
      dateTime: '2026-06-18T08:45:00Z',
      location: 'Al Wasl Road, Dubai',
      description: 'Single vehicle minor incident. Scratches on front bumper.',
      thirdPartyInvolved: false, injuriesReported: false,
    },
    customerId: 'cust2', customerName: 'Aisha Rahman',
    customerEmail: 'aisha.r@email.com', customerPhone: '+971502345678',
    customerToken: 'tok_c2_secure_def456',
    createdAt: '2026-06-18T10:00:00Z', updatedAt: '2026-06-18T10:15:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c2', assignedTo: 'u3', assignedToName: 'Fatima Al Zaabi', assignedToTeam: 'CALL_CENTER', assignedBy: 'u1', assignedByName: 'Sara Al Mansoori', reason: 'Initial Assignment', timestamp: '2026-06-18T10:05:00Z', isActive: true },
    ],
    currentAssignees: ['u3'],
    documents: [
      { id: 'd2', claimId: 'c2', name: 'Accident Photos', type: 'PHOTOS', requestedBy: 'u3', requestedAt: '2026-06-18T10:15:00Z', status: 'REQUESTED' },
    ],
    timeline: makeTimeline('c2'),
    inspections: [
      { id: 'ins2', claimId: 'c2', type: 'SELF', status: 'SCHEDULED', assignedTo: 'cust2', liabilityStatus: 'PENDING', fraudStatus: 'CLEAR' },
    ],
    offers: [],
    queue: 'ACTION_REQUIRED',
    sla: { claimId: 'c2', targetHours: 24, startedAt: '2026-06-18T10:00:00Z', dueAt: '2026-06-19T10:00:00Z', isBreached: true, remainingHours: -14 },
    liabilityStatus: 'PENDING', fraudStatus: 'CLEAR',
  },
  {
    id: 'c3',
    claimNumber: 'CLM-2026-001236',
    status: 'FRAUD_REVIEW',
    category: 'COMPLEX',
    policy: {
      policyNumber: 'POL-AE-2023-55199',
      policyHolderName: 'Robert Chen',
      vehicleRegistration: 'Sharjah B 98765',
      vehicleMake: 'BMW', vehicleModel: '5 Series', vehicleYear: 2023,
      coverageType: 'Comprehensive', deductible: 2000, sumInsured: 200000,
      expiryDate: '2026-09-30', isActive: true,
    },
    accident: {
      dateTime: '2026-06-15T22:00:00Z',
      location: 'Emirates Road, Sharjah',
      description: 'Claimed collision with unknown vehicle. Significant damage reported.',
      thirdPartyInvolved: true, injuriesReported: true,
    },
    customerId: 'cust3', customerName: 'Robert Chen',
    customerEmail: 'r.chen@email.com', customerPhone: '+971503456789',
    customerToken: 'tok_c3_secure_ghi789',
    createdAt: '2026-06-16T09:00:00Z', updatedAt: '2026-06-20T14:00:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c3', assignedTo: 'u13', assignedToName: 'Tariq Al Khoori', assignedToTeam: 'FRAUD_MANAGEMENT', assignedBy: 'u6', assignedByName: 'Omar Al Farsi', reason: 'Fraud Investigation', timestamp: '2026-06-17T10:00:00Z', isActive: true },
    ],
    currentAssignees: ['u13'],
    documents: [],
    timeline: makeTimeline('c3'),
    inspections: [
      { id: 'ins3', claimId: 'c3', type: 'PHYSICAL', status: 'COMPLETED', completedAt: '2026-06-17T15:00:00Z', assignedTo: 'u6', liabilityStatus: 'PENDING', fraudStatus: 'SUSPECT', notes: 'Damage pattern inconsistent with reported accident scenario.' },
    ],
    offers: [],
    queue: 'IN_PROGRESS' as any,
    sla: { claimId: 'c3', targetHours: 96, startedAt: '2026-06-16T09:00:00Z', dueAt: '2026-06-20T09:00:00Z', isBreached: true, remainingHours: -30 },
    liabilityStatus: 'PENDING', fraudStatus: 'SUSPECT',
  },
  {
    id: 'c4',
    claimNumber: 'CLM-2026-001237',
    status: 'OFFER_GENERATED',
    category: 'SIMPLE',
    policy: {
      policyNumber: 'POL-AE-2025-11288',
      policyHolderName: 'Layla Mohammed',
      vehicleRegistration: 'Dubai B 33221',
      vehicleMake: 'Honda', vehicleModel: 'Civic', vehicleYear: 2020,
      coverageType: 'Comprehensive', deductible: 500, sumInsured: 45000,
      expiryDate: '2027-01-20', isActive: true,
    },
    accident: {
      dateTime: '2026-06-21T07:30:00Z',
      location: 'Jumeirah Beach Road, Dubai',
      description: 'Minor parking lot collision. Dent on driver door.',
      thirdPartyInvolved: false, injuriesReported: false,
    },
    customerId: 'cust4', customerName: 'Layla Mohammed',
    customerEmail: 'layla.m@email.com', customerPhone: '+971504567890',
    customerToken: 'tok_c4_secure_jkl012',
    createdAt: '2026-06-21T09:00:00Z', updatedAt: '2026-06-21T16:00:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c4', assignedTo: 'u14', assignedToName: 'Reem Al Hajri', assignedToTeam: 'NORMAL_PROCESSING', assignedBy: 'u4', assignedByName: 'Khalid Ibrahim', reason: 'Initial Assignment', timestamp: '2026-06-21T12:00:00Z', isActive: true },
    ],
    currentAssignees: ['u14'],
    documents: [
      { id: 'd4a', claimId: 'c4', name: 'Accident Photos', type: 'PHOTOS', status: 'UPLOADED', uploadedBy: 'cust4', uploadedAt: '2026-06-21T10:00:00Z' },
    ],
    timeline: makeTimeline('c4'),
    inspections: [
      { id: 'ins4', claimId: 'c4', type: 'SELF', status: 'COMPLETED', completedAt: '2026-06-21T11:00:00Z', liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR', estimateAmount: 3200 },
    ],
    offers: [
      { id: 'off1', claimId: 'c4', amount: 2700, generatedAt: '2026-06-21T16:00:00Z', generatedBy: 'u14', expiresAt: '2026-06-28T16:00:00Z', status: 'PENDING' },
    ],
    queue: 'ACTION_REQUIRED',
    sla: { claimId: 'c4', targetHours: 24, startedAt: '2026-06-21T09:00:00Z', dueAt: '2026-06-22T09:00:00Z', isBreached: false, remainingHours: 17 },
    liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR', settlementAmount: 2700,
  },
  {
    id: 'c5',
    claimNumber: 'CLM-2026-001238',
    status: 'ESTIMATE_UNDER_REVIEW',
    category: 'COMPLEX',
    policy: {
      policyNumber: 'POL-AE-2024-66750',
      policyHolderName: 'Peter Williams',
      vehicleRegistration: 'Dubai D 77890',
      vehicleMake: 'Mercedes', vehicleModel: 'E-Class', vehicleYear: 2024,
      coverageType: 'Comprehensive', deductible: 2500, sumInsured: 250000,
      expiryDate: '2026-11-30', isActive: true,
    },
    accident: {
      dateTime: '2026-06-10T16:00:00Z',
      location: 'Al Khail Road, Dubai',
      description: 'Multi-vehicle accident. Significant front-end damage.',
      thirdPartyInvolved: true, policeReportNumber: 'DXB-2026-41100', injuriesReported: false,
    },
    customerId: 'cust5', customerName: 'Peter Williams',
    customerEmail: 'peter.w@email.com', customerPhone: '+971505678901',
    customerToken: 'tok_c5_secure_mno345',
    createdAt: '2026-06-11T09:00:00Z', updatedAt: '2026-06-22T08:00:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c5', assignedTo: 'u8', assignedToName: 'Yousuf Al Blooshi', assignedToTeam: 'DESK_ENGINEERS', assignedBy: 'u11', assignedByName: 'Dr. Ali Al Shamsi', reason: 'Expertise Required', timestamp: '2026-06-14T10:00:00Z', isActive: true },
    ],
    currentAssignees: ['u8'],
    documents: [
      { id: 'd5a', claimId: 'c5', name: 'Garage Estimate', type: 'GARAGE_ESTIMATE', status: 'UPLOADED', uploadedBy: 'cust5', uploadedAt: '2026-06-13T14:00:00Z' },
    ],
    timeline: makeTimeline('c5'),
    inspections: [
      { id: 'ins5', claimId: 'c5', type: 'PHYSICAL', status: 'COMPLETED', completedAt: '2026-06-12T14:00:00Z', assignedTo: 'u6', liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR', estimateAmount: 45000 },
    ],
    offers: [
      { id: 'off2', claimId: 'c5', amount: 38000, generatedAt: '2026-06-12T18:00:00Z', generatedBy: 'u11', expiresAt: '2026-06-19T18:00:00Z', status: 'REJECTED', rejectionReason: 'Estimate too low', garageEstimateUrl: '/docs/garage-est-c5.pdf' },
    ],
    queue: 'INCOMING',
    sla: { claimId: 'c5', targetHours: 120, startedAt: '2026-06-11T09:00:00Z', dueAt: '2026-06-16T09:00:00Z', isBreached: true, remainingHours: -144 },
    liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR',
  },
  {
    id: 'c6',
    claimNumber: 'CLM-2026-001239',
    status: 'PAYMENT_PROCESSING',
    category: 'SIMPLE',
    policy: {
      policyNumber: 'POL-AE-2025-22103',
      policyHolderName: 'Sarah Johnson',
      vehicleRegistration: 'Abu Dhabi A 11234',
      vehicleMake: 'Hyundai', vehicleModel: 'Tucson', vehicleYear: 2023,
      coverageType: 'Comprehensive', deductible: 750, sumInsured: 65000,
      expiryDate: '2027-05-01', isActive: true,
    },
    accident: {
      dateTime: '2026-06-19T11:00:00Z',
      location: 'Mussafah Industrial Area, Abu Dhabi',
      description: 'Vehicle hit by falling object in parking garage.',
      thirdPartyInvolved: false, injuriesReported: false,
    },
    customerId: 'cust6', customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com', customerPhone: '+971506789012',
    customerToken: 'tok_c6_secure_pqr678',
    createdAt: '2026-06-19T13:00:00Z', updatedAt: '2026-06-22T07:00:00Z',
    assignments: [
      { id: uuidv4(), claimId: 'c6', assignedTo: 'u14', assignedToName: 'Reem Al Hajri', assignedToTeam: 'NORMAL_PROCESSING', assignedBy: 'u3', assignedByName: 'Fatima Al Zaabi', reason: 'Initial Assignment', timestamp: '2026-06-19T13:30:00Z', isActive: true },
    ],
    currentAssignees: ['u14'],
    documents: [],
    timeline: makeTimeline('c6'),
    inspections: [
      { id: 'ins6', claimId: 'c6', type: 'SELF', status: 'COMPLETED', completedAt: '2026-06-19T16:00:00Z', liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR', estimateAmount: 8500 },
    ],
    offers: [
      { id: 'off3', claimId: 'c6', amount: 7750, generatedAt: '2026-06-19T17:00:00Z', generatedBy: 'u14', expiresAt: '2026-06-26T17:00:00Z', status: 'ACCEPTED' },
    ],
    queue: 'OUTGOING',
    sla: { claimId: 'c6', targetHours: 48, startedAt: '2026-06-19T13:00:00Z', dueAt: '2026-06-21T13:00:00Z', isBreached: false, remainingHours: 0 },
    liabilityStatus: 'APPROVED', fraudStatus: 'CLEAR', settlementAmount: 7750,
  },
  {
    id: 'c7',
    claimNumber: 'CLM-2026-001240',
    status: 'NOT_ASSIGNED',
    category: undefined,
    policy: {
      policyNumber: 'POL-AE-2025-33456',
      policyHolderName: 'Ali Hassan',
      vehicleRegistration: 'Dubai C 55432',
      vehicleMake: 'Ford', vehicleModel: 'Explorer', vehicleYear: 2022,
      coverageType: 'Third Party', deductible: 0, sumInsured: 0,
      expiryDate: '2027-02-28', isActive: true,
    },
    accident: {
      dateTime: '2026-06-22T08:00:00Z',
      location: 'Business Bay, Dubai',
      description: 'Just reported. Details pending.',
      thirdPartyInvolved: false, injuriesReported: false,
    },
    customerId: 'cust7', customerName: 'Ali Hassan',
    customerEmail: 'ali.h@email.com', customerPhone: '+971507890123',
    customerToken: 'tok_c7_secure_stu901',
    createdAt: '2026-06-22T08:30:00Z', updatedAt: '2026-06-22T08:30:00Z',
    assignments: [],
    currentAssignees: [],
    documents: [],
    timeline: [{ id: uuidv4(), claimId: 'c7', event: 'Claim Created', description: 'Claim initiated via call center.', actor: 'Ahmed Hassan', actorRole: 'Call Center Agent', timestamp: '2026-06-22T08:30:00Z', status: 'NOT_ASSIGNED' }],
    inspections: [],
    offers: [],
    queue: 'INCOMING',
    sla: { claimId: 'c7', targetHours: 48, startedAt: '2026-06-22T08:30:00Z', dueAt: '2026-06-24T08:30:00Z', isBreached: false, remainingHours: 48 },
    liabilityStatus: 'PENDING', fraudStatus: 'CLEAR',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u4', claimId: 'c1', title: 'New Claim Assigned', message: 'CLM-2026-001234 has been assigned to you.', severity: 'INFO', read: false, createdAt: '2026-06-20T09:05:00Z' },
  { id: 'n2', userId: 'u4', claimId: 'c1', title: 'Document Uploaded', message: 'Customer uploaded Police Report for CLM-2026-001234.', severity: 'SUCCESS', read: false, createdAt: '2026-06-20T10:00:00Z' },
  { id: 'n3', userId: 'u13', claimId: 'c3', title: 'Fraud Alert', message: 'CLM-2026-001236 escalated for fraud review.', severity: 'WARNING', read: false, createdAt: '2026-06-17T10:00:00Z' },
  { id: 'n4', userId: 'u14', claimId: 'c4', title: 'Customer Offer Pending', message: 'Settlement offer awaiting customer response for CLM-2026-001237.', severity: 'INFO', read: true, createdAt: '2026-06-21T16:00:00Z' },
  { id: 'n5', userId: 'u1', claimId: 'c2', title: 'SLA Breach', message: 'CLM-2026-001235 has breached SLA. Immediate action required.', severity: 'ERROR', read: false, createdAt: '2026-06-19T10:00:00Z' },
  { id: 'n6', userId: 'u8', claimId: 'c5', title: 'Estimate Received', message: 'Customer submitted garage estimate for CLM-2026-001238.', severity: 'INFO', read: false, createdAt: '2026-06-13T14:00:00Z' },
];

export const TEAM_LABELS: Record<string, string> = {
  CALL_CENTER: 'Call Center',
  VIRTUAL_ASSESSOR: 'Virtual Assessor',
  PHYSICAL_ASSESSOR: 'Physical Assessor',
  DESK_ENGINEERS: 'Desk Engineers',
  GARAGE_COORDINATOR: 'Garage Coordinator',
  CLAIM_EXPERT: 'Claim Expert',
  FRAUD_MANAGEMENT: 'Fraud Management',
  NORMAL_PROCESSING: 'Normal Processing',
};

export const ROLE_LABELS: Record<string, string> = {
  CALL_CENTER_AGENT: 'Call Center Agent',
  VIRTUAL_ASSESSOR: 'Virtual Assessor',
  PHYSICAL_ASSESSOR: 'Physical Assessor',
  DESK_ENGINEER: 'Desk Engineer',
  GARAGE_COORDINATOR: 'Garage Coordinator',
  CLAIM_EXPERT: 'Claim Expert',
  FRAUD_ANALYST: 'Fraud Analyst',
  NORMAL_PROCESSOR: 'Normal Processor',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrator',
  CUSTOMER: 'Customer',
};
