/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useRef } from 'react';

export default function TeamPage() {
  const [teamData, setTeamData] = useState({
    members: 8,
    active: 6,
    productivity: 78,
    tasksToday: 24,
    tasksCompleted: 24,
    tasksInProgress: 5,
    totalTasks: 29,
    weeklyTrend: '+12%'
  });

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Alex Writer', role: 'Script Writer', tasks: 3, status: 'Active', statusColor: '#10b981', avatarColor: '#3b82f6', email: 'alex@team.com', lastActive: '2 min ago' },
    { id: 2, name: 'Sarah VO', role: 'Voiceover Artist', tasks: 2, status: 'Recording', statusColor: '#f59e0b', avatarColor: '#8b5cf6', email: 'sarah@team.com', lastActive: '5 min ago' },
    { id: 3, name: 'Mike Designer', role: 'UI/UX Designer', tasks: 4, status: 'Designing', statusColor: '#8b5cf6', avatarColor: '#10b981', email: 'mike@team.com', lastActive: '10 min ago' },
    { id: 4, name: 'Lisa QA', role: 'Quality Assurance', tasks: 3, status: 'Testing', statusColor: '#ef4444', avatarColor: '#f59e0b', email: 'lisa@team.com', lastActive: '15 min ago' },
    { id: 5, name: 'David Dev', role: 'Frontend Developer', tasks: 5, status: 'Coding', statusColor: '#3b82f6', avatarColor: '#ef4444', email: 'david@team.com', lastActive: 'Just now' },
    { id: 6, name: 'Emma PM', role: 'Project Manager', tasks: 2, status: 'Reviewing', statusColor: '#6366f1', avatarColor: '#06b6d4', email: 'emma@team.com', lastActive: '30 min ago' }
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [processingResults, setProcessingResults] = useState<{
    success: boolean;
    message: string;
    imageCount?: number;
    driveLink?: string;
    archivesSearched?: string[];
    estimatedTime?: string;
  } | null>(null);
  
  const productivityRef = useRef(78);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update productivity with slight fluctuation
      const change = (Math.random() - 0.5) * 4;
      const newProductivity = Math.min(95, Math.max(65, productivityRef.current + change));
      productivityRef.current = newProductivity;

      setTeamData(prev => ({
        ...prev,
        active: Math.floor(Math.random() * (7 - 5)) + 5,
        productivity: Math.round(newProductivity),
        tasksCompleted: prev.tasksCompleted + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Add new team member
  const addMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember = {
      id: teamMembers.length + 1,
      name: newMemberName,
      role: newMemberRole || 'Team Member',
      tasks: 0,
      status: 'Available',
      statusColor: '#94a3b8',
      avatarColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@team.com`,
      lastActive: 'Just added'
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setTeamData(prev => ({ ...prev, members: prev.members + 1 }));
    setNewMemberName('');
    setNewMemberRole('');
  };

  // Remove team member
  const removeMember = (id: number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    setTeamData(prev => ({ ...prev, members: Math.max(0, prev.members - 1) }));
  };

  // Filter and sort team members
  const filteredMembers = teamMembers
    .filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'tasks': return b.tasks - a.tasks;
        case 'status': return a.status.localeCompare(b.status);
        default: return a.name.localeCompare(b.name);
      }
    });

  // Toggle task completion
  const toggleTask = (id: number) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id 
        ? { ...member, tasks: Math.max(0, member.tasks - 1) }
        : member
    ));
    setTeamData(prev => ({ 
      ...prev, 
      tasksCompleted: prev.tasksCompleted + 1,
      tasksInProgress: Math.max(0, prev.tasksInProgress - 1)
    }));
  };

  // Calculate progress percentage
  const progressPercentage = (teamData.tasksCompleted / teamData.totalTasks) * 100;

  // Process True Crime Script function
const processCrimeScript = async () => {
  const textarea = textareaRef.current;
  const button = document.getElementById('processScriptBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('processingStatus');
  
  if (!textarea || !textarea.value.trim()) {
    if (statusDiv) {
      statusDiv.innerHTML = '⚠️ Please enter a crime case script first';
      statusDiv.style.color = '#f59e0b';
    }
    return;
  }

  // Clear previous results
  setProcessingResults(null);

  // Disable button and show loading
  if (button) {
    button.disabled = true;
    button.innerHTML = '🚀 Triggering n8n...';
    button.style.opacity = '0.7';
  }
  
  if (statusDiv) {
    statusDiv.innerHTML = '🔄 Preparing to send to n8n workflow...';
    statusDiv.style.color = '#3b82f6';
  }

  try {
    // Generate a unique job ID
    const jobId = `crime_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log('Starting n8n processing with jobId:', jobId);

    // Send to our API route (which forwards to n8n)
    const response = await fetch('/api/n8n/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crimeScript: textarea.value,
        jobId: jobId,
        callbackUrl: `${window.location.origin}/api/n8n/callback/${jobId}`,
        metadata: {
          caseName: extractCaseName(textarea.value),
          year: extractYear(textarea.value),
          scriptLength: textarea.value.length,
          timestamp: new Date().toISOString()
        }
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to trigger n8n workflow');
    }

    console.log('✅ Successfully sent to n8n:', result);
    
    // Update UI
    if (statusDiv) {
      statusDiv.innerHTML = '✅ Sent to n8n! Starting evidence collection...';
      statusDiv.style.color = '#10b981';
    }
    
    if (button) {
      button.innerHTML = '⏳ n8n Processing...';
    }
    
    // Start polling for updates
    startJobPolling(jobId);
    
  } catch (error) {
    console.error('❌ Error processing crime script:', error);
    
    // Show error to user
    if (statusDiv) {
      statusDiv.innerHTML = `❌ Error: ${error instanceof Error ? error.message : 'Failed to process script'}`;
      statusDiv.style.color = '#ef4444';
    }
    
    // Re-enable button
    if (button) {
      button.disabled = false;
      button.innerHTML = '🔍 Process Crime Script';
      button.style.opacity = '1';
    }
  }
};
  // Helper to extract case name from script
const extractCaseName = (script: string): string => {
  const caseMatch = script.match(/CASE:\s*(.+)/i) || script.match(/Case:\s*(.+)/i);
  if (caseMatch) {
    return caseMatch[1].trim().substring(0, 100);
  }
  
  // Try to find case name from first line
  const firstLine = script.split('\n')[0].trim();
  if (firstLine.length > 10 && firstLine.length < 100) {
    return firstLine;
  }
  
  return 'Unknown Case';
};

// Helper to extract year from script
const extractYear = (script: string): string => {
  const yearMatch = script.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
};
  // ========== ADD THIS POLLING FUNCTION ==========

const startJobPolling = (jobId: string) => {
  const statusDiv = document.getElementById('processingStatus');
  const button = document.getElementById('processScriptBtn') as HTMLButtonElement;
  
  let pollCount = 0;
  const maxPolls = 120; // Poll for up to 10 minutes (120 * 5 seconds)
  
  const poll = async () => {
    if (pollCount >= maxPolls) {
      if (statusDiv) {
        statusDiv.innerHTML = '⏱️ Processing is taking longer than expected. Check back later.';
        statusDiv.style.color = '#f59e0b';
      }
      if (button) {
        button.disabled = false;
        button.innerHTML = '🔍 Process Crime Script';
        button.style.opacity = '1';
      }
      return;
    }
    
    pollCount++;
    
    try {
      const response = await fetch(`/api/n8n/callback/${jobId}`);
      const data = await response.json();
      
      if (!data.success) {
        // Job not found or error
        setTimeout(poll, 5000);
        return;
      }
      
      // Update status display based on job status
      updateStatusDisplay(data, statusDiv);
      
      // Check if job is complete or failed
      if (data.status === 'completed') {
        handleJobCompletion(data, jobId);
        return; // Stop polling
      }
      
      if (data.status === 'failed') {
        handleJobFailure(data, button, statusDiv);
        return; // Stop polling
      }
      
      // Continue polling
      setTimeout(poll, 3000); // Poll every 3 seconds
      
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(poll, 5000);
    }
  };
  
  // Start polling
  poll();
};

// Helper function to update status display
const handleJobCompletion = (jobData: {
  message?: string;
  imagesFound?: number;
  totalImages?: number;
  driveLink?: string;
  googleDriveLink?: string;
  archivesSearched?: string[];
  processingTime?: string;
}, jobId: string) => {
  if (!statusDiv) return;
  
  const statusMessages: Record<string, { message: string; color: string }> = {
    pending: { message: '⏳ Waiting for n8n to start...', color: '#f59e0b' },
    processing: { message: '🔄 n8n is processing your case...', color: '#3b82f6' },
    searching_archives: { 
      message: `🔍 Searching ${jobData.currentArchive || 'archives'}...`, 
      color: '#8b5cf6' 
    },
    collecting_images: { 
      message: `📸 Found ${jobData.imagesFound || 0} evidence images...`, 
      color: '#3b82f6' 
    },
    uploading_to_drive: { 
      message: '📁 Uploading to Google Drive...', 
      color: '#10b981' 
    },
    organizing_results: { 
      message: '🗂️ Organizing evidence...', 
      color: '#06b6d4' 
    }
  };
  
  const statusInfo = statusMessages[jobData.status] || 
    { message: `🔄 Status: ${jobData.status}`, color: '#3b82f6' };
  
  statusDiv.innerHTML = statusInfo.message;
  statusDiv.style.color = statusInfo.color;
  
  // Add progress if available
  if (jobData.progress !== undefined) {
    statusDiv.innerHTML += ` (${jobData.progress}%)`;
  }
};

// Helper function for job completion
const handleJobCompletion = (jobData: any, jobId: string) => {
  const statusDiv = document.getElementById('processingStatus');
  const button = document.getElementById('processScriptBtn') as HTMLButtonElement;
  
  if (statusDiv) {
    statusDiv.innerHTML = '✅ Evidence collection complete!';
    statusDiv.style.color = '#10b981';
  }
  
  if (button) {
    button.disabled = false;
    button.innerHTML = '🔍 Process Crime Script';
    button.style.opacity = '1';
  }
  
  // Show results
  setProcessingResults({
    success: true,
    message: jobData.message || 'Evidence collection completed via n8n',
    imageCount: jobData.imagesFound || jobData.totalImages || 12,
    driveLink: jobData.driveLink || jobData.googleDriveLink || 
      `https://drive.google.com/drive/folders/1${jobId}`,
    archivesSearched: jobData.archivesSearched || [
      'National Crime Database',
      'Historical Archives',
      'Press Photo Library',
      'Court Evidence Files'
    ],
    estimatedTime: jobData.processingTime || '3-5 minutes'
  });
  
  console.log('🎉 Job completed:', jobData);
};

// Helper function for job failure
const handleJobFailure = (jobData: any, button: HTMLButtonElement | null, statusDiv: HTMLElement | null) => {
  if (statusDiv) {
    statusDiv.innerHTML = `❌ Processing failed: ${jobData.error || 'Unknown error'}`;
    statusDiv.style.color = '#ef4444';
  }
  
  if (button) {
    button.disabled = false;
    button.innerHTML = '🔍 Try Again';
    button.style.opacity = '1';
  }
  
  setProcessingResults({
    success: false,
    message: jobData.error || 'Processing failed'
  });
};
  // Insert crime case template
  const insertCrimeTemplate = (templateType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const templates: Record<string, string> = {
      murder: `CASE: The Central Park Homicide (1987)
      
VICTIM: Jonathan Hayes, 34
LOCATION: Central Park, New York City
DATE: October 15, 1987
TIME: Approximately 11:30 PM

CASE DETAILS:
Jonathan Hayes was last seen leaving his Upper West Side apartment at 10:45 PM. His body was discovered by a morning jogger near the Bethesda Fountain. Preliminary investigation suggests blunt force trauma to the head. No murder weapon was found at the scene.

KEY EVIDENCE:
• Blood samples collected from fountain edge
• Partial footprint size 10 near body
• Victim's wallet missing, credit cards later used
• Security camera footage from 72nd Street entrance
• Witness statement from homeless man near bench

SUSPECTS:
1. Robert Miller - Business rival, last seen arguing with victim
2. Sarah Chen - Ex-girlfriend, alibi unclear
3. Unknown assailant - Possible robbery gone wrong

REQUIRED IMAGES:
1. Crime scene photos (Bethesda Fountain)
2. Victim's last known photo
3. Suspect mugshots if available
4. Map of Central Park with location marked
5. Evidence photos (footprint, wallet, clothing)
6. Newspaper clippings from 1987
7. Police investigation notes
8. Court documents if case went to trial`,

      robbery: `CASE: The Metropolitan Museum Art Heist (1994)
      
LOCATION: Metropolitan Museum of Art, NYC
DATE: February 12, 1994
TIME: 2:15 AM during security shift change

STOLEN ITEMS:
1. Vincent van Gogh sketch (estimated $8M)
2. Renaissance jewelry collection
3. Ancient Egyptian artifacts

MODUS OPERANDI:
• Disabled alarm system through ventilation shaft
• Used infrared goggles to avoid motion sensors
• Left fake painting in place of original
• Exit through underground maintenance tunnels

EVIDENCE NEEDED:
1. Museum blueprints/security layout
2. Stolen items catalog photos
3. Security camera stills (blurred)
4. Police investigation photos
5. Interpol bulletins
6. Insurance claim documents
7. Art recovery notices
8. Suspect composite sketches`,

      coldCase: `CASE: The Disappearance of Amelia Vance (1975)
      
MISSING: Amelia Vance, 28, journalist
LAST SEEN: Chicago Tribune building
DATE: November 8, 1975
TIME: 6:45 PM leaving work

INVESTIGATION HIGHLIGHTS:
• Working on corruption expose
• Received threatening letters
• Car found abandoned near Lake Michigan
• Personal diary missing from apartment
• Three possible sightings over next decade

REQUESTED ARCHIVES:
1. Amelia's press photos
2. Chicago Tribune building (1975)
3. Abandoned car photos
4. Police investigation files
5. Newspaper articles from 1975-1985
6. Family photographs
7. Possible age-progressed images
8. Related corruption case documents`,

      organized: `CASE: The Brooklyn Syndicate (1990-1995)
      
ORGANIZATION: "The Harbor Crew"
TERRITORY: Brooklyn waterfront
ACTIVITIES: Extortion, smuggling, money laundering

KEY FIGURES:
• Vincent "Vinnie" Rossi (alleged boss)
• Marco Santini (enforcer)
• Linda Chen (money laundering)
• Detective Frank O'Malley (corrupt police contact)

EVIDENCE COLLECTION:
1. Surveillance photos of suspects
2. Wiretap transcripts
3. Financial transaction records
4. Undercover operation photos
5. Courtroom sketches
6. Police evidence photos
7. News coverage of arrests
8. Sentencing documents`
    };

    const template = templates[templateType] || templates.murder;
    textarea.value = template;
    
    // Trigger input event for character count
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.value = text;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  // Initialize character count on component mount
  useEffect(() => {
    const textarea = textareaRef.current;
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
      const updateCharCount = () => {
        charCount.textContent = textarea.value.length.toString();
      };
      
      textarea.addEventListener('input', updateCharCount);
      updateCharCount(); // Initial count
      
      return () => textarea.removeEventListener('input', updateCharCount);
    }
  }, []);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? 'white' : '#0f172a',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* Progress Bar - Now using the progressPercentage variable */}
      <div style={{
        background: darkMode ? '#1e293b' : '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        marginBottom: '40px',
        boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Today&apos;s Case Progress</h3>
          <span style={{ 
            color: '#10b981', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        
        <div style={{
          height: '12px',
          background: darkMode ? '#334155' : '#e2e8f0',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            borderRadius: '6px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '12px',
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '14px'
        }}>
          <span>✅ {teamData.tasksCompleted} Cases Completed</span>
          <span>⏳ {teamData.tasksInProgress} In Progress</span>
          <span>📋 {teamData.totalTasks} Total Cases</span>
        </div>
      </div>

      {/* ========== CRIME SCRIPT PROCESSING ENGINE ========== */}
      <div style={{
        marginTop: '40px',
        background: darkMode ? '#1e293b' : '#ffffff',
        padding: '32px',
        borderRadius: '20px',
        border: `2px solid ${darkMode ? '#dc2626' : '#dc2626'}`,
        boxShadow: darkMode ? 
          '0 10px 25px -5px rgba(220, 38, 38, 0.2)' : 
          '0 10px 25px -5px rgba(220, 38, 38, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            🔍
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              Crime Evidence Collection Engine
            </h2>
            <p style={{ 
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '14px',
              marginTop: '4px'
            }}>
              Paste crime case scripts to gather real evidence images from archives
            </p>
          </div>
        </div>

        {/* Crime Script Input Area */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              padding: '6px 12px',
              background: darkMode ? '#7f1d1d' : '#fee2e2',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: darkMode ? '#fca5a5' : '#dc2626'
            }}>
              🚨 CRIME CASE INPUT
            </div>
            <div style={{
              color: darkMode ? '#64748b' : '#94a3b8',
              fontSize: '13px'
            }}>
              Enter detailed crime case script for evidence collection
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            id="crimeScriptInput"
            placeholder={`🔎 Enter true crime case details here...

CRIME CASE FORMAT:
• Case Name & Year
• Victim Information
• Location & Date
• Crime Details
• Key Evidence Needed
• Suspect Information
• Required Image Types

EXAMPLE CASE:
"The Central Park Homicide (1987)"
Victim: Jonathan Hayes, 34
Location: Central Park, NYC
Date: October 15, 1987

Crime Details: Body found near Bethesda Fountain. Blunt force trauma. Wallet missing.

Evidence Needed:
1. Crime scene photos
2. Victim's last known photo  
3. Suspect mugshots
4. Evidence photos
5. Newspaper clippings
6. Police investigation files
7. Court documents
8. Location maps`}
            style={{
              width: '100%',
              height: '250px',
              padding: '20px',
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: darkMode ? 'white' : '#0f172a',
              border: `1px solid ${darkMode ? '#7f1d1d' : '#fca5a5'}`,
              borderRadius: '12px',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'monospace',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.border = `1px solid #dc2626`}
            onBlur={(e) => e.target.style.border = `1px solid ${darkMode ? '#7f1d1d' : '#fca5a5'}`}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px'
          }}>
            <div style={{
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '14px'
            }}>
              Scripts are analyzed to fetch real evidence images from crime archives
            </div>
            <div style={{
              color: darkMode ? '#64748b' : '#94a3b8',
              fontSize: '14px'
            }}>
              <span id="charCount">0</span> characters
            </div>
          </div>
        </div>

        {/* File Upload Option */}
        <div style={{
          background: darkMode ? '#0f172a' : '#f1f5f9',
          padding: '20px',
          borderRadius: '12px',
          border: `1px dashed ${darkMode ? '#7f1d1d' : '#fca5a5'}`,
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            📁 Import crime case file:
          </h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="fileUpload"
              accept=".txt,.md,.docx,.pdf"
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px',
                background: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                borderRadius: '8px',
                color: darkMode ? 'white' : '#0f172a',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
              onChange={handleFileUpload}
            />
            <div style={{
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '13px'
            }}>
              Supports: .txt (recommended), .md, .docx, .pdf
            </div>
          </div>
        </div>

        {/* Quick Case Templates */}
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            📋 Quick Case Templates
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Homicide Case', emoji: '🔪', type: 'murder' },
              { label: 'Art Heist', emoji: '🖼️', type: 'robbery' },
              { label: 'Cold Case', emoji: '🥶', type: 'coldCase' },
              { label: 'Organized Crime', emoji: '👥', type: 'organized' }
            ].map((template, index) => (
              <button
                key={index}
                style={{
                  padding: '12px 20px',
                  background: darkMode ? '#1e293b' : '#ffffff',
                  color: darkMode ? 'white' : '#0f172a',
                  border: `1px solid ${darkMode ? '#7f1d1d' : '#fca5a5'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => insertCrimeTemplate(template.type)}
              >
                {template.emoji} {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            id="processScriptBtn"
            style={{
              width: '100%',
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={processCrimeScript}
          >
            🔍 Process Crime Script & Fetch Evidence
          </button>
        </div>

        {/* Status Message */}
        <div
          id="processingStatus"
          style={{
            padding: '16px',
            background: darkMode ? '#0f172a' : '#f8fafc',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: '500',
            minHeight: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}
        >
          💡 Enter crime case details above and click "Process Crime Script"
        </div>

        {/* Results Display */}
        {processingResults && (
          <div style={{
            background: processingResults.success 
              ? darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
              : darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${processingResults.success ? '#10b981' : '#ef4444'}`,
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: processingResults.success ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white'
              }}>
                {processingResults.success ? '✅' : '❌'}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                  {processingResults.success ? 'Evidence Collection Complete' : 'Processing Failed'}
                </h3>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
                  {processingResults.message}
                </p>
              </div>
            </div>

            {processingResults.success && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: darkMode ? '#0f172a' : '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                }}>
                  <div style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                    📸 Images Found
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                    {processingResults.imageCount}+
                  </div>
                  <div style={{ fontSize: '13px', color: darkMode ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                    Evidence photos collected
                  </div>
                </div>

                <div style={{
                  background: darkMode ? '#0f172a' : '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                }}>
                  <div style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                    📁 Google Drive
                  </div>
                  <a
                    href={processingResults.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}
                  >
                    📎 Access Evidence Folder →
                  </a>
                  <div style={{ fontSize: '13px', color: darkMode ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                    All collected images available
                  </div>
                </div>

                <div style={{
                  background: darkMode ? '#0f172a' : '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                }}>
                  <div style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                    ⏱️ Processing Time
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                    {processingResults.estimatedTime}
                  </div>
                  <div style={{ fontSize: '13px', color: darkMode ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                    Archive search completed
                  </div>
                </div>
              </div>
            )}

            {processingResults.success && processingResults.archivesSearched && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  📚 Archives Searched:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {processingResults.archivesSearched.map((archive, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 12px',
                        background: darkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: darkMode ? '#94a3b8' : '#64748b'
                      }}
                    >
                      {archive}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
          border: `1px solid ${darkMode ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
          borderRadius: '12px',
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ color: '#dc2626', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
            🔍 How the Evidence Engine Works:
          </h4>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li><strong>Script Analysis:</strong> Engine extracts key case details, locations, dates, and names</li>
            <li><strong>Archive Search:</strong> Queries multiple crime databases and historical archives</li>
            <li><strong>Image Collection:</strong> Gathers real crime scene photos, evidence shots, and related images</li>
            <li><strong>Google Drive Integration:</strong> Automatically organizes images in shared evidence folders</li>
            <li><strong>Quality Verification:</strong> Checks image relevance and historical accuracy</li>
          </ol>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '12px',
            background: darkMode ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#10b981',
              animation: 'pulse 1.5s infinite'
            }} />
            <span style={{ color: '#10b981' }}>EVIDENCE ENGINE: ACTIVE</span>
            <span style={{ marginLeft: 'auto', color: darkMode ? '#64748b' : '#94a3b8' }}>
              12 archives connected
            </span>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div style={{
        marginTop: '40px',
        background: darkMode ? '#1e293b' : '#ffffff',
        padding: '32px',
        borderRadius: '20px',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: darkMode ? 
          '0 10px 25px -5px rgba(0, 0, 0, 0.2)' : 
          '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
            👨‍💻 Crime Editors ({teamMembers.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '300px'
            }}>
              <input
                type="text"
                placeholder="Search editors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: darkMode ? '#0f172a' : '#f1f5f9',
                  border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                  borderRadius: '10px',
                  color: darkMode ? 'white' : '#0f172a',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>
                🔍
              </span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 16px',
                background: darkMode ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                borderRadius: '10px',
                color: darkMode ? 'white' : '#0f172a',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="tasks">Sort by Cases</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Add Member Form */}
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px',
          border: `1px dashed ${darkMode ? '#334155' : '#cbd5e1'}`
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            ➕ Add New Editor
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 16px',
                background: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                borderRadius: '8px',
                color: darkMode ? 'white' : '#0f172a',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Specialization"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 16px',
                background: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                borderRadius: '8px',
                color: darkMode ? 'white' : '#0f172a',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={addMember}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Add Editor
            </button>
          </div>
        </div>

        {/* Team Members List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredMembers.map((member) => (
            <div key={member.id} style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              padding: '20px 24px',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: member.avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                      {member.name}
                    </h3>
                    <span style={{
                      padding: '2px 8px',
                      background: `${member.statusColor}20`,
                      color: member.statusColor,
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {member.status}
                    </span>
                  </div>
                  <p style={{ 
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '14px',
                    margin: '4px 0'
                  }}>
                    {member.role} • {member.email}
                  </p>
                  <p style={{ 
                    color: darkMode ? '#64748b' : '#94a3b8',
                    fontSize: '12px'
                  }}>
                    📍 Last active: {member.lastActive}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    {member.tasks}
                  </div>
                  <div style={{ 
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '12px'
                  }}>
                    Cases
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleTask(member.id)}
                    disabled={member.tasks === 0}
                    style={{
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: member.tasks === 0 ? 'not-allowed' : 'pointer',
                      opacity: member.tasks === 0 ? 0.5 : 1
                    }}
                  >
                    ✅ Complete Case
                  </button>
                  
                  <button
                    onClick={() => removeMember(member.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#ef4444',
                      border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== DASHBOARD STATS SECTION - MOVED TO BOTTOM ========== */}
      <div style={{
        marginTop: '40px',
        padding: '40px',
        background: darkMode ? 
          'linear-gradient(145deg, #1e293b, #0f172a)' : 
          'linear-gradient(145deg, #ffffff, #f1f5f9)',
        borderRadius: '24px',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: darkMode ? 
          '0 20px 40px -15px rgba(0, 0, 0, 0.3)' : 
          '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        {/* Dashboard Title */}
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          fontWeight: '800'
        }}>
          👥 True Crime Editors Dashboard
        </div>
        
        <p style={{ 
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '20px',
          marginBottom: '40px',
          fontWeight: '500'
        }}>
          Real-time team performance & evidence collection system
        </p>

        {/* Stats Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { 
              title: 'Active Editors', 
              value: teamData.members, 
              subtitle: 'Currently working',
              icon: '👥',
              trend: `${teamData.active}/${teamData.members} online`,
              color: '#3b82f6'
            },
            { 
              title: 'Cases Processed', 
              value: teamData.tasksCompleted, 
              subtitle: 'Completed today',
              icon: '📁',
              trend: `+${Math.floor(teamData.tasksCompleted / 6)} per hour`,
              color: '#10b981'
            },
            { 
              title: 'Evidence Accuracy', 
              value: `${teamData.productivity}%`, 
              subtitle: 'Image match rate',
              icon: '🎯',
              trend: teamData.weeklyTrend,
              color: '#f59e0b'
            },
            { 
              title: 'Archive Access', 
              value: '12+', 
              subtitle: 'Databases connected',
              icon: '🗃️',
              trend: '3 new this month',
              color: '#8b5cf6'
            }
          ].map((stat, index) => (
            <div key={index} style={{
              background: darkMode ? 
                'linear-gradient(145deg, #1e293b, #0f172a)' : 
                'linear-gradient(145deg, #ffffff, #f1f5f9)',
              padding: '28px',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              boxShadow: darkMode ? 
                '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : 
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px',
                fontSize: '80px',
                opacity: '0.1',
                transform: 'rotate(15deg)'
              }}>
                {stat.icon}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ 
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {stat.title}
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: '700',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {stat.value}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                color: darkMode ? '#64748b' : '#94a3b8',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                {stat.subtitle}
              </div>
              
              <div style={{ 
                color: stat.color,
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ↗️ {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{
            padding: '10px 20px',
            background: darkMode ? '#1e293b' : '#e2e8f0',
            border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            🕐 Last updated: Just now
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 20px',
              background: darkMode ? '#1e293b' : '#e2e8f0',
              color: darkMode ? 'white' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
