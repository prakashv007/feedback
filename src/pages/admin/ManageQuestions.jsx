import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Pencil, Trash2, CheckCircle, AlertCircle, Loader2, GripVertical } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs, query, orderBy } from '../../firebase';
import { defaultQuestions } from '../../data/mockData';
import './ManageQuestions.css';

function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({ text: '', order: 0, subjectId: 'global' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if questions collection is empty, if so, seed with defaultQuestions
    const checkAndSeed = async () => {
      const qSnap = await getDocs(collection(db, 'questions'));
      if (qSnap.empty) {
        console.log("Seeding default questions...");
        for (let i = 0; i < defaultQuestions.length; i++) {
          await addDoc(collection(db, 'questions'), {
            text: defaultQuestions[i],
            order: i,
            subjectId: 'global',
            createdAt: new Date().toISOString()
          });
        }
      }
    };

    checkAndSeed();

    // 2. Load subjects from Firestore for the dropdown
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      const data = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      data.sort((a, b) => (a.semester - b.semester) || a.name.localeCompare(b.name));
      setSubjects(data);
    });

    // 3. Subscribe to questions
    const q = query(collection(db, 'questions'), orderBy('order', 'asc'));
    const unsubQuestions = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuestions(data);
      setLoading(false);
    });

    return () => {
      unsubSubjects();
      unsubQuestions();
    };
  }, []);

  const openAdd = () => {
    setEditingQuestion(null);
    setForm({ text: '', order: questions.length, subjectId: 'global' });
    setShowModal(true);
  };

  const openEdit = (question) => {
    setEditingQuestion(question);
    setForm({ 
      text: question.text, 
      order: question.order, 
      subjectId: question.subjectId || 'global' 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) return;

    let subjectName = null;
    if (form.subjectId !== 'global') {
      const sub = subjects.find(s => s.id === form.subjectId);
      subjectName = sub ? sub.name : null;
    }

    const questionData = {
      text: form.text.trim(),
      order: form.order,
      subjectId: form.subjectId,
      subjectName: subjectName,
      updatedAt: new Date().toISOString()
    };

    if (editingQuestion) {
      await updateDoc(doc(db, 'questions', editingQuestion.id), questionData);
    } else {
      await addDoc(collection(db, 'questions'), {
        ...questionData,
        createdAt: new Date().toISOString()
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question? This will affect all future feedback submissions.')) {
      await deleteDoc(doc(db, 'questions', id));
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Manage Questions</h1>
        <p>Define the questions students answer during feedback sessions.</p>
      </header>

      <div className="admin-toolbar">
        <div className="stats-badge">
          <HelpCircle size={16} />
          <span>{questions.length} Total Questions</span>
        </div>
        <button className="admin-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Question
        </button>
      </div>

      <div className="questions-grid">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" />
            <p>Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state-card">
            <HelpCircle size={48} />
            <h3>No Questions Setup</h3>
            <p>Add your first feedback question to get started.</p>
            <button className="admin-btn" onClick={openAdd}>Add Question</button>
          </div>
        ) : (
          <div className="question-items-list">
            {questions.map((q, idx) => (
              <div key={q.id} className="question-admin-card shadow-sm">
                <div className="q-number">#{idx + 1}</div>
                <div className="q-content">
                  <div className="q-scope-badge" data-scope={q.subjectId === 'global' ? 'global' : 'subject'}>
                    {q.subjectId === 'global' ? 'Global' : `Subject: ${q.subjectName || q.subjectId}`}
                  </div>
                  <p className="q-text">{q.text}</p>
                </div>
                <div className="q-actions">
                  <button className="admin-btn-icon" onClick={() => openEdit(q)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="admin-btn-icon danger" onClick={() => handleDelete(q.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
            <div className="admin-modal-form">
              <div className="admin-field">
                <label>Question Scope</label>
                <select 
                  className="admin-select"
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  <option value="global">Global (Applies to all subjects)</option>
                  <optgroup label="Specific Subjects">
                    {subjects.map(s => (
                      <option key={s.docId} value={s.id}>
                        Sem {s.semester} — {s.name} ({s.id})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="admin-field">
                <label>Question Text</label>
                <textarea
                  placeholder="e.g., How clearly does the teacher explain concepts?"
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="admin-field">
                <label>Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn" onClick={handleSave}>
                  {editingQuestion ? 'Update' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageQuestions;
