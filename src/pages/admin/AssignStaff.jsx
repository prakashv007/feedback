import { useState, useEffect } from 'react';
import { Link2, Save, CheckCircle, Plus, Pencil, Trash2, Loader2, Database } from 'lucide-react';
import { db, collection, onSnapshot, doc, setDoc, getDocs, addDoc, updateDoc, deleteDoc } from '../../firebase';
import { subjectsMetadata } from '../../data/mockData';
import '../admin/AdminDashboard.css';

function AssignStaff() {
  const [selectedSem, setSelectedSem] = useState(1);
  const [staffList, setStaffList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [savedMsg, setSavedMsg] = useState('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ id: '', name: '' });
  const [migrating, setMigrating] = useState(false);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    // Load staff from Firestore
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.code.localeCompare(b.code));
      setStaffList(data);
    });

    // Load subjects from Firestore
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      const data = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      setSubjects(data);
    });

    // Load assignments from Firestore
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snap) => {
      const data = {};
      snap.docs.forEach(d => {
        data[d.id] = d.data();
      });
      setAssignments(data);
    });

    return () => {
      unsubStaff();
      unsubSubjects();
      unsubAssignments();
    };
  }, []);

  const currentSubjects = subjects.filter(s => s.semester === selectedSem);

  const handleMigrate = async () => {
    if (!window.confirm('This will copy all hardcoded subjects to Firestore. Continue?')) return;
    setMigrating(true);
    try {
      const existing = await getDocs(collection(db, 'subjects'));
      if (!existing.empty) {
        if (!window.confirm('Subjects already exist in Firestore. This might create duplicates. Continue anyway?')) {
          setMigrating(false);
          return;
        }
      }

      for (const sem in subjectsMetadata) {
        for (const sub of subjectsMetadata[sem]) {
          await addDoc(collection(db, 'subjects'), {
            id: sub.id,
            name: sub.name,
            semester: parseInt(sem)
          });
        }
      }
      alert('Migration complete!');
    } catch (err) {
      console.error('Migration failed:', err);
    }
    setMigrating(false);
  };

  const getAssignedStaff = (subjectId) => {
    const key = `sem${selectedSem}_${subjectId}`;
    return assignments[key]?.staffCode || '';
  };

  const handleAssign = async (subjectId, staffCode) => {
    const key = `sem${selectedSem}_${subjectId}`;
    const subject = currentSubjects.find(s => s.id === subjectId);
    
    const staff = staffList.find(s => s.code === staffCode);
    
    const assignmentData = {
      semester: selectedSem,
      subjectId,
      subjectName: subject?.name || '',
      staffCode,
      staffName: staff?.name || '',
      staffTitle: staff?.title || '',
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'assignments', key), assignmentData);
    setSavedMsg(`Assigned ${assignmentData.staffName} to ${subject?.name}`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.id.trim() || !subjectForm.name.trim()) return;

    if (editingSubject) {
      await updateDoc(doc(db, 'subjects', editingSubject.docId), {
        id: subjectForm.id.trim(),
        name: subjectForm.name.trim()
      });
    } else {
      await addDoc(collection(db, 'subjects'), {
        id: subjectForm.id.trim(),
        name: subjectForm.name.trim(),
        semester: selectedSem
      });
    }
    setShowSubjectModal(false);
  };

  const handleDeleteSubject = async (sub) => {
    if (window.confirm(`Are you sure you want to delete ${sub.name}?`)) {
      await deleteDoc(doc(db, 'subjects', sub.docId));
    }
  };

  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ id: '', name: '' });
    setShowSubjectModal(true);
  };

  const openEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({ id: sub.id, name: sub.name });
    setShowSubjectModal(true);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Manage Subjects & Staff</h1>
            <p>Select a semester to manage subjects and assign staff.</p>
          </div>
          {subjects.length === 0 && (
            <button className="admin-btn secondary" onClick={handleMigrate} disabled={migrating}>
              {migrating ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
              Migrate Initial Data
            </button>
          )}
        </div>
      </header>

      {savedMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem', background: 'rgba(16, 185, 129, 0.1)', 
          color: 'var(--primary)', borderRadius: '12px', marginBottom: '1.5rem',
          fontWeight: '600', fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          {savedMsg}
        </div>
      )}

      <div className="admin-toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="assign-semester-tabs" style={{ marginBottom: 0 }}>
          {semesters.map(sem => (
            <button
              key={sem}
              className={`sem-tab ${selectedSem === sem ? 'active' : ''}`}
              onClick={() => setSelectedSem(sem)}
            >
              Sem {sem}
            </button>
          ))}
        </div>
        <button className="admin-btn" onClick={openAddSubject}>
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {currentSubjects.length === 0 ? (
        <div className="empty-state">
          <h3>No subjects found</h3>
          <p>No subjects are configured for Semester {selectedSem}. Click "Add Subject" to create one.</p>
        </div>
      ) : (
        <div className="assign-grid">
          {currentSubjects.map(subject => (
            <div key={subject.docId} className="assign-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="assign-subject-info">
                    <h4>{subject.name}</h4>
                    <p>Code: {subject.id}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn secondary sm" onClick={() => openEditSubject(subject)}>
                      <Pencil size={12} />
                    </button>
                    <button className="admin-btn danger sm" onClick={() => handleDeleteSubject(subject)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    ASSIGNED STAFF
                  </label>
                  <select
                    className="assign-select"
                    style={{ width: '100%' }}
                    value={getAssignedStaff(subject.id)}
                    onChange={e => handleAssign(subject.id, e.target.value)}
                  >
                    <option value="">— Select Staff —</option>
                    {staffList.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
            <div className="admin-modal-form">
              <div className="admin-field">
                <label>Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g., CS3591"
                  value={subjectForm.id}
                  onChange={e => setSubjectForm({ ...subjectForm, id: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="admin-field">
                <label>Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Networks"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                />
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button className="admin-btn" onClick={handleSaveSubject}>
                  {editingSubject ? 'Update' : 'Add Subject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignStaff;

