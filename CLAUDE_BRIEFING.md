# Cartoonolgy Studio - Claude Briefing Document

## Quick Overview

**Cartoonolgy Studio** is a video production management and command center built for managing YouTube content creation pipelines. It's a Next.js 14 application that orchestrates multi-stage video production workflows through webhook integrations with external automation tools (n8n).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Frontend | React 18, Tailwind CSS |
| Database | PostgreSQL via Neon Serverless |
| State Management | React Context API |
| UI Components | Custom components + Lucide icons |

---

## Application Purpose

This application solves the problem of managing complex video production pipelines by:

1. **Tracking Projects** - Monitor video projects through 13 production stages
2. **Multi-Channel Support** - Manage content for multiple YouTube channels
3. **Script Workflow** - Generate, review, edit, and approve scripts before production
4. **Automation Integration** - Trigger external workflows via webhooks for script generation, video rendering, and thumbnail creation
5. **Real-time Updates** - Poll for status changes and display progress in real-time

---

## Directory Structure

```
/app                    # Next.js App Router pages and API routes
  /api
    /projects           # Project CRUD + generation triggers
    /channels           # Channel management
    /settings           # Webhook configuration
    /status             # Receives webhook callbacks from n8n
    /migrate            # Database migration endpoint
  /video/[id]           # Video detail page
  /analytics            # Analytics dashboard
  /settings             # Settings page
  page.tsx              # Main dashboard

/components             # React components
  /dashboard            # Dashboard-specific (VideoCard, VideoList)
  /video-detail         # Detail page components (PipelineStatus, ScriptSection)
  /channel              # Channel switching (ChannelProvider, ChannelSwitcher)
  /modals               # Modal dialogs (NewVideoModal, EditChannelModal)
  /settings             # Settings components
  /ui                   # Reusable UI primitives

/lib                    # Core logic
  /db
    schema.ts           # Database types, helpers, status constants
    index.ts            # Database connection
    migrate.ts          # Migration script
  /contexts
    VideoContext.tsx    # Global video state
  api.ts                # API client functions
  types.ts              # TypeScript types
```

---

## Database Schema

### Three Tables:

**1. `projects`** - Video production projects
```
- project_id (PK)
- title, status
- duration_hours, duration_minutes
- total_sections, current_section
- main_characters, primary_locations, central_theme, tone
- script, script_approved
- thumbnail_suggestions[]
- video_status, video_drive_folder
- channel_id (FK → channels)
- error
- created_at, updated_at
```

**2. `channels`** - Production channels
```
- channel_id (PK)
- name, slug (unique), description
- color, avatar_url
- created_at, updated_at
```

**3. `settings`** - Key-value configuration
```
- key (PK): webhook_script, webhook_video, webhook_thumbnail
- value, updated_at
```

---

## Production Pipeline (13 Stages)

Projects flow through these statuses:

```
1. Outline in progress
2. Outline done
3. Sections in creation
4. Sections done
5. Script Assembly
6. Ready for Voiceover
7. Voiceover in progress
8. Voiceover done
9. Images generating
10. Video assembly
11. Thumbnail creation
12. Upload pending
13. Published ← Terminal
    Failed ← Terminal
```

**Video Generation Sub-Pipeline:**
```
Section Chunking → Rendering → Finalizing → Video Finished
```

---

## API Endpoints

### Projects
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects` | List projects (filter by `?channel_id=`) |
| POST | `/api/projects` | Create project + trigger script webhook |
| GET | `/api/projects/[id]` | Get single project |
| DELETE | `/api/projects/[id]` | Delete project |
| PATCH | `/api/projects/[id]` | Update status |
| PUT | `/api/projects/[id]` | Update fields (script, etc.) |

### Project Actions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/projects/[id]/approve-script` | Toggle script approval |
| POST | `/api/projects/[id]/generate-video` | Trigger video generation webhook |
| POST | `/api/projects/[id]/generate-thumbnails` | Trigger thumbnail webhook |
| POST | `/api/projects/[id]/section-progress` | Update section progress |

### Other
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/channels` | List/create channels |
| GET/PUT | `/api/settings` | Get/update webhook URLs |
| POST | `/api/status` | Receive n8n webhook callbacks |
| POST | `/api/migrate` | Run DB migrations |

---

## Key Workflows

### 1. Creating a New Project
```
User clicks "New Video" → NewVideoModal opens
  → User enters title, duration, selects channel
  → POST /api/projects
    → Creates DB record
    → Triggers script generation webhook (n8n)
    → n8n processes and calls POST /api/status with updates
```

### 2. Script Approval Flow
```
Script generated by n8n → Status updates to "Script Assembly" or later
  → User reviews script in video detail page
  → User can edit script manually
  → User clicks "Approve Script"
    → POST /api/projects/[id]/approve-script
    → script_approved = true
    → Enables video/thumbnail generation buttons
```

### 3. Video Generation
```
User clicks "Generate Video" (requires approved script)
  → POST /api/projects/[id]/generate-video
    → Fetches webhook_video URL from settings
    → Sends project data to n8n
    → n8n renders video and calls POST /api/status
    → Updates: video_status, video_drive_folder
```

### 4. Real-time Polling
```
Dashboard loads → fetches all projects
  → Detects projects with in-progress status
  → Starts 10-second polling interval
  → Refetches projects, updates UI
  → Stops when all projects reach terminal state
```

---

## Important Implementation Details

### Status Updates from n8n
The `/api/status` endpoint accepts these fields:
```typescript
{
  project_id: string        // Required
  status?: string           // Pipeline status
  script?: string           // Generated script
  total_sections?: number
  current_section?: number
  main_characters?: string
  primary_locations?: string
  central_theme?: string
  tone?: string
  thumbnail_suggestions?: string[]
  error?: string
  video_status?: string     // Video sub-pipeline status
  video_drive_folder?: string
}
```

### Caching Strategy
- All API routes use `export const dynamic = "force-dynamic"`
- Client uses cache-busting: `?t=${Date.now()}`
- This ensures fresh data on every request

### Channel Provider
- Stores selected channel in localStorage
- Provides channel context to all components
- Filters projects by selected channel

### Video Context
- Manages global video list state
- Controls modal visibility
- Handles loading states
- Used by dashboard and video detail pages

---

## Environment Variables

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
WEBHOOK_SECRET=optional_secret_for_validating_incoming_webhooks
```

---

## Default Channels (Seeded)

| Slug | Name | Color |
|------|------|-------|
| cartoonolgy | Cartoonolgy | Gold (#FFD700) |
| ricktopus | Ricktopus | Orange (#FF6B35) |
| red-umbrella | Red Umbrella | Red (#FF0000) |
| hidden-hokage | Hidden Hokage | Orange (#FF6B00) |
| beyond-ultra | Beyond Ultra | Purple (#9B59B6) |

---

## Key Files to Understand

| File | Why It's Important |
|------|-------------------|
| `lib/db/schema.ts` | All database types, status constants, helper functions |
| `lib/types.ts` | TypeScript types including PIPELINE_STAGES |
| `lib/api.ts` | All API client functions used by frontend |
| `lib/contexts/VideoContext.tsx` | Global state management |
| `components/channel/ChannelProvider.tsx` | Channel selection logic |
| `app/api/status/route.ts` | How external webhooks update projects |
| `app/api/projects/route.ts` | Project creation + webhook triggering |
| `components/video-detail/PipelineStatus.tsx` | Visual pipeline stepper |

---

## Common Development Tasks

### Adding a New Pipeline Stage
1. Update `PIPELINE_STAGES` in `lib/types.ts`
2. Update `PIPELINE_STAGE_ICONS` in `lib/db/schema.ts`
3. Update `PipelineStatus.tsx` component if needed

### Adding a New Webhook
1. Add setting key to `lib/db/schema.ts`
2. Add UI control in `components/settings/WebhookSettings.tsx`
3. Create API endpoint to trigger it in `app/api/projects/[id]/`
4. Add client function in `lib/api.ts`

### Adding a New Project Field
1. Add to database schema (migration)
2. Update `DBProject` type in `lib/db/schema.ts`
3. Update `Video` type in `lib/types.ts`
4. Update `/api/status` to accept updates
5. Update UI components to display it

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Dashboard → VideoList → VideoCard                          │
│  VideoDetail → ScriptSection, PipelineStatus                │
│  Settings → WebhookSettings, ChannelSettings                │
│              ↓                                              │
│         VideoContext + ChannelProvider                      │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch/API calls
┌────────────────────────┴────────────────────────────────────┐
│                    NEXT.JS API LAYER                        │
│  /api/projects/* - CRUD + webhook triggers                  │
│  /api/status - Receives external webhook callbacks          │
│  /api/channels - Channel management                         │
│  /api/settings - Configuration                              │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL queries
┌────────────────────────┴────────────────────────────────────┐
│              POSTGRESQL (NEON SERVERLESS)                   │
│  projects | channels | settings                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL (n8n Automation)                       │
│  ← Webhook triggers (script, video, thumbnail generation)   │
│  → Status callbacks to /api/status                          │
└─────────────────────────────────────────────────────────────┘
```

---

This briefing should give any AI assistant the context needed to understand and work with this codebase effectively.
