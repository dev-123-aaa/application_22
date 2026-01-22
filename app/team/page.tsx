'use client';

import React from 'react';

export default function TeamPage() {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
      backgroundColor: '#0f172a',
      color: 'white',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '16px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #334155'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '8px 0'
    },
    statLabel: {
      color: '#94a3b8'
    },
    teamMember: {
      backgroundColor: '#1e293b',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #334155'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Team Productivity</h1>
        <p style={styles.subtitle}>Track your team performance and workload</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Team Members</div>
          <div style={styles.statNumber}>8</div>
          <div style={styles.statLabel}>Total team size</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Now</div>
          <div style={styles.statNumber}>6</div>
          <div style={styles.statLabel}>Currently working</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Productivity</div>
          <div style={styles.statNumber}>78%</div>
          <div style={styles.statLabel}>Average efficiency</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Tasks Today</div>
          <div style={styles.statNumber}>24</div>
          <div style={styles.statLabel}>Completed tasks</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '16px' }}>Team Members</h2>
      
      <div style={styles.teamMember}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Alex Writer</div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Script Writer</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>3 tasks</div>
          <div style={{ color: '#4ade80', fontSize: '14px' }}>Active</div>
        </div>
      </div>
      
      <div style={styles.teamMember}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Sarah VO</div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Voiceover Artist</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>2 tasks</div>
          <div style={{ color: '#fbbf24', fontSize: '14px' }}>Recording</div>
        </div>
      </div>
    </div>
  );
}
