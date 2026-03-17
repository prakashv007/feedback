import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { DEPARTMENTS } from '../data/departments';
import './Auth.css';

function StudentLogin() {
  const [registerNo, setRegisterNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const id = registerNo.trim();

    if (!id) {
      setError('Please enter your 12-digit Register Number');
      return;
    }

    if (!/^\d{12}$/.test(id)) {
      setError('Register Number must be exactly 12 digits');
      return;
    }

    setLoading(true);

    // Logic from original Login.jsx
    setTimeout(() => {
      const deptCode = id.substring(6, 9);
      const dept = DEPARTMENTS.find(d => d.code === deptCode);

      if (dept) {
        if (dept.implemented) {
          localStorage.setItem('userRole', 'STUDENT');
          localStorage.setItem('userId', id);
          navigate('/student');
        } else {
          navigate('/locked', { state: { deptName: dept.name } });
        }
      } else {
        setError('Invalid department code in Register Number');
        setLoading(false);
      }
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
            <p className="subtitle">Sign in to your student account</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-container">
              <GraduationCap className="input-icon" size={20} />
              <input
                type="text"
                id="regNo"
                maxLength={12}
                placeholder="Register Number"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value.replace(/\D/g, ''))}
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
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <footer className="auth-footer" style={{ marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              IT Dept Code: 205
            </p>
          </footer>
        </div>

        {/* Right Column: Branding & Wavy Divider */}
        <div className="auth-banner-column">
          <svg className="wavy-divider" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100 0 C0 0 0 0 0 0 L0 100 C0 100 0 100 100 100 Z" fill="white" style={{ display: 'none' }} />
            <path d="M0 0 Q 50 50 0 100 L 100 100 L 100 0 Z" fill="white" transform="rotate(180 50 50)" />
            <path d="M30 0 C 100 30 0 70 30 100 L 0 100 L 0 0 Z" fill="white" />
          </svg>
          
          <div className="blob"></div>
          
          <div className="auth-banner-content">
            <h2>Welcome Back!</h2>
            <p>
              Your voice matters. Access the portal to share your academic feedback and help us improve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
