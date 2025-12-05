export type Channel = {
  channel_id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  project_id: string;
  title: string;
  status: string;
  duration_hours: number;
  duration_minutes: number;
  total_sections: number | null;
  main_characters: string | null;
  primary_locations: string | null;
  central_theme: string | null;
  tone: string | null;
  script: string | null;
  thumbnail_suggestions: string[] | null;
  error: string | null;
  channel_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Setting = {
  key: string;
  value: string;
  updated_at: string;
};

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper function to validate hex color
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Status values for projects (matching the pipeline stages)
export const PROJECT_STATUSES = [
  "Outline in progress",
  "Outline done",
  "Sections in creation",
  "Sections done",
  "Script Assembly",
  "Voiceover in progress",
  "Voiceover done",
  "Images generating",
  "Video assembly",
  "Thumbnail creation",
  "Upload pending",
  "Published",
  "Failed",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
