# TurfAI - Backend DMS & Job Router

## Project Overview

**Repository:** turfai (Backend Monorepo)
**Role:** Complete backend infrastructure for TurfAI workflow automation platform
**Tech Stack:** Strapi 5 + Python FastAPI + PostgreSQL + Redis + GCS
**Frontend:** Separate repo at `/Users/zunder/code/turfai-sandbox-e1aaedc5`

This is the **backend monorepo** containing all services for document processing, workflow execution, and AI/ML processing.

---

## Current Sprint

**Duration:** Nov 18-29, 2024 (2 weeks)
**Goal:** Deliver ALL 5 Priority 1 Workflow Use-Cases

**⭐ Sprint Docs Location:** `/Users/zunder/code/turfai-sandbox-e1aaedc5/docs/`

**Key Documents (in turfai-sandbox repo):**
- `docs/CONSOLIDATED_IMPLEMENTATION_PLAN_V2.md` - Master plan
- `docs/PROGRESS_TRACKER.md` - Daily checklist ⭐ **Update daily!**
- `docs/DECISIONS_LOG.md` - Technical decisions
- `docs/GOOGLE_INTEGRATIONS_PLAN.md` - OAuth/Drive/Gmail
- `docs/WORKFLOW_INTEGRATION_GUIDE.md` - API reference

**Use-Cases:**
1. **F1** - Job Application Notification & AI Summary
2. **F2** - New Hire Pre-Boarding Welcome Email
3. **F4-A** - HR Policy Ingestion & Auto-Indexing
4. **F4-B** - Employee Q&A Chatbot
5. **S1** - Performance Review Reminders (Scheduled)

---

## Related Repositories

### Frontend (turfai-sandbox)
**Path:** `/Users/zunder/code/turfai-sandbox-e1aaedc5`
**Branch:** `feature/react-flow-workflow-builder` (matches this branch)
**Port:** 8080
**Tech:** React 18 + TypeScript + React Flow + Vite

**Sprint Docs:** All planning/tracking docs are in turfai-sandbox/docs/

---

## Architecture - Backend Services

### 1. DMS (Document Management System)
**Path:** `dms/`
**Tech:** Strapi 5.10.3 + Node.js + PostgreSQL
**Port:** 1338
**Purpose:** Central API, document storage, workflow management

**Key APIs:**
- `/api/workflows/task-types` - Available task types
- `/api/workflows` - CRUD operations
- `/api/workflows/validate` - Validate workflow definitions
- `/api/workflows/:id/execute` - Execute workflow
- `/api/rag/query` - RAG semantic search ⭐
- `/api/documents/:id/enable-rag` - Index documents ⭐
- `/api/oauth/google/*` - Google OAuth
- `/api/integrations/google-drive/*` - Drive API
- `/api/integrations/gmail/*` - Gmail API

### 2. Job Router
**Path:** `router/`
**Tech:** Python FastAPI + Redis
**Port:** 8000
**Purpose:** Job queuing, workflow orchestration

### 3. Processors
**Path:** `processors/`
**Tech:** Python
**Port:** 8001
**Purpose:** Execute workflow tasks (13+ task types)

**Existing Processors:**
- `classification_task`
- `extraction_task`
- `llm_task`
- `summarization_task`
- `classify_and_extract_task`
- `document_input_task`
- `file_upload_task`
- `user_prompt_input_task`
- `results_display_task`
- `prompt_selection_task`
- `document_and_prompt_input_task`
- `ocr_task`
- `rag_retrieval_task`

**Sprint - New Processors:**
- `email_send_task` (Day 1)
- `google_drive_fetch_task` (Day 3)
- `rag_enable_task` (Day 6)
- `rag_query_task` (Day 7)
- `data_fetch_task` (Day 8)
- `foreach_task` (Day 9)

### 4. LLM Service
**Path:** `llm-service/`
**Tech:** Python FastAPI
**Port:** 9090
**Purpose:** Multi-provider LLM access (OpenAI, Anthropic, Vertex AI, Gemini)

### 5. RAG Query Service ⭐
**Path:** `rag_query_service/`
**Tech:** Python FastAPI
**Port:** 8003
**Purpose:** Vector search, embeddings, semantic Q&A

**Critical Discovery:** RAG infrastructure already exists!
- Document embedding generation
- Vector database integration
- Semantic search with citations
- Session management for conversations
- No need to build from scratch!

---

## Current Focus (Sprint Implementation)

### ✅ Existing Infrastructure
- 13 task type processors
- Workflow execution engine
- RAG infrastructure (embeddings, vector DB)
- Email sending (Nodemailer configured)
- Google Cloud Storage integration
- PostgreSQL database schemas
- Job routing system

### 🔄 Week 1 Tasks (Backend)
**Day 1:**
- [ ] Google OAuth setup (GCP project, credentials)
- [ ] Create `email_send_task` processor
- [ ] Test email sending with Nodemailer

**Day 2:**
- [ ] Create GoogleOAuthService
- [ ] Create OAuth API routes
- [ ] Create GoogleDriveService
- [ ] Create Drive API routes

**Day 3:**
- [ ] Create `google_drive_fetch_task` processor
- [ ] Create webhook trigger endpoint
- [ ] Webhook secret verification

**Day 4:**
- [ ] Test F1 workflow end-to-end
- [ ] Debug any backend issues

**Day 5:**
- [ ] Create GmailService
- [ ] Create Gmail API routes
- [ ] Test RAG enable API

### ⏳ Week 2 Tasks (Backend)
**Day 6:**
- [ ] Create `rag_enable_task` processor (wrapper around existing API)

**Day 7:**
- [ ] Install node-cron for scheduling
- [ ] Create schedule management service
- [ ] Create `rag_query_task` processor (wrapper around existing API)

**Day 8:**
- [ ] Create `data_fetch_task` processor
- [ ] HRIS database connector

**Day 9:**
- [ ] Create `foreach_task` processor
- [ ] Implement iteration + parallel execution

**Day 10:**
- [ ] End-to-end testing all 5 use-cases
- [ ] Bug fixes and polish

---

## Key Files & Locations

### DMS (Strapi)
- `dms/src/api/workflow-builder/` - Task types, validation API
- `dms/src/api/workflow-execution/` - Execution engine
- `dms/src/api/workflow-analytics/` - Metrics, stats
- `dms/src/api/rag/` - RAG enable/query/sessions ⭐
- `dms/src/api/oauth/` - Google OAuth (NEW)
- `dms/src/api/integrations/` - Google Drive/Gmail (NEW)
- `dms/src/processors/` - Task processors
- `dms/config/` - Environment variables

### Job Router
- `router/main.py` - FastAPI app
- `router/workflow_dispatcher.py` - Workflow orchestration
- `router/results_worker.py` - Results processing
- `router/config/` - Redis, DMS config

### Processors
- `processors/dispatcher.py` - Main entry point
- `processors/tasks/` - Task implementations
- `processors/config/worker_config.json` - Task registry
- `processors/turfai_client.py` - LLM service client

### RAG Service
- `rag_query_service/api/` - FastAPI service
- `rag_query_service/rag/` - Vector search logic
- `rag_query_service/config/` - Vector DB config

### Documentation
- `docs/WORKFLOW_INTEGRATION_GUIDE.md` - API reference (copied from turfai-sandbox)
- `docs/api/TESTING_GUIDE.md` - Test commands
- `examples/` - Example scripts

**⭐ Sprint Planning Docs:** In turfai-sandbox/docs/ (not here!)

---

## Development Workflow

### Start All Services
```bash
# 1. Start DMS (Strapi)
cd /Users/zunder/code/turfai/dms
npm run develop  # Port 1338

# 2. Start Job Router
cd /Users/zunder/code/turfai/router
source venv/bin/activate
python main.py  # Port 8000

# 3. Start Processors
cd /Users/zunder/code/turfai/processors
source venv/bin/activate
python -u dispatcher.py  # Port 8001

# 4. Start LLM Service
cd /Users/zunder/code/turfai/llm-service/api
source venv/bin/activate
python main.py  # Port 9090

# 5. Start RAG Service
cd /Users/zunder/code/turfai/rag_query_service
source venv/bin/activate
python main.py  # Port 8003

# 6. Start Results Worker
cd /Users/zunder/code/turfai/router
source venv/bin/activate
python results_worker.py
```

### Quick Start (Minimum)
```bash
# For frontend development, just need DMS:
cd /Users/zunder/code/turfai/dms
npm run develop

# For workflow execution, also need:
cd /Users/zunder/code/turfai/router && python main.py
cd /Users/zunder/code/turfai/processors && python -u dispatcher.py
```

### Test APIs
```bash
# Test task types
curl http://localhost:1338/api/workflows/task-types

# Test RAG query
curl -X POST http://localhost:1338/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the remote work policy?"}'

# Test document RAG enable
curl -X POST http://localhost:1338/api/documents/123/enable-rag \
  -H "Content-Type: application/json"
```

---

## Important Notes

### Task Type Registration
**Location:** `dms/src/processors/` + `processors/config/worker_config.json`

When adding new task type:
1. Create processor class in `processors/tasks/`
2. Register in `worker_config.json`
3. Add to DMS task types endpoint
4. Frontend automatically discovers it!

### RAG Infrastructure
**Already Exists!** No need to build:
- POST `/documents/:id/enable-rag` - Generates embeddings, indexes
- POST `/rag/query` - Semantic search + LLM answer generation
- Session management for conversations
- Multi-document retrieval with citations

**For F4-A:** Just create workflow task wrapper
**For F4-B:** Just create workflow task wrapper + integrate chat UI

### Google Integrations
**New for Sprint:**
- OAuth 2.0 flow (GCP project setup)
- Drive API (file listing, download)
- Gmail API (message listing, attachments)
- Store tokens encrypted in database

### Email Sending
**Already Configured:** Nodemailer setup exists
**Need:** Workflow task wrapper (`email_send_task`)

---

## Environment Variables

### Required (.env in dms/)
```bash
# Database
DATABASE_URL=postgresql://...

# Google Cloud
GCS_BUCKET_NAME=your-bucket
GOOGLE_CLOUD_PROJECT=your-project

# Google OAuth (NEW)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:1338/api/oauth/google/callback

# Email (Nodemailer)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# LLM Services
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Git Workflow

**Current Branch:** `feature/react-flow-workflow-builder`
**Frontend Branch:** `feature/react-flow-workflow-builder` (same name!)

**When Committing:**
- Backend implementation → commit to turfai
- Frontend changes → switch to turfai-sandbox, commit there
- **Update progress:** Edit turfai-sandbox/docs/PROGRESS_TRACKER.md
- **Log decisions:** Edit turfai-sandbox/docs/DECISIONS_LOG.md

**When Creating PRs:**
- Cross-reference related frontend/backend PRs
- Test locally (both repos running) before merging
- Merge backend first, then frontend

---

## Troubleshooting

### Frontend Can't Fetch Task Types
**Cause:** DMS not running or CORS issue
**Fix:**
- Check `dms/` is running on port 1338
- Check `dms/config/server.js` CORS settings

### Workflow Won't Execute
**Cause:** Job router or processors not running
**Fix:**
- Start `router/main.py` on port 8000
- Start `processors/dispatcher.py`
- Check Redis is running

### RAG Query Fails
**Cause:** RAG Query Service not running or document not indexed
**Fix:**
- Start `rag_query_service/` on port 8003
- Call `/documents/:id/enable-rag` first to index document

### Email Not Sending
**Cause:** SMTP credentials not configured or Nodemailer issue
**Fix:**
- Check `.env` in `dms/` has SMTP settings
- Test Nodemailer directly

---

## When Switching to Frontend

1. **Check progress first:**
   ```bash
   cat /Users/zunder/code/turfai-sandbox-e1aaedc5/docs/PROGRESS_TRACKER.md
   ```

2. **Open frontend repo:**
   ```bash
   cd /Users/zunder/code/turfai-sandbox-e1aaedc5
   code .  # or your IDE
   ```

3. **Read frontend context:**
   - Open `.claude/CLAUDE.md` in turfai-sandbox
   - It will guide you for frontend work

4. **Keep DMS running:**
   - Frontend needs backend API (port 1338)
   - Keep terminal with `npm run develop` active

---

## Success Metrics

**By Nov 29:**
- [ ] ⏳ All 6 new task processors implemented
- [ ] ⏳ Google OAuth + Drive + Gmail integrated
- [ ] ⏳ Email sending functional
- [ ] ⏳ Webhook triggers working
- [ ] ⏳ Scheduled execution (node-cron)
- [ ] ⏳ RAG wrappers complete
- [ ] ⏳ All 5 use-cases tested end-to-end

**Progress:** Check `turfai-sandbox/docs/PROGRESS_TRACKER.md` daily!

---

## Legacy UI (Archived)

**Location:** `ui_archived/`
**Status:** **DEPRECATED** - Do not use!

The old React admin portal has been replaced by **turfai-sandbox** (separate repo).
All frontend development now happens in turfai-sandbox.

The archived UI is kept for reference only (e.g., copying useful components like ExecutionsList).

---

## Need Help?

**Sprint Planning:**
- `/Users/zunder/code/turfai-sandbox-e1aaedc5/docs/README.md`
- `/Users/zunder/code/turfai-sandbox-e1aaedc5/docs/CONSOLIDATED_IMPLEMENTATION_PLAN_V2.md`

**API Reference:**
- `docs/WORKFLOW_INTEGRATION_GUIDE.md`
- `docs/api/TESTING_GUIDE.md`

**Frontend Context:**
- Open `/Users/zunder/code/turfai-sandbox-e1aaedc5`
- Read `.claude/CLAUDE.md` there

**System Architecture:**
- `README.md` (this repo) - Complete system overview

---

**Remember:** This repo is the **backend monorepo**. Sprint planning docs live in **turfai-sandbox/docs/** - always reference them when checking progress or making decisions!

When you need frontend work, switch to `/Users/zunder/code/turfai-sandbox-e1aaedc5` and its Claude context will guide you there.