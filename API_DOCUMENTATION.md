# Cartoonolgy Studio API Documentation

A comprehensive API reference for the Cartoonolgy Studio video production management application.

## Table of Contents

- [Overview](#overview)
- [Projects API](#projects-api)
  - [List All Projects](#list-all-projects)
  - [Create Project](#create-project)
  - [Get Project](#get-project)
  - [Update Project Fields](#update-project-fields)
  - [Update Project Status](#update-project-status)
  - [Delete Project](#delete-project)
- [Project Actions API](#project-actions-api)
  - [Update Script Status](#update-script-status)
  - [Generate Video](#generate-video)
  - [Generate Thumbnails](#generate-thumbnails)
  - [Update Section Progress](#update-section-progress)
- [Channels API](#channels-api)
  - [List All Channels](#list-all-channels)
  - [Create Channel](#create-channel)
  - [Get Channel](#get-channel)
  - [Update Channel](#update-channel)
  - [Delete Channel](#delete-channel)
- [Settings API](#settings-api)
  - [Get Settings](#get-settings)
  - [Update Settings](#update-settings)
- [Status Webhook API](#status-webhook-api)
  - [Update Project Status (n8n Webhook)](#update-project-status-n8n-webhook)
- [Migration API](#migration-api)
  - [Run Migrations](#run-migrations)
- [Data Models](#data-models)
- [Webhook Integration](#webhook-integration)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## Overview

### Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

### Authentication

Most endpoints are publicly accessible. The following endpoints support optional webhook secret authentication via the `x-webhook-secret` header:

- `POST /api/status`
- `POST /api/projects/[id]/section-progress`

Set the `WEBHOOK_SECRET` environment variable to enable authentication for these endpoints.

### Content-Type

All endpoints accept and return JSON:

```
Content-Type: application/json
```

### Cache Control

All API responses include cache-busting headers:

```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
```

### Rate Limiting

No rate limiting is currently implemented. Consider implementing rate limiting for production use.

---

## Projects API

### List All Projects

Retrieves all projects, optionally filtered by channel.

**Endpoint:** `GET /api/projects`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_id` | string | No | - | Filter projects by channel ID |
| `fresh` | string | No | - | Set to `"true"` to bypass cache |

#### Response

**Success (200 OK)**

```json
{
  "projects": [
    {
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Why Squidward Is Actually The Hero",
      "status": "Outline in progress",
      "duration_hours": 0,
      "duration_minutes": 15,
      "total_sections": null,
      "current_section": 0,
      "main_characters": null,
      "primary_locations": null,
      "central_theme": null,
      "tone": null,
      "script_url": null,
      "script_status": "pending",
      "thumbnail_suggestions": null,
      "error": null,
      "channel_id": "cartoonolgy",
      "video_status": null,
      "video_drive_folder": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error (500 Internal Server Error)**

```json
{
  "error": "Failed to fetch projects"
}
```

#### Examples

**cURL**
```bash
# Get all projects
curl -X GET "https://your-app.vercel.app/api/projects"

# Get projects for a specific channel
curl -X GET "https://your-app.vercel.app/api/projects?channel_id=cartoonolgy"

# Force fresh data (bypass cache)
curl -X GET "https://your-app.vercel.app/api/projects?fresh=true"
```

**JavaScript/Fetch**
```javascript
// Get all projects
const response = await fetch('/api/projects');
const data = await response.json();
console.log(data.projects);

// Get projects filtered by channel
const response = await fetch('/api/projects?channel_id=cartoonolgy');
const data = await response.json();
```

---

### Create Project

Creates a new video project in the database.

**Endpoint:** `POST /api/projects`

#### Request Body

```typescript
interface CreateProjectRequest {
  title: string;              // Required, min 1 character
  duration_hours: number;     // Required, 0-10
  duration_minutes: number;   // Required, 0-59
  project_id?: string;        // Optional, must be valid UUID if provided
  channel_id?: string;        // Optional, must exist if provided
}
```

**Example Request Body**
```json
{
  "title": "The Secret Life of Patrick Star",
  "duration_hours": 0,
  "duration_minutes": 20,
  "channel_id": "cartoonolgy"
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The Secret Life of Patrick Star",
    "status": "Outline in progress",
    "duration_hours": 0,
    "duration_minutes": 20,
    "total_sections": null,
    "current_section": 0,
    "main_characters": null,
    "primary_locations": null,
    "central_theme": null,
    "tone": null,
    "script_url": null,
    "script_status": "pending",
    "thumbnail_suggestions": null,
    "error": null,
    "channel_id": "cartoonolgy",
    "video_status": null,
    "video_drive_folder": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Title is required"` | Title is missing or empty |
| 400 | `"Duration hours must be a non-negative number"` | Invalid hours value |
| 400 | `"Duration minutes must be between 0 and 59"` | Invalid minutes value |
| 400 | `"Invalid project_id format. Must be a valid UUID."` | Invalid UUID format |
| 400 | `"Channel not found"` | Specified channel_id doesn't exist |
| 409 | `"Project with this ID already exists"` | Duplicate project_id |
| 500 | `"Failed to create project"` | Server error |

#### Examples

**cURL**
```bash
curl -X POST "https://your-app.vercel.app/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Secret Life of Patrick Star",
    "duration_hours": 0,
    "duration_minutes": 20,
    "channel_id": "cartoonolgy"
  }'
```

**JavaScript/Fetch**
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'The Secret Life of Patrick Star',
    duration_hours: 0,
    duration_minutes: 20,
    channel_id: 'cartoonolgy',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Created project:', data.project);
}
```

---

### Get Project

Retrieves a single project by ID.

**Endpoint:** `GET /api/projects/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fresh` | string | No | - | Set to `"true"` to bypass cache |

#### Response

**Success (200 OK)**
```json
{
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Why Squidward Is Actually The Hero",
    "status": "Script Assembly",
    "duration_hours": 0,
    "duration_minutes": 15,
    "total_sections": 5,
    "current_section": 3,
    "main_characters": "Squidward, SpongeBob, Patrick",
    "primary_locations": "Bikini Bottom, Krusty Krab",
    "central_theme": "Hidden heroism in everyday life",
    "tone": "Analytical, humorous",
    "script_url": "https://docs.google.com/document/d/1abc123/edit",
    "script_status": "draft",
    "thumbnail_suggestions": ["Squidward looking heroic", "Split comparison shot"],
    "error": null,
    "channel_id": "cartoonolgy",
    "video_status": null,
    "video_drive_folder": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T12:45:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to fetch project"` | Server error |

#### Examples

**cURL**
```bash
curl -X GET "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000"
```

**JavaScript/Fetch**
```javascript
const projectId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`/api/projects/${projectId}`);
const data = await response.json();

if (response.ok) {
  console.log('Project:', data.project);
} else {
  console.error('Error:', data.error);
}
```

---

### Update Project Fields

Updates project fields like `script_url`.

**Endpoint:** `PUT /api/projects/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Request Body

```typescript
interface UpdateProjectRequest {
  script_url?: string;  // Must be valid Google Docs URL
}
```

**Example Request Body**
```json
{
  "script_url": "https://docs.google.com/document/d/1abc123def456/edit"
}
```

#### Validation

The `script_url` must be a valid Google Docs URL matching the pattern:
- Domain: `docs.google.com`
- Path: `/document/d/[DOCUMENT_ID]/...`

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Why Squidward Is Actually The Hero",
    "script_url": "https://docs.google.com/document/d/1abc123def456/edit",
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"script_url must be a valid Google Docs URL..."` | Invalid URL format |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to update project"` | Server error |

#### Examples

**cURL**
```bash
curl -X PUT "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "script_url": "https://docs.google.com/document/d/1abc123def456/edit"
  }'
```

**JavaScript/Fetch**
```javascript
const response = await fetch(`/api/projects/${projectId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    script_url: 'https://docs.google.com/document/d/1abc123def456/edit',
  }),
});
```

---

### Update Project Status

Updates the project pipeline status.

**Endpoint:** `PATCH /api/projects/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Request Body

```typescript
interface UpdateStatusRequest {
  status: string;  // Required, see ProjectStatus values below
}
```

**Valid Status Values**
- `"Outline in progress"`
- `"Outline done"`
- `"Sections in creation"`
- `"Sections done"`
- `"Script Assembly"`
- `"Voiceover in progress"`
- `"Voiceover done"`
- `"Images generating"`
- `"Video assembly"`
- `"Thumbnail creation"`
- `"Upload pending"`
- `"Published"`
- `"Failed"`

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Script Assembly",
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Status is required"` | Missing status field |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to update project"` | Server error |

#### Examples

**cURL**
```bash
curl -X PATCH "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "Script Assembly"}'
```

**JavaScript/Fetch**
```javascript
const response = await fetch(`/api/projects/${projectId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'Script Assembly' }),
});
```

---

### Delete Project

Permanently deletes a project.

**Endpoint:** `DELETE /api/projects/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Response

**Success (200 OK)**
```json
{
  "success": true
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to delete project"` | Server error |

#### Examples

**cURL**
```bash
curl -X DELETE "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000"
```

**JavaScript/Fetch**
```javascript
const response = await fetch(`/api/projects/${projectId}`, {
  method: 'DELETE',
});

if (response.ok) {
  console.log('Project deleted successfully');
}
```

---

## Project Actions API

### Update Script Status

Updates the script approval status for a project.

**Endpoint:** `POST /api/projects/[id]/approve-script`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Request Body

```typescript
interface ApproveScriptRequest {
  status: 'pending' | 'draft' | 'approved';
}
```

**Example Request Body**
```json
{
  "status": "approved"
}
```

#### Validation Rules

- When setting status to `"approved"`, the project must have a valid `script_url` set
- Valid status values: `"pending"`, `"draft"`, `"approved"`

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "script_status": "approved",
    "script_url": "https://docs.google.com/document/d/1abc123/edit"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"status must be one of: pending, draft, approved"` | Invalid status value |
| 400 | `"Cannot approve script: No script URL has been set..."` | Trying to approve without script_url |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to update script status"` | Server error |

#### Examples

**cURL**
```bash
curl -X POST "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000/approve-script" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

**JavaScript/Fetch**
```javascript
const response = await fetch(`/api/projects/${projectId}/approve-script`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'approved' }),
});
```

---

### Generate Video

Triggers the video generation webhook for a project with an approved script.

**Endpoint:** `POST /api/projects/[id]/generate-video`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Prerequisites

1. Script must be approved (`script_status === 'approved'`)
2. Script URL must be set
3. Video generation webhook must be configured in settings
4. No video generation already in progress

#### Webhook Payload Sent

```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "channel_id": "cartoonolgy",
  "channel_name": "Cartoonolgy",
  "title": "Why Squidward Is Actually The Hero",
  "script_url": "https://docs.google.com/document/d/1abc123/edit"
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Video generation started"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Script must be approved before generating video"` | Script not approved |
| 400 | `"Script URL is not set"` | Missing script_url |
| 400 | `"Video generation already in progress"` | Already generating |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Video generation webhook not configured..."` | Webhook not set up |
| 500 | `"Video generation webhook request timed out"` | Webhook timeout |
| 500 | `"Failed to trigger video generation"` | Webhook failed |

#### Examples

**cURL**
```bash
curl -X POST "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000/generate-video" \
  -H "Content-Type: application/json"
```

**JavaScript/Fetch**
```javascript
const response = await fetch(`/api/projects/${projectId}/generate-video`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});

const data = await response.json();
if (data.success) {
  console.log('Video generation started!');
}
```

---

### Generate Thumbnails

Triggers the thumbnail generation webhook for a project.

**Endpoint:** `POST /api/projects/[id]/generate-thumbnails`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Prerequisites

1. Script must be approved (`script_status === 'approved'`)
2. Script URL must be set
3. Thumbnail webhook must be configured in settings

#### Webhook Payload Sent

```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "channel_id": "cartoonolgy",
  "channel_name": "Cartoonolgy",
  "title": "Why Squidward Is Actually The Hero",
  "script_url": "https://docs.google.com/document/d/1abc123/edit"
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Script must be approved before generating thumbnails"` | Script not approved |
| 400 | `"No script URL available to generate thumbnails from"` | Missing script_url |
| 400 | `"Thumbnail webhook URL not configured..."` | Webhook not set up |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Webhook returned status [code]"` | Webhook error |
| 500 | `"Webhook request timed out"` | Webhook timeout |
| 500 | `"Failed to trigger thumbnail generation"` | Server error |

#### Examples

**cURL**
```bash
curl -X POST "https://your-app.vercel.app/api/projects/550e8400-e29b-41d4-a716-446655440000/generate-thumbnails" \
  -H "Content-Type: application/json"
```

---

### Update Section Progress

Updates the current section progress for a project (typically called by n8n during processing).

**Endpoint:** `POST /api/projects/[id]/section-progress`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

#### Headers (Optional)

| Header | Description |
|--------|-------------|
| `x-webhook-secret` | Webhook authentication secret (if `WEBHOOK_SECRET` env var is set) |

#### Request Body

```typescript
interface SectionProgressRequest {
  current_section?: number;  // Set to specific value
  increment?: boolean;       // Or increment by 1
}
```

**Example: Set specific section**
```json
{
  "current_section": 3
}
```

**Example: Increment section**
```json
{
  "increment": true
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "current_section": 3,
    "total_sections": 5
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Invalid JSON body"` | Malformed request |
| 400 | `"Either current_section or increment must be provided"` | Missing required field |
| 401 | `"Unauthorized"` | Invalid webhook secret |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to update section progress"` | Server error |

---

## Channels API

### List All Channels

Retrieves all channels with project counts.

**Endpoint:** `GET /api/channels`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fresh` | string | No | - | Set to `"true"` to bypass cache |

#### Response

**Success (200 OK)**
```json
{
  "channels": [
    {
      "channel_id": "cartoonolgy",
      "name": "Cartoonolgy",
      "slug": "cartoonolgy",
      "description": "Deep dives into cartoon lore and analysis",
      "color": "#00d4ff",
      "avatar_url": "https://example.com/avatar.png",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "project_count": 12
    }
  ]
}
```

#### Examples

**cURL**
```bash
curl -X GET "https://your-app.vercel.app/api/channels"
```

---

### Create Channel

Creates a new YouTube channel.

**Endpoint:** `POST /api/channels`

#### Request Body

```typescript
interface CreateChannelRequest {
  name: string;           // Required, max 100 characters
  slug?: string;          // Optional, auto-generated from name if not provided
  description?: string;   // Optional
  color?: string;         // Optional, defaults to "#00d4ff", must be hex format
  avatar_url?: string;    // Optional
}
```

**Example Request Body**
```json
{
  "name": "SpongeBob Theories",
  "description": "Fan theories and deep dives",
  "color": "#FFE135"
}
```

#### Validation

- `name`: Required, 1-100 characters
- `slug`: Must contain only lowercase letters, numbers, and hyphens
- `color`: Must be valid hex color (e.g., `#FF0000`)

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "channel": {
    "channel_id": "spongebob-theories",
    "name": "SpongeBob Theories",
    "slug": "spongebob-theories",
    "description": "Fan theories and deep dives",
    "color": "#FFE135",
    "avatar_url": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Name is required"` | Missing or empty name |
| 400 | `"Name must be 100 characters or less"` | Name too long |
| 400 | `"Could not generate a valid slug from the name"` | Invalid name for slug |
| 400 | `"Slug must only contain lowercase letters, numbers, and hyphens"` | Invalid slug format |
| 400 | `"Color must be a valid hex color (e.g., #FF0000)"` | Invalid color format |
| 400 | `"Channel with this slug already exists"` | Duplicate slug |
| 500 | `"Failed to create channel"` | Server error |

#### Examples

**cURL**
```bash
curl -X POST "https://your-app.vercel.app/api/channels" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SpongeBob Theories",
    "description": "Fan theories and deep dives",
    "color": "#FFE135"
  }'
```

---

### Get Channel

Retrieves a single channel by ID.

**Endpoint:** `GET /api/channels/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Channel ID (same as slug) |

#### Response

**Success (200 OK)**
```json
{
  "channel": {
    "channel_id": "cartoonolgy",
    "name": "Cartoonolgy",
    "slug": "cartoonolgy",
    "description": "Deep dives into cartoon lore",
    "color": "#00d4ff",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `"Channel not found"` | No channel with given ID |
| 500 | `"Failed to fetch channel"` | Server error |

---

### Update Channel

Updates channel properties.

**Endpoint:** `PUT /api/channels/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Channel ID |

#### Request Body

All fields are optional. Only provided fields will be updated.

```typescript
interface UpdateChannelRequest {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  avatar_url?: string;
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "channel": {
    "channel_id": "cartoonolgy",
    "name": "Cartoonolgy Updated",
    "slug": "cartoonolgy",
    "description": "Updated description",
    "color": "#FF0000",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Name cannot be empty"` | Empty name provided |
| 400 | `"Name must be 100 characters or less"` | Name too long |
| 400 | `"Slug must only contain lowercase letters, numbers, and hyphens"` | Invalid slug |
| 400 | `"Channel with this slug already exists"` | Slug conflict |
| 400 | `"Color must be a valid hex color (e.g., #FF0000)"` | Invalid color |
| 404 | `"Channel not found"` | No channel with given ID |
| 500 | `"Failed to update channel"` | Server error |

---

### Delete Channel

Deletes a channel (only if no projects are linked).

**Endpoint:** `DELETE /api/channels/[id]`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Channel ID |

#### Response

**Success (200 OK)**
```json
{
  "success": true
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Cannot delete channel with existing projects"` | Channel has projects |
| 404 | `"Channel not found"` | No channel with given ID |
| 500 | `"Failed to delete channel"` | Server error |

---

## Settings API

### Get Settings

Retrieves all webhook configuration settings.

**Endpoint:** `GET /api/settings`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fresh` | string | No | - | Set to `"true"` to bypass cache |

#### Response

**Success (200 OK)**
```json
{
  "webhook_url": "https://n8n.example.com/webhook/script",
  "webhook_script": "https://n8n.example.com/webhook/script",
  "webhook_video": "https://n8n.example.com/webhook/video",
  "webhook_thumbnail": "https://n8n.example.com/webhook/thumbnail",
  "thumbnail_webhook_url": null,
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Fields**

| Field | Description |
|-------|-------------|
| `webhook_script` | URL triggered when starting new production (primary) |
| `webhook_url` | Legacy alias for webhook_script |
| `webhook_video` | URL triggered for video generation |
| `webhook_thumbnail` | URL triggered for thumbnail generation (primary) |
| `thumbnail_webhook_url` | Legacy alias for webhook_thumbnail |
| `updated_at` | Most recent update timestamp |

---

### Update Settings

Updates a webhook URL setting.

**Endpoint:** `PUT /api/settings`

#### Request Body

```typescript
interface UpdateSettingRequest {
  key: string;    // One of the allowed keys
  value: string;  // Valid URL or empty string to clear
}
```

**Allowed Keys**
- `webhook_url` (legacy)
- `webhook_script`
- `webhook_video`
- `webhook_thumbnail`
- `thumbnail_webhook_url` (legacy)

**Example Request Body**
```json
{
  "key": "webhook_video",
  "value": "https://n8n.example.com/webhook/video-generation"
}
```

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "webhook_video": "https://n8n.example.com/webhook/video-generation",
  "updated_at": "2024-01-15T14:00:00.000Z"
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Missing required fields: key and value"` | Missing fields |
| 400 | `"Only webhook_url, webhook_script, ... can be updated"` | Invalid key |
| 400 | `"Invalid URL format"` | Malformed URL |
| 500 | `"Failed to update settings"` | Server error |

#### Examples

**cURL**
```bash
curl -X PUT "https://your-app.vercel.app/api/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "webhook_video",
    "value": "https://n8n.example.com/webhook/video-generation"
  }'
```

---

## Status Webhook API

### Update Project Status (n8n Webhook)

Receives status updates from n8n automation workflows. This is the primary endpoint for external systems to update project progress.

**Endpoint:** `POST /api/status`

#### Headers (Optional)

| Header | Description |
|--------|-------------|
| `x-webhook-secret` | Webhook authentication secret (if `WEBHOOK_SECRET` env var is set) |

#### Request Body

```typescript
interface StatusUpdateRequest {
  project_id: string;                          // Required
  status?: string;                             // Pipeline status
  script_url?: string;                         // Google Docs URL
  script_status?: 'pending' | 'draft' | 'approved';
  total_sections?: number;
  current_section?: number;
  main_characters?: string | string[];         // Can be string or array
  primary_locations?: string | string[];       // Can be string or array
  central_theme?: string;
  tone?: string;
  thumbnail_suggestions?: string[];
  error?: string | null;                       // Set null to clear error
  video_status?: string;                       // Video generation status
  video_drive_folder?: string;                 // Google Drive folder URL
}
```

**Example: Update from script generation**
```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "Script Assembly",
  "script_url": "https://docs.google.com/document/d/1abc123/edit",
  "script_status": "draft",
  "total_sections": 5,
  "main_characters": ["SpongeBob", "Patrick", "Squidward"],
  "primary_locations": "Bikini Bottom, Krusty Krab",
  "central_theme": "Friendship and perseverance",
  "tone": "Humorous, analytical"
}
```

**Example: Update video generation status**
```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "video_status": "Rendering",
  "current_section": 3
}
```

**Example: Set error state**
```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "Failed",
  "error": "Script generation failed: API rate limit exceeded"
}
```

#### Validation

- `project_id` is required
- At least one update field must be provided
- `script_url` must be a valid Google Docs URL if provided
- `script_status` must be one of: `pending`, `draft`, `approved`
- Arrays for `main_characters` and `primary_locations` are automatically converted to comma-separated strings

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Script Assembly",
    "script_status": "draft",
    "current_section": 3,
    "total_sections": 5,
    "video_status": null,
    "video_drive_folder": null,
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"Invalid JSON body"` | Malformed JSON |
| 400 | `"project_id is required"` | Missing project_id |
| 400 | `"At least one update field is required"` | No fields to update |
| 400 | `"script_url must be a valid Google Docs URL..."` | Invalid script URL |
| 401 | `"Unauthorized"` | Invalid webhook secret |
| 404 | `"Project not found"` | No project with given ID |
| 500 | `"Failed to update project status"` | Server error |

#### Examples

**cURL (with authentication)**
```bash
curl -X POST "https://your-app.vercel.app/api/status" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret-key" \
  -d '{
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Script Assembly",
    "script_url": "https://docs.google.com/document/d/1abc123/edit",
    "script_status": "draft"
  }'
```

---

## Migration API

### Run Migrations

Initializes or updates the database schema. Protected in production environments.

**Endpoint:** `GET /api/migrate`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `secret` | string | Production only | Migration secret key |

#### Environment Variables

| Variable | Description |
|----------|-------------|
| `MIGRATION_SECRET` | Required in production to authorize migrations |
| `DATABASE_URL` | PostgreSQL connection string |

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Migration completed successfully",
  "steps": [
    "Settings table created",
    "Default webhook URL inserted",
    "Projects table created",
    "Trigger function created",
    "Projects trigger created",
    "Settings trigger created"
  ],
  "tables": ["settings", "projects"],
  "settings": [
    { "key": "webhook_url", "value": "https://..." }
  ]
}
```

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `"Unauthorized. Provide valid secret key."` | Invalid or missing secret |
| 500 | `"DATABASE_URL environment variable is not set"` | Missing database config |
| 500 | `"Migration failed"` | Database error |

#### Examples

**cURL (production)**
```bash
curl -X GET "https://your-app.vercel.app/api/migrate?secret=your-migration-secret"
```

**cURL (development)**
```bash
curl -X GET "http://localhost:3000/api/migrate"
```

---

## Data Models

### Project

The main entity representing a video production.

```typescript
interface Project {
  // Identifiers
  project_id: string;           // UUID
  channel_id: string | null;    // Foreign key to channels

  // Basic Info
  title: string;
  status: ProjectStatus;
  duration_hours: number;
  duration_minutes: number;

  // Content Details (populated by n8n)
  total_sections: number | null;
  current_section: number;
  main_characters: string | null;
  primary_locations: string | null;
  central_theme: string | null;
  tone: string | null;

  // Script
  script_url: string | null;              // Google Docs URL
  script_status: ScriptStatus;            // 'pending' | 'draft' | 'approved'

  // Generation Outputs
  thumbnail_suggestions: string[] | null;
  video_status: VideoGenerationStatus | null;
  video_drive_folder: string | null;

  // Error Handling
  error: string | null;

  // Timestamps
  created_at: string;           // ISO 8601
  updated_at: string;           // ISO 8601
}
```

### ProjectStatus (Pipeline Stages)

```typescript
type ProjectStatus =
  | "Outline in progress"
  | "Outline done"
  | "Sections in creation"
  | "Sections done"
  | "Script Assembly"
  | "Voiceover in progress"
  | "Voiceover done"
  | "Images generating"
  | "Video assembly"
  | "Thumbnail creation"
  | "Upload pending"
  | "Published"
  | "Failed";
```

### ScriptStatus

```typescript
type ScriptStatus = "pending" | "draft" | "approved";
```

### VideoGenerationStatus

```typescript
type VideoGenerationStatus =
  | "Section Chunking"
  | "Rendering"
  | "Finalizing"
  | "Video Finished"
  | "Video Failed";
```

### Channel

```typescript
interface Channel {
  channel_id: string;           // Same as slug
  name: string;
  slug: string;                 // URL-safe identifier
  description: string | null;
  color: string;                // Hex color (#RRGGBB)
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  project_count?: number;       // Only in list queries
}
```

### Setting

```typescript
interface Setting {
  key: string;
  value: string;
  updated_at: string;
}
```

---

## Webhook Integration

### Overview

Cartoonolgy Studio integrates with n8n automation workflows through webhooks:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Studio App     │────▶│     n8n         │────▶│  External APIs  │
│  (Next.js)      │◀────│  (Automation)   │◀────│  (AI, Drive)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │  webhook_script        │  POST /api/status
        │  webhook_video         │
        │  webhook_thumbnail     │
        ▼                        ▼
```

### Webhook Types

| Webhook | Setting Key | Trigger | Purpose |
|---------|-------------|---------|---------|
| Script | `webhook_script` | New project creation | Generate script in Google Docs |
| Video | `webhook_video` | "Generate Video" button | Render video from script |
| Thumbnail | `webhook_thumbnail` | "Generate Thumbnails" button | Create thumbnail options |

### n8n Workflow Example

**Script Generation Workflow:**

1. **Trigger**: Receive webhook from Cartoonolgy Studio
2. **Process**: Generate script using AI
3. **Create**: Save script to Google Docs
4. **Update**: POST to `/api/status` with:
   ```json
   {
     "project_id": "...",
     "status": "Script Assembly",
     "script_url": "https://docs.google.com/document/d/...",
     "script_status": "draft",
     "total_sections": 5,
     "main_characters": "SpongeBob, Patrick",
     "central_theme": "..."
   }
   ```

### Status Update Flow

```
n8n Workflow                    Cartoonolgy Studio
     │                                  │
     │  POST /api/status               │
     │  { project_id, status, ... }    │
     ├─────────────────────────────────▶│
     │                                  │ Update database
     │                                  │ Invalidate cache
     │     { success: true }            │
     │◀─────────────────────────────────┤
     │                                  │
     │                                  │ UI auto-refreshes
```

### Security

Set `WEBHOOK_SECRET` environment variable to require authentication:

```bash
# .env
WEBHOOK_SECRET=your-secure-random-string
```

n8n must include the header:
```
x-webhook-secret: your-secure-random-string
```

---

## Error Handling

### Standard Error Response

All API errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Or for endpoints returning `success`:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid or missing webhook secret |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., project_id) |
| 500 | Server Error | Database or internal error |

### Client-Side Error Handling

```javascript
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (response.status) {
        case 400:
          console.error('Validation error:', data.error);
          break;
        case 404:
          console.error('Not found:', data.error);
          break;
        case 500:
          console.error('Server error:', data.error);
          break;
        default:
          console.error('Unknown error:', data.error);
      }
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network request failed' };
  }
}
```

---

## Code Examples

### Complete Flow: Create Project and Start Production

```javascript
import { startProduction } from '@/lib/api';

async function createNewVideo() {
  // 1. Create project and trigger script generation webhook
  const result = await startProduction({
    title: 'The Psychology of Squidward',
    duration_hours: 0,
    duration_minutes: 25,
    channel_id: 'cartoonolgy',
    channel_name: 'Cartoonolgy',
  });

  if (!result.success) {
    console.error('Failed:', result.error);
    return;
  }

  if (result.webhookFailed) {
    console.warn('Project saved but webhook failed:', result.error);
    // Project exists, but n8n wasn't notified
  }

  console.log('Project created:', result.project.project_id);
  // Now n8n will process and call POST /api/status to update
}
```

### Poll for Project Updates

```javascript
async function pollProjectStatus(projectId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/projects/${projectId}?fresh=true`);
    const { project } = await response.json();

    console.log(`Status: ${project.status}, Script: ${project.script_status}`);

    // Check if script is ready for review
    if (project.script_url && project.script_status === 'draft') {
      console.log('Script ready for review:', project.script_url);
      return project;
    }

    // Check for errors
    if (project.status === 'Failed') {
      throw new Error(project.error || 'Project failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Timeout waiting for script');
}
```

### Approve Script and Generate Video

```javascript
async function approveAndGenerate(projectId) {
  // 1. Approve the script
  const approveResponse = await fetch(
    `/api/projects/${projectId}/approve-script`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    }
  );

  if (!approveResponse.ok) {
    const error = await approveResponse.json();
    throw new Error(error.error);
  }

  console.log('Script approved!');

  // 2. Trigger video generation
  const videoResponse = await fetch(
    `/api/projects/${projectId}/generate-video`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!videoResponse.ok) {
    const error = await videoResponse.json();
    throw new Error(error.error);
  }

  console.log('Video generation started!');

  // 3. Optionally trigger thumbnail generation in parallel
  const thumbResponse = await fetch(
    `/api/projects/${projectId}/generate-thumbnails`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (thumbResponse.ok) {
    console.log('Thumbnail generation started!');
  }
}
```

### n8n Webhook Handler (Node.js)

Example code for an n8n Code node to update Cartoonolgy Studio:

```javascript
// n8n Code Node - Update project after script generation
const projectId = $input.first().json.project_id;
const scriptUrl = $input.first().json.script_url;
const characters = $input.first().json.characters; // array

const response = await fetch('https://your-app.vercel.app/api/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-secret': process.env.WEBHOOK_SECRET,
  },
  body: JSON.stringify({
    project_id: projectId,
    status: 'Script Assembly',
    script_url: scriptUrl,
    script_status: 'draft',
    main_characters: characters,
    total_sections: 5,
  }),
});

const result = await response.json();

if (!result.success) {
  throw new Error(`Status update failed: ${result.error}`);
}

return { success: true, updated: result.project };
```

---

## Appendix: Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) |
| `WEBHOOK_SECRET` | No | Secret for authenticating webhook calls |
| `MIGRATION_SECRET` | Production | Secret for running migrations |
| `NODE_ENV` | Auto | Set to `production` in deployed environments |

---

*Generated for Cartoonolgy Studio v1.0*
