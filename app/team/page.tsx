"use client";  // ⬅️ ADD THIS AT THE VERY TOP

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
  const removeMember = (id) => {
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
  const toggleTask = (id) => {
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
            Real-time team performance & workload tracking
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
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Today's Progress</h3>
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
    </div>
  );
}
