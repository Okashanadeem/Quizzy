# Phase 6: Backend Processing & Results

## **Goal**
Automate quiz grading for MCQ questions, securely upload recordings to the cloud, and notify the teacher with detailed student results.

## **Tasks**
- [x] T027: Implement server-side grading for MCQ questions.
- [x] T028: Set up Supabase Storage bucket for recordings.
- [x] T029: Implement recording upload upon submission.
- [x] T030: Implement Email Dispatch (Gmail/Nodemailer) for result notifications.
- [x] T031: Design Admin Submissions review panel (viewing scores/recordings).

## **Implementation Details**
- **Grading:** Compare `studentAnswer` with `correctAnswer` in DB; calculate total score.
- **Storage:** Use `@supabase/supabase-js` to upload video blobs to a public bucket.
- **Emails:** Send formatted HTML emails using a Gmail App Password and Nodemailer.
- **Validation:** Every valid submission must result in a saved record and a dispatched email.
