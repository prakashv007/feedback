import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc } from '../../firebase';
import { Activity, BarChart3, Filter } from 'lucide-react';
import './HodTabs.css';

function FeedbackTimeline() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('ALL');
  const [activeSessionId, setActiveSessionId] = useState(null);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    // Listen for feedbacks
    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
      const fbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(fbData);
    });

    // Listen for staff
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(staffData);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'current'), (snap) => {
      if (snap.exists()) {
        setActiveSessionId(snap.data().id);
      }
    });

    return () => {
      unsubFeedbacks();
      unsubStaff();
      unsubSettings();
    };
  }, []);

  const getTimelineData = () => {
    // 1. Filter feedbacks by session first
    const sessionFeedbacks = activeSessionId 
      ? feedbacks.filter(f => f.sessionId === activeSessionId)
      : feedbacks;

    // 2. Filter feedbacks by teacher if selected
    const filteredFeedbacks = selectedTeacher === 'ALL' 
      ? sessionFeedbacks 
      : sessionFeedbacks.filter(f => f.teacherCode === selectedTeacher);

    return semesters.map(sem => {
      const semFeedbacks = filteredFeedbacks.filter(f => f.semesterId === sem);
      const totalRatings = semFeedbacks.length;
      const averageRating = totalRatings > 0 
        ? (semFeedbacks.reduce((sum, f) => sum + f.averageRating, 0) / totalRatings)
        : 0;

      return {
        semester: sem,
        average: parseFloat(averageRating.toFixed(2)),
        count: totalRatings
      };
    });
  };

  const timelineData = getTimelineData();
  const maxAvg = Math.max(...timelineData.map(s => s.average), 1);

  return (
    <div className="hod-tabs-container">
      <header className="tabs-header">
        <h1>Feedback Timeline</h1>
        <p className="subtitle">Historical evolution of department ratings over semesters.</p>
      </header>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label"><Filter size={12} /> Filter by Teacher</label>
          <select 
            className="filter-select"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="ALL">Entire Department (All Faculty)</option>
            {staffList.map(teacher => (
              <option key={teacher.code} value={teacher.code}>
                {teacher.name} ({teacher.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="timeline-card card animate-fade-in">
        <div className="chart-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
          <h3>Historical Performance Trend</h3>
        </div>
        
        <div className="chart-wrapper">
          {timelineData.map(stat => (
            <div key={stat.semester} className="timeline-bar-col">
              {stat.average > 0 && (
                <div className="timeline-bar-val">{stat.average}</div>
              )}
              <div 
                className="timeline-bar" 
                style={{ height: `${(stat.average / 5) * 100}%` }}
              >
                {stat.average >= 4.0 && (
                   <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'white' }}></div>
                )}
              </div>
              <div className="timeline-bar-label">Sem {stat.semester}</div>
            </div>
          ))}
        </div>

        <div className="repo-legend" style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.85rem' }}>
          <p>
            * Showing average ratings for {selectedTeacher === 'ALL' ? 'the entire department' : 'selected teacher'}. 
            Based on {timelineData.reduce((sum, s) => sum + s.count, 0)} student responses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeedbackTimeline;
