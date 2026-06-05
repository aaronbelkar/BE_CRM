# 💻 Software Architecture: Sovereign CRM & Kanban Hub

> **The Developer's Manifesto:** This document defines the codebase layout, strict type conventions, and state management patterns. It ensures that human developers and AI coding agents build matching components.

---

## 1. Project Structure
*A classic layered layout optimized for repository onboarding and easy navigation.*

```text
/
├── /src
│   ├── /app                  # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── /api              # REST Endpoints for Agent Integration
│   │   │   ├── /agent        # Inbound API routes (X-API-Key authenticated)
│   │   │   └── /webhook      # Webhook subscriber registration endpoints
│   │   ├── /dashboard        # Sovereign Dashboard layout slots
│   │   └── /login            # Standalone User authentication gateway
│   ├── /components           # Global UI Layout Components
│   │   ├── /ui               # Atomic primitives (Buttons, Inputs, Dialogs via Radix)
│   │   └── /features         # Layered layout views (CRM Table, Kanban Board)
│   ├── /db                   # Database Configuration & Drizzle Engine
│   │   ├── /schema           # Modular schema folder
│   │   │   ├── leads.ts      # CRM Leads definitions
│   │   │   ├── tasks.ts      # Kanban Tasks definitions
│   │   │   └── audits.ts     # State Transition log definitions
│   │   ├── index.ts          # Drizzle client initialization
│   │   └── client.ts         # MySQL Pool manager matching Hostinger parameters
│   ├── /lib                  # Utility logic (Token check, webhook dispatchers)
│   ├── /hooks                # Custom React state hooks
│   └── /types                # Shared TypeScript interfaces
├── /public                   # Static visual assets
├── drizzle.config.ts         # Drizzle migration engine setup
└── package.json              # Engine definitions

## 2. Coding Standards & ConventionsThe strict guidelines governing automated or human code generation.

### Naming Paradigms:
-- Components: PascalCase (e.g., KanbanCard.tsx, LeadRow.tsx).  
-- Utilities/Functions: camelCase (e.g., validateAgentToken(), pushAuditEntry()).  
-- Styles: Explicit Tailwind utility classes.  

### File Exports: Named exports only (export const KanbanBoard = ...) to prevent module loading ambiguity.  

### Type Safety: Strongly typed boundaries. Strict runtime assertions using Zod for all inbound agent payload schemas.  

## 3. State Management & Mutation PatternDefines how data cascades through the system views[cite: 3].

### Server State: Handled directly via React Server Components (RSC) to minimize initial rendering latency on Hostinger[cite: 3].

### Client State: Lightweight Zustand slices manage front-end specific properties (e.g., filtering options, active board lane view, or theme toggling).

### Mutations: Driven securely via Next.js Server Actions for human UI operations, bypassing additional API overhead.

## 4. UI/UX & Async FlowScannability Fallbacks:

### Async components utilize native React Suspense boundaries paired with structured skeletons keeping view layout shift to 0%.

### Error Boundaries: Localized view errors fail gracefully via layout catch boundaries, throwing visual notification toasts without breaking the dashboard container.

## 5. Security & Middleware 

### BoundaryRoute Protection: Next.js middleware intercepts requests hitting /dashboard/* to validate user session validity. Unauthenticated hits are hard-redirected to /login.

### API Guarding: Routes targeting /api/agent/* bypass traditional session verification, executing standalone header checks validation directly for static X-API-Key values.    