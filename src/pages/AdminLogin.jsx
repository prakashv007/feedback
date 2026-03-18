import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, Loader2, Lock } from 'lucide-react';
import './Auth.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (username.trim() === 'admin' && password === 'aamec2026') {
        localStorage.setItem('userRole', 'ADMIN');
        localStorage.setItem('userId', 'ADMIN');
        navigate('/admin');
      } else {
        setError('Invalid username or password');
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
        <div className="auth-form-column">
          <Link to="/" className="btn-back">
            <ArrowLeft size={18} />
            <span>Back to Roles</span>
          </Link>

          <header>
            <h2>Admin</h2>
            <p className="subtitle">Sign in to admin portal</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-container">
              <ShieldCheck className="input-icon" size={20} />
              <input
                type="text"
                id="adminUser"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="adminPass"
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
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="auth-banner-column">
          <div className="blob"></div>
          <div className="auth-banner-content">
            <h2>Admin Panel</h2>
            <p>
              Manage staff assignments, student records, and academic configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
