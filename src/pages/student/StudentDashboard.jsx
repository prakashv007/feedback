import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitialData } from '../../data/mockData';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => {
    getInitialData();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome Back, Student!</h1>
        <p className="subtitle">Select your current semester to provide feedback.</p>
      </header>

      <div className="semester-grid">
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
