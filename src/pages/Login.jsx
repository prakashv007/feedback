import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';
import { DEPARTMENTS } from '../data/departments';
import './Login.css';

function Login() {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const id = userId.trim().toUpperCase();

    if (!id) {
      setError('Please enter your Register Number or Code');
      return;
    }

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

    // Student Login
    if (/^\d{12}$/.test(id)) {
      const deptCode = id.substring(6, 9);
      const dept = DEPARTMENTS.find(d => d.code === deptCode);

      if (dept) {
        if (dept.implemented) {
          localStorage.setItem('userRole', 'STUDENT');
          localStorage.setItem('userId', id);
          navigate('/student');
        } else {
          // Locked Department
          navigate('/locked', { state: { deptName: dept.name } });
        }
      } else {
        setError('Invalid department code in Register Number');
      }
      return;
    }

    // Generic HOD/Teacher login for other depts (locked)
    if (id.endsWith('HOD') || (/^[A-Z]{2,3}\d{3}$/.test(id))) {
       navigate('/locked', { state: { deptName: 'requested' } });
       return;
    }

    setError('Invalid Register Number or Code format');
  };

  return (
    <div className="login-container">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <div className="login-card glass-dark animate-slide-up">
        <div className="login-header">
          <div className="icon-wrapper">
            <GraduationCap size={44} color="white" />
          </div>
          <h1>Feedback Portal</h1>
          <p className="subtitle">Anna University Affiliated College</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">Register Number / Teacher Code</label>
            <input
              type="text"
              id="userId"
              autoFocus
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 820423205061 or IT001"
            />
            <small className="help-text">
              IT Students: 12-digit (code 205) • Teachers: IT001 • HOD: ITHOD
            </small>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn">
            <span>Login to Portal</span>
            <LogIn size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
