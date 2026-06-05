# 🎨 Brand Guide: Sovereign CRM & Kanban Hub

> **Core Aesthetic:** Engineered Minimalist / Tactical Dark
> **Primary Goal:** High-density clarity for rapid human assessment and automated agent alignment.

---

## 1. Visual Language & "The Vibe"
*This section dictates how the product feels during a visual interface sprint.*

- **Keywords:** Engineered, High-Contrast, High-Density, Functional.
- **Design Metaphor:** An interactive terminal dashboard—stripped of ornamental fluff, built entirely out of functional blocks.
- **Standard Radius:** `8px` (Modern, clean corner rounding for technical panels and cards to prevent aesthetic fatigue).

---

## 2. Color Palette
*Configured directly for Tailwind CSS custom properties or traditional CSS variables.*

| Role | Hex Code | Tailwind Implementation (Proposed) | Functional Description |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#e67e22` | `bg-[#e67e22]` / `text-[#e67e22]` | Focus states, unassigned alerts, active tasks |
| **Background (Deep)**| `#1a1a1b` | `bg-[#1a1a1b]` | Global application background (Default Dark Mode) |
| **Surface (Card)** | `#25292d` | `bg-[#25292d]` | Kanban cards, CRM rows, sidebars, modal surfaces |
| **Text (Main)** | `#ffffff` | `text-[#ffffff]` | High readability for item titles and primary data |
| **Text (Muted)** | `#e5e7e9` | `text-[#e5e7e9]` | Subheadings, metadata labels, system timestamps |

---

## 3. Typography
*Defines the hierarchical type system for rapid scanning.*

- **Headings:** Sans-Serif (e.g., `Inter` or `Geist Sans`), Semi-Bold, light tracking-tight for high structural layout clarity.
- **Body Data:** Sans-Serif, Regular, high readability for text fields and lead descriptions.
- **System Metrics & IDs:** Monospace (e.g., `JetBrains Mono`), used exclusively for database record IDs, webhook payloads, and agent activity logs.

---

## 4. UI Components & Patterns
*Rules for the front-end generation agent to follow explicitly.*

- **The Hybrid Layout:** Data tables and Kanban boards use compressed row heights and tight internal padding (`p-2` to `p-3`), while structural margins (`m-6`) provide breathing room to maintain a clean, uncluttered visual flow.
- **Kanban Cards:** Structured utilizing the `#25292d` surface color, thin borders, an explicit 8px corner radius, and subtle color rings (`#e67e22`) only when an item requires manual intervention or immediate assignment.
- **Inputs & Fields:** Minimal background style, triggering a distinct 1px outline using the primary amber/orange color when focused.

---

## 5. Imagery & Iconography
*Rules for non-text visual components.*

- **Icon Set:** `Lucide-react` using a uniform `thin` or `regular` stroke weight (1.5px). 
- **Functional Isolation:** Icons are only used to represent clear actions (e.g., status updates, copying webhook hooks, shifting lanes) to avoid visual noise.

---

## 6. Vibe-Check Examples
*A guide to direct the layout iterations.*

- ✅ **Good:** "A high-density table of 15 client leads using monospace tags for statuses, framed by wide structural background space."
- ❌ **Bad:** "Adding bright gradients, soft dropshadows, or rounded pill buttons that break the clean, engineered appearance."

## 7. Assets

Business specific assets are in `/assets` folder in project root directory. AI generated images are in `/assets/ai-images` folder. 

