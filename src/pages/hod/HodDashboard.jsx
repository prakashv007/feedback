import { useState, useEffect } from 'react';
import { teachersInfo, subjectsMetadata } from '../../data/mockData';
import { Users, Star, Activity, ChevronRight } from 'lucide-react';
import './HodDashboard.css';

function HodDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const { db, collection, onSnapshot } = await import('../../firebase');
        const unsub = onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
          const fbData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setFeedbacks(fbData);
        });
        return () => unsub();
      } catch (err) {
        console.error("Firebase fetch failed:", err);
        const savedFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        setFeedbacks(savedFeedbacks);
      }
    };

    const cleanup = loadFeedbacks();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Compute Department Stats
  const totalTeachers = Object.keys(teachersInfo).length;
  const totalFeedbacks = feedbacks.length;
  const currentDeptAvg = totalFeedbacks > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.averageRating, 0) / totalFeedbacks).toFixed(2)
    : 0;

  // Approximate response rate (mock calculation: max 60 students per subject)
  // Subjects tracked * 60 = expected responses
  let activeSubjectsCount = 0;
  Object.values(subjectsMetadata).forEach(sem => activeSubjectsCount += sem.length);
  const expectedResponses = activeSubjectsCount * 60; 
  const responseRate = expectedResponses > 0 
    ? Math.min(100, (totalFeedbacks / expectedResponses) * 100).toFixed(1) 
    : 0;

  // Compute Teacher Performance
  const teacherPerformance = Object.keys(teachersInfo).map(code => {
    const tFeedbacks = feedbacks.filter(f => {
      // Find subject to confirm it belongs to this teacher
      let belongsToT = false;
      Object.values(subjectsMetadata).forEach(sem => {
        const sub = sem.find(s => s.id === f.subjectId);
        if (sub && sub.teacherCode === code) belongsToT = true;
      });
      return belongsToT;
    });

    const tTotal = tFeedbacks.length;
    const tAvg = tTotal > 0 
      ? (tFeedbacks.reduce((sum, f) => sum + f.averageRating, 0) / tTotal).toFixed(2)
      : 0;

    return {
      code,
      name: teachersInfo[code].name,
      title: teachersInfo[code].title,
      totalResponses: tTotal,
      averageRating: parseFloat(tAvg)
    };
  }).sort((a, b) => b.averageRating - a.averageRating); // Sort highest first

  return (
    <div className="hod-dashboard">
      <header className="dashboard-header">
        <h1>IT Department Overview</h1>
        <p className="subtitle">Track teacher performance and feedback analytics.</p>
      </header>

      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Teachers</span>
            <span className="stat-value">{totalTeachers}</span>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon star"><Star size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Dept Average Rating</span>
            <span className="stat-value">{currentDeptAvg} <span className="stat-max">/ 5.0</span></span>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon activity"><Activity size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Est. Response Rate</span>
            <span className="stat-value">{responseRate}%</span>
            <span className="stat-context">({totalFeedbacks} submissions)</span>
          </div>
        </div>
      </div>

      <div className="hod-content-layout">
        <section className="elite-performers-section">
          <div className="section-header">
            <h3>Elite Performers</h3>
            <p>Top rated faculty according to student voice.</p>
          </div>
          <div className="elite-grid">
            {teacherPerformance.slice(0, 3).map((t, idx) => (
              <div key={t.code} className={`elite-card rank-${idx + 1}`}>
                <div className="elite-rank-badge">#{idx + 1}</div>
                <div className="elite-avatar">
                  <span>{t.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h4>{t.name}</h4>
                <p className="elite-title">{t.title}</p>
                <div className="elite-stats">
                  <div className="elite-stat-item">
                    <span className="val">{t.averageRating.toFixed(1)}</span>
                    <span className="lbl">Rating</span>
                  </div>
                  <div className="elite-stat-item">
                    <span className="val">{t.totalResponses}</span>
                    <span className="lbl">Reviews</span>
                  </div>
                </div>
                <button className="btn btn-secondary-outline btn-sm" onClick={() => setSelectedTeacher(t)}>
                  View Breakdown
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="ranking-section card">
          <div className="card-header">
            <h3>Department Ranking</h3>
            <div className="header-meta">
              <span>{totalTeachers} Faculty Members</span>
            </div>
          </div>
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Teacher</th>
                  <th>Performance Index</th>
                  <th>Total Responses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherPerformance.map((t, idx) => (
                  <tr 
                    key={t.code} 
                    className={selectedTeacher?.code === t.code ? 'selected' : ''}
                    onClick={() => setSelectedTeacher(t)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="rank-col">#{idx + 1}</td>
                    <td className="teacher-col">
                      <div className="t-cell-info">
                        <strong>{t.name}</strong>
                        <span>{t.code}</span>
                      </div>
                    </td>
                    <td className="index-col">
                      <div className="index-bar-group">
                        <div className="index-val">{t.averageRating.toFixed(1)}</div>
                        <div className="index-track">
                          <div className="index-fill" style={{ width: `${(t.averageRating / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="responses-col">{t.totalResponses}</td>
                    <td className="action-col">
                      <ChevronRight size={18} className="row-chevron" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detail Modal/Panel - Overlay Style */}
        {selectedTeacher && (
          <div className="detail-overlay" onClick={() => setSelectedTeacher(null)}>
            <div className="detail-modal animate-slide-up" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedTeacher(null)}>×</button>
              <div className="modal-inner">
                <div className="t-detail-header">
                  <div className="t-detail-avatar">
                   {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="t-detail-id">
                    <h2>{selectedTeacher.name}</h2>
                    <p>{selectedTeacher.title} • {selectedTeacher.code}</p>
                  </div>
                  <div className="t-detail-score">
                    <span className="v">{selectedTeacher.averageRating.toFixed(1)}</span>
                    <span className="l">Global Score</span>
                  </div>
                </div>

                <div className="t-detail-body">
                   <div className="detail-card-row">
                      <div className="metric-card">
                         <span className="ml">Total Reviews</span>
                         <span className="mv">{selectedTeacher.totalResponses}</span>
                      </div>
                      <div className="metric-card highlight">
                         <span className="ml">Percentile</span>
                         <span className="mv">98th</span>
                      </div>
                   </div>
                   
                   <div className="chart-container">
                      <h4>Performance History</h4>
                      <div className="placeholder-chart">
                         {/* Visual bar showing score */}
                         <div className="main-index-track">
                            <div className="main-index-fill" style={{ width: `${(selectedTeacher.averageRating/5)*100}%` }}></div>
                         </div>
                      </div>
                      <p className="insight-text">
                        Feedback is highly positive regarding punctuality and subject clarity.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HodDashboard;
