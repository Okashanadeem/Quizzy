const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const authAdmin = require('../middleware/auth');
const Quiz = require('../models/Quiz');

// Admin Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Use ADMIN_USERNAME and ADMIN_PASSWORD from .env
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token as a cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    return res.status(200).json({ message: 'Login successful', role: 'admin' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Create Quiz
router.post('/quizzes', authAdmin, async (req, res) => {
  try {
    const { title, startTime, endTime, isRecordingEnabled, questions } = req.body;
    const newQuiz = new Quiz({
      title,
      startTime,
      endTime,
      isRecordingEnabled,
      questions
    });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
});

// Get All Quizzes
router.get('/quizzes', authAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// Delete Quiz
router.delete('/quizzes/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Quiz.findByIdAndDelete(id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
});

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: 'uploads/' });

// ... existing routes ...

// Add Manual Question
router.post('/quizzes/:id/questions', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, question, options, answer, marks } = req.body;
    
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    quiz.questions.push({
      id: uuidv4(),
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

// CSV Upload Questions
router.post('/quizzes/:id/questions/csv', authAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const results = [];
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // question, type, option1, option2, option3, option4, answer, marks
        const options = [];
        if (data.option1) options.push(data.option1);
        if (data.option2) options.push(data.option2);
        if (data.option3) options.push(data.option3);
        if (data.option4) options.push(data.option4);

        results.push({
          id: uuidv4(),
          type: data.type.toLowerCase(),
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
        
        // Clean up file
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: `${results.length} questions imported`, quiz });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error importing CSV', error: error.message });
  }
});

const Submission = require('../models/Submission');

// Get All Submissions for a Quiz
router.get('/quizzes/:id/submissions', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ quizID: id }).sort({ submittedAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Admin Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
