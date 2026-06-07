# BE CRM — Sovereign CRM & Kanban Hub

A self-hosted, open-source CRM and Kanban workspace built with **Next.js 15**, **SQLite (Drizzle ORM)**, and a full **REST API** for agent integration.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Configuration](#configuration)
4. [Agent REST API](#agent-rest-api)
   - [Authentication](#authentication)
   - [Boards](#boards)
   - [Tickets — List & Create](#tickets--list--create)
   - [Tickets — Read, Update & Delete](#tickets--read-update--delete)
   - [Field Reference](#field-reference)
   - [Status Values per Board](#status-values-per-board)
5. [Connecting an AI Agent](#connecting-an-ai-agent)
   - [Google Gemini / Antigravity Agent](#google-gemini--antigravity-agent)
   - [OpenAI Function Calling](#openai-function-calling)
   - [Generic HTTP Agent](#generic-http-agent)
6. [UX / UI Customisation](#ux--ui-customisation)
7. [Database](#database)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push the database schema (creates local SQLite file)
npx drizzle-kit push

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — default login: `test / test1234` (or `test@test.com / test1234`)

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── boards/         GET  /api/v1/boards
│   │       └── tickets/        GET | POST /api/v1/tickets
│   │           └── [id]/       GET | PATCH | DELETE /api/v1/tickets/:id
│   ├── dashboard/              Main CRM UI
│   └── actions.ts              Server-side DB helpers
├── components/
│   └── features/
│       ├── KanbanBoard.tsx     Board + list + calendar views
│       └── DashboardWorkspace.tsx
├── db/
│   ├── index.ts                Drizzle DB client
│   ├── schema.ts               Table definitions
│   └── local.db                SQLite database file
└── lib/
    └── mockData.ts             Board configs & seed data
```

---

## Configuration

Create a `.env.local` file at the project root:

```env
# API key required for all /api/v1/* endpoints
AGENT_API_KEY=your-secret-key-here
```

> If `AGENT_API_KEY` is not set, the default value is `crm-agent-secret-key`.  
> **Change this before exposing the server to any network.**

---

## Agent REST API

Base URL: `http://localhost:3000/api/v1`

All endpoints return JSON. All responses include a `success: boolean` field.

### Authentication

Every request **must** include the API key as an HTTP header:

```
X-API-Key: your-secret-key-here
```

**Example — test connectivity:**

```bash
curl http://localhost:3000/api/v1/boards \
  -H "X-API-Key: your-secret-key-here"
```

---

### Boards

#### `GET /api/v1/boards`

Returns all boards with their IDs and valid status columns.

**Response:**
```json
{
  "success": true,
  "boards": [
    { "id": "leads",     "name": "LEADS",     "statuses": ["New","Contacted","Quote","Lost"] },
    { "id": "quotes",    "name": "QUOTES",    "statuses": ["New","Sent","Revise","Approved","Declined"] },
    { "id": "retainers", "name": "RETAINERS", "statuses": ["New","In Progress","On Hold","Expired"] },
    { "id": "contacts",  "name": "CONTACTS",  "statuses": ["Contacts"] },
    { "id": "tasks",     "name": "TASKS",     "statuses": ["New","In Progress","On Hold","Done"] }
  ]
}
```

---

### Tickets — List & Create

#### `GET /api/v1/tickets`

List all tickets. Optionally filter by board.

| Query Param | Type   | Required | Description          |
|-------------|--------|----------|----------------------|
| `board`     | string | No       | e.g. `leads`, `tasks`|

```bash
# All tickets
curl http://localhost:3000/api/v1/tickets \
  -H "X-API-Key: your-secret-key-here"

# Only leads
curl "http://localhost:3000/api/v1/tickets?board=leads" \
  -H "X-API-Key: your-secret-key-here"
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "tickets": [
    {
      "id": "l1",
      "board": "leads",
      "title": "Acme Corp",
      "status": "New",
      "contactName": "John Doe",
      "email": "john@acme.com",
      "value": "$10,000",
      "subTasks": []
    }
  ]
}
```

---

#### `POST /api/v1/tickets`

Create a new ticket on any board.

**Required body fields:**

| Field    | Type   | Description                                 |
|----------|--------|---------------------------------------------|
| `board`  | string | Target board ID (`leads`, `tasks`, etc.)    |
| `title`  | string | Ticket title / name                         |
| `status` | string | Must be a valid column for the chosen board |

**Optional fields:** see [Field Reference](#field-reference)

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "X-API-Key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "board": "leads",
    "title": "New Prospect Co",
    "status": "New",
    "contactName": "Jane Smith",
    "email": "jane@prospect.com",
    "value": "$25,000"
  }'
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "ticket": {
    "id": "l1717000000000",
    "board": "leads",
    "title": "New Prospect Co",
    "status": "New",
    ...
  }
}
```

---

### Tickets — Read, Update & Delete

#### `GET /api/v1/tickets/:id`

Fetch a single ticket including all its subtasks.

```bash
curl http://localhost:3000/api/v1/tickets/l1 \
  -H "X-API-Key: your-secret-key-here"
```

---

#### `PATCH /api/v1/tickets/:id`

Partially update any field on a ticket. Only include the fields you want to change.  
Status changes are validated against the board's allowed columns.

```bash
# Move a lead to "Quote" stage
curl -X PATCH http://localhost:3000/api/v1/tickets/l1 \
  -H "X-API-Key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{ "status": "Quote" }'

# Update multiple fields at once
curl -X PATCH http://localhost:3000/api/v1/tickets/t2 \
  -H "X-API-Key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "assignee": "Agent Chuck",
    "priority": "High",
    "details": "Assigned by agent on schedule trigger"
  }'
```

**Response:**
```json
{
  "success": true,
  "ticket": { "id": "l1", "status": "Quote", ... }
}
```

---

#### `DELETE /api/v1/tickets/:id`

Permanently delete a ticket and all its subtasks.

```bash
curl -X DELETE http://localhost:3000/api/v1/tickets/l1 \
  -H "X-API-Key: your-secret-key-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket \"l1\" deleted successfully."
}
```

---

### Field Reference

All fields are optional on `PATCH`. All string fields, `""` clears the value.

| Field              | Boards              | Description                                    |
|--------------------|---------------------|------------------------------------------------|
| `title`            | All                 | Main ticket / card title                       |
| `status`           | All                 | Must match a valid column (see below)          |
| `subtitle`         | All                 | Secondary line shown on card                   |
| `contactName`      | Leads, Quotes, Ret. | Client / contact person name                   |
| `email`            | All                 | Email address                                  |
| `phone`            | All                 | Phone number                                   |
| `value`            | Leads               | Estimated deal value (string, e.g. "$10,000")  |
| `pricingMethod`    | Quotes              | `"Fixed Price"` or `"Daily Rate"`              |
| `totalRate`        | Quotes              | Total quote amount                             |
| `startDate`        | Quotes, Retainers   | ISO date string `YYYY-MM-DD`                   |
| `endDate`          | Retainers           | ISO date string `YYYY-MM-DD`                   |
| `monthlyFee`       | Retainers           | Monthly retainer fee (numeric string)          |
| `dueDate`          | Tasks, Quotes       | ISO date string `YYYY-MM-DD`                   |
| `description`      | All                 | Short description                              |
| `quoteDescription` | Quotes              | Detailed quote description                     |
| `details`          | All                 | Notes / details / internal comments            |
| `amount`           | All                 | Generic amount field                           |
| `priority`         | Tasks               | `"Low"`, `"Medium"`, `"High"`, `"Critical"`    |
| `assignee`         | Tasks               | Name of the assigned team member               |

---

### Status Values per Board

| Board       | Valid Statuses                                  |
|-------------|--------------------------------------------------|
| `leads`     | `New`, `Contacted`, `Quote`, `Lost`             |
| `quotes`    | `New`, `Sent`, `Revise`, `Approved`, `Declined` |
| `retainers` | `New`, `In Progress`, `On Hold`, `Expired`      |
| `contacts`  | `Contacts`                                      |
| `tasks`     | `New`, `In Progress`, `On Hold`, `Done`         |

---

## Connecting an AI Agent

### Google Gemini / Antigravity Agent

Define the following **tool declarations** in your agent system prompt or tool config:

```python
tools = [
    {
        "name": "list_tickets",
        "description": "List CRM tickets. Optionally filter by board (leads, quotes, retainers, contacts, tasks).",
        "parameters": {
            "type": "object",
            "properties": {
                "board": { "type": "string", "description": "Optional board filter" }
            }
        }
    },
    {
        "name": "create_ticket",
        "description": "Create a new CRM ticket.",
        "parameters": {
            "type": "object",
            "required": ["board", "title", "status"],
            "properties": {
                "board":       { "type": "string" },
                "title":       { "type": "string" },
                "status":      { "type": "string" },
                "contactName": { "type": "string" },
                "email":       { "type": "string" },
                "phone":       { "type": "string" },
                "value":       { "type": "string" },
                "priority":    { "type": "string" },
                "assignee":    { "type": "string" },
                "description": { "type": "string" },
                "details":     { "type": "string" }
            }
        }
    },
    {
        "name": "update_ticket",
        "description": "Update a ticket field or change its status.",
        "parameters": {
            "type": "object",
            "required": ["id"],
            "properties": {
                "id":       { "type": "string", "description": "Ticket ID, e.g. l1" },
                "status":   { "type": "string" },
                "title":    { "type": "string" },
                "assignee": { "type": "string" },
                "priority": { "type": "string" },
                "details":  { "type": "string" }
            }
        }
    },
    {
        "name": "delete_ticket",
        "description": "Permanently delete a CRM ticket by ID.",
        "parameters": {
            "type": "object",
            "required": ["id"],
            "properties": {
                "id": { "type": "string" }
            }
        }
    }
]

# Tool execution dispatcher
import requests

CRM_BASE = "http://localhost:3000/api/v1"
HEADERS = { "X-API-Key": "your-secret-key-here", "Content-Type": "application/json" }

def execute_tool(name, args):
    if name == "list_tickets":
        params = {"board": args["board"]} if "board" in args else {}
        return requests.get(f"{CRM_BASE}/tickets", headers=HEADERS, params=params).json()

    if name == "create_ticket":
        return requests.post(f"{CRM_BASE}/tickets", headers=HEADERS, json=args).json()

    if name == "update_ticket":
        ticket_id = args.pop("id")
        return requests.patch(f"{CRM_BASE}/tickets/{ticket_id}", headers=HEADERS, json=args).json()

    if name == "delete_ticket":
        return requests.delete(f"{CRM_BASE}/tickets/{args['id']}", headers=HEADERS).json()
```

**System prompt snippet for the agent:**

```
You are a CRM assistant for Sovereign CRM.
You can read, create, update, and delete tickets using the available tools.

When a user says:
- "Add a new lead for [Company]" → create_ticket(board=leads, status=New, ...)
- "Move [ticket] to Approved" → update_ticket(id=..., status=Approved)
- "Mark task [X] as done" → update_ticket(id=..., status=Done)
- "Show me all open tasks" → list_tickets(board=tasks), filter status != Done
- "Delete ticket [X]" → delete_ticket(id=...)

Always confirm status values match the board's allowed statuses before calling update_ticket.
Valid statuses per board:
  leads: New, Contacted, Quote, Lost
  quotes: New, Sent, Revise, Approved, Declined
  retainers: New, In Progress, On Hold, Expired
  tasks: New, In Progress, On Hold, Done
  contacts: Contacts
```

---

### OpenAI Function Calling

```python
functions = [
    {
        "name": "crm_update_ticket",
        "description": "Change the status or fields of a CRM ticket",
        "parameters": {
            "type": "object",
            "required": ["id"],
            "properties": {
                "id": { "type": "string" },
                "status": { "type": "string" },
                "priority": { "type": "string" },
                "assignee": { "type": "string" },
                "details": { "type": "string" }
            }
        }
    }
]
```

---

### Generic HTTP Agent

Any agent (n8n, Make, Zapier, LangChain, etc.) can integrate using standard HTTP:

| Action              | Method | URL                                 |
|---------------------|--------|-------------------------------------|
| List all tickets    | GET    | `/api/v1/tickets`                   |
| Filter by board     | GET    | `/api/v1/tickets?board=leads`       |
| Get one ticket      | GET    | `/api/v1/tickets/{id}`              |
| Create ticket       | POST   | `/api/v1/tickets`                   |
| Update / reclassify | PATCH  | `/api/v1/tickets/{id}`              |
| Delete ticket       | DELETE | `/api/v1/tickets/{id}`              |
| List boards         | GET    | `/api/v1/boards`                    |

Always include header: `X-API-Key: your-secret-key-here`

---

## UX / UI Customisation

### Colours & Theme

Edit `src/app/globals.css`:

```css
:root {
  --background: #f4f5f6;   /* Light mode page background */
  --surface:    #ffffff;   /* Cards, sidebar, modals */
  --text-main:  #1a1a1b;   /* Primary text */
  --text-muted: #5e5e60;   /* Secondary / label text */
  --border-color: #e2e8f0; /* All borders & dividers */
}

html.dark {
  --background: #1a1a1b;
  --surface:    #25292d;
  --text-main:  #ffffff;
  --text-muted: #e5e7e9;
  --border-color: #27272a;
}
```

The accent / brand colour (`#e67e22`) is used directly in Tailwind classes. Search for `e67e22` in `KanbanBoard.tsx` and `dashboard/page.tsx` to change it globally.

### Logo

Place your logo files in `/public/assets/`:
- `site logo light theme.png` — shown in light mode (`/assets/site logo light theme.png`)
- `site logo dark theme.png` — shown in dark mode (`/assets/site logo dark theme.png`)

Edit the logo block in `src/app/dashboard/page.tsx` (lines 44–56) to change dimensions.

### Fonts

Edit `src/app/layout.tsx`. The project uses:
- **Space Grotesk** — body / UI font (`--font-sans`)
- **IBM Plex Serif Bold** — headings / board titles (`--font-serif`)

Replace these with any [Google Fonts](https://fonts.google.com) import.

### Boards & Statuses

Edit `src/lib/mockData.ts`. Each entry in `boardsConfig` defines:
- `name` — display name (uppercase)
- `columns` — the status pipeline stages (order matters for Kanban)
- `cards` — seed data (only used if DB is empty for that board)

```ts
myBoard: {
  name: 'MY BOARD',
  columns: ['Backlog', 'Active', 'Done'],
  cards: [
    { id: 'mb1', title: 'First ticket', status: 'Backlog' }
  ]
}
```

Then add a sidebar link in `src/app/dashboard/page.tsx` (the `sidebarItems` array).

### Sidebar Navigation

Edit the `sidebarItems` array in `src/app/dashboard/page.tsx`:

```ts
const sidebarItems = [
  { id: 'dashboards', name: 'DASHBOARDS', desc: 'system_performance' },
  { id: 'leads',      name: 'LEADS',      desc: 'registry_leads' },
  // Add your custom boards here
];
```

### Database Schema

The database schema is in `src/db/schema.ts`. After any change, run:

```bash
npx drizzle-kit push
```

This applies the schema to the local SQLite file without data loss for existing columns.

---

## Database

| Location         | `src/db/local.db` (SQLite)         |
|------------------|------------------------------------|
| ORM              | Drizzle ORM                        |
| Config           | `drizzle.config.ts`                |
| Push schema      | `npx drizzle-kit push`             |
| View in studio   | `npx drizzle-kit studio`           |

The DB is automatically seeded with sample data on first load of each board.  
To reset a board's data: delete all rows from the `cards` table for that board, then reload the page.

---

## Changelog

### Version 1.1.0 — Latest Updates
- **SQLite Database Integration & Drizzle ORM:** Migrated from volatile browser-based `localStorage` to a persistent local SQLite backend (`local.db`) using Drizzle ORM.
- **Agent REST API (`/api/v1/*`):** Designed and verified a full CRUD REST API for boards and tickets enabling seamless AI agent (Gemini, OpenAI, n8n, Make) integrations. Fully documented with copy-pasteable SDK schemas and Python dispatch wrappers.
- **Operator Registration & Authentication:** Replaced hardcoded access with a full Signup/Login system. LoginForm now features animated tab toggling and verifies credentials against both registered Name (Username) and Email in the SQLite database. Added a new default login (`test` / `test1234`).
- **Mobile Responsiveness & Sidebar Drawer:** Implemented a hamburger menu overlay drawer (`DashboardShell.tsx`) on viewports under `1024px` and set up Kanban board columns to stack vertically on mobile.
- **Horizontal Table Scrolling:** Wrapped the list-only Contacts directory in a scrollable frame to prevent squishing on narrow screens.
- **Vercel Serverless Optimizations:** Fixed Next.js function compilation crashes by copying the seeded SQLite database template to `/tmp/local.db` at runtime, and added server-side redirects on root `/` and `/login` to avoid static reload conflicts.
- **Logo Asset Routing:** Copied brand assets to `/public/assets/` and updated pages to dynamically swap logos depending on CSS dark/light theme context.
