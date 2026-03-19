import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs } from '../../firebase';
import '../admin/AdminDashboard.css';

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', title: '' });

  // Bulk import state
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.code.localeCompare(b.code));
      setStaffList(data);
    });
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditingStaff(null);
    setForm({ code: '', name: '', title: '' });
    setShowModal(true);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);
    setForm({ code: staff.code, name: staff.name, title: staff.title });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;

    if (editingStaff) {
      const staffCode = form.code.trim();
      const staffName = form.name.trim();
      const staffTitle = form.title.trim();

      await updateDoc(doc(db, 'staff', editingStaff.id), {
        code: staffCode,
        name: staffName,
        title: staffTitle
      });

      // Propagate changes to assignments
      try {
        const q = query(collection(db, 'assignments'), where('staffCode', '==', staffCode));
        const snap = await getDocs(q);
        const promises = snap.docs.map(d => 
          updateDoc(doc(db, 'assignments', d.id), {
            staffName: staffName,
            staffTitle: staffTitle
          })
        );
        await Promise.all(promises);
      } catch (err) {
        console.error('Failed to propagate staff changes:', err);
      }
    } else {
      await addDoc(collection(db, 'staff'), {
        code: form.code.trim(),
        name: form.name.trim(),
        title: form.title.trim()
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      await deleteDoc(doc(db, 'staff', id));
    }
  };

  const handleBulkImport = async () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n').filter(line => line.trim());
    
    // Skip header row if it contains "Code" or "Name"
    let dataLines = lines;
    if (lines[0] && /code|name/i.test(lines[0])) {
      dataLines = lines.slice(1);
    }

    const parsed = dataLines.map(line => {
      // Handle possible quoted CSV values roughly, or simple split
      const parts = line.split(',');
      return {
        code: (parts[0] || '').trim(),
        name: (parts[1] || '').trim(),
        title: (parts[2] || '').trim()
      };
    }).filter(s => s.code && s.name);

    if (parsed.length === 0) {
      setImportResult({ type: 'error', message: 'No valid data found. Use format: Code,Name,Title' });
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: parsed.length });
    setImportResult(null);

    let added = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const batch = parsed.slice(i, i + BATCH_SIZE);
      const promises = batch.map(staff =>
        addDoc(collection(db, 'staff'), {
          code: staff.code,
          name: staff.name,
          title: staff.title
        }).then(() => {
          added++;
          setImportProgress({ done: added, total: parsed.length });
        }).catch(err => console.error('Failed to add:', staff.code, err))
      );
      await Promise.all(promises);
    }

    setImporting(false);
    setImportResult({ type: 'success', message: `Successfully imported ${added} staff members` });
  };

  const closeBulkModal = () => {
    if (importing) return;
    setShowBulkModal(false);
    setCsvText('');
    setImportResult(null);
    setImportProgress({ done: 0, total: 0 });
  };

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Manage Staff</h1>
        <p>Add, edit, or remove staff members.</p>
      </header>

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Search staff by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn secondary" onClick={() => setShowBulkModal(true)}>
            <Upload size={18} />
            Bulk Import
          </button>
          <button className="admin-btn" onClick={openAdd}>
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No staff found. Add your first staff member!</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.code}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.title}</td>
                  <td className="actions">
                    <button className="admin-btn secondary sm" onClick={() => openEdit(s)}>
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

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
            <div className="admin-modal-form">
              <div className="admin-field">
                <label>Staff Code</label>
                <input
                  type="text"
                  placeholder="e.g., IT001"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="admin-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Subramanian"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="admin-field">
                <label>Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g., Professor (IT)"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn" onClick={handleSave}>
                  {editingStaff ? 'Update' : 'Add Staff'}
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
            <h3>Bulk Import Staff</h3>

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
              <div className="admin-field">
                <label>Paste CSV Data (Code, Name, Title)</label>
                <textarea
                  placeholder={`Paste your CSV data here. Example:\n\nCode,Name,Title\nIT001,Dr. Subramanian,Professor (Math)\nIT002,Dr. Lakshmi,Associate Professor (Physics)\nIT003,Prof. Ramesh,Assistant Professor (Chemistry)`}
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
                  Header row is auto-detected and skipped. Each row: Code,Name,Title
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
    </div>
  );
}

export default ManageStaff;
