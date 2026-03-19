import { Link } from 'react-router-dom';
import { GraduationCap, Users, Settings2 } from 'lucide-react';
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
          <h1>AAMEC Feedback</h1>
          <p>Select your portal to continue</p>
        </div>

        <div className="role-grid">
          <Link to="/student-login" className="role-card">
            <div className="role-icon">
              <GraduationCap size={40} />
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
              <h3>HOD Portal</h3>
              <p>Department head dashboard access</p>
            </div>
          </Link>

          <Link to="/admin-login" className="role-card">
            <div className="role-icon">
              <Settings2 size={40} />
            </div>
            <div className="role-info">
              <h3>Admin Portal</h3>
              <p>Manage staff, students &amp; assignments</p>
            </div>
          </Link>
        </div>

        <footer style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '4rem auto 0' }}>
          <p>© 2026 Anna University Affiliated College</p>
        </footer>
      </div>
    </div>
  );
}

export default Entrance;
