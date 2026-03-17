import { useState, useEffect } from 'react';
import { BarChart3, ChevronLeft } from 'lucide-react';
import { subjectsMetadata } from '../../data/mockData';
import './Reports.css';

function Reports() {
  const [feedbacks, setFeedbacks] = useState([]);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

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

    loadFeedbacks();
  }, []);

  // Calculate Average Rating per Semester
  const semesterStats = semesters.map(sem => {
    const semFeedbacks = feedbacks.filter(f => f.semester === sem);
    const avg = semFeedbacks.length > 0
      ? (semFeedbacks.reduce((sum, f) => sum + f.averageRating, 0) / semFeedbacks.length).toFixed(2)
      : 0;
    
    return {
      semester: sem,
      average: parseFloat(avg),
      count: semFeedbacks.length
    };
  });

  const maxAvg = Math.max(...semesterStats.map(s => s.average), 1);

  return (
    <div className="reports-container">
      <header className="dashboard-header" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Department Reports</h1>
        <p className="subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Semester-wise average performance ratings.</p>
      </header>

      <div className="reports-content card">
        <div className="chart-header">
          <h3><BarChart3 size={20} /> Semester-wise Average Ratings</h3>
        </div>

        <div className="bar-chart-container">
          <div className="y-axis">
            <span>5.0</span>
            <span>4.0</span>
            <span>3.0</span>
            <span>2.0</span>
            <span>1.0</span>
            <span>0</span>
          </div>
          
          <div className="bars-area">
            {semesterStats.map(stat => (
              <div key={stat.semester} className="bar-column">
                <div className="bar-group">
                  <div className="bar-tooltip">
                    {stat.average} ({stat.count} resp)
                  </div>
                  <div 
                    className="bar-rect" 
                    style={{ height: `${(stat.average / 5) * 100}%` }}
                  >
                    {stat.average > 0 && <span className="bar-val">{stat.average}</span>}
                  </div>
                </div>
                <div className="bar-label">Sem {stat.semester}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="repo-legend">
          <p>* Ratings are calculated from all student feedback submitted in the current academic year.</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
