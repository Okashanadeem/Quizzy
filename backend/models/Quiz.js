const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short'], required: true },
  question: { type: String, required: true },
  options: [String], // MCQ only
  answer: { type: String, required: true },
  marks: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  unverifiedPassword: { type: String }, // Optional shared password for guest students
  allowStudentCopy: { type: Boolean, default: false },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
