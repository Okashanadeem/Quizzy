# Master Task List: EazyQuizzy

This is the central task tracking list for the whole project.

## **Phase 1: Setup & Core Infrastructure**
- [x] T001: Initialize Next.js (Frontend) & Node/Express (Backend) project.
- [x] T002: Set up MongoDB Atlas cluster and connection logic.
- [x] T003: Configure Tailwind CSS / Styling boilerplate.
- [x] T004: Create shared layout components (Navbar, Footer).
- [x] T005: Initialize environment variable management (.env).

## **Phase 2: Admin Quiz Management**
- [x] T006: Implement Admin Login (JWT-protected).
- [x] T007: Design Admin Dashboard layout.
- [x] T008: Implement Quiz CRUD (Create, Read, Update, Delete) endpoints.
- [x] T009: Implement manual Question Entry form.
- [x] T010: Implement CSV Import functionality for questions.
- [x] T011: Verify Admin-only access to management routes.

## **Phase 3: Student Entry & Dashboard**
- [x] T012: Bundle student credentials JSON into the frontend.
- [x] T013: Implement Student Login page (JSON-based).
- [x] T014: Design Student Dashboard with quiz categorization (Upcoming/Live/Expired).
- [x] T015: Implement countdown timers for upcoming quizzes.
- [x] T016: Verify time-based quiz visibility logic.

## **Phase 4: Quiz Interface & Attempt**
- [x] T017: Design Quiz Taking interface (Question rendering).
- [x] T018: Implement real-time countdown timer for active quizzes.
- [x] T019: Implement answer capture (MCQ & Short Answer).
- [x] T020: Implement manual and automatic submission triggers.
- [x] T021: Verify submission API receives correct answer payloads.

## **Phase 5: Security & Screen Recording**
- [x] T022: Implement tab-switching detection (Visibility API).
- [x] T023: Implement on-screen warning system for violations.
- [x] T024: Implement WebRTC Screen Recording start/stop logic. (REMOVED in Phase 8)
- [x] T025: Request and handle screen-share permissions from students. (REMOVED in Phase 8)
- [x] T026: Capture recording blob upon quiz completion. (REMOVED in Phase 8)

## **Phase 6: Backend Processing & Results**
- [x] T027: Implement server-side grading for MCQ questions.
- [x] T028: Set up Supabase Storage bucket for recordings. (REMOVED in Phase 8)
- [x] T029: Implement recording upload upon submission. (REMOVED in Phase 8)
- [x] T030: Implement Email Dispatch (Gmail/Nodemailer) for result notifications.
- [x] T031: Design Admin Submissions review panel (viewing scores/recordings).

## **Phase 7: Deployment & Final Validation**
- [ ] T032: Deploy Frontend to Vercel.
- [ ] T033: Deploy Backend to Railway / Render / Vercel API.
- [ ] T034: Configure all production environment variables.
- [x] T035: Perform end-to-end testing (Admin creation -> Student attempt -> Teacher result email).
- [x] T036: Conduct final code review and documentation cleanup.

## **Phase 8: Refinement & Simplification**
- [x] T037: Remove WebRTC recording logic from frontend.
- [x] T038: Remove Supabase dependency and storage logic from backend.
- [x] T039: Enhance grading logic to include all question types in score.
- [x] T040: Implement detailed HTML email answer sheet for instructors.
- [x] T041: Add CSV template download to admin quiz management.
- [x] T042: Restrict bulk CSV upload to MCQ type only.
- [x] T043: Clean up database schemas and admin forms (remove recording toggles).

## **Phase 9: Quiz Visibility & Duration Management**
- [x] T044: Add `duration` field to Quiz model.
- [x] T045: Implement `duration` input and display in Admin Dashboard.
- [x] T046: Implement per-student attempt timer with `localStorage` persistence.
- [x] T047: Implement hard visibility cutoff logic with auto-submission.
- [x] T048: Add specific notification message for visibility expiration.

## **Phase 10: UI/UX Overhaul & Feature Polish**
- [x] T049: Phase 10.1 - Install dependencies (`lucide-react`, `react-hot-toast`), set up global styles and layout wrappers.
- [x] T050: Phase 10.2 - Redesign Landing page with a modern hero section.
- [x] T051: Phase 10.2 - Redesign Admin and Student Login pages with split-screen/card layouts and inline validation.
- [x] T052: Phase 10.3 - Overhaul Admin Dashboard (add statistics, improve quiz cards).
- [x] T053: Phase 10.3 - Overhaul Manage Questions interface (collapsible cards, sticky summary).
- [x] T054: Phase 10.3 - Implement Detailed Submission View modal/drawer for Admin.
- [x] T055: Phase 10.3 - Implement Manual Grading logic for short-answer questions in the Admin UI.
- [x] T056: Phase 10.3 - Add "Export to CSV" functionality on the Submissions page.
- [x] T057: Phase 10.4 - Overhaul Student Dashboard (tabbed interface, visual timers).
- [x] T058: Phase 10.4 - Redesign Quiz Taking interface (add Question Navigation Palette, progress bar, pagination).
- [x] T059: Phase 10.4 - Implement "Flag for Review" feature for students taking quizzes.

## **Phase 11: Unverified User Access & Attempt Enforcement**
- [x] T060: Add `unverifiedPassword` to Quiz model and `isUnverified` to Submission model.
- [x] T061: Implement Unverified Entry form on the quiz taking page.
- [x] T062: Implement server-side Quiz Password validation for guest students.
- [x] T063: Implement "Single Attempt" check across both verified and unverified students.
- [x] T064: Add "Unverified" badge to submissions table in Admin Panel.
- [x] T065: Implement auto-redirect/blocking for students who have already completed a quiz.

## **Phase 12: System Robustness & Production Readiness**
- [x] T066: Replace hardcoded API URLs with environment variables (Frontend).
- [x] T067: Implement Zod validation schemas for all Backend API routes.
- [x] T068: Implement "Copy-Paste" and "Right-Click" prevention on the quiz taking page.
- [x] T069: Implement "Window Blur" detection and violation tracking (Focus Monitoring).
- [x] T070: Implement server-side Pagination for admin tables (Quizzes/Submissions).
- [x] T071: Configure Nodemailer with SMTP provider for production email delivery.

## **Phase 13: Multi-Level Auth (Super Admin/Teacher)**
- [x] T072: Implement `Teacher` model and Super Admin env-based auth.
- [x] T073: Create Super Admin Dashboard (Teacher CRUD).
- [x] T074: Implement random password generation and email delivery for Teachers.
- [x] T075: Implement global quiz visibility (metadata only) for Super Admin.

## **Phase 14: Teacher Dashboard & Quiz Logic**
- [x] T076: Implement Teacher-specific login and personal dashboard.
- [x] T077: Update `Quiz` model with `teacherId` and unique `accessCode`.
- [x] T078: Implement unique alphanumeric `accessCode` generation logic.
- [x] T079: Add "Copy Invite" button with formatted template on Teacher Dashboard.

## **Phase 15: Unified Student Join Flow & Shuffling**
- [x] T080: Remove `students.json` and legacy student/guest login flows.
- [x] T081: Create the unified `/join` page with code validation.
- [x] T082: Implement Fisher-Yates MCQ shuffling for student attempts.
- [x] T083: Implement "Send results to student email" toggle and logic.

## **Phase 16: EazyQuizzy Branding & Refactoring**
- [x] T084: Global rename "Quizzy" -> "EazyQuizzy" (Codebase-wide).
- [x] T085: Update logos, favicons, and metadata for EazyQuizzy branding.
- [x] T086: Implement RBAC middleware and enforce `teacherId` data isolation.
- [x] T087: Perform final system cleanup and documentation update.
