# 🏗️ System Architecture: Sovereign CRM & Kanban Hub

> **Deployment Target:** Hostinger Node.js Subdomain Setup (`crm.aaronbelkar.com`)
> **Database:** Hostinger Managed MySQL
> **Integration Model:** Stateless REST API + Outbound Webhook Publisher

---

## 1. High-Level System Topology
*Explains the core data flow between your local infrastructure and Hostinger.*
------------------------------------------------------------------------+
|                      HOSTINGER CLOUD ENVIRONMENT                       |
|                                                                        |
|  crm.aaronbelkar.com (Next.js App / Node.js Runtime)                   |
|  +-----------------------+              +---------------------------+  |
|  |   UI / Web App Core   | -----------> |    Hostinger MySQL DB     |  |
|  | (Human Interaction)   |              |  (Leads, Tasks, Audits)   |  |
|  +-----------------------+              +---------------------------+  |
|              ^                                        ^                |
|              | Secure HTTPS                           | Internal Sync  |
|              v                                        v                |
|  +-----------------------+              +---------------------------+  |
|  |     REST API layer    |              |   Webhook Dispatcher      |  |
|  | (Token Authenticated) |              |  (Event-Driven Broadcast) |  |
|  +-----------------------+              +---------------------------+  |
+--------------^----------------------------------------|----------------+
|                                        |
| [A] Inbound Mutations                  | [B] Outbound Events
| (JSON Payload over HTTPS)              | (POST Webhook)
|                                        v
+--------------|----------------------------------------|----------------+
|              +----------------------------------------+                |
|                                                                        |
|  LOCAL SERVER / ENVIRONMENT (Strategic Agentic Assistant - "Chuck")      |
+------------------------------------------------------------------------+


---

## 2. Component Breakdown

### A. Core Application Layer (Next.js)
- **Framework:** Next.js (App Router) configured to compile to a `standalone` Node.js server.
- **Server Environment:** Dispatched via Hostinger’s Node.js application manager, binding to the designated passenger port behind their Nginx reverse proxy.
- **Authentication:** - **Human:** Simple, secure session-based cookie login (e.g., NextAuth or simple iron-session matching a master dashboard password).
  - **Agent:** Token-based header validation (`X-API-Key`) targeting all API routes under `/api/agent/*`.

### B. Database Layer (Hostinger MySQL)
- **ORM:** Prisma or Drizzle ORM, configuring connection pooling matching Hostinger's concurrent connection limitations.
- **Persistence:** Relational tables with strict foreign keys to preserve integrity between tasks, leads, and the system audit logs.

### C. Integration & Sync Mechanics
- **Inbound (Agent -> CRM):** Chuck executes `POST` and `PATCH` actions to modify task properties, inject logs, or advance statuses.
- **Outbound (CRM -> Agent):** When a human modifies a Kanban card, a background event fires a signed JSON payload to Chuck's local listener endpoint (configured in the CRM settings panel).

---

## 3. Data Schema Draft (Core Entities)

### `leads`
- `id` (INT AUTO_INCREMENT PRIMARY KEY)
- `name`, `email`, `company`, `value`
- `status` (ENUM: `NEW`, `PENDING_CONTACT`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`)
- `created_at`, `updated_at`

### `tasks`
- `id` (VARCHAR/UUID PRIMARY KEY)
- `title`, `description`, `assigned_to` (System / Agent)
- `status` (ENUM: `BACKLOG`, `ASSIGNED`, `IN_PROGRESS`, `REVIEW`, `DONE`)
- `progress_metrics` (TEXT/JSON for rich agent telemetry updates)
- `updated_at`

### `audit_logs`
- `id` (INT AUTO_INCREMENT PRIMARY KEY)
- `actor` (ENUM: `OPERATOR`, `AGENT_CHUCK`)
- `action` (VARCHAR, e.g., `STATUS_CHANGED`)
- `entity_type` (ENUM: `LEAD`, `TASK`)
- `entity_id` (VARCHAR/INT)
- `changes` (JSON object holding old vs new values)
- `timestamp`

---

## 4. Technical Guardrails & Constraints
- **State Boundaries:** No Long Polling or complex WebSockets on the server tier. This keeps Node footprint minimal within Hostinger parameters. Status tracking runs strictly via fast HTTP pulls or atomic Webhook events.
- **Database Limits:** Ensure explicit cleanup strategies for `audit_logs` to ensure table space doesn't balloon uncontrollably over months of continuous background agent tracking.