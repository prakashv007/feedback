import { useState, useEffect } from 'react';
import { defaultQuestions, subjectsMetadata, teachersInfo } from '../../data/mockData';
import { Plus, X, BarChart2 } from 'lucide-react';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const teacherCode = localStorage.getItem('userId');
  const teacher = teachersInfo[teacherCode] || { name: 'Unknown Teacher' };
  
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [customQuestions, setCustomQuestions] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  
  // UI State
  const [activeSubject, setActiveSubject] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    // 1. Find assigned subjects across all semesters
    const subjects = [];
    Object.values(subjectsMetadata).forEach(semSubjects => {
      semSubjects.forEach(sub => {
        if (sub.teacherCode === teacherCode) {
          subjects.push(sub);
        }
      });
    });
    setAssignedSubjects(subjects);

    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0].id);
    }

    // 2. Real-time Firebase listeners
    const setupListeners = async () => {
      try {
        const { db, collection, query, where, onSnapshot } = await import('../../firebase');
        
        // Listen for all feedbacks related to this teacher's subjects
        const feedbackQuery = query(
          collection(db, 'feedbacks'),
          where('subjectId', 'in', subjects.map(s => s.id))
        );

        const unsubFeedbacks = onSnapshot(feedbackQuery, (snapshot) => {
          const fbData = snapshot.docs.map(doc => doc.data());
          setFeedbacks(fbData);
        });

        // Listen for custom questions
        const questionsQuery = query(
          collection(db, 'customQuestions'),
          where('teacherCode', '==', teacherCode)
        );

        const unsubQuestions = onSnapshot(questionsQuery, (snapshot) => {
          const qsData = {};
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            qsData[data.subjectId] = data.questions;
          });
          setCustomQuestions(qsData);
        });

        return () => {
          unsubFeedbacks();
          unsubQuestions();
        };
      } catch (err) {
        console.error("Firestore Listeners failed:", err);
        // Fallback to local storage
        const savedCustomQs = JSON.parse(localStorage.getItem('customQuestions') || '{}');
        setCustomQuestions(savedCustomQs);
        const savedFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        setFeedbacks(savedFeedbacks.filter(f => subjects.some(s => s.id === f.subjectId)));
      }
    };

    if (subjects.length > 0) {
      const cleanup = setupListeners();
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [teacherCode, activeSubject]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !activeSubject) return;

    try {
      const { db, collection, query, where, getDocs, updateDoc, addDoc, doc } = await import('../../firebase');
      const currentQs = customQuestions[activeSubject] || [];
      const updatedQs = [...currentQs, newQuestion.trim()];

      // Find if doc exists for this subject/teacher
      const q = query(
        collection(db, 'customQuestions'),
        where('teacherCode', '==', teacherCode),
        where('subjectId', '==', activeSubject)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // Update existing
        await updateDoc(doc(db, 'customQuestions', snapshot.docs[0].id), {
          questions: updatedQs
        });
      } else {
        // Create new
        await addDoc(collection(db, 'customQuestions'), {
          teacherCode,
          subjectId: activeSubject,
          questions: updatedQs
        });
      }

      setNewQuestion('');
    } catch (err) {
      console.error("Error adding question:", err);
      // Fallback update
      const currentQs = customQuestions[activeSubject] || [];
      setCustomQuestions({ ...customQuestions, [activeSubject]: [...currentQs, newQuestion] });
    }
  };

  const handleRemoveQuestion = async (index) => {
    const currentQs = customQuestions[activeSubject] || [];
    const updatedQs = currentQs.filter((_, i) => i !== index);

    try {
      const { db, collection, query, where, getDocs, updateDoc, doc } = await import('../../firebase');
      const q = query(
        collection(db, 'customQuestions'),
        where('teacherCode', '==', teacherCode),
        where('subjectId', '==', activeSubject)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await updateDoc(doc(db, 'customQuestions', snapshot.docs[0].id), {
          questions: updatedQs
        });
      }
    } catch (err) {
      console.error("Error removing question:", err);
    }
  };

  // Calculate stats for active subject
  const subjectFeedbacks = feedbacks.filter(f => f.subjectId === activeSubject);
  const totalResponses = subjectFeedbacks.length;
  
  const averageRating = totalResponses > 0 
    ? (subjectFeedbacks.reduce((sum, f) => sum + f.averageRating, 0) / totalResponses).toFixed(1)
    : 0;

  // Question-wise averages for active subject
  const getQuestionAverage = (qIndex) => {
    if (totalResponses === 0) return 0;
    const sum = subjectFeedbacks.reduce((acc, f) => acc + (f.ratings[qIndex] || 0), 0);
    return (sum / totalResponses).toFixed(1);
  };

  const activeSubjectData = assignedSubjects.find(s => s.id === activeSubject);
  const activeSubjectCustomQs = customQuestions[activeSubject] || [];
  const allQuestions = [...defaultQuestions, ...activeSubjectCustomQs];

  return (
    <div className="teacher-dashboard animate-fade-in">
      <header className="dashboard-header">
        <div className="header-content">
          <span className="welcome-badge">Teacher Dashboard</span>
          <h1>Welcome, {teacher.name}</h1>
          <p className="subtitle">Manage your subjects and view feedback analytics in real-time.</p>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar for Subjects */}
        <div className="subjects-panel card">
          <h3>Your Subjects</h3>
          <div className="subject-list-nav">
            {assignedSubjects.length === 0 ? (
              <p className="empty-text">No subjects assigned.</p>
            ) : (
              assignedSubjects.map(sub => (
                <button
                  key={sub.id}
                  className={`subject-nav-btn ${activeSubject === sub.id ? 'active' : ''}`}
                  onClick={() => setActiveSubject(sub.id)}
                >
                  <span className="sub-name">{sub.name}</span>
                  <span className="sub-id">{sub.id}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-panel">
          {activeSubjectData ? (
            <div className="content-grid">
              
              {/* Analytics Card */}
              <div className="analytics-card card">
                <div className="card-header">
                  <h3><BarChart2 size={20} /> Feedback Summary</h3>
                  <span className="badge">{totalResponses} Responses</span>
                </div>
                
                <div className="overall-score">
                  <div className="progress-ring-wrapper">
                    <svg viewBox="0 0 36 36" className="circular-chart emerald">
                      <path className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray={`${(averageRating / 5) * 100}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">{averageRating}</text>
                    </svg>
                  </div>
                  <div className="score-details">
                    <span className="score-subtitle">Average Rating</span>
                    <div className="score-value">
                      <strong>{averageRating}</strong>
                      <span>/ 5.0</span>
                    </div>
                    <p className="score-description">Based on {totalResponses} student responses</p>
                  </div>
                </div>

                {totalResponses > 0 && (
                  <div className="question-breakdown">
                    <h4>Category Breakdown (Default Questions)</h4>
                    {defaultQuestions.map((q, idx) => (
                      <div key={idx} className="breakdown-item">
                        <div className="b-header">
                          <span className="b-label" title={q}>Q{idx + 1}. {q.substring(0, 30)}...</span>
                          <span className="b-score">{getQuestionAverage(idx)} / 5</span>
                        </div>
                        <div className="b-progress-bar">
                          <div 
                            className="b-progress-fill" 
                            style={{ width: `${(getQuestionAverage(idx) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Questions Card */}
              <div className="questions-card card">
                <div className="card-header">
                  <h3>Custom Questions</h3>
                </div>
                <p className="description-text">
                  Add specific questions for <b>{activeSubjectData.name}</b>. Students will answer these along with the default 7 questions.
                </p>

                <form onSubmit={handleAddQuestion} className="add-q-form">
                  <input
                    type="text"
                    placeholder="Enter your custom question here..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} /> Add
                  </button>
                </form>

                <div className="q-list">
                  {activeSubjectCustomQs.length === 0 ? (
                    <p className="empty-text">No custom questions added yet.</p>
                  ) : (
                    activeSubjectCustomQs.map((q, idx) => (
                      <div key={idx} className="q-item">
                        <span className="q-text">{idx + 1}. {q}</span>
                        <button 
                          className="remove-btn" 
                          onClick={() => handleRemoveQuestion(idx)}
                          title="Remove Question"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="empty-state card">
              <h2>Select a subject to view details</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
