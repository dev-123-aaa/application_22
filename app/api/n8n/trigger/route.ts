// app/api/n8n/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';

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
        callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/n8n/callback`,
        metadata: {
          ...metadata,
          submittedAt: new Date().toISOString(),
          scriptLength: crimeScript.length,
          source: 'true-crime-dashboard-v1'
        },
        // Include the callback URL in the data for n8n to use
        webhookCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/n8n/callback/${jobId}`
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
    } catch (e) {
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
      // For testing without n8n:
      testMode: !N8N_WEBHOOK_URL.includes('your-n8n-instance') ? false : '⚠️ Using test URL - update N8N_WEBHOOK_URL in .env'
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
          '3. Check n8n webhook node configuration'
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
    supports: ['POST /api/n8n/trigger'],
    description: 'Trigger n8n workflows for crime script processing',
    expectedBody: {
      crimeScript: 'string (required, min 50 chars)',
      jobId: 'string (optional, auto-generated if not provided)',
      callbackUrl: 'string (optional)',
      metadata: 'object (optional)'
    }
  });
}
