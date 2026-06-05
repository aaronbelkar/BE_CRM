# 📋 Requirements Traceability Matrix (RTM)

> **Purpose:** Maps user specifications directly to structural frontend layouts, backend schemas, and open-source documentation targets. Ensures zero feature drift.

---

## 1. Core Requirements Mapping

| Req ID | User Requirement | Frontend View / Component | Backend Schema Impact | API / Webhook Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | **Unified Central Dashboard** | `/app/dashboard/page.tsx`<br>• Slots: New Leads, Pending Contact, Kanban Summary, Next 30 Days Summary | Queries `leads`, `tasks`, and aggregated `audit_logs` | Triggers raw initial server-side fetch via Drizzle |
| **REQ-02** | **CRM Status Management** | `/components/features/crm/LeadTable.tsx`<br>• High-density grid view with status selectors | Mutates `leads.status`<br>• Enum: `NEW`, `PENDING_CONTACT`, etc. | Fires outbound JSON payload webhook on modification |
| **REQ-03** | **Kanban Board** | `/components/features/kanban/KanbanBoard.tsx`<br>• Interactive 8px rounded lanes and task cards | Mutates `tasks.status`<br>• Enum: `BACKLOG`, `ASSIGNED`, etc. | Fires outbound JSON payload webhook on board drag/drop |
| **REQ-04** | **Master Agent Ingestion** | *System Component Only (No dedicated layout view)* | Mutates `leads`, `tasks`, and appends to `audit_logs` | Inbound REST endpoint authorized via `X-API-Key` |
| **REQ-05** | **State Transition Audit Log** | `/components/ui/TerminalLog.tsx`<br>• Code-style audit viewer component on dashboard | Appends new records to `audit_logs` table | Injected strictly when a state-transition event resolves |

---

## 2. Open-Source Boilerplate & Repository Readiness

To ensure the repository is fully optimized for external developers on GitHub, the codebase must ship with the following standalone validation targets:

- [ ] **`/.env.example`**: Outlines required local context variables (`DATABASE_URL`, `CRM_WEBHOOK_SECRET`, `AGENT_API_SECRET`) without leaking sensitive user production environments.
- [ ] **`/README.md`**: Technical onboarding manual detailing how to map Drizzle schemas to a Hostinger managed MySQL instance and establish the agent webhook handshakes.
- [ ] **`/drizzle.config.ts`**: Standardized environment definition specifying schema locations and output directories for easy version-controlled database migrations.