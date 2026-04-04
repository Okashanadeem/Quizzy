const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const os = require('os');
require('dotenv').config();

const authAdmin = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto');

const validate = require('../middleware/validate');
const { adminLoginSchema, quizSchema, questionSchema, gradingSchema } = require('../validation/schemas');

// Vercel serverless functions only have write access to /tmp
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

// Admin Login Route
router.post('/login', validate(adminLoginSchema), (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: true, // Always true for Vercel/Production
      sameSite: 'none', // Required for cross-site cookie transfer
      maxAge: 3600000 // 1 hour
    });

    return res.status(200).json({ message: 'Login successful', role: 'admin' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Create Quiz
router.post('/quizzes', authAdmin, validate(quizSchema), async (req, res) => {
  try {
    const { title, startTime, endTime, duration, unverifiedPassword, allowStudentCopy, questions } = req.body;
    const newQuiz = new Quiz({
      title,
      startTime,
      endTime,
      duration,
      unverifiedPassword,
      allowStudentCopy,
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

    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Quiz.countDocuments();

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
    
    // 1. Delete the quiz itself
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // 2. Delete all student submissions linked to this quizID
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
    const { title, startTime, endTime, duration, unverifiedPassword, allowStudentCopy } = req.body;
    
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { title, startTime, endTime, duration, unverifiedPassword, allowStudentCopy },
      { new: true }
    );
    
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
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
    
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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
        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

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

    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Update the score
    // Note: This logic assumes we are ADDING the marksAwarded to the current score
    // In a more robust system, we would track individual question marks in the Submission model too.
    // For now, we'll just update the total score.
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
    const totalQuizzes = await Quiz.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    
    const upcomingQuizzes = await Quiz.countDocuments({
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

module.exports = router;
