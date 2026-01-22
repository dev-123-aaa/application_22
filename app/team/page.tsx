'use client';

export default function TeamPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        👥 Team Productivity
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Track your team performance and workload
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dbeafe'
        }}>
          <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>8</div>
          <div style={{ color: '#6b7280' }}>Team Members</div>
        </div>
        
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>6</div>
          <div style={{ color: '#6b7280' }}>Active Now</div>
        </div>
        
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>78%</div>
          <div style={{ color: '#6b7280' }}>Productivity</div>
        </div>
        
        <div style={{
          backgroundColor: '#fae8ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f5d0fe'
        }}>
          <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>24</div>
          <div style={{ color: '#6b7280' }}>Tasks Today</div>
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Team Members
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                marginRight: '12px'
              }}></div>
              <div>
                <div style={{ fontWeight: '500' }}>Alex Writer</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Script Writer</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '500' }}>3 tasks</div>
              <div style={{ fontSize: '14px', color: '#059669' }}>Active</div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                marginRight: '12px'
              }}></div>
              <div>
                <div style={{ fontWeight: '500' }}>Sarah VO</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Voiceover Artist</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '500' }}>2 tasks</div>
              <div style={{ fontSize: '14px', color: '#d97706' }}>Recording</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Next Steps for Team Dashboard:
        </h3>
        <ul style={{ color: '#6b7280', paddingLeft: '20px', listStyleType: 'disc' }}>
          <li>Add task assignment tracking</li>
          <li>Integrate video production timelines</li>
          <li>Add workload balancing charts</li>
          <li>Connect to voiceover recording schedules</li>
        </ul>
      </div>
    </div>
  );
}
