// app/api/n8n/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ALWAYS use production URL - hardcode it
const PRODUCTION_URL = 'https://application-1.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crimeScript, jobId, callbackUrl, metadata } = body;

    console.log('📨 Received script for n8n processing:', {
      jobId,
      scriptLength: crimeScript?.length,
      callbackUrl
    });

    if (!crimeScript || crimeScript.trim().length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Script too short. Please provide detailed case information (min 50 characters).' 
        },
        { status: 400 }
      );
    }

    // Get your n8n webhook URL from environment variable
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    if (!N8N_WEBHOOK_URL) {
      console.error('❌ N8N_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'n8n webhook URL not configured' 
        },
        { status: 500 }
      );
    }

    console.log('🚀 Sending to n8n webhook:', N8N_WEBHOOK_URL);

    // ALWAYS use production URL - no dynamic detection
    const baseUrl = PRODUCTION_URL;
    console.log('🌐 FORCING production URL for callbacks:', baseUrl);

    // Send to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if your n8n requires it
        ...(process.env.N8N_API_KEY && {
          'X-API-Key': process.env.N8N_API_KEY
        })
      },
      body: JSON.stringify({
        crimeScript,
        jobId,
        // FORCE production URL
        callbackUrl: `${baseUrl}/api/n8n/callback/${jobId}`,
        metadata: {
          ...metadata,
          submittedAt: new Date().toISOString(),
          scriptLength: crimeScript.length,
          source: 'true-crime-dashboard-v1'
        },
        // FORCE production URL - this is what n8n will use
        webhookCallback: `${baseUrl}/api/n8n/callback/${jobId}`
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n response error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        error: errorText
      });
      
      throw new Error(`n8n returned ${n8nResponse.status}: ${errorText}`);
    }

    let n8nData;
    try {
      n8nData = await n8nResponse.json();
    } catch {
      // n8n might return empty response or non-JSON
      n8nData = { success: true };
    }

    console.log('✅ Successfully sent to n8n:', { jobId, n8nData });

    return NextResponse.json({
      success: true,
      message: 'Crime script sent to n8n workflow for processing',
      jobId: jobId,
      n8nResponse: n8nData,
      estimatedTime: 'Processing typically takes 2-5 minutes',
      nextStep: 'n8n will now search archives and collect evidence',
      // Show the PRODUCTION callback URL
      callbackUrl: `${baseUrl}/api/n8n/callback/${jobId}`,
      note: `n8n should POST updates to PRODUCTION: ${baseUrl}/api/n8n/callback/${jobId}`
    });

  } catch (error) {
    console.error('❌ Error triggering n8n workflow:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger n8n workflow',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          '1. Check if n8n instance is running',
          '2. Verify N8N_WEBHOOK_URL in .env',
          '3. Check n8n webhook node configuration',
          `4. Ensure n8n can reach PRODUCTION: ${PRODUCTION_URL}`
        ]
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    service: 'n8n Trigger API',
    status: 'operational',
    webhookConfigured: !!process.env.N8N_WEBHOOK_URL,
    // Always show production URL
    productionUrl: PRODUCTION_URL,
    environment: process.env.NODE_ENV,
    supports: ['POST /api/n8n/trigger'],
    description: 'Trigger n8n workflows for crime script processing',
    expectedBody: {
      crimeScript: 'string (required, min 50 chars)',
      jobId: 'string (optional, auto-generated if not provided)',
      callbackUrl: 'string (optional)',
      metadata: 'object (optional)'
    },
    // Always production pattern
    callbackPattern: `${PRODUCTION_URL}/api/n8n/callback/{jobId}`
  });
}
