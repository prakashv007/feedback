import { useState, useEffect } from 'react';
import { defaultQuestions } from '../../data/mockData';
import { Star, X, Loader2 } from 'lucide-react';
import { db, collection, addDoc } from '../../firebase';
import './FeedbackFormModal.css';

function FeedbackFormModal({ subject, teacher, semesterId, activeSessionId, onClose, onSubmit }) {
  const [customQuestions, setCustomQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine default and custom questions on mount
  useEffect(() => {
    const savedCustomQuestions = JSON.parse(localStorage.getItem('customQuestions') || '{}');
    const subjCustomQs = savedCustomQuestions[subject.id] || [];
    setCustomQuestions(subjCustomQs);
  }, [subject.id]);

  const allQuestions = [...defaultQuestions, ...customQuestions];

  const handleRating = (index, value) => {
    setRatings(prev => ({ ...prev, [index]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate if all questions are answered
    if (Object.keys(ratings).length < allQuestions.length) {
      setError('Please rate all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Calculate average rating
    const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0);
    const averageRating = totalScore / allQuestions.length;

    const newFeedback = {
      studentId: localStorage.getItem('userId'),
      semesterId: semesterId,
      subjectId: subject.id,
      sessionId: activeSessionId || 'default',
      subjectName: subject.name,
      teacherCode: teacher?.code || '',
      teacherName: teacher?.name || '',
      teacherTitle: teacher?.title || '',
      ratings,
      comment,
      averageRating: parseFloat(averageRating.toFixed(2)),
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Save to local storage first for immediate availability
      const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      localStorage.setItem('feedbacks', JSON.stringify([...existingFeedbacks, newFeedback]));

      // 2. Success! Notify and close immediately BEFORE the cloud sync
      if (onSubmit) onSubmit();
      onClose();
      
      // Notify other components
      window.dispatchEvent(new Event('feedback-submitted'));

      // 3. Try to save to Firestore in the background (non-blocking)
      addDoc(collection(db, 'feedbacks'), newFeedback)
        .then(() => {
          console.log("Feedback synced to cloud successfully.");
        })
        .catch(cloudErr => {
          console.warn("Cloud save background sync failed:", cloudErr);
        });

    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false); // Only stop loading if we actually error out early
    }
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>{subject.name}</h2>
          <p className="subtitle">Feedback for {teacher ? teacher.name : 'Unknown Teacher'}</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="questions-container">
            {allQuestions.map((q, index) => (
              <div key={index} className="question-item">
                <p className="question-text">{index + 1}. {q}</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      className={`star ${ratings[index] >= star ? 'filled' : ''}`}
                      onClick={() => handleRating(index, star)}
                    />
                  ))}
                  <span className="rating-label">
                    {ratings[index] ? `${ratings[index]} / 5` : 'Rate'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Additional Comments / Suggestions (optional):</label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could be improved? What did you like?"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackFormModal;
