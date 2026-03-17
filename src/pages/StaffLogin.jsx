import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import './Auth.css';

function StaffLogin() {
  const [staffCode, setStaffCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const id = staffCode.trim().toUpperCase();

    if (!id) {
      setError('Please enter your Staff Code');
      return;
    }

    setLoading(true);

    // Logic from original Login.jsx
    setTimeout(() => {
      // HOD Login
      if (id === 'ITHOD') {
        localStorage.setItem('userRole', 'HOD');
        localStorage.setItem('userId', id);
        navigate('/hod');
        return;
      }

      // Teacher Login
      if (id.startsWith('IT') && id.length > 2) {
        localStorage.setItem('userRole', 'TEACHER');
        localStorage.setItem('userId', id);
        navigate('/teacher');
        return;
      }

      // Generic HOD/Teacher login for other depts (locked)
      if (id.endsWith('HOD') || (/^[A-Z]{2,3}\d{3}$/.test(id))) {
         navigate('/locked', { state: { deptName: 'requested' } });
         return;
      }

      setError('Invalid Staff Code format. Example: IT001 or ITHOD');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-blobs">
        <div className="blob blob-primary"></div>
        <div className="blob blob-secondary"></div>
      </div>

      <div className="auth-card-modern animate-slide-up">
        {/* Left Column: Form */}
        <div className="auth-form-column">
          <Link to="/" className="btn-back">
            <ArrowLeft size={18} />
            <span>Back to Roles</span>
          </Link>

          <header>
            <h2>Hello!</h2>
            <p className="subtitle">Sign in to staff portal</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-container">
              <Users className="input-icon" size={20} />
              <input
                type="text"
                id="staffCode"
                placeholder="Teacher / HOD Code"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="error-box" style={{ marginTop: '0' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="auth-btn-modern" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Enter Portal'}
            </button>
          </form>

          <footer className="auth-footer" style={{ marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Example Codes: IT001, ITHOD
            </p>
          </footer>
        </div>

        {/* Right Column: Branding & Wavy Divider */}
        <div className="auth-banner-column">
          <svg className="wavy-divider" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 Q 50 50 0 100 L 100 100 L 100 0 Z" fill="white" transform="rotate(180 50 50)" />
            <path d="M30 0 C 100 30 0 70 30 100 L 0 100 L 0 0 Z" fill="white" />
          </svg>
          
          <div className="blob"></div>
          
          <div className="auth-banner-content">
            <h2>Welcome Back!</h2>
            <p>
              Access the administrative dashboard to monitor feedback trends and manage academic parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
