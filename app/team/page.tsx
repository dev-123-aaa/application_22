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
  const productivityRef = useRef(78);

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

  // n8n send function
  const sendToN8n = async () => {
    const textarea = document.getElementById('n8nContentInput') as HTMLTextAreaElement;
    const button = document.getElementById('sendToN8nBtn') as HTMLButtonElement;
    const statusDiv = document.getElementById('n8nStatus');
    
    if (!textarea || !textarea.value.trim()) {
      if (statusDiv) {
        statusDiv.innerHTML = '⚠️ Please enter some content first';
        statusDiv.style.color = '#f59e0b';
      }
      return;
    }

    // Disable button and show loading
    if (button) {
      button.disabled = true;
      button.innerHTML = '🔄 Processing...';
    }
    
    if (statusDiv) {
      statusDiv.innerHTML = '🔄 Sending to n8n workflow...';
      statusDiv.style.color = '#3b82f6';
    }

    try {
      const response = await fetch('/api/n8n/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textarea.value,
          timestamp: new Date().toISOString(),
          source: 'team-dashboard',
          action: 'process_content',
          metadata: {
            team_members: teamData.members,
            productivity: teamData.productivity,
            active_members: teamData.active
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (statusDiv) {
          statusDiv.innerHTML = '✅ Successfully sent to n8n workflow!';
          statusDiv.style.color = '#10b981';
        }
        textarea.value = ''; // Clear input
        
        // Update character count
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = '0';
      } else {
        if (statusDiv) {
          statusDiv.innerHTML = `❌ Error: ${data.error || 'Failed to send'}`;
          statusDiv.style.color = '#ef4444';
        }
      }
    } catch (error) {
      if (statusDiv) {
        statusDiv.innerHTML = '❌ Network error. Please try again.';
        statusDiv.style.color = '#ef4444';
      }
      console.error('Error sending to n8n:', error);
    } finally {
      // Re-enable button
      if (button) {
        button.disabled = false;
        button.innerHTML = '🚀 Send to n8n';
      }
    }
  };

  // Insert team report template
  const insertTeamReport = () => {
    const textarea = document.getElementById('n8nContentInput') as HTMLTextAreaElement;
    if (!textarea) return;
    
    textarea.value = `Team Productivity Report - ${new Date().toLocaleDateString()}

👥 Team Members: ${teamData.members}
🟢 Active Now: ${teamData.active}
📈 Productivity: ${teamData.productivity}%
✅ Tasks Completed Today: ${teamData.tasksCompleted}/${teamData.totalTasks}
📊 Weekly Trend: ${teamData.weeklyTrend}

Team Status:
${teamMembers.map(member => 
  `• ${member.name} (${member.role}): ${member.status} - ${member.tasks} tasks`
).join('\n')}

Action Items:
1. Review productivity metrics
2. Assign pending tasks
3. Schedule team sync
4. Update project timelines`;
    
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
      const textarea = document.getElementById('n8nContentInput') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = text;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  // Handle template click
  const handleTemplateClick = (template: string) => {
    const textarea = document.getElementById('n8nContentInput') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = template;
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
  };

  // Initialize character count on component mount
  useEffect(() => {
    const textarea = document.getElementById('n8nContentInput');
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            👥 Team Dashboard
          </h1>
          <p style={{ 
            color: darkMode ? '#94a3b8' : '#64748b',
            fontSize: '16px'
          }}>
            Real-time team performance &amp; workload tracking
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <div style={{
            padding: '10px 20px',
            background: darkMode ? '#1e293b' : '#e2e8f0',
            border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            🕐 Last updated: Just now
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {[
          { 
            title: 'Team Members', 
            value: teamData.members, 
            subtitle: 'Total team size',
            icon: '👥',
            trend: '+2 this month',
            color: '#3b82f6'
          },
          { 
            title: 'Active Now', 
            value: teamData.active, 
            subtitle: 'Currently working',
            icon: '🟢',
            trend: `${teamData.active}/${teamData.members} online`,
            color: '#10b981'
          },
          { 
            title: 'Productivity', 
            value: `${teamData.productivity}%`, 
            subtitle: 'Average efficiency',
            icon: '📈',
            trend: teamData.weeklyTrend,
            color: '#f59e0b'
          },
          { 
            title: 'Tasks Progress', 
            value: `${teamData.tasksCompleted}/${teamData.totalTasks}`, 
            subtitle: 'Completed today',
            icon: '✅',
            trend: `${Math.round(progressPercentage)}% complete`,
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

      {/* Progress Bar */}
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
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Today&apos;s Progress</h3>
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
          <span>✅ {teamData.tasksCompleted} Completed</span>
          <span>⏳ {teamData.tasksInProgress} In Progress</span>
          <span>📋 {teamData.totalTasks} Total</span>
        </div>
      </div>

      {/* Team Members Section */}
      <div style={{
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
            👨‍💻 Team Members ({teamMembers.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '300px'
            }}>
              <input
                type="text"
                placeholder="Search team members..."
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
              <option value="tasks">Sort by Tasks</option>
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
            ➕ Add New Team Member
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
              placeholder="Role/Position"
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
              Add Member
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
                    Tasks
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
                    ✅ Complete Task
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

      {/* Footer Stats */}
      <div style={{
        marginTop: '40px',
        padding: '24px',
        background: darkMode ? '#1e293b' : '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        textAlign: 'center',
        color: darkMode ? '#94a3b8' : '#64748b',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <span>🏆 Avg. Completion Rate: 89%</span>
          <span>⚡ Response Time: 1.2h</span>
          <span>🎯 Goal Completion: 78%</span>
          <span>📊 Weekly Growth: +12%</span>
        </div>
        <div style={{ marginTop: '16px', color: darkMode ? '#64748b' : '#94a3b8', fontSize: '12px' }}>
          Data updates in real-time • Last refresh: Just now
        </div>
      </div>

      {/* ========== N8N INTEGRATION SECTION ========== */}
      <div style={{
        marginTop: '40px',
        background: darkMode ? '#1e293b' : '#ffffff',
        padding: '32px',
        borderRadius: '20px',
        border: `2px solid ${darkMode ? '#3b82f6' : '#3b82f6'}`,
        boxShadow: darkMode ? 
          '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : 
          '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
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
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            🤖
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              n8n Automation Hub
            </h2>
            <p style={{ 
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '14px',
              marginTop: '4px'
            }}>
              Send content directly to your n8n workflows for processing
            </p>
          </div>
        </div>

        {/* Content Input Area */}
        <div style={{ marginBottom: '24px' }}>
          <textarea
            id="n8nContentInput"
            placeholder={`📝 Paste your content here...

Examples:
• Video scripts for Family Guy episodes
• Voiceover recording instructions  
• Editing notes and timelines
• Task assignments for team members
• Any content that needs automation
• AI processing requests
• Workflow triggers`}
            style={{
              width: '100%',
              height: '200px',
              padding: '20px',
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: darkMode ? 'white' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
              borderRadius: '12px',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'monospace',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.border = `1px solid #3b82f6`}
            onBlur={(e) => e.target.style.border = `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`}
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
              Supports text, markdown, JSON, or any structured content
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
          border: `1px dashed ${darkMode ? '#334155' : '#cbd5e1'}`,
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            📁 Or upload a file:
          </h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="fileUpload"
              accept=".txt,.md,.json,.csv,.docx,.pdf"
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
              Supports: .txt, .md, .json, .csv, .docx, .pdf
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            id="sendToN8nBtn"
            style={{
              flex: '1',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={sendToN8n}
          >
            🚀 Send to n8n
          </button>
          
          <button
            style={{
              padding: '16px 24px',
              background: 'transparent',
              color: darkMode ? '#94a3b8' : '#64748b',
              border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = darkMode ? '#0f172a' : '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={insertTeamReport}
          >
            📋 Insert Team Report
          </button>
        </div>

        {/* Status Message */}
        <div
          id="n8nStatus"
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
          💡 Enter content above and click "Send to n8n"
        </div>

        {/* Templates Section */}
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            ⚡ Quick Templates
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Video Script', emoji: '🎬', template: 'Video Script Template\n\nTitle:\nDuration:\nVoiceover Notes:\nVisual Elements:\nCall to Action:' },
              { label: 'Team Task', emoji: '📋', template: 'Task Assignment\n\nAssignee:\nPriority:\nDeadline:\nDescription:\nSuccess Criteria:' },
              { label: 'Meeting Notes', emoji: '📝', template: 'Meeting Notes\n\nDate:\nAttendees:\nAgenda:\nDecisions:\nAction Items:' },
              { label: 'Content Brief', emoji: '📄', template: 'Content Brief\n\nTopic:\nTarget Audience:\nKey Points:\nFormat:\nSEO Keywords:' }
            ].map((template, index) => (
              <button
                key={index}
                style={{
                  padding: '12px 20px',
                  background: darkMode ? '#1e293b' : '#ffffff',
                  color: darkMode ? 'white' : '#0f172a',
                  border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
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
                onClick={() => handleTemplateClick(template.template)}
              >
                {template.emoji} {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          borderRadius: '12px',
          color: darkMode ? '#94a3b8' : '#64748b',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ color: '#3b82f6', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
            💡 How n8n Integration Works:
          </h4>
          <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Team enters content in the box above</li>
            <li>Click "Send to n8n" to trigger your workflow</li>
            <li>Content is sent to your n8n webhook URL</li>
            <li>n8n processes the content (AI, automation, etc.)</li>
            <li>Results are delivered to your configured destinations</li>
          </ol>
          <div style={{ 
            color: darkMode ? '#3b82f6' : '#2563eb',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            🔗 Connected to: Your n8n workflow
          </div>
        </div>
      </div>
    </div>
  );
}
