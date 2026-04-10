const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const csv = require('csv-parser');
require('dotenv').config();

const upload = multer({ dest: os.tmpdir() });

const authAdmin = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Teacher = require('../models/Teacher');
const superAuth = require('../middleware/superAuth');
const validate = require('../middleware/validate');
const { quizSchema, questionSchema, gradingSchema, adminLoginSchema } = require('../validation/schemas');
const { sendEmail } = require('../utils/email');
const { generatePassword, generateAccessCode } = require('../utils/helpers');

// ... (existing imports)

// --- AUTH ROUTES ---

// Admin & Teacher Login
router.post('/login', validate(adminLoginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if Super Admin (from .env)
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'super-admin-id', role: 'superadmin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(200).json({ message: 'Super Admin login successful', role: 'superadmin' });
    }

    // 2. Check if Teacher (from Database)
    const teacher = await Teacher.findOne({ email: username });
    if (teacher && (await teacher.comparePassword(password))) {
      const token = jwt.sign(
        { id: teacher._id, role: 'teacher', name: teacher.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(200).json({ message: 'Teacher login successful', role: 'teacher', name: teacher.name });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// --- SUPER ADMIN ROUTES ---

// Create Teacher
router.post('/teachers', superAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if teacher already exists
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Teacher with this email already exists' });

    const password = generatePassword();
    const teacher = new Teacher({ name, email, password });
    await teacher.save();

    // Send password via email
    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #0f172a; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">EazyQuizzy</h1>
          <div style="display: inline-block; margin-top: 8px; padding: 4px 12px; background-color: #1e293b; border-radius: 6px; color: #3b82f6; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
            Secure Assessment Portal
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 40px 32px;">
          <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Instructor Account Provisioned</h2>
          <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569;">
            Dear ${name},<br><br>
            An instructor account has been successfully created for you on the <strong>EazyQuizzy Assessment Platform</strong>. You may now access the portal to manage your quizzes and monitor student performance.
          </p>
          
          <!-- Credentials Box -->
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Access Credentials</p>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Portal Identity:</td>
                <td style="padding: 4px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Temporary Key:</td>
                <td style="padding: 4px 0; color: #2563eb; font-size: 14px; font-weight: 700; text-align: right; font-family: 'Roboto Mono', monospace;">${password}</td>
              </tr>
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/login" 
               style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
               Login to Instructor Portal
            </a>
          </div>

          <!-- Footer Note -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
              For security, please update your temporary key immediately upon your first successful login.
            </p>
          </div>
        </div>

        <!-- Legal Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-weight: 500; text-transform: uppercase; letter-spacing: 0.025em;">
            &copy; ${new Date().getFullYear()} EazyQuizzy Assessment Systems. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail(email, 'EazyQuizzy | Instructor Access Credentials', html);

    res.status(201).json({ message: 'Teacher created successfully and email sent', teacher: { id: teacher._id, name, email } });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  }
});

// Get All Teachers (for Super Admin)
router.get('/teachers', superAuth, async (req, res) => {
  try {
    const teachers = await Teacher.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// Delete Teacher
router.delete('/teachers/:id', superAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Teacher not found' });
    
    // Optionally delete all quizzes by this teacher?
    // For now, just delete the teacher.
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
});

// Get Global Quiz Metadata (for Super Admin)
router.get('/super/quizzes', superAuth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title teacherId startTime endTime createdAt')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global quizzes', error: error.message });
  }
});

// --- TEACHER & GENERAL ADMIN ROUTES ---

// Create Quiz (Updated for Teacher Ownership)
router.post('/quizzes', authAdmin, validate(quizSchema), async (req, res) => {
  try {
    const { title, startTime, endTime, duration, allowStudentResultsEmail, questions } = req.body;
    
    // Role Check: Only teachers (or super admin if they want) can create quizzes
    // But usually super admin wouldn't create their own quizzes in this multi-tenant model
    // unless they act as a teacher.
    
    const teacherId = req.admin.id; // From JWT
    if (!teacherId && req.admin.role !== 'superadmin') {
        return res.status(401).json({ message: 'Teacher identity not found in token' });
    }

    const accessCode = generateAccessCode();

    const newQuiz = new Quiz({
      title,
      teacherId: teacherId || null, // Super admin might not have a teacherId
      accessCode,
      startTime,
      endTime,
      duration,
      allowStudentResultsEmail,
      questions
    });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
});

// Get All Quizzes (with Pagination)
router.get('/quizzes', authAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.admin.role === 'teacher' ? { teacherId: req.admin.id } : {};

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Quiz.countDocuments(query);

    res.status(200).json({
      quizzes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// Delete Quiz (and all associated submissions)
router.delete('/quizzes/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = { _id: id };
    if (req.admin.role === 'teacher') {
      query.teacherId = req.admin.id;
    }

    const deletedQuiz = await Quiz.findOneAndDelete(query);
    
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    await Submission.deleteMany({ quizID: id });

    res.status(200).json({ 
      message: 'Quiz and all associated records deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz records', error: error.message });
  }
});

// Update Quiz (Visibility/Duration)
router.patch('/quizzes/:id', authAdmin, validate(quizSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, duration, allowStudentResultsEmail } = req.body;
    
    const query = { _id: id };
    if (req.admin.role === 'teacher') {
      query.teacherId = req.admin.id;
    }

    const updatedQuiz = await Quiz.findOneAndUpdate(
      query,
      { title, startTime, endTime, duration, allowStudentResultsEmail },
      { new: true }
    );
    
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
});

// Add Manual Question
router.post('/quizzes/:id/questions', authAdmin, validate(questionSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, question, options, answer, marks } = req.body;
    
    const query = { _id: id };
    if (req.admin.role === 'teacher') {
      query.teacherId = req.admin.id;
    }

    const quiz = await Quiz.findOne(query);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or unauthorized' });

    quiz.questions.push({
      id: crypto.randomUUID(),
      type,
      question,
      options,
      answer,
      marks
    });

    await quiz.save();
    res.status(200).json(quiz);
    } catch (error) {
    res.status(500).json({ message: 'Error adding question', error: error.message });
    }
    });

    // Delete Question
    router.delete('/quizzes/:id/questions/:questionId', authAdmin, async (req, res) => {
    try {
    const { id, questionId } = req.params;

    const query = { _id: id };
    if (req.admin.role === 'teacher') {
      query.teacherId = req.admin.id;
    }

    const quiz = await Quiz.findOne(query);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or unauthorized' });

    quiz.questions = quiz.questions.filter(q => q.id !== questionId);

    await quiz.save();
    res.status(200).json({ message: 'Question deleted successfully', quiz });
    } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
    });

    // Upload Questions via CSV
router.post('/quizzes/:id/questions/csv', authAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const results = [];
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const query = { _id: id };
    if (req.admin.role === 'teacher') {
      query.teacherId = req.admin.id;
    }

    const quiz = await Quiz.findOne(query);
    if (!quiz) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        const options = [];
        if (data.option1) options.push(data.option1);
        if (data.option2) options.push(data.option2);
        if (data.option3) options.push(data.option3);
        if (data.option4) options.push(data.option4);

        results.push({
          id: crypto.randomUUID(),
          type: 'mcq', 
          question: data.question,
          options,
          answer: data.answer,
          marks: parseInt(data.marks) || 1
        });
      })
      .on('end', async () => {
        quiz.questions.push(...results);
        await quiz.save();
        
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: `${results.length} questions imported`, quiz });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error importing CSV', error: error.message });
  }
});

// Get All Submissions for a Quiz (with Pagination)
router.get('/quizzes/:id/submissions', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quizQuery = { _id: id };
    if (req.admin.role === 'teacher') {
      quizQuery.teacherId = req.admin.id;
    }

    const quiz = await Quiz.findOne(quizQuery);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or unauthorized' });

    const submissions = await Submission.find({ quizID: id })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ quizID: id });

    res.status(200).json({
      submissions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Manual Grading Route
router.post('/submissions/:id/grade', authAdmin, validate(gradingSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, marksAwarded } = req.body;

    const submission = await Submission.findById(id).populate('quizID');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (req.admin.role === 'teacher' && String(submission.quizID.teacherId) !== req.admin.id) {
        return res.status(403).json({ message: 'Unauthorized to grade this submission' });
    }

    submission.score += Number(marksAwarded);
    await submission.save();

    res.status(200).json({ message: 'Grade updated successfully', newScore: submission.score });
  } catch (error) {
    res.status(500).json({ message: 'Error updating grade', error: error.message });
  }
});

// Get Admin Stats
router.get('/stats', authAdmin, async (req, res) => {
  try {
    const query = req.admin.role === 'teacher' ? { teacherId: req.admin.id } : {};
    
    const totalQuizzes = await Quiz.countDocuments(query);
    
    let totalSubmissions = 0;
    if (req.admin.role === 'teacher') {
        const quizzes = await Quiz.find({ teacherId: req.admin.id }, '_id');
        const quizIds = quizzes.map(q => q._id);
        totalSubmissions = await Submission.countDocuments({ quizID: { $in: quizIds } });
    } else {
        totalSubmissions = await Submission.countDocuments();
    }
    
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      ...query,
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    
    const upcomingQuizzes = await Quiz.countDocuments({
      ...query,
      startTime: { $gt: now }
    });

    res.status(200).json({
      totalQuizzes,
      totalSubmissions,
      activeQuizzes,
      upcomingQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Admin Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.status(200).json({ message: 'Logout successful' });
});

// Change Password Route
router.patch('/profile/password', authAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    if (req.admin.role === 'superadmin') {
      // Super admin password is in .env, so we can't "change" it via DB
      // but we can allow them to check it. Actually, usually super admin 
      // password change would be manual in .env. 
      // For now, only allow teachers to change their DB password.
      return res.status(403).json({ message: 'Super Admin password must be changed in system configuration.' });
    }

    const teacher = await Teacher.findById(adminId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const isMatch = await teacher.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    teacher.password = newPassword; // Pre-save hook will hash it
    await teacher.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
});

module.exports = router;
