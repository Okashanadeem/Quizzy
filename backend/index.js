const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const authAdmin = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('👉 TIP: Check your username and password in backend/.env. Ensure you removed the < > brackets.');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('👉 TIP: Check your Network Access in MongoDB Atlas. Is your IP whitelisted (0.0.0.0/0)?');
    }
    process.exit(1);
  });

const validate = require('./middleware/validate');
const { studentLoginSchema, submissionSchema } = require('./validation/schemas');

// ... (Middleware and DB connection)

// Health Check Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Online Quiz Web App API is running...',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Student Login Route (Centralized in backend)
app.post('/api/student/login', validate(studentLoginSchema), (req, res) => {
  const { name, studentId } = req.body;
  try {
    const studentsData = JSON.parse(fs.readFileSync('./data/students.json', 'utf8'));
    const student = studentsData.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() && s.id === studentId
    );

    if (student) {
      res.status(200).json(student);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing login' });
  }
});

const nodemailer = require('nodemailer');
const fs = require('fs');

const Quiz = require('./models/Quiz');
const Submission = require('./models/Submission');

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Public Student Route to fetch quizzes (Answers omitted for security)
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, '-questions.answer').sort({ startTime: 1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// Public Student Route to fetch a single quiz (Answers omitted)
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id, '-questions.answer');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// Check if student has already submitted this quiz
app.get('/api/submissions/check/:quizId/:studentId', async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    const existing = await Submission.findOne({ quizID: quizId, studentID: studentId });
    res.status(200).json({ submitted: !!existing });
  } catch (error) {
    res.status(500).json({ message: 'Error checking submission status' });
  }
});

// Submit Quiz Endpoint (Phase 11: Duplicate check & Unverified support)
app.post('/api/quizzes/:id/submit', validate(submissionSchema), async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { studentID, studentName, tabSwitches, answers, quizPassword, isUnverified } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // 0. Security Checks
    // Check if already submitted
    const existing = await Submission.findOne({ quizID: quizId, studentID: studentID });
    if (existing) {
      return res.status(403).json({ message: 'You have already submitted this quiz.' });
    }

    // Check quiz password for unverified students
    if (isUnverified) {
      if (!quiz.unverifiedPassword || quiz.unverifiedPassword !== quizPassword) {
        return res.status(401).json({ message: 'Invalid Quiz Access Password.' });
      }
    }

    // Validate time window (allow 60s grace period)
    const now = new Date();
    const gracePeriod = 60000; 
    if (now > new Date(quiz.endTime).getTime() + gracePeriod) {
      return res.status(403).json({ message: 'Submission failed: Quiz window closed' });
    }

    // 1. Grading Logic
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    const gradedResults = quiz.questions.map(question => {
      maxPossibleScore += question.marks;
      const studentAns = answers.find(a => a.questionId === question.id);
      const studentAnswerText = studentAns ? studentAns.answer : 'No Answer';
      
      let marksAwarded = 0;
      let isCorrect = false;

      if (question.type === 'mcq') {
        if (studentAnswerText.trim().toLowerCase() === question.answer.trim().toLowerCase()) {
          marksAwarded = question.marks;
          isCorrect = true;
        }
      } else {
        // Short answer: No auto-grading. Marks remain 0 until manual review.
        marksAwarded = 0;
        isCorrect = false;
      }

      totalScore += marksAwarded;

      return {
        question: question.question,
        studentAnswer: studentAnswerText,
        correctAnswer: question.type === 'mcq' ? question.answer : 'N/A (Manual Review)',
        marksAwarded,
        maxMarks: question.marks,
        isCorrect,
        type: question.type
      };
    });

    // 2. Save to MongoDB
    const newSubmission = new Submission({
      studentID,
      studentName,
      quizID: quizId,
      answers: answers.map(a => ({ questionId: a.questionId, answer: a.answer })),
      score: totalScore,
      maxScore: maxPossibleScore,
      tabSwitches: parseInt(tabSwitches) || 0,
      isUnverified: !!isUnverified,
      submittedAt: new Date()
    });

    await newSubmission.save();

    // 3. Send Detailed Email Notification
    let emailSent = false;
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.INSTRUCTOR_EMAIL || process.env.GMAIL_USER, // Instructor receives the email
      subject: `[QUIZ SUBMISSION] ${quiz.title} - ${studentName} (${studentID})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Quiz Answer Sheet</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Student Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Student ID</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${studentID}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Quiz Title</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${quiz.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Score</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-size: 1.2em; color: #27ae60; font-weight: bold;">
                ${totalScore} / ${maxPossibleScore}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tab Switches</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${tabSwitches}</td>
            </tr>
          </table>

          <h3 style="color: #2c3e50;">Detailed Answers Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">#</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Question</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Student's Answer</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Correct Answer</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Marks</th>
              </tr>
            </thead>
            <tbody>
              ${gradedResults.map((res, idx) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${idx + 1}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${res.question} <br/><small style="color: #7f8c8d;">(${res.type.toUpperCase()})</small></td>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: ${res.type === 'short' ? '#fff3cd' : (res.isCorrect ? '#d4edda' : '#f8d7da')};">
                    ${res.studentAnswer}
                    ${res.type === 'short' ? '<br/><small style="color: #856404;">[Requires Manual Review]</small>' : ''}
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${res.correctAnswer}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">
                    ${res.type === 'short' ? `0 / ${res.maxMarks} (Pending)` : `${res.marksAwarded} / ${res.maxMarks}`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 0.8em; color: #7f8c8d;">Submitted at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      emailSent = true;
      newSubmission.emailSent = true;
      await newSubmission.save();
    } catch (err) {
      console.error('Email Dispatch Error:', err);
    }
    
    res.status(200).json({ message: 'Submission successful', score: totalScore, maxScore: maxPossibleScore, emailSent });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ message: 'Error processing submission', error: error.message });
  }
});

// Admin Authentication Routes
app.use('/api/admin', adminRoutes);

// Protected Admin Example Route (T011 validation check)
app.get('/api/admin/profile', authAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome Admin!', admin: req.admin });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS Origin Allowed: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
