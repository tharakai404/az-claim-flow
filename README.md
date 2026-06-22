# AZ Claim Flow — Motor Insurance Claim Workflow Management System

Enterprise-grade React + TypeScript application for managing the full motor insurance claim lifecycle.

## Features

### Internal Portal
- **Dashboard** — KPI cards, weekly activity chart, status distribution, team workload
- **All Claims** — Sortable/filterable claims table with full detail drawer
- **Queue Management** — Incoming / Action Required / Pending / Outgoing / Completed per-user queues
- **Claim Detail** — Overview, Timeline, Documents, Inspection Decision, Offer Management tabs
- **Assignment Engine** — Auto Round Robin or manual assignment with reason tracking
- **Inspection Panel** — Liability + Fraud decision with automated routing
- **User Management** — Team workload overview, status management, workload distribution
- **Reports** — Monthly trends, team performance, SLA compliance charts

### Customer Portal
- Secure tokenized claim access (no login required)
- Real-time claim status progress steps
- Complete claim timeline view
- Document upload interface
- Settlement offer accept/reject

## Demo Access

### Internal Portal Users (switch via top-right menu)
| Name | Role | Team |
|------|------|------|
| Sara Al Mansoori | Call Center Agent | Call Center |
| Khalid Ibrahim | Virtual Assessor | Virtual Assessor |
| Omar Al Farsi | Physical Assessor | Physical Assessor |
| Yousuf Al Blooshi | Desk Engineer | Desk Engineers |
| Dr. Ali Al Shamsi | Claim Expert | Claim Expert |
| Tariq Al Khoori | Fraud Analyst | Fraud Management |
| Mohammed Al Ameri | Supervisor | — |

### Customer Portal Demo Tokens
- `tok_c4_secure_jkl012` — Offer Pending (Layla Mohammed)
- `tok_c6_secure_pqr678` — Payment Processing (Sarah Johnson)
- `tok_c1_secure_abc123` — Virtual Inspection (John Smith)

## Getting Started

```bash
npm install
npm start
```

## Architecture

```
src/
├── types/          # TypeScript interfaces
├── data/           # Mock data & constants
├── context/        # React Context (AppContext)
├── utils/          # Helper functions
└── components/
    ├── layout/     # Sidebar, TopBar
    ├── dashboard/  # Dashboard KPIs, Reports
    ├── claims/     # ClaimsTable, ClaimDetail, AssignModal, NewClaimModal, Timeline
    ├── queues/     # QueueView
    ├── workflow/   # InspectionPanel
    ├── admin/      # UserManagement
    ├── customer/   # CustomerPortal
    └── shared/     # Badge, Modal, StatusDot
```

## Teams Supported
- Call Center
- Virtual Assessor
- Physical Assessor
- Desk Engineers
- Garage Coordinator
- Claim Expert Processing
- Claim Fraud Management
- Normal Claim Processing
