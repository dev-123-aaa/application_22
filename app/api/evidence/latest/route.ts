// Update the interface in RealTimeEvidence.tsx
interface EvidenceData {
  imagesFound: number;
  processingTime: number;
  archivesSearched: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastUpdated: string;
  driveLink?: string;
  isMock?: boolean;
  jobId?: string;
  totalSearches?: number;
  successfulDownloads?: number;
}
