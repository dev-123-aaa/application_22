// app/api/crime/process/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This would be your actual n8n webhook URL or processing endpoint
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/crime-script';

// Mock archives for demonstration
const CRIME_ARCHIVES = [
  'National Crime Database',
  'Historical Archives', 
  'Press Photo Library',
  'Court Evidence Files',
  'Police Department Records',
  'FBI Case Files',
  'Interpol Database',
  'Newspaper Archives',
  'Historical Society Collections',
  'University Crime Studies',
  'Forensic Evidence Repository',
  'Public Records Office'
];

// Interface for archive search results
interface ArchiveSearchResult {
  imageCount: number;
  archivesSearched: string[];
  caseName: string;
  year: string;
}

// Simulate searching archives
async function searchCrimeArchives(crimeScript: string): Promise<ArchiveSearchResult> {
  // In reality, this would call external APIs or databases
  // For now, we simulate the search
  
  // Extract key information from script
  const lines = crimeScript.split('\n');
  const caseNameLine = lines.find(line => line.includes('CASE:')) || 'Unknown Case';
  const caseName = caseNameLine.replace('CASE:', '').trim();
  const yearMatch = crimeScript.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : 'Unknown';
  
  // Simulate search time (2-5 seconds)
  const searchTime = 2000 + Math.random() * 3000;
  await new Promise(resolve => setTimeout(resolve, searchTime));
  
  // Simulate finding images
  const imageCount = 5 + Math.floor(Math.random() * 20);
  
  // Select random archives that were "searched"
  const searchedCount = 3 + Math.floor(Math.random() * 5);
  const shuffled = [...CRIME_ARCHIVES].sort(() => 0.5 - Math.random());
  const archivesSearched = shuffled.slice(0, searchedCount);
  
  return {
    imageCount,
    archivesSearched,
    caseName,
    year
  };
}

// Interface for metadata
interface ProcessMetadata {
  scriptLength?: number;
  teamId?: string;
  requestedBy?: string;
  archiveResults?: ArchiveSearchResult;
  driveLink?: string;
  [key: string]: unknown;
}

// Interface for n8n result
interface N8NResult {
  success: boolean;
  n8nData?: unknown;
  message: string;
}

// Generate Google Drive link
function generateDriveLink(caseName: string, year: string): string {
  // In reality, this would create/access a specific Google Drive folder
  const folderId = `1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  return `https://drive.google.com/drive/folders/${folderId}`;
}

// Process the crime script with n8n
async function processWithN8N(crimeScript: string, metadata: ProcessMetadata): Promise<N8NResult> {
  try {
    // This is where you'd send the data to your n8n workflow
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crimeScript,
        metadata,
        timestamp: new Date().toISOString(),
        source: 'crime-editors-dashboard'
      }),
    });

    if (n8nResponse.ok) {
      const n8nData = await n8nResponse.json();
      return {
        success: true,
        n8nData,
        message: 'Successfully processed with n8n workflow'
      };
    } else {
      return {
        success: false,
        message: `n8n returned status ${n8nResponse.status}`
      };
    }
  } catch (error) {
    console.error('n8n processing error:', error);
    return {
      success: false,
      message: 'Failed to connect to n8n workflow'
    };
  }
}

// Interface for request body
interface CrimeProcessRequestBody {
  crimeScript: string;
  metadata?: ProcessMetadata;
}

export async function POST(request: NextRequest) {
  try {
    const body: CrimeProcessRequestBody = await request.json();
    const { crimeScript, metadata } = body;

    if (!crimeScript) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No crime script provided' 
        },
        { status: 400 }
      );
    }

    // Validate script length
    if (crimeScript.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Script too short. Please provide detailed case information.' 
        },
        { status: 400 }
      );
    }

    // Start processing
    console.log(`Processing crime script (${crimeScript.length} chars)`);
    
    // Step 1: Search archives for evidence
    const archiveResults = await searchCrimeArchives(crimeScript);
    
    // Step 2: Generate Google Drive link
    const driveLink = generateDriveLink(archiveResults.caseName, archiveResults.year);
    
    // Step 3: Process with n8n (this would be your actual automation)
    const n8nResult = await processWithN8N(crimeScript, {
      ...metadata,
      archiveResults,
      driveLink
    });

    // Combine results
    const processingTime = `${Math.floor(archiveResults.imageCount / 5) + 1}-${Math.floor(archiveResults.imageCount / 3) + 3} minutes`;
    
    return NextResponse.json({
      success: true,
      message: 'Evidence collection complete',
      imageCount: archiveResults.imageCount,
      driveLink,
      archives: archiveResults.archivesSearched,
      estimatedTime: processingTime,
      caseName: archiveResults.caseName,
      year: archiveResults.year,
      n8nProcessing: n8nResult.success,
      n8nMessage: n8nResult.message
    });

  } catch (error) {
    console.error('Error processing crime script:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error processing crime script' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Provide info about the API
  return NextResponse.json({
    name: 'Crime Evidence Collection API',
    version: '1.0.0',
    description: 'Process true crime scripts and collect evidence images',
    endpoints: {
      POST: '/api/crime/process',
      method: 'POST',
      body: {
        crimeScript: 'string (required)',
        metadata: 'object (optional)'
      }
    },
    connectedArchives: CRIME_ARCHIVES.length,
    supports: [
      'Script analysis',
      'Archive searching', 
      'Image collection',
      'Google Drive integration',
      'n8n workflow automation'
    ]
  });
}
