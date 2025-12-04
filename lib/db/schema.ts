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
  created_at: string;
  updated_at: string;
};

export type Setting = {
  key: string;
  value: string;
  updated_at: string;
};

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
