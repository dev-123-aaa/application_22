import { cn } from "@/lib/utils";
import { VideoStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: VideoStatus;
  className?: string;
}

function getStatusStyle(status: VideoStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "Published":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      };
    case "Script Done":
      // Green to indicate script is complete and ready for review
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      };
    case "Failed":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
      };
    default:
      return {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/30",
      };
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = getStatusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-light tracking-wide",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {status}
    </span>
  );
}
