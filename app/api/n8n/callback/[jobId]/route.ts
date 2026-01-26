/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/n8n/callback/[jobId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

// Simple in-memory storage for job status
const jobStatusStore = new Map<string, any>();

// Helper to clean old jobs
function cleanupOldJobs() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const entries = Array.from(jobStatusStore.entries());
  for (const [jobId, job] of entries) {
    if (job.lastUpdated && new Date(job.lastUpdated).getTime() < oneHourAgo) {
      jobStatusStore.delete(jobId);
    }
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

// GET: Check job status
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = await params;
    
    cleanupOldJobs();
    
    const jobStatus = jobStatusStore.get(jobId);
    
    if (!jobStatus) {
      return NextResponse.json({
        success: false,
        error: 'Job not found',
        jobId,
        status: 'unknown',
        message: 'Job expired or never existed'
      }, {
        headers: corsHeaders,
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      ...jobStatus,
      // Add some calculated fields
      isCompleted: jobStatus.status === 'completed',
      isFailed: jobStatus.status === 'failed',
      duration: jobStatus.startedAt ? 
        Date.now() - new Date(jobStatus.startedAt).getTime() : 
        null
    }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get job status' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Update job status (called by n8n HTTP nodes)
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = await params;
    const update = await request.json();
    
    console.log('📤 n8n callback received:', { jobId, update });

    // Get existing job or create new
    const existingJob = jobStatusStore.get(jobId) || {
      jobId,
      created: new Date().toISOString(),
      status: 'pending',
      progress: 0,
      messages: []
    };

    // Merge updates
    const updatedJob = {
      ...existingJob,
      ...update,
      lastUpdated: new Date().toISOString(),
      messages: [
        ...existingJob.messages,
        {
          timestamp: new Date().toISOString(),
          status: update.status || 'update',
          message: update.message || 'Progress update',
          data: update
        }
      ].slice(-20) // Keep last 20 messages
    };

    // Store status
    jobStatusStore.set(jobId, updatedJob);
    
    // Set startedAt timestamp if not set and status is processing
    if (update.status === 'processing' && !existingJob.startedAt) {
      updatedJob.startedAt = new Date().toISOString();
      jobStatusStore.set(jobId, updatedJob);
    }
    
    // Set completedAt timestamp if completed
    if (update.status === 'completed' && !existingJob.completedAt) {
      updatedJob.completedAt = new Date().toISOString();
      jobStatusStore.set(jobId, updatedJob);
    }

    console.log('✅ Job status updated:', { 
      jobId, 
      status: update.status,
      progress: update.progress 
    });

    return NextResponse.json({
      success: true,
      message: 'Job status updated successfully',
      jobId,
      receivedUpdate: update
    }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job status' },
      { status: 500, headers: corsHeaders }
    );
  }
}
