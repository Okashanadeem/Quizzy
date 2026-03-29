const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String, required: true },
  quizID: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [
    {
      questionId: { type: String, required: true },
      answer: { type: String }
    }
  ],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  tabSwitches: { type: Number, default: 0 },
  emailSent: { type: Boolean, default: false },
  isUnverified: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
