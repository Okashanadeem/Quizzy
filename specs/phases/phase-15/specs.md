# Phase 15: Student Join Flow & Shuffling

## **Goal**
Simplify student entry and enhance quiz integrity with question shuffling.

## **Objectives**
- **Removal of Legacy Login:** Remove `students.json` dependency and Guest Mode.
- **The Join Page (`/join`):**
    - A single, clean entry point for all students.
    - Fields: Full Name, Student ID, Email, and Quiz Access Code.
- **Validation:** 
    - Verify `Access Code` exists and the quiz is currently "Live".
    - Check if this `Student ID` has already submitted for this specific quiz (Single Attempt Enforcement).
- **Question Shuffling:**
    - MCQs must be shuffled (random order) for each student attempt.
- **Results Delivery:**
    - Add a toggle in Quiz settings: "Send results to student email".
    - If enabled, automatically email the answer sheet to the student upon submission.

## **Technical Requirements**
- **Frontend:** New `/join` route and refactored quiz-taking logic.
- **Logic:** Implement Fisher-Yates shuffle algorithm for MCQ questions.
- **Email:** Update submission route to handle dual-email delivery (to Teacher and Student).

## **Success Criteria**
- Student can join a quiz using only the code and their basic details.
- Multiple students see questions in different orders.
- Students receive their results via email if the teacher has enabled the option.
