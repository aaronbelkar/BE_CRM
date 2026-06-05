# ⚖️ Architectural Decision Record: Sovereign CRM & Kanban Hub

> **Status:** APPROVED  
> **Impact:** Core Database, Security Layer, Component Strategy & Open-Source Distribution

---

## 1. ADR 001: Database Abstraction via Drizzle ORM

### Context
The application will deploy on Hostinger Managed MySQL. It will eventually be open-sourced on GitHub. It must remain lightweight, easy to inspect, performant under shared hosting resource caps, and clear to external developers.

### Decision
We will use **Drizzle ORM** instead of Prisma or raw SQL strings.

### Consequences
- **Pros:** Near-zero runtime overhead (it functions as a thin TypeScript SQL wrapper), absolute control over performance, and native support for MySQL connection pooling.
- **Cons:** Schema migrations require running the `drizzle-kit` CLI tool, which must be clearly documented in the project's setup files for open-source contributors.

---

## 2. ADR 002: Inbound & Outbound API Security via Secret Token Headers

### Context
An external, locally-hosted autonomous agent ("Chuck") requires programmatic access to mutate leads and advance Kanban lanes. The system must verify these identity actions securely without introducing heavy OAuth2 frameworks or complex cryptographic setups that complicate open-source configuration.

### Decision
Implement a **Simple Static Secret Token Header Validation** system (`X-API-Key: your_secret_token`).

### Consequences
- **Pros:** Trivial to implement, rock-solid reliability, and extremely easy for developers to integrate with local Python scripts, Node orchestrators, or Make/Zapier webhooks.
- **Cons:** Requires the application administrator to generate and copy the secret key securely over an encrypted connection (HTTPS). It must be stored as an environment variable (`AGENT_API_SECRET`).

---

## 3. ADR 003: UI Assembly via Tailwind CSS & Radix UI Primitives

### Context
The UI must deliver a high-density, hybrid engineered aesthetic with a default dark mode. For maximum open-source adoption, the codebase must be easily themeable, hyper-customizable, and fast loading.

### Decision
We will adopt a decoupled structural component approach using **Tailwind CSS** alongside **Radix UI Primitives** (the foundational engine behind `shadcn/ui`).

### Consequences
- **Pros:** Zero heavy pre-compiled component libraries. Components are copied directly into the project repository as native source code (`/components/ui/`), allowing any developer to instantly change border radiuses, padding, or the color variables in `tailwind.config.js`.
- **Cons:** Requires initial structure boilerplate in the codebase, which will be managed entirely during our upcoming execution blueprints.