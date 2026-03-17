import { useNavigate } from 'react-router-dom';
import { Lock, Construction, ArrowLeft } from 'lucide-react';

function ComingSoon({ departmentName }) {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-container">
      <div className="card" style={{ maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: 'rgba(26, 191, 161, 0.1)', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          align_items: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <Construction size={40} color="var(--primary)" />
        </div>
        
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Coming Soon</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          The Feedback Portal for the <b>{departmentName || 'selected'}</b> department is currently under maintenance or being implemented.
        </p>
        
        <div style={{ 
          display: 'flex', 
          align_items: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          color: 'var(--text-light)',
          fontSize: '0.9rem',
          marginBottom: '2rem'
        }}>
          <Lock size={16} />
          <span>Access Restricted to IT Dept</span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => {
            localStorage.clear();
            navigate('/', { replace: true });
          }}
          style={{ width: '100%' }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ComingSoon;
