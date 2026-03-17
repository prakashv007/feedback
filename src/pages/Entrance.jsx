import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';
import './Auth.css';

function Entrance() {
  return (
    <div className="auth-container">
      <div className="auth-bg-blobs">
        <div className="blob blob-primary"></div>
        <div className="blob blob-secondary"></div>
      </div>

      <div className="entrance-card animate-fade-in">
        <div className="entrance-header">
          <h1>Digital Feedback</h1>
          <p>Select your portal to continue</p>
        </div>

        <div className="role-grid">
          <Link to="/student-login" className="role-card">
            <div className="role-icon">
              <ShieldCheck size={40} />
            </div>
            <div className="role-info">
              <h3>Student Portal</h3>
              <p>Direct feedback on subjects & infrastructure</p>
            </div>
          </Link>

          <Link to="/staff-login" className="role-card">
            <div className="role-icon">
              <Users size={40} />
            </div>
            <div className="role-info">
              <h3>Staff Portal</h3>
              <p>HODs & Teachers dashboard access</p>
            </div>
          </Link>
        </div>

        <footer style={{ marginTop: '4rem', opacity: 0.3, fontSize: '0.8rem', color: 'white', maxWidth: '400px', margin: '4rem auto 0' }}>
          <p>© 2026 Anna University Affiliated College • Quality Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default Entrance;
