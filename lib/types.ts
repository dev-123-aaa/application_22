export type VideoStatus =
  | "Outline in progress"
  | "Outline done"
  | "Sections in creation"
  | "Sections done"
  | "Script Assembly"
  | "Ready for Voiceover"
  | "Voiceover in progress"
  | "Voiceover done"
  | "Images generating"
  | "Video assembly"
  | "Thumbnail creation"
  | "Upload pending"
  | "Published"
  | "Failed";

// Script status values
export type ScriptStatus = "pending" | "draft" | "approved";

export type Video = {
  project_id: string;
  title: string;
  status: VideoStatus;
  created_at: string;
  total_sections: number;
  current_section: number;
  duration_hours: number;
  duration_minutes: number;
  main_characters: string;
  primary_locations: string;
  central_theme: string;
  tone: string;
  script_url?: string;
  script_status: ScriptStatus;
  thumbnail_suggestions?: string[];
  video_status: string | null;
  video_drive_folder: string | null;
};

// Pipeline stages in order
export const PIPELINE_STAGES = [
  "Outline",
  "Sections",
  "Script",
  "Voiceover",
  "Images",
  "Video Assembly",
  "Video Generation",
  "Thumbnail",
  "Upload",
  "Published",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

// Pipeline stage configuration with associated statuses
export const PIPELINE_STAGE_CONFIG = [
  { key: "outline", label: "Outline", statuses: ["Outline in progress", "Outline done"] },
  { key: "sections", label: "Sections", statuses: ["Sections in creation", "Sections done"] },
  { key: "script", label: "Script", statuses: ["Script Assembly", "Ready for Voiceover"] },
  { key: "voiceover", label: "Voiceover", statuses: ["Voiceover in progress", "Voiceover done"] },
  { key: "images", label: "Images", statuses: ["Images generating"] },
  { key: "video-assembly", label: "Video Assembly", statuses: ["Video assembly"] },
  { key: "video-generation", label: "Video Generation", statuses: ["Section Chunking", "Rendering", "Finalizing", "Video Finished"] },
  { key: "thumbnail", label: "Thumbnail", statuses: ["Thumbnail creation"] },
  { key: "upload", label: "Upload", statuses: ["Upload pending"] },
  { key: "published", label: "Published", statuses: ["Published"] },
] as const;

// Map status to pipeline stage index
export function getStageFromStatus(status: VideoStatus): number {
  const statusToStage: Record<VideoStatus, number> = {
    "Outline in progress": 0,
    "Outline done": 0,
    "Sections in creation": 1,
    "Sections done": 1,
    "Script Assembly": 2,
    "Ready for Voiceover": 2,
    "Voiceover in progress": 3,
    "Voiceover done": 3,
    "Images generating": 4,
    "Video assembly": 5,
    // Video Generation (index 6) is handled separately via video_status
    "Thumbnail creation": 7,
    "Upload pending": 8,
    "Published": 9,
    "Failed": -1,
  };
  return statusToStage[status];
}

// Check if a stage is complete based on current status
export function isStageComplete(status: VideoStatus, stageIndex: number): boolean {
  const currentStage = getStageFromStatus(status);
  if (status === "Failed") return false;

  // Check if status indicates the stage is done (not in progress)
  const doneStatuses: VideoStatus[] = [
    "Outline done",
    "Sections done",
    "Ready for Voiceover",
    "Voiceover done",
    "Published",
  ];

  if (stageIndex < currentStage) return true;
  if (stageIndex === currentStage && doneStatuses.includes(status)) return true;

  return false;
}

// Check if script should be available based on status
export function hasScriptReady(status: VideoStatus): boolean {
  const postScriptStatuses: VideoStatus[] = [
    "Ready for Voiceover",
    "Voiceover in progress",
    "Voiceover done",
    "Images generating",
    "Video assembly",
    "Thumbnail creation",
    "Upload pending",
    "Published",
  ];
  return postScriptStatuses.includes(status);
}

// Check if thumbnail generation can be triggered (Ready for Voiceover or later)
export function canTriggerThumbnail(status: VideoStatus): boolean {
  const eligibleStatuses: VideoStatus[] = [
    "Ready for Voiceover",
    "Voiceover in progress",
    "Voiceover done",
    "Images generating",
    "Video assembly",
  ];
  return eligibleStatuses.includes(status);
}
