import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitialData } from '../../data/mockData';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';
  const assignedSemester = parseInt(localStorage.getItem('userSemester'));
  const semesters = assignedSemester ? [assignedSemester] : [];

  useEffect(() => {
    getInitialData();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome Back, {userName}!</h1>
        {semesters.length > 0 ? (
          <p className="subtitle">Select your current semester to provide feedback.</p>
        ) : (
          <p className="subtitle pink-text">You haven't been assigned to a semester yet. Please contact the Admin Office.</p>
        )}
      </header>

      <div className="semester-grid">
        {semesters.length === 0 && (
          <div className="empty-sem-notice animate-fade-in shadow-xl">
            <h3>No Active Semester Found</h3>
            <p>Your curriculum access is restricted. Once the administrator assigns you to a semester (e.g., Session 2023-2027, 3rd Year), your active semester will appear here automatically.</p>
          </div>
        )}
        {semesters.map((sem, idx) => (
          <div 
            key={sem} 
            className="semester-card glass animate-slide-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={() => navigate(`/student/semester/${sem}`)}
          >
            <div className="semester-number">{sem}</div>
            <div className="card-content">
              <h3>Semester {sem}</h3>
              <p>Anna University Curriculum</p>
            </div>
            <div className="card-footer">
              <span className="explore-btn">View Subjects</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;
