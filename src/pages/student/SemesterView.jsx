import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import { subjectsMetadata, teachersInfo } from '../../data/mockData';
import FeedbackFormModal from './FeedbackFormModal';
import './SemesterView.css';

function SemesterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const semester = parseInt(id);
  
  const [subjects, setSubjects] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Load subjects for this semester
    const semSubjects = subjectsMetadata[semester] || [];
    setSubjects(semSubjects);

    // Set up real-time listener for feedbacks from Firestore
    const loadFeedbacks = async () => {
      try {
        const { db, collection, query, where, onSnapshot } = await import('../../firebase');
        const q = query(
          collection(db, 'feedbacks'),
          where('studentId', '==', userId),
          where('semesterId', '==', semester)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fbData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setFeedbacks(fbData);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Firebase not configured or error:", err);
        // Fallback to local storage if firebase fails/not setup
        const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        setFeedbacks(storedFeedbacks.filter(f => f.userId === userId && f.semester === semester));
      }
    };

    const cleanup = loadFeedbacks();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [semester, userId]);

  // Check if a subject has already been submitted by this user for this semester
  const isSubmitted = (subjectId) => {
    return feedbacks.some(f => f.subjectId === subjectId);
  };

  const handleFeedbackSubmit = () => {
    setSelectedSubject(null); // Close modal
  };

  if (!subjects.length) {
    return (
      <div className="semester-view-container">
        <button className="btn btn-outline back-btn" onClick={() => navigate('/student')}>
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <div className="empty-state">
          <h2>No subjects found for Semester {semester}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="semester-view-container">
      <div className="header-actions">
        <button className="btn btn-outline back-btn" onClick={() => navigate('/student')}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1>Semester {semester} Subjects</h1>
      </div>

      <div className="subject-list">
        {subjects.map((sub) => {
          const submitted = isSubmitted(sub.id);
          const teacher = teachersInfo[sub.teacherCode];

          return (
            <div key={sub.id} className="subject-card card">
              <div className="subject-info">
                <h3>{sub.name} <span>({sub.id})</span></h3>
                <p className="teacher-name">{teacher ? teacher.name : 'Unknown Teacher'}</p>
                <p className="teacher-title">{teacher ? teacher.title : ''}</p>
              </div>
              
              <div className="subject-action">
                {submitted ? (
                  <div className="status submitted">
                    <CheckCircle size={18} />
                    <span>Submitted</span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedSubject(sub)}
                  >
                    Provide Feedback
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSubject && (
        <FeedbackFormModal 
          subject={selectedSubject}
          semesterId={semester}
          teacher={teachersInfo[selectedSubject.teacherCode]}
          onClose={() => setSelectedSubject(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}

export default SemesterView;
