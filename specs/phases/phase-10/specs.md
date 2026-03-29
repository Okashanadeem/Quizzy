# Phase 10: UI/UX Overhaul & Feature Polish

## Objectives
- Elevate the visual design and user experience across the entire application using modern UI patterns.
- Replace native browser `alert()` and `confirm()` dialogs with custom toast notifications and elegant modals.
- Introduce critical missing features identified during the system review, specifically around manual grading, detailed submission viewing within the dashboard, and a better quiz-taking experience.

## System Review & New Features Identified
1. **In-App Submission Review & Manual Grading (Admin):** Currently, teachers receive emails for submissions but cannot view the detailed answers or grade short-answer questions within the app. We need a detailed view modal and the ability to assign marks to short-answer questions, which then updates the total score.
2. **Export Submissions (Admin):** Admins should be able to download a CSV of all student scores for a specific quiz for their records.
3. **Question Pagination & Palette (Student):** Instead of a long scrolling page, the quiz interface should show one question at a time with a "Question Palette" grid on the side to jump between questions and see which are answered/unanswered.
4. **Toast Notifications (Global):** Implement a sleek toast notification system for success/error messages to replace jarring browser alerts.
5. **Dashboard Statistics (Admin):** Add high-level metric cards to the Admin Dashboard (e.g., Total Quizzes, Active Quizzes).

## UI/UX Redesign Plan per Page

### Global Design System
- **Typography:** Implement a modern sans-serif font stack (e.g., Inter) for cleaner readability.
- **Color Palette:** Refined slate/blue primary palette with soft, accessible semantic colors for success (emerald), warning (amber), and danger (rose).
- **Components:** Unified card styles with subtle hover elevations, consistent button states (disabled, loading, active, hover), and skeleton loaders for data fetching states.

### 1. Landing Page (`/`)
- **New Design:** 
  - Hero section with a modern, subtle gradient background or abstract pattern.
  - Feature grid highlighting "Secure", "Scheduled", and "Automated Grading" with icons.
  - Prominent, stylized Call-To-Action (CTA) buttons for Student and Admin entry points.

### 2. Login Pages (`/login`, `/admin/login`)
- **New Design:** 
  - Centered, elevated card layout with a soft shadow.
  - Floating labels or cleanly styled inputs with focus rings.
  - Inline validation error messages (red text below inputs) instead of a single block error.
  - Loading spinners inside the submit buttons.

### 3. Student Dashboard (`/dashboard`)
- **New Design:** 
  - Tabbed or categorized interface: "Active Quizzes", "Upcoming", "Past Attempts".
  - Status badges with pulsing dot indicators for "Live" quizzes.
  - Enhanced card layouts showing duration, total marks, and a visual countdown timer for upcoming quizzes.

### 4. Quiz Taking Interface (`/quiz/[id]`)
- **New Design:** 
  - **Layout:** Split layout. Main content area for the current question, and a right-hand sidebar for the Question Navigation Palette and Timer.
  - **Navigation:** "Next" and "Previous" buttons to move between questions, eliminating the need for a massive scrollable page.
  - **Progress:** Visual progress bar at the top showing completion percentage (Answered vs Total).
  - **Confirm Modal:** A styled confirmation modal before final submission.

### 5. Admin Dashboard (`/admin/dashboard`)
- **New Design:** 
  - Top statistics row (e.g., Total Quizzes, Total Submissions).
  - Enhanced quiz cards with distinct visual indicators for "Upcoming", "Active", and "Expired" states.
  - Quick action dropdown menus or icon buttons (Edit, Questions, Submissions, Delete) to save space and look cleaner.

### 6. Quiz Management (`/admin/quizzes/[id]`)
- **New Design:** 
  - Collapsible question cards to easily manage a large list of questions without endless scrolling.
  - Better visual distinction between MCQ and Short Answer types.
  - Sticky summary bar showing total questions and total marks.

### 7. Submissions Page (`/admin/quizzes/[id]/submissions`)
- **New Design:** 
  - **Detailed View:** Click on a row to open a slide-out drawer or modal showing the student's exact answer sheet (mirroring the email content).
  - **Manual Grading Integration:** Within the detailed view, admins can input a score for "Pending" short-answer questions and hit "Save Grading" to update the student's total score in the database.
  - **Export Data:** An "Export to CSV" button to download grades.

## Execution Plan
To implement this massive overhaul safely, we will break it down into four sub-phases:
1. **Phase 10.1:** Global UI setup (Install UI libraries if needed like `lucide-react` for icons, setup custom Toast notifications, update generic components).
2. **Phase 10.2:** Redesign Landing & Login pages.
3. **Phase 10.3:** Overhaul Admin Dashboards, add Export CSV, and implement the Detailed Submission View with Manual Grading logic.
4. **Phase 10.4:** Overhaul Student Dashboard & rebuild the Quiz Taking interface with pagination and the question palette.
