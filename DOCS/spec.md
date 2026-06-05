# 🚀 Product Specification: Sovereign CRM & Kanban Hub

> **The Vibe:** Data-Driven, Engineered, Minimalist & Hyper-Functional
> **Status:** Draft v1.0
> **Primary Stack:** Next.js (App Router), Tailwind CSS, SQLite/PostgreSQL, Hostinger Deployment

---

## 1. The North Star (Vision)
*This section defines the "Soul" of the project. Focus on the core problem.*

- **The "One Thing":** Foolproof status management of leads and tasks to ensure nothing slips through the cracks, and everything is explicitly addressed or assigned.
- **Success Looks Like:** A unified, zero-fluff workspace where human updates and autonomous agent operations sync instantly with zero friction.
- **Target Audience:** A technical solo operator managing high-value operations alongside an autonomous, data-driven strategic AI assistant.

---

## 2. The Golden Loop (User Journey)
*Detail the primary workflow. This is the logic the AI will prioritize.*

1. **Trigger:** A new lead arrives (via API/Webhook) or a task is initialized.
2. **Action:** The lead/task enters the system queue with an unassigned or pending status.
3. **Feedback:** The UI immediately reflects the addition in a high-density, minimalist grid/Kanban lane. An webhook event triggers to notify the AI agent.
4. **Value:** The agent pulls the task, updates the progress metrics, or the operator instantly reviews and assigns it—ensuring 100% operational throughput.

---

## 3. Aesthetic & UI Guidelines
*This helps the "Visual Sprint" workflow stay on brand.*

- **Visual Keywords:** Engineered, High-Density, Minimalist, Monochromatic, Clean.
- **Color Palette:** Deep Obsidian/Slate backgrounds, Stark White typography, and subtle, precise Status indicators (e.g., Tactical Green for Active, Amber for Pending, Steel Gray for Muted).
- **Typography:** Sans-serif for data display (e.g., Geist Sans, Inter) paired with Monospace font elements (e.g., JetBrains Mono) for IDs, system logs, and data parameters.
- **Animation Feel:** Snappy, instantaneous, or no animations. Form over flare.

---

## 4. Functional Requirements (P0/P1)
*List features. P0 is mandatory; P1 is "Nice to have."*

### [P0] Core Features (The Must-Haves)
- [ ] **Dual-View Workspace:** A centralized interface to toggle cleanly between a high-density CRM lead list and an engineered Kanban board.
- **Bidirectional Agent API/Webhooks:**
  - Secure incoming endpoints for the agent to fetch available tasks, ingest new leads, and inject progress reports.
  - Outgoing webhooks that broadcast state updates whenever a human modifies a task status or moves a card.
- [ ] **Deterministic Status Matrix:** Strict status transitions (e.g., `Lead` -> `Qualified` -> `Proposal` -> `Won/Lost`; `Task` -> `Backlog` -> `Assigned` -> `In-Progress` -> `Review` -> `Done`).

### [P1] Secondary Features (The Should-Haves)
- [ ] **Agent Performance Logs:** A small, terminal-style widget embedded in the dashboard showing the latest API hits and execution status updates from the agent.
- [ ] **Token-Based API Security:** Simple, secure API key generation interface within the settings screen for authorization.

---

## 5. Technical Guardrails & Architecture
*The "Law of the Land" for development.*

- **Frontend:** Next.js with React Server Components for raw data speed and minimal client-side bloat.
- **Styling:** Tailwind CSS using explicit utility classes with zero heavy custom component library wrappers.
- **Database/Storage:** A lightweight PostgreSQL instance or an optimized SQLite file backed up cleanly, fully compatible with Hostinger’s Node.js application environment.
- **State Management:** Fast, lightweight state via Zustand for UI filters; native Server Actions for data mutations.

---

## 6. Anti-Goals (Constraints)
*What we are NOT building right now.*

- No heavy metrics charts, graphs, or visual analytics packages (keep it pure text/data-driven).
- No complex multi-tenant user permissions (optimized strictly for the primary operator and the assigned agent).
- No native mobile apps.

---

## 7. The Vibe-Check Log
*A space to track how the project "evolved" during the build.*

- **2026-06-05:** Architecture finalized for Hostinger deployment. Agent interaction model optimized for discrete Webhook pulling and status synchronization.