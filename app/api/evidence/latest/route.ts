// app/api/evidence/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory store (you could use Redis or database in production)
const evidenceStore = {
  lastJobId: null as string | null,
  lastUpdate: null as string | null,
  data: null as any
};

export async function GET(request: NextRequest) {
  try {
    // Check if we have recent evidence data
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    if (evidenceStore.data && evidenceStore.lastUpdate) {
      const lastUpdateTime = new Date(evidenceStore.lastUpdate).getTime();
      
      // Return cached data if less than 5 minutes old
      if (Date.now() - lastUpdateTime < 5 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          data: evidenceStore.data,
          cached: true,
          lastUpdated: evidenceStore.lastUpdate
        });
      }
    }

    // Get the most recent completed job from your callback store
    // This would need access to your jobStatusStore from the callback API
    // For now, we'll simulate fetching from n8n
    
    const N8N_WEBHOOK_STATUS_URL = process.env.N8N_WEBHOOK_STATUS_URL || 
      'https://your-n8n-domain.com/webhook/evidence-status';
    
    const response = await fetch(N8N_WEBHOOK_STATUS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_API_KEY && {
          'X-API-Key': process.env.N8N_API_KEY
        })
      },
    });

    if (!response.ok) {
      // Fallback to the latest job in memory
      return NextResponse.json({
        success: true,
        data: evidenceStore.data || getDefaultEvidenceData(),
        fallback: true,
        message: 'Using latest available data'
      });
    }

    const n8nData = await response.json();
    
    // Transform n8n data to match your UI format
    const evidenceData = transformN8nToEvidence(n8nData);
    
    // Store for caching
    evidenceStore.data = evidenceData;
    evidenceStore.lastUpdate = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: evidenceData,
      source: 'n8n',
      lastUpdated: evidenceStore.lastUpdate
    });

  } catch (error) {
    console.error('Error fetching evidence data:', error);
    
    // Return default data on error
    return NextResponse.json({
      success: true,
      data: getDefaultEvidenceData(),
      error: 'Could not fetch real-time data',
      fallback: true
    });
  }
}

// Helper to transform n8n data to your UI format
function transformN8nToEvidence(n8nData: any) {
  return {
    imagesFound: n8nData.images_found || n8nData.total_images || 12,
    processingTime: n8nData.processing_time || n8nData.processing_time_seconds || 45,
    archivesSearched: n8nData.archives_searched || [
      'National Crime Database',
      'Historical Archives', 
      'Press Photo Library'
    ],
    status: n8nData.status || 'completed',
    lastUpdated: n8nData.last_updated || new Date().toISOString(),
    driveLink: n8nData.drive_folder_url || n8nData.driveLink,
    // Add any other fields from n8n
    ...n8nData
  };
}

// Default fallback data
function getDefaultEvidenceData() {
  return {
    imagesFound: 12,
    processingTime: 45,
    archivesSearched: [
      'National Crime Database',
      'Historical Archives',
      'Press Photo Library'
    ],
    status: 'completed',
    lastUpdated: new Date().toISOString(),
    driveLink: null,
    isMock: true
  };
}

// POST: Update evidence data (called by n8n when a job completes)
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    console.log('📊 Updating evidence data from n8n:', update);
    
    // Transform and store the data
    evidenceStore.data = transformN8nToEvidence(update);
    evidenceStore.lastUpdate = new Date().toISOString();
    evidenceStore.lastJobId = update.jobId || null;
    
    return NextResponse.json({
      success: true,
      message: 'Evidence data updated successfully',
      lastUpdated: evidenceStore.lastUpdate
    });
    
  } catch (error) {
    console.error('Error updating evidence data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update evidence data' },
      { status: 500 }
    );
  }
}
