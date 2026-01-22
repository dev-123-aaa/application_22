export default function TeamPage() {
  return (
    <div style={{ 
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#0f172a',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
        👥 Team Productivity
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        Track your team performance and workload
      </p>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #334155',
          flex: '1',
          minWidth: '250px'
        }}>
          <div style={{ color: '#94a3b8', marginBottom: '10px' }}>
            Team Members
          </div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>
            8
          </div>
          <div style={{ color: '#64748b' }}>
            Total team size
          </div>
        </div>
        
        <div style={{
          background: '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #334155',
          flex: '1',
          minWidth: '250px'
        }}>
          <div style={{ color: '#94a3b8', marginBottom: '10px' }}>
            Active Now
          </div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>
            6
          </div>
          <div style={{ color: '#64748b' }}>
            Currently working
          </div>
        </div>
        
        <div style={{
          background: '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #334155',
          flex: '1',
          minWidth: '250px'
        }}>
          <div style={{ color: '#94a3b8', marginBottom: '10px' }}>
            Productivity
          </div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>
            78%
          </div>
          <div style={{ color: '#64748b' }}>
            Average efficiency
          </div>
        </div>
        
        <div style={{
          background: '#1e293b',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #334155',
          flex: '1',
          minWidth: '250px'
        }}>
          <div style={{ color: '#94a3b8', marginBottom: '10px' }}>
            Tasks Today
          </div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '5px' }}>
            24
          </div>
          <div style={{ color: '#64748b' }}>
            Completed tasks
          </div>
        </div>
      </div>
      
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
        Team Members
      </h2>
      
      <div style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #334155',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Alex Writer</div>
            <div style={{ color: '#94a3b8' }}>Script Writer</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>3 tasks</div>
            <div style={{ color: '#4ade80' }}>Active</div>
          </div>
        </div>
      </div>
      
      <div style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Sarah VO</div>
            <div style={{ color: '#94a3b8' }}>Voiceover Artist</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>2 tasks</div>
            <div style={{ color: '#fbbf24' }}>Recording</div>
          </div>
        </div>
      </div>
    </div>
  );
}
