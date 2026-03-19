import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import { db, collection, query, where, onSnapshot, doc } from '../../firebase';
import FeedbackFormModal from './FeedbackFormModal';
import './SemesterView.css';

function SemesterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const semester = parseInt(id);
  
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // 1. Fetch subjects for this semester
    const qSubjects = query(collection(db, 'subjects'), where('semester', '==', semester));
    const unsubSubjects = onSnapshot(qSubjects, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      data.sort((a, b) => a.id.localeCompare(b.id)); // Sort by subject code
      setSubjects(data);
    });

    // 2. Fetch assignments for this semester (to get teacher info)
    const qAssignments = query(collection(db, 'assignments'), where('semester', '==', semester));
    const unsubAssignments = onSnapshot(qAssignments, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(data);
    });

    // 3. Fetch all staff to join latest info
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const data = snapshot.docs.reduce((acc, doc) => {
        const d = doc.data();
        acc[d.code] = d;
        return acc;
      }, {});
      setStaffList(data);
    });

    // 4. Fetch active session ID
    const unsubSettings = onSnapshot(doc(db, 'settings', 'current'), (snap) => {
      if (snap.exists()) {
        setActiveSessionId(snap.data().id);
      }
    });

    return () => {
      unsubSubjects();
      unsubAssignments();
      unsubStaff();
      unsubSettings();
    };
  }, [semester, userId]);

  // Separate effect for feedbacks to depend on activeSessionId
  useEffect(() => {
    if (!activeSessionId) return;

    const qFeedbacks = query(
      collection(db, 'feedbacks'),
      where('studentId', '==', userId),
      where('semesterId', '==', semester),
      where('sessionId', '==', activeSessionId)
    );

    const unsubFeedbacks = onSnapshot(qFeedbacks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(data);
    });

    return () => unsubFeedbacks();
  }, [semester, userId, activeSessionId]);

  // Check if a subject has already been submitted by this user
  const isSubmitted = (subjectId) => {
    return feedbacks.some(f => f.subjectId === subjectId);
  };

  const getSubjectAssignment = (subjectId) => {
    return assignments.find(a => a.subjectId === subjectId);
  };

  const handleFeedbackSubmit = () => {
    setSelectedSubject(null); 
  };

  const subjectsWithStaff = subjects.map(sub => {
    const assign = getSubjectAssignment(sub.id);
    const latestStaff = assign ? staffList[assign.staffCode] : null;
    
    return {
      ...sub,
      assignment: assign ? {
        ...assign,
        staffName: latestStaff?.name || assign.staffName,
        staffTitle: latestStaff?.title || assign.staffTitle
      } : null
    };
  });

  return (
    <div className="semester-view-container">
      <div className="header-actions">
        <button className="btn btn-outline back-btn" onClick={() => navigate('/student')}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1>Semester {semester} Subjects</h1>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <h2>No subjects found for Semester {semester}</h2>
          <p>Please contact the administrator or check back later.</p>
        </div>
      ) : (
        <div className="subject-list">
          {subjectsWithStaff.map((sub) => {
            const submitted = isSubmitted(sub.id);
            const teacher = sub.assignment;

            return (
              <div key={sub.docId} className="subject-card card">
                <div className="subject-info">
                  <h3>{sub.name} <span>({sub.id})</span></h3>
                  <p className="teacher-name">{teacher ? teacher.staffName : 'Faculty Not Assigned'}</p>
                  <p className="teacher-title">{teacher ? teacher.staffTitle : ''}</p>
                </div>
                
                <div className="subject-action">
                  {submitted ? (
                    <div className="status submitted">
                      <CheckCircle size={18} />
                      <span>Submitted</span>
                    </div>
                  ) : (
                    <button 
                      className={`btn ${teacher ? 'btn-primary' : 'btn-outline disabled'}`}
                      disabled={!teacher}
                      onClick={() => setSelectedSubject(sub)}
                    >
                      {teacher ? 'Provide Feedback' : 'Awaiting Faculty'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSubject && (
        <FeedbackFormModal 
          subject={selectedSubject}
          semesterId={semester}
          activeSessionId={activeSessionId}
          teacher={{
            code: getSubjectAssignment(selectedSubject.id)?.staffCode,
            name: getSubjectAssignment(selectedSubject.id)?.staffName,
            title: getSubjectAssignment(selectedSubject.id)?.staffTitle
          }}
          onClose={() => setSelectedSubject(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}

export default SemesterView;
