# Master Task List: Online Quiz Web App

This is the central task tracking list for the whole project.

## **Phase 1: Setup & Core Infrastructure**
- [ ] T001: Initialize Next.js (Frontend) & Node/Express (Backend) project.
- [ ] T002: Set up MongoDB Atlas cluster and connection logic.
- [ ] T003: Configure Tailwind CSS / Styling boilerplate.
- [ ] T004: Create shared layout components (Navbar, Footer).
- [ ] T005: Initialize environment variable management (.env).

## **Phase 2: Admin Quiz Management**
- [ ] T006: Implement Admin Login (JWT-protected).
- [ ] T007: Design Admin Dashboard layout.
- [ ] T008: Implement Quiz CRUD (Create, Read, Update, Delete) endpoints.
- [ ] T009: Implement manual Question Entry form.
- [ ] T010: Implement CSV Import functionality for questions.
- [ ] T011: Verify Admin-only access to management routes.

## **Phase 3: Student Entry & Dashboard**
- [ ] T012: Bundle student credentials JSON into the frontend.
- [ ] T013: Implement Student Login page (JSON-based).
- [ ] T014: Design Student Dashboard with quiz categorization (Upcoming/Live/Expired).
- [ ] T015: Implement countdown timers for upcoming quizzes.
- [ ] T016: Verify time-based quiz visibility logic.

## **Phase 4: Quiz Interface & Attempt**
- [ ] T017: Design Quiz Taking interface (Question rendering).
- [ ] T018: Implement real-time countdown timer for active quizzes.
- [ ] T019: Implement answer capture (MCQ & Short Answer).
- [ ] T020: Implement manual and automatic submission triggers.
- [ ] T021: Verify submission API receives correct answer payloads.

## **Phase 5: Security & Screen Recording**
- [ ] T022: Implement tab-switching detection (Visibility API).
- [ ] T023: Implement on-screen warning system for violations.
- [ ] T024: Implement WebRTC Screen Recording start/stop logic.
- [ ] T025: Request and handle screen-share permissions from students.
- [ ] T026: Capture recording blob upon quiz completion.

## **Phase 6: Backend Processing & Results**
- [ ] T027: Implement server-side grading for MCQ questions.
- [ ] T028: Set up Supabase Storage bucket for recordings.
- [ ] T029: Implement recording upload upon submission.
- [ ] T030: Implement Email Dispatch (Gmail/Nodemailer) for result notifications.
- [ ] T031: Design Admin Submissions review panel (viewing scores/recordings).

## **Phase 7: Deployment & Final Validation**
- [ ] T032: Deploy Frontend to Vercel.
- [ ] T033: Deploy Backend to Railway / Render / Vercel API.
- [ ] T034: Configure all production environment variables.
- [ ] T035: Perform end-to-end testing (Admin creation -> Student attempt -> Teacher result email).
- [ ] T036: Conduct final code review and documentation cleanup.
