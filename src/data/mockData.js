// Mock Data for the Application

// Subjects assigned by semester
export const subjectsMetadata = {
  1: [
    { id: 'MA3151', name: 'Matrices and Calculus', teacherCode: 'IT001' },
    { id: 'PH3151', name: 'Engineering Physics', teacherCode: 'IT002' },
    { id: 'CY3151', name: 'Engineering Chemistry', teacherCode: 'IT003' },
    { id: 'GE3151', name: 'Problem Solving and Python Programming', teacherCode: 'IT004' }
  ],
  2: [
    { id: 'HS3251', name: 'Professional English-II', teacherCode: 'IT005' },
    { id: 'MA3251', name: 'Statistics and Numerical Methods', teacherCode: 'IT001' },
    { id: 'PH3256', name: 'Physics for Information Science', teacherCode: 'IT002' },
    { id: 'BE3251', name: 'Basic Electrical and Electronics Engineering', teacherCode: 'IT006' }
  ],
  3: [
    { id: 'MA3354', name: 'Discrete Mathematics', teacherCode: 'IT001' },
    { id: 'CS3351', name: 'Digital Principles and Computer Organization', teacherCode: 'IT007' },
    { id: 'CS3352', name: 'Foundations of Data Science', teacherCode: 'IT008' },
    { id: 'CD3291', name: 'Data Structures and Algorithms', teacherCode: 'IT004' },
    { id: 'CS3391', name: 'Object Oriented Programming', teacherCode: 'IT009' }
  ],
  // Add more semesters as needed up to 8...
  4: [
    { id: 'CS3452', name: 'Theory of Computation', teacherCode: 'IT010' },
    { id: 'CS3491', name: 'Artificial Intelligence and Machine Learning', teacherCode: 'IT008' },
    { id: 'CS3492', name: 'Database Management Systems', teacherCode: 'IT011' },
    { id: 'IT3401', name: 'Web Essentials', teacherCode: 'IT009' }
  ],
  5: [
    { id: 'CS3591', name: 'Computer Networks', teacherCode: 'IT012' },
    { id: 'IT3501', name: 'Full Stack Web Development', teacherCode: 'IT009' }
  ],
  6: [{ id: 'IT3601', name: 'Mobile Computing', teacherCode: 'IT013' }],
  7: [{ id: 'IT3701', name: 'Cloud Computing', teacherCode: 'IT014' }],
  8: [{ id: 'IT3801', name: 'Project Work', teacherCode: 'IT004' }]
};

export const defaultQuestions = [
  "How clearly does the teacher explain concepts?",
  "Is the teacher punctual and regular to class?",
  "Does the teacher encourage questions and discussion?",
  "How useful are the teaching materials provided?",
  "Does the teacher complete the syllabus on time?",
  "How would you rate the teacher's subject knowledge?",
  "Overall satisfaction with this subject and teacher?"
];

export const teachersInfo = {
  'IT001': { name: 'Dr. Subramanian', title: 'Professor (Math)' },
  'IT002': { name: 'Dr. Lakshmi', title: 'Associate Professor (Physics)' },
  'IT003': { name: 'Prof. Ramesh', title: 'Assistant Professor (Chemistry)' },
  'IT004': { name: 'Dr. Kavitha', title: 'Professor (IT)' },
  'IT005': { name: 'Dr. Selvi', title: 'Professor (English)' },
  'IT006': { name: 'Prof. Karthik', title: 'Assistant Professor (EEE)' },
  'IT007': { name: 'Dr. Balaji', title: 'Associate Professor (CSE)' },
  'IT008': { name: 'Dr. Meena', title: 'Professor (IT)' },
  'IT009': { name: 'Prof. Anand', title: 'Assistant Professor (IT)' },
  'IT010': { name: 'Dr. Prakash', title: 'Professor (IT)' },
  'IT011': { name: 'Dr. Srinivasan', title: 'Associate Professor (IT)' },
  'IT012': { name: 'Prof. Vijay', title: 'Assistant Professor (IT)' },
  'IT013': { name: 'Dr. Nithya', title: 'Professor (IT)' },
  'IT014': { name: 'Dr. Mohan', title: 'Associate Professor (IT)' }
};

// Helper: Get initialization data
export const getInitialData = () => {
  if (!localStorage.getItem('feedbacks')) {
    localStorage.setItem('feedbacks', JSON.stringify([]));
  }
  if (!localStorage.getItem('customQuestions')) {
    // Structure: { "SUBJECT_ID": ["Question 1", "Question 2"] }
    localStorage.setItem('customQuestions', JSON.stringify({}));
  }
};
