# Phase 12: System Robustness & Production Readiness

## **Introduction**
This phase focuses on making the Quizzy platform more secure, scalable, and production-ready by addressing technical debt, improving data integrity, and enhancing student proctoring.

## **Core Requirements**

### **1. Production-Ready Configuration**
- **Objective:** Move away from hardcoded local development strings.
- **Tasks:**
  - Create `.env.local` for the frontend.
  - Replace all `http://localhost:5000` instances with `NEXT_PUBLIC_API_URL`.
  - Ensure backend handles CORS correctly in production environments.

### **2. Backend Input Validation (Zod/Joi)**
- **Objective:** Prevent invalid or malicious data from reaching the database.
- **Tasks:**
  - Implement a validation layer (e.g., Zod) for:
    - Quiz Creation/Updates.
    - Question additions (manual and CSV).
    - Submission payloads.
    - Student Login requests.

### **3. Advanced Proctoring & Anti-Cheat**
- **Objective:** Strengthen the integrity of quiz attempts.
- **Tasks:**
  - **Copy-Paste Prevention:** Disable `ctrl+c`, `ctrl+v`, and right-click on the quiz taking page.
  - **Window Focus Monitoring:** Detect and record "Window Blur" events (when a student switches to another application) as violations.
  - **Auto-Submit on Timeouts:** Ensure server-side logic handles quiz expiration and marks attempts as closed.

### **4. Backend Scalability (Pagination & Performance)**
- **Objective:** Ensure the system remains fast with thousands of quizzes/submissions.
- **Tasks:**
  - Implement pagination for `GET /api/admin/quizzes` and `GET /api/admin/quizzes/:id/submissions`.
  - Use MongoDB Aggregation for calculating dashboard statistics.

### **5. Automated Communication (Nodemailer)**
- **Objective:** Improve user engagement and result delivery.
- **Tasks:**
  - Configure **Nodemailer** with a production SMTP provider (e.g., SendGrid, Gmail).
  - Automatically email the detailed answer sheet to the instructor upon submission (if configured).

## **Success Criteria**
- [ ] No hardcoded `localhost` URLs remain in the frontend codebase.
- [ ] All API endpoints return structured errors for invalid payloads.
- [ ] Right-clicking and copy-pasting are disabled during active quiz attempts.
- [ ] Admin dashboard and submission tables support pagination.
