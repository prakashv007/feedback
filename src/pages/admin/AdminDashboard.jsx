import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Link2, Calendar } from 'lucide-react';
import { db, collection, onSnapshot, doc, getDoc, setDoc } from '../../firebase';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [staffCount, setStaffCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [activeSession, setActiveSession] = useState({ id: 'default', name: 'Standard Session' });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [sessionFeedbacks, setSessionFeedbacks] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Listen to staff collection
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      setStaffCount(snap.size);
    });

    // Listen to students collection
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudentCount(snap.size);
    });

    // Listen to subjects collection
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjectCount(snap.size);
    });

    // Listen to feedbacks collection
    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snap) => {
      const all = snap.docs.map(d => d.data());
      setFeedbacks(all);
      setFeedbackCount(all.length);
    });

    // Listen to current session settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'current'), (snap) => {
      if (snap.exists()) {
        setActiveSession(snap.data());
      } else {
        // Initial setup if missing
        setDoc(doc(db, 'settings', 'current'), {
          id: 'session-1',
          name: 'Main Session',
          updatedAt: new Date().toISOString()
        });
      }
    });

    return () => {
      unsubStaff();
      unsubStudents();
      unsubSubjects();
      unsubFeedbacks();
      unsubSettings();
    };
  }, []);

  const cards = [
    { label: 'Total Staff', value: staffCount, icon: Users, color: 'green', to: '/admin/staff' },
    { label: 'Total Students', value: studentCount, icon: GraduationCap, color: 'blue', to: '/admin/students' },
    { label: 'Total Subjects', value: subjectCount, icon: BookOpen, color: 'amber', to: '/admin/assign' },
    { label: 'Feedbacks (Current Session)', value: feedbacks.filter(f => f.sessionId === activeSession?.id).length, icon: Link2, color: 'purple', to: '/admin' },
    { label: 'Active Session', value: activeSession.name, icon: Calendar, color: 'indigo', action: () => setShowSessionModal(true) },
  ];

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    setUpdating(true);
    const newId = `session-${Date.now()}`;
    await setDoc(doc(db, 'settings', 'current'), {
      id: newId,
      name: newSessionName.trim(),
      updatedAt: new Date().toISOString()
    });
    setUpdating(false);
    setShowSessionModal(false);
    setNewSessionName('');
    alert(`New session "${newSessionName}" started! All students can now provide fresh feedback.`);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of all academic data and resources.</p>
      </header>

      <div className="admin-stats-grid">
        {cards.map(card => (
          card.to ? (
            <Link key={card.label} to={card.to} style={{ textDecoration: 'none' }}>
              <div className="admin-stat-card">
                <div className={`admin-stat-icon ${card.color}`}>
                  <card.icon size={28} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">{card.label}</span>
                  <span className="admin-stat-value">{card.value}</span>
                </div>
              </div>
            </Link>
          ) : (
            <div key={card.label} className="admin-stat-card clickable" onClick={card.action}>
              <div className={`admin-stat-icon ${card.color}`}>
                <card.icon size={28} />
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-label">{card.label}</span>
                <span className="admin-stat-value" style={{ fontSize: '0.9rem' }}>{card.value}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '4px' }}>CLICK TO CHANGE</span>
              </div>
            </div>
          )
        ))}
      </div>

      {showSessionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSessionModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Start New Feedback Session</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Starting a new session will "reset" the feedback status for all students. They will be able to provide new feedback for all their subjects. Previous feedback is kept in the database but archived.
            </p>
            <div className="admin-field">
              <label>New Session Name</label>
              <input 
                type="text" 
                placeholder="e.g. Unit Test 1, April Feedback, etc." 
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
              />
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn secondary" onClick={() => setShowSessionModal(false)}>Cancel</button>
              <button className="admin-btn" onClick={handleCreateSession} disabled={updating || !newSessionName.trim()}>
                {updating ? 'Starting...' : 'Start New Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
