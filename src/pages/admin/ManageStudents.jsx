import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Activity, Pencil } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from '../../firebase';
import '../admin/AdminDashboard.css';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFilter, setUpdateFilter] = useState({ session: '', year: '', section: '', targetSem: '' });
  const [form, setForm] = useState({ regNo: '', name: '', section: '', year: '', session: '', currentSemester: '' });

  // Bulk import state
  const [csvText, setCsvText] = useState('');
  const [bulkSection, setBulkSection] = useState('');
  const [bulkYear, setBulkYear] = useState('');
  const [bulkSession, setBulkSession] = useState('');
  const [bulkSemester, setBulkSemester] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.regNo.localeCompare(b.regNo));
      setStudents(data);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!form.regNo.trim() || !form.name.trim()) return;
    
    const studentData = {
      regNo: form.regNo.trim(),
      name: form.name.trim(),
      section: form.section.trim(),
      year: form.year.trim(),
      session: form.session.trim(),
      currentSemester: parseInt(form.currentSemester) || null
    };

    if (editingStudent) {
      await updateDoc(doc(db, 'students', editingStudent.id), studentData);
    } else {
      await addDoc(collection(db, 'students'), studentData);
    }
    
    resetForm();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      regNo: student.regNo,
      name: student.name,
      section: student.section || '',
      year: student.year || '',
      session: student.session || '',
      currentSemester: student.currentSemester?.toString() || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ regNo: '', name: '', section: '', year: '', session: '', currentSemester: '' });
    setEditingStudent(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      await deleteDoc(doc(db, 'students', id));
    }
  };

  const handleGlobalUpdate = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const { session, year, section, targetSem } = updateFilter;
    
    if (!targetSem) {
      setLocalStatus({ type: 'error', message: "Please select a Target Semester." });
      return;
    }

    try {
      setImporting(true);
      setLocalStatus({ type: 'info', message: "Searching for students..." });

      // Find all matching students
      const toUpdate = students.filter(s => {
        let match = true;
        if (session && (s.session || '').toLowerCase().trim() !== session.toLowerCase().trim()) match = false;
        if (year && (s.year || '') !== year) match = false;
        if (section && (s.section || '').toLowerCase().trim() !== section.toLowerCase().trim()) match = false;
        return match;
      });

      if (toUpdate.length === 0) {
        setLocalStatus({ type: 'error', message: "No matching students found." });
        setImporting(false);
        return;
      }

      const confirmMsg = `Found ${toUpdate.length} students. Update all to Semester ${targetSem}?`;
      if (!window.confirm(confirmMsg)) {
        setImporting(false);
        setLocalStatus(null);
        return;
      }

      setLocalStatus({ type: 'info', message: `Updating ${toUpdate.length} students...` });
      
      let updatedCount = 0;
      for (const student of toUpdate) {
        try {
          await updateDoc(doc(db, 'students', student.id), {
            currentSemester: parseInt(targetSem)
          });
          updatedCount++;
        } catch (err) {
          console.error('Update failed:', student.regNo, err);
        }
      }

      setLocalStatus({ type: 'success', message: `Successfully updated ${updatedCount} students!` });
      setTimeout(() => {
        setShowUpdateModal(false);
        setUpdateFilter({ session: '', year: '', section: '', targetSem: '' });
        setLocalStatus(null);
      }, 2000);
    } catch (globalErr) {
      console.error("Global Update Error:", globalErr);
      setLocalStatus({ type: 'error', message: "System error: " + globalErr.message });
    } finally {
      setImporting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!csvText.trim() || !bulkSection.trim() || !bulkYear.trim() || !bulkSession.trim() || !bulkSemester) return;

    const lines = csvText.trim().split('\n').filter(line => line.trim());
    
    // Skip header row if it contains "Register" or "Name" (case-insensitive)
    let dataLines = lines;
    if (lines[0] && /register|name|reg/i.test(lines[0])) {
      dataLines = lines.slice(1);
    }

    const parsed = dataLines.map(line => {
      const parts = line.split(',');
      return {
        regNo: (parts[0] || '').trim(),
        name: (parts[1] || '').trim()
      };
    }).filter(s => s.regNo && s.name);

    if (parsed.length === 0) {
      setImportResult({ type: 'error', message: 'No valid data found. Use format: RegisterNumber,Name' });
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: parsed.length });
    setImportResult(null);

    let added = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const batch = parsed.slice(i, i + BATCH_SIZE);
      const promises = batch.map(student =>
        addDoc(collection(db, 'students'), {
          regNo: student.regNo,
          name: student.name,
          section: bulkSection.trim(),
          year: bulkYear.trim(),
          session: bulkSession.trim(),
          currentSemester: parseInt(bulkSemester)
        }).then(() => {
          added++;
          setImportProgress({ done: added, total: parsed.length });
        }).catch(err => console.error('Failed to add:', student.regNo, err))
      );
      await Promise.all(promises);
    }

    setImporting(false);
    setImportResult({ type: 'success', message: `Successfully imported ${added} students into ${bulkSection} (${bulkYear}, Sem ${bulkSemester})` });
  };

  const closeBulkModal = () => {
    if (importing) return; // Don't close while importing
    setShowBulkModal(false);
    setCsvText('');
    setBulkSection('');
    setBulkYear('');
    setBulkSession('');
    setBulkSemester('');
    setImportResult(null);
    setImportProgress({ done: 0, total: 0 });
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    (s.session && s.session.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Manage Students</h1>
        <p>View and manage registered students and their semester assignments.</p>
      </header>

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Search by name, reg number, or session..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn secondary" onClick={() => setShowUpdateModal(true)}>
            <Activity size={18} />
            Update Class Sem
          </button>
          <button className="admin-btn secondary" onClick={() => setShowBulkModal(true)}>
            <Upload size={18} />
            Bulk Import
          </button>
          <button className="admin-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Register No</th>
              <th>Name</th>
              <th>Section</th>
              <th>Session</th>
              <th>Year</th>
              <th>Sem</th>
              <th>Actions</th>
            </tr>
</thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found. Add your first student!</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.regNo}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.section || '—'}</td>
                  <td>{s.session || '—'}</td>
                  <td>{s.year || '—'}</td>
                  <td><span className="badge">{s.currentSemester || '—'}</span></td>
                  <td className="actions">
                    <button className="admin-btn secondary sm" onClick={() => handleEdit(s)}>
                      <Pencil size={14} />
                    </button>
                    <button className="admin-btn danger sm" onClick={() => handleDelete(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Single Student Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={resetForm}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingStudent ? 'Modify Student' : 'Add New Student'}</h3>
            <div className="admin-modal-form">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Register Number</label>
                  <input
                    type="text"
                    placeholder="e.g., 8204..."
                    maxLength={12}
                    value={form.regNo}
                    onChange={e => setForm({ ...form, regNo: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Session (Batch)</label>
                  <input
                    type="text"
                    placeholder="e.g., 2023-2027"
                    value={form.session}
                    onChange={e => setForm({ ...form, session: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Prakash V"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Year</label>
                  <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Current Semester</label>
                  <select value={form.currentSemester} onChange={e => setForm({ ...form, currentSemester: e.target.value })}>
                    <option value="">Select Sem</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Section</label>
                <input
                  type="text"
                  placeholder="e.g., IT-1"
                  value={form.section}
                  onChange={e => setForm({ ...form, section: e.target.value })}
                />
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={resetForm}>Cancel</button>
                <button className="admin-btn" onClick={handleSave}>
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="admin-modal-overlay" onClick={closeBulkModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3>Bulk Import Students</h3>

            {importResult && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: importResult.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: importResult.type === 'success' ? 'var(--primary)' : '#ef4444',
                borderRadius: '10px', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem'
              }}>
                {importResult.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {importResult.message}
              </div>
            )}

            <div className="admin-modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-field">
                  <label>Session (Batch)</label>
                  <input
                    type="text"
                    placeholder="e.g., 2023-2027"
                    value={bulkSession}
                    onChange={e => setBulkSession(e.target.value)}
                    disabled={importing}
                  />
                </div>
                <div className="admin-field">
                  <label>Assign to Semester</label>
                  <select value={bulkSemester} onChange={e => setBulkSemester(e.target.value)} disabled={importing}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Section</label>
                  <input
                    type="text"
                    placeholder="e.g., IT-2"
                    value={bulkSection}
                    onChange={e => setBulkSection(e.target.value)}
                    disabled={importing}
                  />
                </div>
                <div className="admin-field">
                  <label>Year</label>
                  <select value={bulkYear} onChange={e => setBulkYear(e.target.value)} disabled={importing}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label>Paste CSV Data (RegisterNumber, Name)</label>
                <textarea
                  placeholder={`Paste your CSV data here. Example:\n\nRegister Number,Name\n820423205001,ABINASH M\n820423205002,ABISHEK S\n820423205003,ADITHYAN M`}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  disabled={importing}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Header row is auto-detected and skipped. Each row: RegisterNumber,Name
                </span>
              </div>

              {importing && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      Importing...
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                      {importProgress.done} / {importProgress.total}
                    </span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '100px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(importProgress.done / importProgress.total) * 100}%`,
                      height: '100%',
                      background: 'var(--primary)',
                      borderRadius: '100px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={closeBulkModal} disabled={importing}>
                  {importResult?.type === 'success' ? 'Close' : 'Cancel'}
                </button>
                {!importResult?.type && (
                  <button className="admin-btn" onClick={handleBulkImport} disabled={importing || !csvText.trim()}>
                    {importing ? <><Loader2 size={18} className="animate-spin" /> Importing...</> : <><Upload size={18} /> Import All</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Global Semester Update Modal */}
      {showUpdateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>Global Semester Update</h3>
            
            {localStatus && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: localStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : localStatus.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                color: localStatus.type === 'success' ? '#10b981' : localStatus.type === 'error' ? '#ef4444' : '#3b82f6',
                borderRadius: '10px', marginBottom: '1rem', fontWeight: '600', fontSize: '0.9rem'
              }}>
                {localStatus.type === 'success' ? <CheckCircle size={18} /> : localStatus.type === 'error' ? <AlertCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
                {localStatus.message}
              </div>
            )}

            <p className="description-text" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Bulk update the current semester for a specific group of students (e.g., promote all 3rd Year students to Sem 6). Leave filters blank to match more students.
            </p>
            
            <div className="admin-modal-form">
              <div className="admin-field">
                <label>Filter by Session (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 2023-2027"
                  value={updateFilter.session}
                  onChange={e => setUpdateFilter({ ...updateFilter, session: e.target.value })}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Filter by Year</label>
                  <select value={updateFilter.year} onChange={e => setUpdateFilter({ ...updateFilter, year: e.target.value })}>
                    <option value="">Any Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Filter by Section</label>
                  <input
                    type="text"
                    placeholder="e.g., IT-1"
                    value={updateFilter.section}
                    onChange={e => setUpdateFilter({ ...updateFilter, section: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-field" style={{ background: 'rgba(16,185,129,0.05)', padding: '1rem', borderRadius: '10px', marginTop: '0.5rem' }}>
                <label style={{ color: 'var(--primary)', fontWeight: '700' }}>Target Semester (Assign To)</label>
                <select 
                  style={{ borderColor: 'var(--primary)', background: 'white' }}
                  value={updateFilter.targetSem} 
                  onChange={e => setUpdateFilter({ ...updateFilter, targetSem: e.target.value })}
                >
                  <option value="">Select Target Sem</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button 
                  className="admin-btn" 
                  onClick={(e) => handleGlobalUpdate(e)} 
                  disabled={!updateFilter.targetSem || importing}
                  style={{ background: 'var(--primary-gradient)' }}
                >
                  {importing ? 'Updating...' : 'Update All Matching'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
