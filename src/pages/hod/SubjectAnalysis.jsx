import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, doc } from '../../firebase';
import { GraduationCap, UserCircle } from 'lucide-react';
import './HodTabs.css';

function SubjectAnalysis() {
  const [selectedSem, setSelectedSem] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    // Listen for feedbacks
    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
      const fbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(fbData);
    });

    // Listen for subjects
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snapshot) => {
      const subData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(subData);
    });

    // Listen for assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      const assignData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(assignData);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'current'), (snap) => {
      if (snap.exists()) {
        setActiveSessionId(snap.data().id);
      }
    });

    return () => {
      unsubFeedbacks();
      unsubSubjects();
      unsubAssignments();
      unsubSettings();
    };
  }, []);

  const getAnalysisData = () => {
    const semSubjects = subjects.filter(s => s.semester === selectedSem);
    
    return semSubjects.map(sub => {
      // Find assignment for this subject in this semester
      const assignment = assignments.find(a => a.subjectId === sub.id && a.semester === selectedSem);
      
      // Calculate average rating for this subject in current semester (ONLY THIS SESSION)
      const subFeedbacks = feedbacks.filter(f => 
        f.subjectId === sub.id && 
        f.semesterId === selectedSem &&
        (!activeSessionId || f.sessionId === activeSessionId)
      );
      const totalRatings = subFeedbacks.length;
      const averageRating = totalRatings > 0 
        ? (subFeedbacks.reduce((sum, f) => sum + f.averageRating, 0) / totalRatings)
        : 0;

      // Determine performance level
      let performanceClass = '';
      if (averageRating >= 4.5) performanceClass = 'excellent';
      else if (averageRating >= 4.0) performanceClass = 'good';
      else if (averageRating >= 3.0) performanceClass = 'average';
      else if (averageRating > 0) performanceClass = 'poor';

      return {
        ...sub,
        teacherName: assignment?.staffName || 'No Faculty Assigned',
        teacherTitle: assignment?.staffTitle || '',
        averageRating: averageRating.toFixed(2),
        totalResponses: totalRatings,
        performanceClass
      };
    }).sort((a, b) => b.averageRating - a.averageRating);
  };

  const analysisData = getAnalysisData();

  return (
    <div className="hod-tabs-container">
      <header className="tabs-header">
        <h1>Subject-wise Analysis</h1>
        <p className="subtitle">Detailed performance insights for individual subjects.</p>
      </header>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Target Semester</label>
          <select 
            className="filter-select"
            value={selectedSem}
            onChange={(e) => setSelectedSem(parseInt(e.target.value))}
          >
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      {analysisData.length === 0 ? (
        <div className="empty-state">
           <h3>No subjects configured for Semester {selectedSem}</h3>
           <p>Contact Administration to assign subjects for this semester.</p>
        </div>
      ) : (
        <div className="analysis-grid">
          {analysisData.map(subject => (
            <div key={subject.id} className={`subject-analysis-card animate-fade-in ${subject.performanceClass}`}>
              <div className="sub-header">
                <span className="code">{subject.id}</span>
                <h3>{subject.name}</h3>
              </div>

              <div className="sub-meta">
                <div className="teacher-info">
                  <div className="teacher-icon">
                    <UserCircle size={22} />
                  </div>
                  <div className="teacher-details">
                    <span className="name">{subject.teacherName}</span>
                    <span className="title">{subject.teacherTitle}</span>
                  </div>
                </div>

                <div className="rating-display">
                  <span className="rating-val">{subject.averageRating}</span>
                  <span className="rating-max">/ 5.0</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                  ({subject.totalResponses} submissions)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubjectAnalysis;
