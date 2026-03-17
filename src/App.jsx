import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Entrance from './pages/Entrance';
import StudentLogin from './pages/StudentLogin';
import StaffLogin from './pages/StaffLogin';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import HodLayout from './layouts/HodLayout';
import './App.css';

// Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SemesterView from './pages/student/SemesterView';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import HodDashboard from './pages/hod/HodDashboard';
import Reports from './pages/hod/Reports';
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
        <Route path="/locked" element={<LockedPage />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="semester/:id" element={<SemesterView />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
        </Route>

        {/* HOD Routes */}
        <Route path="/hod" element={<HodLayout />}>
          <Route index element={<HodDashboard />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
