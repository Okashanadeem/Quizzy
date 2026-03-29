# Phase 11: Unverified User Access & Attempt Enforcement

## Objectives
- Allow students who are not in the pre-defined `students.json` list to attempt quizzes using a shared "Quiz Password".
- Ensure both verified and unverified students can only attempt a quiz once.
- Distinguish unverified submissions in the admin panel with a visual badge.

## Technical Requirements

### 1. Database Model Updates
- **Quiz Model:** Add `unverifiedPassword` (String, optional). This is the key unverified students must enter to start the quiz.
- **Submission Model:** Add `isUnverified` (Boolean, default `false`).

### 2. Backend Logic Updates
- **Check Submission Status:** Create a new endpoint `GET /api/submissions/check/:quizId/:studentId` to verify if a student has already submitted.
- **Submit Endpoint:** Add a server-side check to block multiple submissions for the same `studentID` and `quizID`.
- **Admin Routes:** Update Create/Update routes to handle the `unverifiedPassword` field.

### 3. Frontend: Student Experience
- **Unverified Access:**
  - If a user reaches a quiz page without being logged in, show an "Unverified Entry" form instead of redirecting to login.
  - Form Fields: Full Name, Student ID, Quiz Access Password.
  - The system verifies the `Quiz Access Password` before showing the questions.
- **Attempt Enforcement:**
  - On the Student Dashboard, the "Start Assessment" button should first check if the student has already submitted.
  - If they have submitted, show a "Completed" badge and disable the button.
  - If they try to access the quiz URL directly, show a "You have already completed this quiz" message.

### 4. Frontend: Admin Experience
- **Quiz Configuration:** Add an "Unverified Student Access Password" field to the Create/Edit Quiz modal.
- **Submissions List:** Add a badge (e.g., "Guest" or "Unverified") to students who entered via the unverified route.

## File Changes
- `backend/models/Quiz.js`: Add `unverifiedPassword`.
- `backend/models/Submission.js`: Add `isUnverified`.
- `backend/routes/adminRoutes.js`: Update quiz management and manual grading logic if needed.
- `backend/index.js`: Add check-submission endpoint and duplicate prevention.
- `frontendApp/src/app/admin/dashboard/page.tsx`: Add password field to modal.
- `frontendApp/src/app/admin/quizzes/[id]/submissions/page.tsx`: Add "Unverified" badge.
- `frontendApp/src/app/dashboard/page.tsx`: Add "Completed" check logic.
- `frontendApp/src/app/quiz/[id]/page.tsx`: Implement Unverified Entry form and attempt blocking.

## Success Criteria
- Students in `students.json` can log in and take quizzes once.
- Students NOT in `students.json` can take quizzes by providing their Name, ID, and the specific Quiz Password.
- No student can take the same quiz twice (using the same ID).
- Admins can easily identify unverified students in the submissions list.
