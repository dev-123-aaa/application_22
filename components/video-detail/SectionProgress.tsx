"use client";

import { cn } from "@/lib/utils";

interface SectionProgressProps {
  currentSection: number;
  totalSections: number | null;
  showLabel?: boolean;
  className?: string;
}

export function SectionProgress({
  currentSection,
  totalSections,
  showLabel = true,
  className,
}: SectionProgressProps) {
  // Don't show if we don't have total sections
  if (!totalSections || totalSections === 0) {
    return null;
  }

  const percentage = Math.min((currentSection / totalSections) * 100, 100);
  const isComplete = currentSection >= totalSections;

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Sections Progress</span>
          <span className={cn(
            "font-medium",
            isComplete ? "text-emerald-400" : "text-gray-300"
          )}>
            {currentSection} of {totalSections} complete
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isComplete ? "bg-emerald-500" : "bg-cyan-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Mini version for dashboard cards
export function SectionProgressMini({
  currentSection,
  totalSections,
}: Pick<SectionProgressProps, "currentSection" | "totalSections">) {
  if (!totalSections || totalSections === 0) {
    return null;
  }

  return (
    <span className="text-xs text-gray-500">
      ({currentSection}/{totalSections})
    </span>
  );
}
