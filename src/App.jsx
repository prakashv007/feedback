import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Entrance from './pages/Entrance';
import StudentLogin from './pages/StudentLogin';
import StaffLogin from './pages/StaffLogin';
import AdminLogin from './pages/AdminLogin';
import StudentLayout from './layouts/StudentLayout';
import HodLayout from './layouts/HodLayout';
import AdminLayout from './layouts/AdminLayout';
import './App.css';

// Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SemesterView from './pages/student/SemesterView';
import HodDashboard from './pages/hod/HodDashboard';
import Reports from './pages/hod/Reports';
import SubjectAnalysis from './pages/hod/SubjectAnalysis';
import FeedbackTimeline from './pages/hod/FeedbackTimeline';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff';
import ManageStudents from './pages/admin/ManageStudents';
import AssignStaff from './pages/admin/AssignStaff';
import ManageQuestions from './pages/admin/ManageQuestions';

import ComingSoon from './pages/ComingSoon';

// Wrap ComingSoon to get state
function LockedPage() {
  const location = useLocation();
  const deptName = location.state?.deptName || "Department";
  return <ComingSoon departmentName={deptName} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Entrance />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/locked" element={<LockedPage />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="semester/:id" element={<SemesterView />} />
        </Route>

        {/* HOD Routes */}
        <Route path="/hod" element={<HodLayout />}>
          <Route index element={<HodDashboard />} />
          <Route path="analysis" element={<SubjectAnalysis />} />
          <Route path="timeline" element={<FeedbackTimeline />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="assign" element={<AssignStaff />} />
          <Route path="questions" element={<ManageQuestions />} />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
