# Phase 9: Quiz Visibility & Duration Management

## Objectives
- Separate **Quiz Visibility Window** (when students can start) from **Quiz Duration** (how long they have to finish).
- Implement a per-student timer based on the configured quiz duration.
- Enforce a hard cutoff at the end of the visibility window: if the visibility window expires while a student is testing, the quiz auto-submits with a specific notification.

## Technical Requirements

### 1. Database Model Updates
- **Quiz Model:** Add `duration` field (Number, represents minutes).
- **Submission Model:** No changes needed, but `score` and `submittedAt` remain critical.

### 2. Admin Interface Updates
- **Create Quiz Modal:** Add an input for "Quiz Duration (minutes)".
- **Admin Dashboard:** Display the duration in the quiz cards.

### 3. Student Quiz Logic (Frontend)
- **Timer Calculation:** 
  - Upon entering the quiz, the system calculates the `endOfAttemptTime`.
  - `endOfAttemptTime = min(now + duration, visibilityEndTime)`.
- **LocalStorage Persistence:** Store the `startTime` of the attempt in `localStorage` to prevent timer resets on page refresh.
- **Auto-Submission:**
  - If `now >= visibilityEndTime`, trigger auto-submission with the message: *"Your time of quiz visibility is up and quiz is submitted."*
  - If `now >= endOfAttemptTime` (duration expired), trigger standard auto-submission.

### 4. Backend Validation
- **Submit Endpoint:** Ensure the submission is still rejected if received significantly after the `visibilityEndTime`.

## File Changes
- `backend/models/Quiz.js`: Add `duration` field.
- `backend/routes/adminRoutes.js`: Update create route to accept `duration`.
- `frontendApp/src/app/admin/dashboard/page.tsx`: Update "Create Quiz" form and display.
- `frontendApp/src/app/quiz/[id]/page.tsx`: Implement the dual-timer logic and visibility cutoff message.

## Success Criteria
- Admin can set a quiz to be visible for 4 hours, but give students only 30 minutes to complete it once they start.
- If a student starts 5 minutes before the visibility window ends, they only get 5 minutes.
- The quiz auto-submits correctly in both "duration expired" and "visibility expired" scenarios.
- A clear message is shown when the visibility window cuts the attempt short.
