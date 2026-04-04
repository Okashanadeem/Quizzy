const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Route and Middleware Imports
const adminRoutes = require('./routes/adminRoutes');
const authAdmin = require('./middleware/auth');
const validate = require('./middleware/validate');
const { studentLoginSchema, submissionSchema } = require('./validation/schemas');

// Model Imports
const Quiz = require('./models/Quiz');
const Submission = require('./models/Submission');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection state
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined.');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// --- ROUTES ---

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

// Student Login Route
app.post('/api/student/login', validate(studentLoginSchema), (req, res) => {
  const { name, studentId } = req.body;
  try {
    const studentsFilePath = path.join(__dirname, 'data', 'students.json');
    if (!fs.existsSync(studentsFilePath)) {
      console.error('❌ Missing students.json file at:', studentsFilePath);
      return res.status(500).json({ message: 'Server configuration error: student data missing' });
    }
    const studentsData = JSON.parse(fs.readFileSync(studentsFilePath, 'utf8'));
    const student = studentsData.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() && s.id === studentId
    );

    if (student) {
      res.status(200).json(student);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Error processing login' });
  }
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

// Submit Quiz Endpoint
app.post('/api/quizzes/:id/submit', validate(submissionSchema), async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { studentID, studentName, tabSwitches, answers, quizPassword, isUnverified } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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

    // Grading Logic
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    const gradedResults = quiz.questions.map(question => {
      maxPossibleScore += question.marks;
      const studentAns = answers.find(a => a.questionId === question.id);
      const studentAnswerText = (studentAns && studentAns.answer) ? studentAns.answer : 'No Answer';
      
      let marksAwarded = 0;
      let isCorrect = false;

      if (question.type === 'mcq') {
        if (studentAnswerText.trim().toLowerCase() === (question.answer || '').trim().toLowerCase()) {
          marksAwarded = question.marks;
          isCorrect = true;
        }
      } else {
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

    // Prepare Email Content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">Quiz Answer Sheet</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px; font-weight: bold;">Student Name</td><td style="padding: 5px;">${studentName}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">Student ID</td><td style="padding: 5px;">${studentID}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">Quiz Title</td><td style="padding: 5px;">${quiz.title}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">Total Score</td><td style="padding: 5px; font-size: 1.1em; color: #27ae60; font-weight: bold;">${totalScore} / ${maxPossibleScore}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">Tab Switches</td><td style="padding: 5px; color: ${tabSwitches > 0 ? '#e74c3c' : '#333'}">${tabSwitches}</td></tr>
          </table>
        </div>
        
        <h3 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Detailed Breakdown</h3>
        ${gradedResults.map((res, idx) => `
          <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid ${res.type === 'short' ? '#f1c40f' : (res.isCorrect ? '#2ecc71' : '#e74c3c')}; background-color: #fcfcfc;">
            <p style="margin: 0 0 5px 0; font-weight: bold;">${idx + 1}. ${res.question}</p>
            <p style="margin: 0; font-size: 0.9em;"><strong>Your Answer:</strong> ${res.studentAnswer}</p>
            <p style="margin: 0; font-size: 0.9em;"><strong>Correct Answer:</strong> ${res.correctAnswer}</p>
            <p style="margin: 5px 0 0 0; font-size: 0.8em; font-weight: bold; color: #7f8c8d;">
              Marks: ${res.type === 'short' ? `Pending Review (Max: ${res.maxMarks})` : `${res.marksAwarded} / ${res.maxMarks}`}
            </p>
          </div>
        `).join('')}
        
        <p style="margin-top: 30px; font-size: 0.8em; color: #95a5a6; text-align: center;">
          Submitted at: ${new Date().toLocaleString()}<br/>
          This is an automated copy of your assessment submission.
        </p>
      </div>
    `;

    // Send Detailed Email Notification to Teacher (Always)
    const teacherMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `[QUIZ SUBMISSION] ${quiz.title} - ${studentName} (${studentID})`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(teacherMailOptions);
      newSubmission.emailSent = true;
      await newSubmission.save();
    } catch (err) {
      console.error('Teacher Email Error:', err);
    }

    // Send copy to student if allowed and requested
    const { studentEmail } = req.body;
    if (quiz.allowStudentCopy && studentEmail) {
      const studentMailOptions = {
        from: process.env.GMAIL_USER,
        to: studentEmail,
        subject: `Your Quiz Results: ${quiz.title}`,
        html: `
          <p>Hello ${studentName},</p>
          <p>Thank you for completing the assessment. Here is a copy of your responses and initial grading.</p>
          ${emailHtml}
        `,
      };

      try {
        await transporter.sendMail(studentMailOptions);
      } catch (err) {
        console.error('Student Email Error:', err);
      }
    }
    
    res.status(200).json({ message: 'Submission successful', score: totalScore, maxScore: maxPossibleScore, emailSent: true });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ message: 'Error processing submission', error: error.message });
  }
});

// Admin Authentication Routes
app.use('/api/admin', adminRoutes);

// Protected Admin Example Route
app.get('/api/admin/profile', authAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome Admin!', admin: req.admin });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error', error: err.message });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;