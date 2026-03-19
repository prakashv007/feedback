import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, AlertCircle, Loader2, Lock } from 'lucide-react';
import './Auth.css';

function StaffLogin() {
  const [staffCode, setStaffCode] = useState('');
  const [password, setPassword] = useState('');
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
      if (id === 'ITHOD' && password === 'hod@it2026') {
        localStorage.setItem('userRole', 'HOD');
        localStorage.setItem('userId', id);
        navigate('/hod');
        return;
      }
      
      if (id === 'ITHOD' && password !== 'hod@it2026') {
        setError('Invalid password for HOD');
        setLoading(false);
        return;
      }

      // Generic HOD login for other depts (locked)
      if (id.endsWith('HOD')) {
         navigate('/locked', { state: { deptName: 'requested' } });
         return;
      }

      setError('Invalid HOD Code. Example: ITHOD');
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
            <p className="subtitle">Sign in to HOD portal</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-container">
              <Users className="input-icon" size={20} />
              <input
                type="text"
                id="staffCode"
                placeholder="HOD Code"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="staffPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Example Code: ITHOD
            </p>
          </footer>
        </div>

        {/* Right Column: Branding & Wavy Divider */}
        <div className="auth-banner-column">
          
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
