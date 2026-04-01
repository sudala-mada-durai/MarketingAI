# Task List: 0001-prd-marketing-sales-pipeline

> **PRD Reference:** `tasks/0001-prd-marketing-sales-pipeline.md`
> **Status:** Phase 2 — Detailed sub-tasks generated.

---

## Relevant Files

- `src/middleware/tenant.ts` - Middleware to inject `org_id` into requests.
- `src/lib/turfai.ts` - Central `TurfAIClient` for handling synchronous webhook calls.
- `src/models/` - Database schemas for Tenants, Users, Leads, Campaigns, and TurfAI configs.
- `src/components/content-studio/` - UI for Brochure and Ad generation.
- [X] **Phase 1: Project Foundation**
    - [X] Initialize Express Backend & Prisma ORM
    - [X] Implement Multi-tenant Authentication middleware
    - [X] Define core GraphQL/REST schemas for leads and campaigns
- [X] **Phase 2: TurfAI Integration**
    - [X] Implement `TurfAIClient` for webhook communication
    - [X] Create `TurfAIConfig` model & settings management
- [X] **Phase 3: Marketing Studio (AI-Powered)**
    - [X] Build `BrochureBuilder` logic (Prompt -> TurfAI -> Result)
    - [X] Build `AdGenerator` logic
- [X] **Phase 4: CRM & Sales Tools**
    - [X] Implement `ReminderService` (automated follow-ups)
    - [X] Implement `CompetitorScraper` (Market Intelligence integration)
- [ ] **Phase 5: Distribution & Analytics**
    - [ ] Integrate WhatsApp/Email distribution APIs
    - [ ] Build Executive Analytics Dashboard

---

  - [X] 5.3 Implement PDF/Image export functionality for brochures and ads.
- [X] 6.0 AI Copywriting Assistant (TurfAI-Powered)
  - [X] 6.1 Build the universal sidebar AI Writing Assistant integrated across modules.
  - [X] 6.2 Implement tone selection (Professional, Friendly, etc.) and "Regenerate" logic.
- [ ] 7.0 Campaign Distribution — Email, WhatsApp & Social Media Posting
  - [ ] 7.1 Integrate SendGrid/SES for email distribution with tracking (Open/Bounce).
  - [ ] 7.2 Implement WhatsApp messaging via Meta Cloud API with opt-in permission check.
  - [ ] 7.3 Build the Social Media posting engine for Instagram, Facebook, LinkedIn, and Twitter.
  - [ ] 7.4 Create the Campaign Scheduling dashboard.
- [ ] 8.0 Competitor Intelligence Module (TurfAI-Powered)
  - [ ] 8.1 Build the Competitor tracking list and Category mapping.
  - [ ] 8.2 Create the Competitor Price History charts (Recharts/Chart.js).
  - [ ] 8.3 Implement the scheduled analysis trigger for TurfAI predictions.
- [ ] 9.0 Dashboard & Analytics
  - [ ] 9.0 Build the main dashboard with KPI cards and chart summaries.
  - [ ] 9.1 Implement date-range filtering for all analytics.
- [ ] 10.0 Settings Panel — Org Config, Social Connections & TurfAI Workflows
  - [ ] 10.1 Build the comprehensive Organisation settings panel.
  - [ ] 10.2 Create the connection management UI for Social Media APIs.
