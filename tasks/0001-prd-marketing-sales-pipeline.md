# PRD: AI-Powered Marketing & Sales Pipeline Platform

**Document ID:** 0001
**Feature Name:** marketing-sales-pipeline
**Author:** AI Assistant
**Date:** 2026-03-31
**Status:** Draft v2 — Updated with TurfAI Integration
**Primary Audience:** Junior Developers

---

## 1. Introduction / Overview

### What is this?
An **AI-Powered Marketing & Sales Pipeline Web Application** — a multi-tenant SaaS platform where multiple organisations each have their own isolated workspace. Enterprise sales and marketing teams use it to automate content creation, multichannel distribution, lead management, competitor monitoring, and follow-up workflows.

> **🔑 Key Design Principle:** All AI and automation tasks in this platform are powered by **TurfAI Studio** — the organisation's internal AI workflow engine. The application does **not** call OpenAI, Anthropic, or any LLM directly. Instead, it triggers pre-built TurfAI workflows via **webhooks**, sending custom prompts and receiving structured results. This is the primary and preferred integration pattern for every AI feature.

### Problem It Solves
Marketing and sales teams waste enormous time manually:
- Designing brochures and ad creatives from scratch
- Copy-pasting content across Instagram, Facebook, LinkedIn, and Twitter one by one
- Sending bulk emails and WhatsApp messages from spreadsheets
- Tracking leads in disconnected tools with no reminders
- Researching competitor prices and guessing market trends

This platform automates all of those tasks, freeing teams to focus on strategy and relationships — with TurfAI doing the heavy AI lifting behind the scenes.

### Goal
Build a full-featured, multi-tenant web application where each organisation's team can go from **idea → brochure → ad → distribution → lead tracking → follow-up**, all in one place, powered end-to-end by TurfAI workflows.

---

## 2. Goals

1. **Multi-tenant SaaS** — Multiple organisations use the same application with full data isolation. Each org is a separate tenant.
2. **TurfAI-First AI** — Every AI feature (content generation, predictions, descriptions) must be implemented as a TurfAI workflow triggered via webhook, not via direct LLM API calls.
3. **Automate content creation** — Auto-generate professional brochures and digital ad creatives by sending inputs to a TurfAI workflow and rendering the returned output.
4. **Multichannel distribution** — One-click publishing to Instagram, Facebook, LinkedIn, Twitter, Email, and WhatsApp.
5. **AI-assisted copywriting** — Generate marketing descriptions, ad copy, and product write-ups via TurfAI's `llm_task` or `summarization_task` processors.
6. **Competitor intelligence** — AI-based competitor price predictions via a dedicated TurfAI analysis workflow (data source to be decided separately).
7. **Lead pipeline & CRM** — Built-in Kanban CRM to track leads through the sales funnel.
8. **Automated reminders** — Notify sales reps via in-app, email, and WhatsApp when leads need follow-up.
9. **Role-based access** — Admin, Marketing Team, and Sales Team roles with controlled permissions.

---

## 3. TurfAI Integration Architecture

> This section is **critical** and must be understood by all developers before implementation begins.

### How TurfAI Is Used
TurfAI Studio is an internal AI workflow automation platform. It exposes each workflow as a **webhook endpoint**. Our application acts as a **webhook client** — it sends an HTTP POST request to a TurfAI workflow webhook URL with a custom prompt and any required data, and receives a structured JSON response with the AI-generated output.

### Workflow Trigger Pattern
```
[Our App]
   |
   |--- HTTP POST --> [TurfAI Webhook URL]
   |                     |
   |                  TurfAI runs the workflow:
   |                  (llm_task / summarization_task /
   |                   classification_task / extraction_task / etc.)
   |                     |
   |<--- JSON Response -- [TurfAI returns result]
   |
[Our App renders / uses the result]
```

### TurfAI Processors Available (to be leveraged)
| Processor | Use in Our App |
|---|---|
| `llm_task` | Ad copy, brochure text, lead descriptions, email body generation |
| `summarization_task` | Summarise lead notes, competitor data, campaign reports |
| `classification_task` | Classify lead quality, categorise competitor offers |
| `extraction_task` | Extract structured data (price, product name) from competitor pages |
| `classify_and_extract_task` | Competitor price + category extraction in one step |
| `rag_retrieval_task` | Search internal knowledge base (product info, brand guidelines) |
| `email_send_task` | Send emails via TurfAI's built-in email processor |
| `data_fetch_task` | Fetch competitor data or external feeds |

### Webhook Call Example
```json
// POST https://turfai.internal/webhooks/{workflow-id}
// Headers: { "x-webhook-secret": "...", "Content-Type": "application/json" }
{
  "prompt": "Write a professional marketing brochure for a product called 'CloudDesk' in the SaaS industry. Key features: real-time collaboration, AI assistant, 99.9% uptime. Tone: professional. Output: JSON with fields: headline, tagline, feature_bullets (array of 5), cta_text, footer_note.",
  "context": {
    "product_name": "CloudDesk",
    "industry": "SaaS",
    "tone": "professional"
  }
}

// TurfAI Response:
{
  "status": "success",
  "result": {
    "headline": "Work Smarter, Together.",
    "tagline": "The AI-powered workspace your team deserves.",
    "feature_bullets": ["..."],
    "cta_text": "Start Free Trial",
    "footer_note": "Enterprise-grade security, always."
  }
}
```

### TurfAI Workflow Registry (to be created per feature)
Admins of this platform must pre-configure the TurfAI webhook URLs for each AI feature in the **Settings → TurfAI Workflows** panel. The following workflows must be created in TurfAI Studio:

| Workflow Name | Purpose | Key Processors Used |
|---|---|---|
| `wf-brochure-generator` | Generate brochure text content | `llm_task` |
| `wf-ad-copy-generator` | Generate ad headline + body + CTA | `llm_task` |
| `wf-description-writer` | Write product/service descriptions | `llm_task` |
| `wf-email-body-generator` | Draft campaign email body | `llm_task` |
| `wf-whatsapp-message-generator` | Draft WhatsApp message text | `llm_task` |
| `wf-competitor-analyzer` | Analyze and predict competitor pricing | `data_fetch_task` + `extraction_task` + `classification_task` |
| `wf-lead-summarizer` | Summarise lead activity timeline | `summarization_task` |
| `wf-social-caption-generator` | Generate post captions per platform | `llm_task` |

---

## 4. Multi-Tenant Architecture

### Overview
The platform runs as a single deployment serving multiple organisations. Each organisation is a **Tenant**.

### Tenant Isolation Rules
- Every database record (leads, campaigns, contacts, brochures, posts) must have an `org_id` (tenant ID) field.
- All API queries must be automatically scoped to the currently authenticated user's `org_id`. No cross-tenant data leakage is permitted.
- TurfAI webhook URLs and secrets are configured **per org** by that org's Admin.

### Tenant-Specific Configuration
Each tenant's Admin can configure (in Settings):
- Organisation name and logo (used in brochures and emails)
- TurfAI webhook URLs for each AI workflow
- TurfAI webhook secrets (stored encrypted)
- Social media account connections (per org)
- Email sending credentials (per org)
- WhatsApp Business API credentials (per org)

---

## 5. User Stories

### Admin
- As an **Admin**, I want to register my organisation and set up the tenant workspace, so that my team can start using the platform.
- As an **Admin**, I want to configure TurfAI workflow webhook URLs for each AI feature, so that all AI outputs are routed through our internal TurfAI Studio.
- As an **Admin**, I want to invite team members and assign them Marketing or Sales roles, so that access is controlled appropriately.
- As an **Admin**, I want to connect social media accounts (Instagram, Facebook, LinkedIn, Twitter) for the organisation, so that the team can publish posts without sharing credentials.
- As an **Admin**, I want to manage the WhatsApp opt-in permission, deciding who on the team can send WhatsApp messages to contacts, so that we stay compliant with Meta's policies.

### Marketing Team Member
- As a **Marketing Team member**, I want to fill in product details and trigger a TurfAI workflow that auto-generates professional brochure content, so that I can create a brochure in seconds instead of hours.
- As a **Marketing Team member**, I want to pick an ad template, trigger a TurfAI workflow with the product context, and get AI-generated ad copy automatically filled in, so that I can launch campaigns faster.
- As a **Marketing Team member**, I want to schedule and publish a post to all connected social platforms simultaneously, so that I save time on manual posting.
- As a **Marketing Team member**, I want to compose a campaign email with AI-generated body text (from TurfAI) and send it to a selected contact list.
- As a **Marketing Team member**, I want to send a WhatsApp broadcast message (generated by TurfAI) to opted-in contacts, so that I can reach people on their preferred channel.

### Sales Team Member
- As a **Sales Team member**, I want to view all leads in a Kanban pipeline with current stage, so that I can manage my workload visually.
- As a **Sales Team member**, I want to receive reminders (in-app, email, WhatsApp) when a lead hasn't been followed up in X days.
- As a **Sales Team member**, I want to see AI-generated competitor price predictions (produced by a TurfAI workflow), so that I can adjust my pitch.
- As a **Sales Team member**, I want to ask TurfAI to summarise a lead's activity history, so that I can get up to speed quickly before a call.
- As a **Sales Team member**, I want to import a CSV of contacts into the CRM, so that I can bulk-onboard existing contact lists.

---

## 6. Functional Requirements

### 6.1 Tenant (Organisation) Management
1. The system **must** support multi-tenant architecture where each organisation's data is fully isolated by `org_id`.
2. The system **must** allow a new organisation to self-register (company name, admin email, password).
3. The system **must** provide each organisation with a **Settings** panel where Admins can configure TurfAI webhook URLs and secrets for each AI workflow.
4. The system **must** store each tenant's TurfAI webhook secrets in encrypted form (never in plain text).
5. The system **must** display the organisation's name and logo across all generated brochures and email templates.

### 6.2 Authentication & User Management
6. The system **must** allow users to log in with email + password.
7. The system **must** support Google OAuth 2.0 login ("Sign in with Google").
8. The system **must** enforce three roles per org: **Admin**, **Marketing Team**, **Sales Team**.
9. The system **must** allow Admins to invite users by email, assign roles, and deactivate accounts.
10. The system **must** support password reset via email.
11. The system **must** ensure all sessions are scoped to a single tenant; cross-tenant access is forbidden.

### 6.3 Brochure Auto-Generation (TurfAI-Powered)
12. The system **must** present the user with a form to enter: product/service name, key features (up to 10 bullet points), price, tone (Professional / Friendly / Persuasive), and optional images.
13. The system **must** send this form data as a structured prompt to the TurfAI `wf-brochure-generator` webhook and receive the generated text content (headline, tagline, feature bullets, CTA, footer).
14. The system **must** offer at least 5 brochure layout templates. The AI-generated text is injected into the selected template.
15. The system **must** render a live visual preview of the brochure in the browser using the selected template and AI content.
16. The system **must** allow the user to manually edit any AI-generated text field before finalising.
17. The system **must** export the final brochure as a PDF and as a JPG/PNG image.
18. The system **should** display a loading state while waiting for the TurfAI webhook response.

### 6.4 Digital Ad Generation (TurfAI-Powered)
19. The system **must** allow the user to select a target format: Instagram Story (1080×1920), Instagram/Facebook Feed (1080×1080), LinkedIn Banner (1200×627), Twitter/X Post (1600×900).
20. The system **must** send product details and selected format to the TurfAI `wf-ad-copy-generator` webhook and receive: headline, body text, call-to-action.
21. The system **must** inject the AI-generated content into an ad canvas (using a library like Fabric.js or Konva.js) overlaid on the selected template.
22. The system **must** offer at least 3 design templates per format.
23. The system **must** allow the user to click "Regenerate" to resend the prompt to TurfAI and get a fresh copy variation.
24. The system **must** export the final ad at the correct pixel dimensions for the selected platform.

### 6.5 Social Media Auto-Posting
25. The system **must** allow Admins to connect: Instagram (via Meta Graph API), Facebook Page (Meta), LinkedIn Company Page, Twitter/X (v2 API).
26. The system **must** allow users to publish a post (image + caption) to one or more connected platforms in a single action.
27. The system **must** allow users to request TurfAI (`wf-social-caption-generator`) to generate a platform-optimised caption before posting.
28. The system **must** support scheduling posts for a future date and time.
29. The system **must** maintain a post history log with status per platform: Scheduled / Publishing / Published / Failed.
30. The system **must** notify the user on failure and show the reason returned by the social API.

### 6.6 Email Distribution (TurfAI-Powered)
31. The system **must** allow users to compose a campaign email with a subject line, rich-text body, and optional PDF attachment (e.g., a generated brochure).
32. The system **must** offer a "Generate with TurfAI" button that calls `wf-email-body-generator` with the campaign goal and product context, pre-filling the email body.
33. The system **must** allow users to select recipients from the built-in contact list or upload a CSV of email addresses.
34. The system **must** send bulk emails via a transactional email service (e.g., SendGrid or AWS SES — configured per org).
35. The system **must** track and display delivery status: Sent, Delivered, Opened, Bounced.
36. The system **must** support scheduling email campaigns for a future time.

### 6.7 WhatsApp Distribution (TurfAI-Powered)
37. The system **must** allow users to compose a WhatsApp message (text + optional image/document).
38. The system **must** offer a "Generate with TurfAI" button that calls `wf-whatsapp-message-generator` to generate a concise, conversational WhatsApp-appropriate message.
39. The system **must** allow the user to select recipients from opted-in contacts or upload a CSV of opted-in phone numbers.
40. The system **must** send messages via the WhatsApp Business API (Meta Cloud API), configured per org by the Admin.
41. The system **must** display per-message delivery status: Sent / Delivered / Read / Failed.
42. The system **must** enforce WhatsApp compliance: only contacts who have opted in may be messaged. The opt-in status is managed by the Admin and any team members the Admin explicitly grants permission to update opt-in status.

### 6.8 AI Description & Copywriting Assistant (TurfAI-Powered)
43. The system **must** provide an AI writing panel accessible within the brochure, ad, email, and WhatsApp composition screens.
44. The system **must** accept a free-text prompt or product name from the user and send it to the TurfAI `wf-description-writer` webhook.
45. The system **must** allow the user to set the tone before generating: Professional, Friendly, Persuasive, Urgent.
46. The system **must** display the TurfAI-generated description with options to Copy, Apply to field, or Regenerate.
47. The system **should** show character/word count alongside the generated output so the user can assess platform fit.

### 6.9 Competitor Price Prediction (TurfAI-Powered)
48. The system **must** allow users to add competitors by name and associated product/service category.
49. The system **must** trigger the TurfAI `wf-competitor-analyzer` workflow on a scheduled basis (configurable: daily / weekly). The data source for competitor prices will be determined and configured separately.
50. The system **must** display competitor price history in a line chart per product/category.
51. The system **must** show AI-generated price trend predictions and commentary returned by the TurfAI workflow.
52. The system **must** send an in-app alert when a price change exceeds a configurable threshold (e.g., ±5%).
53. The system **should** display a TurfAI-generated "Recommended Pricing" suggestion based on the competitive analysis result.

### 6.10 Built-in CRM & Lead Pipeline
54. The system **must** provide a Kanban-style lead pipeline board with stages: **New → Contacted → Qualified → Proposal Sent → Negotiation → Closed Won → Closed Lost**.
55. The system **must** allow Sales Team members to create, edit, and delete leads.
56. The system **must** store per lead: Name, Company, Email, Phone, Lead Source, Assigned Rep, Stage, Expected Value, Last Contacted Date, Notes.
57. The system **must** support CSV/Excel import of contacts into the CRM.
58. The system **must** support filtering and searching leads by stage, rep, source, and date range.
59. The system **must** allow attaching files (proposals, contracts) to a lead record.
60. The system **must** log all lead activity in a timeline: stage changes, notes, emails sent, calls logged.
61. The system **must** offer a "Summarise with TurfAI" button on each lead that calls `wf-lead-summarizer` to produce a quick summary of the lead's history, helping a rep catch up before a call.

### 6.11 Lead Follow-Up Reminders
62. The system **must** allow users to set a manual follow-up reminder on any lead with a date, time, and note.
63. The system **must** automatically trigger a reminder if a lead has not been updated for a configurable number of days (default: 3 days).
64. The system **must** deliver reminders via three channels: in-app notification, email, and WhatsApp message.
65. The system **must** display all upcoming reminders in a "Reminders" view sorted by due date.
66. The system **must** allow the user to mark a reminder "Done" or "Snooze" for a later time.

### 6.12 Dashboard & Analytics
67. The system **must** provide a main dashboard with KPI cards: Active Leads by Stage, Total Campaigns Sent, Email Open Rate, Posts Published, Upcoming Reminders.
68. The system **must** display lead conversion rate (Closed Won / Total Leads) as a percentage KPI.
69. The system **must** allow filtering all analytics by date range: Last 7 days / 30 days / 90 days / Custom.

---

## 7. Non-Goals (Out of Scope for V1)

- **Native mobile app** — Web-only for V1.
- **SMS distribution** — Email and WhatsApp only in V1.
- **Paid ad management** — Organic posting only; no ad spend management (Google Ads, Facebook Ads Manager).
- **eCommerce / payment processing** — No in-app checkout or billing.
- **Third-party CRM integration** — No HubSpot / Salesforce / Zoho sync; CRM is platform-native.
- **Multi-language UI** — English only in V1.
- **Direct LLM API calls** — The app must never call OpenAI, Anthropic, or any LLM API directly. All AI must go through TurfAI webhooks.
- **Building AI models in-house** — All ML/AI is delegated entirely to TurfAI.
- **Custom domain email sending** — Emails sent from platform's own domain in V1. Custom domains may be added in V2.

---

## 8. Design Considerations

### UI/UX Guidelines
- **Dark-mode-first** premium aesthetic: glassmorphism cards, vibrant accent colours, smooth micro-animations.
- **Sidebar navigation** (collapsible) grouped by module: Dashboard · Campaigns · Brochures · Ads · Social Posts · Emails · WhatsApp · CRM Pipeline · Competitor Intel · Reminders · Settings.
- Typography: **Inter** or **Outfit** (Google Fonts).
- Brochure/Ad builder: live canvas preview with template selector on the left, form inputs on the right, TurfAI generate button prominently placed.
- Kanban pipeline board: drag-and-drop cards between stages.
- All tables: column sorting, filters, pagination.
- Responsive: desktop + tablet (1024px+).

### Colour Palette
| Token | Value | Usage |
|---|---|---|
| Background | `#0D0F14` | Page background |
| Surface | `#161A22` | Cards, panels |
| Accent Primary | `#6C63FF` | Buttons, active states |
| Accent Secondary | `#00D4AA` | TurfAI actions, success states |
| Danger | `#FF4D6D` | Errors, delete |
| Warning | `#FFB300` | Reminders, alerts |

> **Convention:** Use **teal (`#00D4AA`)** for all TurfAI-powered action buttons (e.g., "Generate with TurfAI", "Summarise", "Analyse Competitors") so users visually associate teal with AI actions.

---

## 9. Technical Considerations

### Recommended Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite (or Next.js) |
| Styling | Tailwind CSS or Vanilla CSS with design tokens |
| Backend API | Node.js + Express or Python FastAPI |
| Database | PostgreSQL (with `org_id` tenant scoping on every table) |
| Queue / Jobs | BullMQ + Redis (for scheduled posts, reminders, and TurfAI webhook calls) |
| TurfAI Integration | HTTP POST client (axios / fetch) — webhook URLs stored per-tenant in DB |
| Ad/Brochure Canvas | Fabric.js or Konva.js |
| Social APIs | Meta Graph API (Instagram/Facebook), LinkedIn API, Twitter/X API v2 |
| Email | SendGrid or AWS SES (per-org credentials) |
| WhatsApp | Meta Cloud API — WhatsApp Business (per-org credentials) |
| Auth | JWT + Google OAuth 2.0 |
| File Storage | AWS S3 or Cloudflare R2 |
| Hosting | Any cloud (AWS / GCP / Azure / Render) — no preference for V1 |

### TurfAI Webhook Integration Rules

> **⚠️ Assumed Pattern: Synchronous (confirm before go-live)**
> TurfAI webhooks are treated as **synchronous HTTP request/response** calls. The app sends a POST request and waits for TurfAI to return the generated result in the same HTTP response. If TurfAI's actual implementation is asynchronous (i.e., it calls back to our app), the `TurfAIClient` service will need to be redesigned with a polling or callback receiver approach.

- The backend **must** have a central `TurfAIClient` service (a single wrapper class/module) that handles all outbound webhook calls to TurfAI. No other service or controller should call TurfAI directly.
- The `TurfAIClient` must implement the following flow:
  1. Read the org's TurfAI webhook URL and secret from the encrypted database config.
  2. POST the prompt + context payload to the TurfAI webhook URL with the secret in the `x-webhook-secret` header.
  3. **Wait synchronously** for the response (HTTP 200 with JSON result body).
  4. Parse and return the structured result to the calling service.
  5. On timeout or error: retry up to **2 times** with a **5-second delay** between retries, then return a graceful error.
- All webhook calls must have a configurable **timeout** (default: **30 seconds**).
- If the TurfAI webhook URL is not configured by the org Admin, the platform **must** show a clear user-facing message: _"Please configure the TurfAI workflow for this feature in Settings → TurfAI Workflows."_
- The frontend must show a **loading/spinner state** on TurfAI-powered buttons while awaiting the synchronous response.
- Webhook secrets must be stored **encrypted** in the database (AES-256 or equivalent) and **never** sent to the frontend client.
- The backend must log all TurfAI webhook calls (timestamp, workflow name, org, response time, success/failure) for debugging and monitoring.

### Multi-Tenancy Implementation Rules
- All database tables containing org-specific data must have a `org_id` foreign key.
- Backend middleware must inject the authenticated user's `org_id` into every query automatically.
- There must be no admin "super-query" endpoint that can fetch cross-tenant data, except for a separate platform-level admin panel (out of scope for V1).

### Security
- Passwords: bcrypt hash, minimum 12 rounds.
- API endpoints: JWT authentication required on all protected routes.
- Inputs: sanitise all user inputs (XSS / SQL injection prevention).
- Secrets: all third-party credentials (TurfAI, social APIs, email) stored encrypted in the database per tenant.
- HTTPS enforced in production.

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Brochure AI generation time (TurfAI round-trip) | < 15 seconds |
| Ad copy generation time (TurfAI round-trip) | < 10 seconds |
| Description generation time (TurfAI round-trip) | < 8 seconds |
| Social post publish success rate | ≥ 95% of scheduled posts delivered |
| Email delivery rate | ≥ 98% (non-bounced) |
| WhatsApp delivery rate | ≥ 95% |
| Lead pipeline adoption | ≥ 80% of sales reps using the pipeline daily within 30 days of launch |
| Reminder actioned rate | ≥ 70% of reminders actioned within 24 hours |
| TurfAI webhook availability | ≥ 99% uptime (monitored with alerts on failure) |
| User satisfaction (CSAT) | ≥ 4.2 / 5.0 in post-launch survey |

---

## 11. Open Questions

1. **Competitor data source** — The mechanism for fetching competitor prices (web scraping, paid API, or manual entry) is **deferred**. The TurfAI `wf-competitor-analyzer` workflow will be built, but its data input node needs to be decided before that workflow is created in TurfAI Studio.
2. **TurfAI webhook mode** — ~~Resolved~~ **Assumed synchronous** (app sends POST, TurfAI responds in the same HTTP response). This assumption drives the entire `TurfAIClient` design. **Must be confirmed with the TurfAI team before development of the TurfAI client begins.** If it turns out to be asynchronous, the client will need a polling or callback receiver redesign.
3. **Brand Kit** — Should each tenant be able to upload a brand logo, primary colours, and fonts so they are auto-applied to brochure and ad templates?
4. **WhatsApp template approval** — Who manages the creation and Meta approval of WhatsApp message templates per org? This must be done before WhatsApp distribution can go live.
5. **Email sending domain** — Will all tenant emails come from a shared platform domain, or will orgs connect their own SMTP/sending domain?
6. **TurfAI Studio access** — Who creates and maintains the TurfAI workflows (e.g., `wf-brochure-generator`)? Is this the platform team, or can each org Admin create their own workflows in TurfAI Studio?
7. **LinkedIn & Twitter API tiers** — These APIs have stricter posting quotas on free tiers. Confirm required tier/plan before including auto-posting for these platforms in V1.
8. **Lead CSV deduplication** — When importing a CSV that contains contacts matching existing CRM leads, how should duplicates be handled? (Skip / Overwrite / Merge?)
9. **Competitor monitoring frequency** — How often should the TurfAI competitor workflow be triggered per org? Daily, weekly, or on-demand only?
10. **Export** — Should the platform support exporting the full lead database and campaign reports as Excel/CSV?

---

*Document generated by AI Assistant | Requirements session: 2026-03-31 | Version: 2 (TurfAI Integration + Multi-Tenant update)*
