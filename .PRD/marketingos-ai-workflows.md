# MarketingOS AI Workflow Suite Design

## 1. Webhook Integration Pattern

**Webhook URL Format:**  
`POST /api/ai/:feature` (e.g., `/api/ai/wf-marketing-brain-index`)

**Headers:**  
- `Content-Type: application/json`
- `x-webhook-secret: <your-shared-secret>`
- `x-org-id: <orgId>` (optional, if not in payload)

**Payload Envelope (all features):**
```json
{
  "orgId": "string",
  "feature": "string",
  "prompt": "string or object", // varies by workflow
  "input": { ... } // varies by workflow
}
```

**Response Envelope (all features):**
```json
{
  "success": true,
  "data": { ... }, // varies by workflow
  "error": null // or error message
}
```

---

## 2. Workflow Definitions

### wf-marketing-brain-index

**Purpose:** Index brand guidelines (text/files) into tenant-isolated RAG.

- **Node Config:**
  - `type`: "rag_enable_task"
  - `inputs`: `orgId`, `documents` (URLs or text)
- **Processor:** `rag_enable_task`
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-marketing-brain-index",
      "input": {
        "documents": [
          { "url": "https://...", "type": "pdf" },
          { "text": "Brand guidelines text...", "type": "text" }
        ]
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "indexed_count": 2,
        "document_ids": ["doc1", "doc2"]
      },
      "error": null
    }
    ```

---

### wf-marketing-brain-query

**Purpose:** Strategy Assistant, strictly grounded in indexed org data.

- **Node Config:**
  - `type`: "rag_query_task"
  - `inputs`: `orgId`, `query`
- **Processor:** `rag_query_task`
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-marketing-brain-query",
      "input": {
        "query": "What is our approved tone for social posts?"
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "answer": "Your approved tone is friendly, concise, and professional.",
        "citations": [
          { "document_id": "doc1", "snippet": "Our tone is friendly..." }
        ]
      },
      "error": null
    }
    ```

---

### wf-brochure-generator

**Purpose:** Generate brochure copy, cross-referencing Marketing Brain.

- **Node Config:**
  - `type`: "llm_task"
  - `inputs`: `orgId`, `product_specs`, `tone`
  - `dependencies`: "rag_query_task" (for grounding)
- **Processor:** `llm_task` (with RAG grounding)
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-brochure-generator",
      "input": {
        "product_specs": { "name": "SuperWidget", "features": ["Fast", "Reliable"] },
        "tone": "playful"
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "headline": "Meet SuperWidget",
        "tagline": "Speed and reliability, redefined.",
        "feature_bullets": [
          "Blazing fast performance",
          "Unmatched reliability"
        ],
        "cta": "Get started today!",
        "footer": "© 2026 Acme Corp. All rights reserved."
      },
      "error": null
    }
    ```

---

### wf-ad-copy-generator

**Purpose:** Generate ad copy for 4 platforms using a For Each loop.

- **Node Config:**
  - `type`: "foreach_task"
  - `inputs`: `orgId`, `product`, `platforms` (["Instagram", "Facebook", ...])
  - `child`: "llm_task" (with RAG grounding)
- **Processors:** `foreach_task` → `llm_task`
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-ad-copy-generator",
      "input": {
        "product": "SuperWidget",
        "platforms": ["Instagram", "Facebook", "LinkedIn", "Twitter"]
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": [
        { "platform": "Instagram", "copy": "Meet SuperWidget. Fast. Reliable. #Brand" },
        { "platform": "Facebook", "copy": "Discover SuperWidget—speed and reliability for you." },
        { "platform": "LinkedIn", "copy": "SuperWidget: The professional's choice for speed." },
        { "platform": "Twitter", "copy": "SuperWidget: Fast. Reliable. Yours. #AcmeCorp" }
      ],
      "error": null
    }
    ```

---

### wf-lead-summarizer

**Purpose:** Summarize a lead’s activity timeline and notes.

- **Node Config:**
  - `type`: "summarization_task"
  - `inputs`: `orgId`, `lead_timeline` (array of events/notes)
- **Processor:** `summarization_task`
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-lead-summarizer",
      "input": {
        "lead_timeline": [
          { "date": "2026-03-01", "event": "Visited pricing page" },
          { "date": "2026-03-02", "event": "Requested demo" }
        ]
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "summary": "The lead showed interest by visiting the pricing page and requesting a demo."
      },
      "error": null
    }
    ```

---

### wf-competitor-analyzer

**Purpose:** Extract pricing data from competitor sites/ads (text & images).

- **Node Config:**
  - `type`: ["extraction_task", "ocr_task"]
  - `inputs`: `orgId`, `sources` (URLs, screenshots)
- **Processors:** `extraction_task`, `ocr_task`
- **JSON Schema:**
  - **Request:**
    ```json
    {
      "orgId": "acme-corp",
      "feature": "wf-competitor-analyzer",
      "input": {
        "sources": [
          { "url": "https://competitor.com/pricing", "type": "web" },
          { "url": "https://imgur.com/ad123.png", "type": "image" }
        ]
      }
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "pricing_data": [
          { "competitor": "CompetitorX", "plan": "Pro", "price": "$49/mo" }
        ],
        "trend_prediction": "CompetitorX likely to reduce prices in Q3."
      },
      "error": null
    }
    ```

---

## 3. Summary Table

| Workflow                  | Node Type(s)                | Processor(s)                | Webhook URL                       | Input Schema Key Fields                | Output Schema Key Fields         |
|---------------------------|-----------------------------|-----------------------------|------------------------------------|----------------------------------------|----------------------------------|
| wf-marketing-brain-index  | rag_enable_task             | rag_enable_task             | /api/ai/wf-marketing-brain-index   | orgId, documents                      | indexed_count, document_ids      |
| wf-marketing-brain-query  | rag_query_task              | rag_query_task              | /api/ai/wf-marketing-brain-query   | orgId, query                          | answer, citations                |
| wf-brochure-generator     | llm_task (+rag_query_task)  | llm_task                    | /api/ai/wf-brochure-generator      | orgId, product_specs, tone            | headline, tagline, ...           |
| wf-ad-copy-generator      | foreach_task, llm_task      | foreach_task, llm_task      | /api/ai/wf-ad-copy-generator       | orgId, product, platforms             | [{platform, copy}]               |
| wf-lead-summarizer        | summarization_task          | summarization_task          | /api/ai/wf-lead-summarizer         | orgId, lead_timeline                  | summary                          |
| wf-competitor-analyzer    | extraction_task, ocr_task   | extraction_task, ocr_task   | /api/ai/wf-competitor-analyzer     | orgId, sources                        | pricing_data, trend_prediction   |

---

## 4. Multi-Tenancy & Brand Consistency

- All workflows require `orgId` in every request.
- RAG (Marketing Brain) is always scoped by `orgId` for both indexing and querying.
- All creative outputs (brochures, ads) are grounded via the org’s RAG index for brand consistency.

---

## 5. Security

- Every webhook must include `x-webhook-secret` header for authentication.
- All payloads must include `orgId` for tenant isolation.

---

**This structure ensures robust, brand-consistent, multi-tenant AI workflows with clear integration points for your Node.js/Express backend.**
