import { Project } from "@/lib/db/schema";

// Cache for webhook URL (refreshed on modal open)
let cachedWebhookUrl: string | null = null;

export interface StartProductionPayload {
  project_id: string;
  title: string;
  duration: string;
}

export interface StartProductionResponse {
  success: boolean;
  error?: string;
  webhookFailed?: boolean;
}

export interface CreateProjectPayload {
  title: string;
  duration_hours: number;
  duration_minutes: number;
}

export interface CreateProjectResponse {
  success: boolean;
  project?: Project;
  error?: string;
}

// Fetch webhook URL from settings
export async function fetchWebhookUrl(): Promise<string | null> {
  try {
    const response = await fetch("/api/settings");
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Not configured
      }
      throw new Error("Failed to fetch webhook URL");
    }
    const data = await response.json();
    cachedWebhookUrl = data.webhook_url;
    return data.webhook_url;
  } catch (error) {
    console.error("Failed to fetch webhook URL:", error);
    return null;
  }
}

// Get cached webhook URL or fetch it
export async function getWebhookUrl(): Promise<string | null> {
  if (cachedWebhookUrl) return cachedWebhookUrl;
  return fetchWebhookUrl();
}

// Clear webhook URL cache (call when settings change)
export function clearWebhookCache(): void {
  cachedWebhookUrl = null;
}

// Create a new project in the database
export async function createProject(
  payload: CreateProjectPayload
): Promise<CreateProjectResponse> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create project",
      };
    }

    return {
      success: true,
      project: data.project,
    };
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

// Trigger the webhook with project details
export async function triggerWebhook(
  webhookUrl: string,
  payload: StartProductionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Webhook trigger failed:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Webhook request timed out" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook trigger failed",
    };
  }
}

// Full production start flow: create project + trigger webhook
export async function startProduction(
  payload: CreateProjectPayload
): Promise<StartProductionResponse & { project?: Project }> {
  // Step 1: Create project in database
  const projectResult = await createProject(payload);

  if (!projectResult.success || !projectResult.project) {
    return {
      success: false,
      error: projectResult.error || "Failed to create project",
    };
  }

  const project = projectResult.project;

  // Step 2: Get webhook URL
  const webhookUrl = await getWebhookUrl();

  if (!webhookUrl) {
    // Project saved but no webhook configured
    return {
      success: true,
      project,
      webhookFailed: true,
      error: "Webhook URL not configured. Project saved but webhook not triggered.",
    };
  }

  // Step 3: Trigger webhook
  const webhookPayload: StartProductionPayload = {
    project_id: project.project_id,
    title: project.title,
    duration: formatDuration(project.duration_hours, project.duration_minutes),
  };

  const webhookResult = await triggerWebhook(webhookUrl, webhookPayload);

  if (!webhookResult.success) {
    // Project saved but webhook failed
    return {
      success: true,
      project,
      webhookFailed: true,
      error: `Project saved but webhook trigger failed: ${webhookResult.error}`,
    };
  }

  return {
    success: true,
    project,
  };
}

// Fetch all projects from database
export async function fetchProjects(): Promise<{
  success: boolean;
  projects?: Project[];
  error?: string;
}> {
  try {
    // Cache-busting to prevent stale data
    const response = await fetch(`/api/projects?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data = await response.json();
    return {
      success: true,
      projects: data.projects,
    };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

// Fetch single project by ID
export async function fetchProject(id: string): Promise<{
  success: boolean;
  project?: Project;
  error?: string;
}> {
  try {
    // Cache-busting to prevent stale data
    const response = await fetch(`/api/projects/${id}?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }

    const data = await response.json();
    return {
      success: true,
      project: data.project,
    };
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch project",
    };
  }
}

export function formatDuration(hours: number, minutes: number): string {
  return `${hours}h ${minutes}m`;
}

export function generateProjectId(): string {
  return `vid_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}
