# Phase 14: Teacher Dashboard & Quiz Logic

## **Goal**
Provide Teachers with a dedicated workspace to manage their own quizzes and unique access codes.

## **Objectives**
- **Teacher Login:** Authentication for teachers using their email and provided password.
- **Teacher Dashboard:**
    - List only quizzes and submissions created by the logged-in teacher.
    - Personal stats (My Quizzes, My Submissions).
- **Quiz Code Generation:**
    - Automatically generate a unique, 6-8 character alphanumeric code for every new quiz (e.g., `EZ-7X2A`).
    - Backend validation to ensure no code collisions.
- **Copy Invitation:**
    - Add a "Copy Invite" button to each quiz card.
    - **Template:** *"You are invited to take the quiz: [Quiz Name]. Date: [Date], Time: [Time]. Access Code: [Code]. Link: [BaseURL]/join"*

## **Technical Requirements**
- **Schema Update:** `Quiz` model must include `teacherId` (ObjectId ref) and `accessCode` (String, unique).
- **Frontend:** Update the Quiz Creation form to handle teacher-specific ownership.
- **Logic:** Implement a utility to generate collision-free unique codes.

## **Success Criteria**
- Teacher logs in and only sees their own quizzes.
- Every quiz has a unique access code.
- Teacher can copy a formatted invitation to send to students.
