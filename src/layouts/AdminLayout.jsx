import { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Link2, HelpCircle, LogOut, Menu, X } from 'lucide-react';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const location = useLocation();

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/staff', icon: Users, label: 'Manage Staff' },
    { to: '/admin/students', icon: GraduationCap, label: 'Manage Students' },
    { to: '/admin/assign', icon: Link2, label: 'Assign Staff' },
    { to: '/admin/questions', icon: HelpCircle, label: 'Manage Questions' },
  ];

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <header className="mobile-nav-header">
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="mobile-portal-label">Admin Portal</span>
        </div>
      </header>

      <div className="app-main-wrapper">
        <div className="sidebar-overlay" onClick={closeSidebar}></div>

        <aside className="sidebar">
          <div className="sidebar-header" style={{ padding: '0 1rem 2rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Admin Menu</h2>
              <button onClick={closeSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '0.8rem', background: 'var(--faint-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                AAMEC
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Administrator
              </span>
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {navItems.map(item => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
    </div>
  );
}

export default AdminLayout;
