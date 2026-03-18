import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { db, collection, query, where, getDocs } from '../firebase';
import './Auth.css';

function StudentLogin() {
  const [registerNo, setRegisterNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
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

    try {
      const q = query(collection(db, 'students'), where('regNo', '==', id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Register Number not found. Please contact Admin.');
        setLoading(false);
        return;
      }

      const studentData = querySnapshot.docs[0].data();
      
      // Store student info
      localStorage.setItem('userRole', 'STUDENT');
      localStorage.setItem('userId', id);
      localStorage.setItem('userName', studentData.name || 'Student');
      localStorage.setItem('userSemester', studentData.currentSemester || '');
      
      navigate('/student');
    } catch (err) {
      console.error("Login error:", err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
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
            <div>
              <div className="input-container">
                <GraduationCap className="input-icon" size={20} />
                <input
                  type="text"
                  id="regNo"
                  maxLength={12}
                  placeholder="Register number"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                  required
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginLeft: '0.5rem', lineHeight: '1.4' }}>
                Enter your full 12-digit university register number.
              </p>
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
