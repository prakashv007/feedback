import { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, BarChart3, Users, Menu, X } from 'lucide-react';

function HodLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const location = useLocation();

  if (role !== 'HOD') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Universal Portal Navigation Header */}
      <header className="mobile-nav-header">
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="mobile-portal-label">HOD Portal</span>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div className="sidebar-overlay" onClick={closeSidebar}></div>

      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '0 1rem 2rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Portal Menu</h2>
            <button 
              onClick={closeSidebar}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '0.8rem', background: 'var(--faint-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
              IT Department
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Head of Department
            </span>
          </div>
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link 
            to="/hod" 
            className={`nav-item ${location.pathname === '/hod' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <div className="nav-item">
            <Users size={20} />
            <span>Teachers</span>
          </div>
          <Link 
            to="/hod/reports" 
            className={`nav-item ${location.pathname === '/hod/reports' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <BarChart3 size={20} />
            <span>Reports</span>
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '0.875rem', justifyContent: 'center' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default HodLayout;
