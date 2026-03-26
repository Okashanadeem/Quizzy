# Phase 4: Quiz Interface & Attempt

## **Goal**
Develop a functional quiz-taking interface that accurately renders questions, manages the countdown timer, and captures answers for submission.

## **Tasks**
- [x] T017: Design Quiz Taking interface (Question rendering).
- [x] T018: Implement real-time countdown timer for active quizzes.
- [x] T019: Implement answer capture (MCQ & Short Answer).
- [x] T020: Implement manual and automatic submission triggers.
- [x] T021: Verify submission API receives correct answer payloads.

## **Implementation Details**
- **Interface:** Dynamic forms for MCQ and Text areas for short-answers.
- **Timer:** Real-time countdown synced with `endTime` from backend.
- **Submission:** Trigger automatic submission when timer hits zero.
- **Validation:** Submission must only be possible if the quiz is "Live".
