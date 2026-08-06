# 🔌 API Reference

The Next.js SaaS AI Template provides a REST API for managing tenant resources, profiles, and operations. All API routes are tenant-scoped and require authentication.

## Authentication

All API routes require a valid session. Authentication is handled by Auth.js v5 with support for:

- **Auth0** - Production SSO provider
- **Development Provider** - Email-based login for development

## Base URL

All tenant-scoped API routes follow the pattern:

```
/api/tenants/[tenant]/...
```

Where `[tenant]` is the tenant slug (e.g., `acme`).

---

## Profile APIs

### GET /api/tenants/[tenant]/profile/evidences

Returns all evidences for the authenticated user with processing status.

**Response:**

```json
{
  "evidences": [
    {
      "id": "uuid",
      "evidenceType": "cv" | "link" | "document" | "feedback",
      "title": "My Resume.pdf",
      "sourceRef": "file-object-uuid",
      "description": "CV uploaded during onboarding",
      "createdAt": "2024-01-15T10:00:00Z",
      "processingJob": {
        "id": "job-uuid",
        "status": "queued" | "processing" | "done" | "failed",
        "error": null,
        "startedAt": "2024-01-15T10:00:05Z",
        "finishedAt": "2024-01-15T10:00:30Z",
        "metadata": {
          "extractedSkillsCount": 15,
          "matchedCount": 12,
          "createdCount": 3
        }
      }
    }
  ]
}
```

### GET /api/tenants/[tenant]/profile/interests

Returns the authenticated user's declared skill interests.

**Response:**

```json
{
  "interests": [
    {
      "id": "uuid",
      "skillId": "skill-uuid" | null,
      "skillName": "React",
      "freeText": null,
      "intensity": "curious" | "learning" | "actively_pursuing",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/tenants/[tenant]/profile/interests

Add new interests to the user's profile.

**Request Body:**

```json
{
  "interests": [{ "skillId": "skill-uuid" }, { "freeText": "Machine Learning" }]
}
```

**Response:**

```json
{
  "success": true,
  "added": 2
}
```

### DELETE /api/tenants/[tenant]/profile/interests

Remove an interest from the user's profile.

**Request Body:**

```json
{
  "interestId": "interest-uuid"
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /api/tenants/[tenant]/profile/skills/confirm

Confirm extracted skills with self-assessment levels.

**Request Body:**

```json
{
  "jobId": "processing-job-uuid",
  "assessments": [
    {
      "skillId": "skill-uuid",
      "skillName": "TypeScript",
      "confirmedLevel": 4,
      "interested": true,
      "notes": "5 years experience"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "assessmentsCreated": 5,
  "interestsCreated": 3
}
```

---

## Skills API

### GET /api/tenants/[tenant]/skills

Returns all skills for a tenant with optional search.

**Query Parameters:**

- `search` - Search term for filtering by name

**Response:**

```json
{
  "skills": [
    {
      "id": "uuid",
      "name": "TypeScript",
      "slug": "typescript",
      "description": "Typed JavaScript superset",
      "category": "technical",
      "status": "active" | "pending"
    }
  ]
}
```

---

## Settings API

### GET /api/tenants/[tenant]/settings

Returns tenant settings.

**Response:**

```json
{
  "settings": {
    "features": {
      "cvProcessing": true,
      "aiAssistant": true,
      "evidenceUpload": true,
      "selfAssessment": true
    },
    "skillMatching": {
      "minSimilarity": 0.7,
      "maxSuggestionsPerSkill": 5
    },
    "departments": ["Engineering", "Product", "Design"],
    "skillLevels": [
      { "value": 1, "label": "Beginner" },
      { "value": 2, "label": "Familiar" },
      { "value": 3, "label": "Competent" },
      { "value": 4, "label": "Advanced" },
      { "value": 5, "label": "Expert" }
    ]
  }
}
```

### PATCH /api/tenants/[tenant]/settings

Update tenant settings by section.

**Request Body:**

```json
{
  "section": "features" | "skillMatching" | "processing" | "ui" | "info",
  "data": {
    "cvProcessing": false
  }
}
```

**Response:**

```json
{
  "settings": { ... }
}
```

---

## Admin APIs

### GET /api/tenants/[tenant]/admin/processing/[jobId]/skills

Returns extracted skills from a CV processing job.

**Response:**

```json
{
  "skills": [
    {
      "skillId": "uuid",
      "name": "React",
      "category": "technical",
      "confidence": 0.92,
      "context": "5+ years of React development",
      "isNew": false,
      "isPendingApproval": false
    }
  ],
  "metadata": {
    "extractedSkillsCount": 15,
    "matchedCount": 12,
    "createdCount": 3,
    "skippedCount": 0
  }
}
```

---

## AI Chat API

### POST /api/chat

Stream AI assistant responses. Uses Vercel AI SDK with GPT-4o.

**Request Body:**

```json
{
  "messages": [{ "role": "user", "content": "Who knows React on my team?" }],
  "tenantSlug": "acme"
}
```

**Response:** Server-Sent Events stream with AI response chunks.

**Available Tools:**

- `getMyProfile` - Get current user's profile and skills
- `searchPeople` - Find people by skill or capability
- `getSkillInfo` - Get details about a skill
- `getCapabilities` - List available capabilities
- `getRoadmaps` - Get learning roadmaps
- `getTrainings` - Get available trainings

---

## 1:1 Meeting APIs

### GET /api/tenants/[tenant]/one-on-one/meetings

List 1:1 meetings for the current user (as facilitator). Requires `one_on_one:meetings` permission.

### GET /api/tenants/[tenant]/one-on-one/meetings/[meetingId]

Get a single 1:1 meeting with full detail (title, agenda, notes, status, participants). Requires being the facilitator or having `one_on_one:meetings` permission.

### POST /api/tenants/[tenant]/one-on-one/meetings

Create a new 1:1 meeting. Body: `{ personId, scheduledAt, title?, agenda? }`.

### PATCH /api/tenants/[tenant]/one-on-one/meetings/[meetingId]

Update a meeting's title, agenda, notes, or status.

### POST /api/tenants/[tenant]/one-on-one/suggest-agenda

Generate AI-powered agenda suggestions for a 1:1 meeting based on the person's full context.

**Request Body:**

```json
{
  "personId": "uuid (required)",
  "templateId": "uuid (optional — meeting template to guide structure)",
  "existingAgenda": "string (optional — existing agenda to build upon)"
}
```

**Response:**

```json
{
  "agenda": "1. Follow up on ...\n2. Review @[TypeScript](skill:uuid) progress...",
  "title": "Growth & Tech Lead Review"
}
```

The service aggregates person context (skills, OKRs, learning progress, capability gaps, feedback, previous meetings, growth notes, action items) and generates a contextual agenda using `gpt-4o-mini`. If a `templateId` is provided, the template's items (static talking points and dynamic context types) guide the AI's output structure.

**Permissions:** Requires `one_on_one:meetings` or the caller must be the 1:1 facilitator for the person.

**Error Responses:**

- `501` — `OPENAI_API_KEY` is not configured
- `400` — `personId` is required
- `403` — Not authorized

### GET /api/tenants/[tenant]/one-on-one/templates

List meeting templates available to the current user (system templates + user's personal templates), including their items.

**Response:**

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Weekly Check-in",
      "description": "Standard weekly 1:1...",
      "isSystem": true,
      "isPersonal": false,
      "items": [
        { "content": null, "contextType": "okr_status", "sortOrder": 0 },
        { "content": "Any blockers?", "contextType": "static", "sortOrder": 1 },
        { "content": null, "contextType": "learning_progress", "sortOrder": 2 }
      ]
    }
  ]
}
```

Template items have a `contextType` that determines their behavior:

- `static` — Fixed talking point (text in `content`)
- `skill_changes` — Review skill changes since last meeting
- `learning_progress` — Review learning assignments and completions
- `okr_status` — Check OKR progress and blockers
- `capability_gaps` — Discuss capability fit and development gaps
- `recent_feedback` — Review recent feedback and recognitions

When selected in the UI, static items pre-fill the agenda directly while dynamic items appear as placeholders. The "Suggest with AI" button then resolves everything using real person data.

### GET /api/tenants/[tenant]/one-on-one/tree

Returns the 1:1 facilitation tree showing who facilitates whom. Requires `one_on_one:dashboard` permission.

---

## Error Responses

All API errors follow a standard format:

```json
{
  "error": {
    "code": "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "details": [...]
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "requestId": "req_abc123"
}
```

### Common Error Codes

| Code               | Status | Description               |
| ------------------ | ------ | ------------------------- |
| `UNAUTHORIZED`     | 401    | Authentication required   |
| `FORBIDDEN`        | 403    | Insufficient permissions  |
| `NOT_FOUND`        | 404    | Resource not found        |
| `BAD_REQUEST`      | 400    | Invalid request           |
| `VALIDATION_ERROR` | 400    | Request validation failed |
| `INTERNAL_ERROR`   | 500    | Server error              |

---

## Rate Limiting

Currently, no rate limiting is enforced. This should be added for production deployments.

## CORS

CORS is configured to allow requests from the same origin only. Configure additional origins in `next.config.ts` if needed.
