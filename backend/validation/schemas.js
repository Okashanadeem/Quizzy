const { z } = require('zod');

// Student Login Schema
const studentLoginSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  studentId: z.string().min(3, "Student ID must be at least 3 characters").max(20)
});

// Admin Login Schema
const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(5, "Password must be at least 5 characters")
});

// Quiz Creation/Update Schema
const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  startTime: z.string().datetime("Invalid start time format"),
  endTime: z.string().datetime("Invalid end time format"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  unverifiedPassword: z.string().optional(),
  allowStudentCopy: z.boolean().optional().default(false)
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Question Schema
const questionSchema = z.object({
  type: z.enum(['mcq', 'short']),
  question: z.string().min(3, "Question must be at least 3 characters"),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  marks: z.number().int().positive("Marks must be a positive integer")
}).refine((data) => {
  if (data.type === 'mcq') {
    return data.options && data.options.length >= 2 && data.answer;
  }
  return true;
}, {
  message: "MCQ must have at least 2 options and a correct answer",
  path: ["options"]
});

// Submission Schema
const submissionSchema = z.object({
  studentID: z.string().min(3),
  studentName: z.string().min(2),
  studentEmail: z.string().email("Invalid email format").optional().or(z.literal('')),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string().optional()
  })),
  tabSwitches: z.number().int().nonnegative().default(0),
  isUnverified: z.boolean().default(false),
  quizPassword: z.string().optional()
});

// Manual Grading Schema
const gradingSchema = z.object({
  questionId: z.string(),
  marksAwarded: z.number().min(0, "Marks must be 0 or more")
});

module.exports = {
  studentLoginSchema,
  adminLoginSchema,
  quizSchema,
  questionSchema,
  submissionSchema,
  gradingSchema
};
