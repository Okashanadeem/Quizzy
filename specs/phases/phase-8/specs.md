# Phase 8: Refinement & Simplification

## Objectives
- Remove camera and screen recording features.
- Remove Supabase integration and any associated file uploads.
- Implement an automated email system to send student quiz answer sheets and marks calculation to the instructor.
- Update the admin quiz upload page to include a downloadable CSV template.
- Simplify bulk MCQ upload: only MCQs via CSV; short-answer questions must be added manually.

## Technical Requirements

### 1. Recording Removal
- **Frontend:** Remove WebRTC recording logic from the student quiz page (`frontendApp/src/app/quiz/[id]/page.tsx`).
- **Backend:** Remove logic for handling recording file uploads and storage.
- **Database:** Remove `recordingURL` and `isRecordingEnabled` fields from `Quiz` and `Submission` models if present.

### 2. Supabase Removal
- **Backend:** Remove `@supabase/supabase-js` dependency from `backend/package.json`.
- **Backend:** Remove Supabase client initialization and any usage of Supabase storage/database.
- **Environment:** Clean up Supabase-related environment variables from `.env`.

### 3. Email Submission System
- **Backend:** Enhance the submission route (`POST /api/submissions` or similar) to calculate full marks for both MCQ and short-answer questions.
- **Backend:** Integrate `nodemailer` to send a formatted HTML email to the instructor after each submission.
- **Email Content:**
  - Student Name and ID.
  - Quiz Title.
  - Full Question List with:
    - Student's Answer.
    - Correct Answer (for reference).
    - Marks Awarded for each question.
  - Final Calculated Score and Total Possible Marks.

### 4. CSV Template & Bulk Upload
- **Frontend:** Provide a "Download CSV Template" button on the admin quiz management page.
- **Frontend:** Update the bulk upload logic to only support MCQs.
- **Backend:** Update the CSV parsing logic to handle only MCQ-formatted rows for bulk imports.
- **Manual Entry:** Ensure short-answer questions can still be added manually through the admin UI.

## File Changes
- `frontendApp/src/app/quiz/[id]/page.tsx`: Remove recording logic.
- `frontendApp/src/app/admin/quizzes/[id]/page.tsx`: Add CSV template download; update bulk upload UI.
- `backend/index.js`: Remove Supabase initialization; update submission logic for email & grading.
- `backend/models/Quiz.js` & `Submission.js`: Update schemas.
- `backend/package.json`: Remove Supabase; ensure `nodemailer` is present.
- `backend/.env`: Remove Supabase keys; add SMTP credentials for instructor email.

## Success Criteria
- Quizzes function correctly without asking for camera/screen permissions.
- Submissions are successful without uploading any media files.
- Instructor receives a detailed email for every submission with accurate grading.
- Admin can download a template CSV and upload MCQs in bulk successfully.
- Short-answer questions can be added and graded (manually or auto-graded where possible).
