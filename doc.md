**ONLINE QUIZ WEB APP**

_Full Project Documentation_

Secure · Scheduled · Automated Assessment Platform

| **Document Version**<br><br>1.0 - Initial Release    | **Prepared For**<br><br>Development Agent |
| ---------------------------------------------------- | ----------------------------------------- |
| **Platform Type**<br><br>Remote Classroom Assessment | **Date**<br><br>March 2026                |

**1\. Project Overview**

The Online Quiz Web App is a secure, scheduled, and fully automated assessment platform designed for remote classrooms. It enables teachers to create, schedule, and manage quizzes while providing students with a structured, monitored environment for completing assessments online.

_This document serves as the complete technical and functional specification intended for a development agent to build the full application from scratch. All design decisions, workflows, data models, and security requirements are defined herein._

## **1.1 Core Objectives**

- Provide a reliable and tamper-resistant quiz environment for remote students.
- Automate the entire assessment lifecycle - creation, scheduling, delivery, grading, and result dispatch.
- Eliminate manual grading effort for teachers through automatic scoring.
- Record student screens during quiz attempts as a deterrent to dishonesty.
- Allow teachers to manage everything through a secure admin dashboard.

## **1.2 Key Features**

| **Feature**            | **Description**                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Student Authentication | Login using name and ID verified against a preloaded JSON credentials file.                          |
| Scheduled Quizzes      | Quizzes have defined start and end times; countdown timers shown to students before activation.      |
| Question Types         | Supports Multiple Choice Questions (MCQ) and short-answer questions.                                 |
| Automatic Scoring      | Answers graded instantly upon submission; score calculated server-side.                              |
| Screen Recording       | Student screen recorded via WebRTC throughout the quiz session.                                      |
| Auto Submission        | Quiz auto-submits when the timer expires; manual early submission also supported.                    |
| Email Results          | Teacher receives formatted result emails with scores and recording links automatically.              |
| Admin Dashboard        | Protected admin interface for quiz creation, scheduling, question management, and submission review. |
| CSV Import             | Questions and student reference data can be bulk-imported via CSV files.                             |

## **1.3 Technology Stack**

| **Layer**             | **Technology**                        |
| --------------------- | ------------------------------------- |
| Frontend              | Next.js (React Framework)             |
| Backend               | Node.js with Express.js               |
| Database              | MongoDB Atlas (Cloud-hosted)          |
| Recording Storage     | AWS S3 or Google Cloud Storage        |
| Email Service         | Gmail API or SendGrid                 |
| Deployment - Frontend | Vercel                                |
| Deployment - Backend  | Vercel API Routes or Railway / Render |

**2\. System Architecture**

## **2.1 Frontend Architecture**

The frontend is built with Next.js and handles all user-facing pages and interactions. It communicates with the backend API for quiz data and submission. Student authentication is handled entirely on the frontend using a locally bundled JSON credentials file - no server round-trip is required for login.

### **Pages and Components**

| **Page / Component** | **Purpose**                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Login Page (Student) | Accepts student name and ID; validates against the bundled JSON credentials file.              |
| Student Dashboard    | Lists all quizzes as Upcoming, Live, or Expired with appropriate status and timers.            |
| Quiz Interface       | Renders questions, manages the countdown timer, captures answers, and starts screen recording. |
| Admin Login Page     | Accepts admin credentials and issues a JWT token for protected access.                         |
| Admin Dashboard      | Provides full quiz management: create, edit, schedule, upload CSV, and view submissions.       |

### **Frontend Functional Flow**

- Student logs in using name and student ID; frontend validates against the JSON file.
- Dashboard fetches quiz schedule from the backend and categorises quizzes by status.
- Countdown timers are displayed for upcoming quizzes; questions are hidden until the start time.
- At start time, the quiz becomes interactive; the timer counts down to the end time.
- Screen recording begins automatically when the quiz starts (with browser permission).
- Tab-switching triggers an on-screen warning; repeated violations may auto-submit.
- On submission (manual or automatic), answers and the recording file are sent to the backend.

## **2.2 Backend Architecture**

The backend is a Node.js and Express application responsible for quiz delivery, submission handling, grading, email dispatch, and admin operations. It enforces time-based access control for all quiz endpoints.

### **Core Responsibilities**

- Serve quiz data only within the allowed start and end time window.
- Accept answer submissions and recording uploads.
- Auto-grade MCQ answers and compute scores server-side.
- Send result emails to the teacher with scores and a secure recording link.
- Store recordings securely in cloud storage and return accessible URLs.
- Authenticate admin users and protect all admin endpoints with JWT middleware.

### **API Endpoints**

| **Method + Endpoint**  | **Description**                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| GET /quiz/:id          | Returns quiz data only if current server time is within the quiz's start and end window. |
| POST /quiz/:id/submit  | Accepts student answers and recording; validates quiz is still active before processing. |
| POST /admin/login      | Authenticates admin credentials and returns a signed JWT token.                          |
| POST /admin/quiz       | Creates a new quiz with title, questions, start time, and end time.                      |
| POST /admin/quiz/csv   | Parses an uploaded CSV file and populates questions for a specified quiz.                |
| GET /admin/submissions | Returns all submissions for admin review; protected by JWT middleware.                   |

## **2.3 Database Design (MongoDB Atlas)**

The application uses MongoDB Atlas as its cloud database. There are two primary collections: one for quizzes and one for submissions. Student data is not stored in the database; it is managed as a static JSON file on the frontend.

### **Quizzes Collection**

| **Field** | **Type / Description**                                                                        |
| --------- | --------------------------------------------------------------------------------------------- |
| \_id      | ObjectId - Unique identifier generated by MongoDB.                                            |
| title     | String - The display title of the quiz (e.g., Programming Fundamentals Quiz).                 |
| questions | Array - List of question objects (see Question Schema below).                                 |
| startTime | ISO 8601 DateTime - The exact UTC time at which the quiz becomes accessible to students.      |
| endTime   | ISO 8601 DateTime - The exact UTC time at which the quiz closes and auto-submission triggers. |

### **Question Schema (embedded in Quizzes)**

| **Field** | **Type / Description**                                                            |
| --------- | --------------------------------------------------------------------------------- |
| type      | String - Either 'mcq' for multiple choice or 'short' for a short-answer question. |
| question  | String - The question text displayed to the student.                              |
| options   | Array of Strings - The four answer choices (MCQ only; omitted for short-answer).  |
| answer    | String - The correct answer; used for automatic grading.                          |
| marks     | Number - The number of marks awarded for a correct answer.                        |

### **Submissions Collection**

| **Field**    | **Type / Description**                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| \_id         | ObjectId - Unique identifier for the submission.                              |
| studentID    | String - The student's ID as entered during login (e.g., BSE-25F-086).        |
| quizID       | ObjectId - Reference to the associated quiz in the Quizzes collection.        |
| answers      | Array - Each item contains a questionId and the student's submitted answer.   |
| score        | Number - Total score calculated by the backend after grading.                 |
| recordingURL | String - Secure cloud storage URL pointing to the student's screen recording. |
| submittedAt  | ISO 8601 DateTime - The exact UTC time the submission was received.           |

### **Student Data (Frontend JSON)**

Student credentials are not stored in the database. They are maintained as a static JSON file bundled with the frontend application. Each entry contains only the student's full name and their ID. This file is used exclusively for login validation on the client side.

**3\. Student Workflow**

## **3.1 Login**

Students access the application through a login page. They enter their full name and student ID. The frontend cross-references this input against the bundled JSON credentials file. If a match is found, the student is directed to their dashboard. No password is required. This approach prioritises ease of access for classroom settings.

_Security Note: Frontend-only login is intentional for classroom convenience. Backend submission validation ensures that even if a student bypasses login, they cannot submit results for a quiz that is not active or does not belong to them._

## **3.2 Student Dashboard**

After login, the student sees a list of all quizzes. Each quiz is displayed in one of three states:

| **Quiz State** | **Behaviour**                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Upcoming       | A countdown timer shows the time remaining until the quiz starts. Questions are not accessible. The student can see the quiz title and scheduled start time. |
| Live           | The quiz is fully interactive. A countdown timer shows the time remaining until the quiz closes. The student can begin answering immediately.                |
| Expired        | The quiz has passed its end time. A 'Quiz Closed' message is displayed. No interaction is possible.                                                          |

## **3.3 Quiz Attempt**

When a quiz is live, the student enters the quiz interface. The following behaviours are enforced automatically:

- A countdown timer is prominently displayed, counting down to the quiz end time.
- Screen recording starts automatically using the browser's WebRTC API. The student must grant screen-share permission. If permission is denied, an appropriate warning is displayed.
- Both MCQ and short-answer questions are displayed sequentially or on a single scrollable page depending on implementation preference.
- Tab-switching detection is active. If the student switches away from the quiz tab, a warning alert is shown immediately. This event is logged.
- Repeated tab-switching violations may trigger an automatic early submission as a disciplinary measure.

## **3.4 Submission**

Submission occurs in one of two ways: the student clicks the submit button before the timer expires, or the timer reaches zero and submission triggers automatically. In both cases the following steps occur on the backend:

- The backend verifies that the quiz is still within its active window before accepting the submission.
- Answers are graded automatically. MCQ answers are compared against the stored correct answer. Short-answer responses are stored for teacher review without automatic grading.
- The screen recording file is uploaded to cloud storage and a secure URL is generated.
- A formatted result email is sent to the teacher containing the student name, student ID, quiz title, score, a breakdown of answers, and the secure link to the recording.
- The submission record is stored in the database for admin review.

**4\. Admin Workflow**

## **4.1 Admin Authentication**

The admin accesses a separate login page. Admin credentials are validated server-side. Upon successful authentication, the backend issues a signed JWT token. This token must be included in the Authorization header of all subsequent admin API requests. Admin routes are protected by JWT middleware that rejects requests with invalid or expired tokens.

## **4.2 Quiz Management**

The admin dashboard provides full control over the quiz lifecycle:

- Create a new quiz by entering a title, defining the start time, and defining the end time.
- Add questions manually through a form interface - specify the question text, type (MCQ or short answer), answer options (for MCQ), correct answer, and marks per question.
- Upload questions in bulk using a CSV file (format detailed in Section 6).
- Edit existing questions - update the text, options, correct answer, or marks.
- Remove individual questions from a quiz.
- Delete an entire quiz if it has not yet started.

## **4.3 Student Reference Management**

The admin can upload or update the student credentials JSON or CSV file. This file is consumed by the frontend for login validation only. The backend does not use this file for any validation or grading logic. When updated, the file must be redeployed with the frontend or served from a location accessible to the frontend application.

## **4.4 Submission Monitoring**

The admin dashboard includes a submissions panel that displays all recorded submissions. From this panel the admin can:

- View all submissions for any quiz, including student name, ID, score, and submission time.
- Review the answers submitted by each student, including short-answer responses that require manual evaluation.
- Download a CSV export of all scores for a selected quiz.
- Access the secure recording link for any submission to review the student's screen recording.
- Confirm that result emails have been dispatched by reviewing submission metadata.

**5\. Security Measures**

## **5.1 Frontend Security**

| **Measure**             | **Implementation Detail**                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student Login           | Validated against a locally bundled JSON file. Simple and fast; not intended as a high-security mechanism - backend validation is the authoritative layer. |
| Tab-Switching Detection | Implemented using the document.visibilitychange browser event. Violations are logged and displayed to the student as warnings.                             |
| Screen Recording        | Initiated via the WebRTC Media Devices API. Student must grant explicit permission. Recording proceeds for the duration of the quiz session.               |
| Quiz Time Enforcement   | Quiz questions are not rendered or made accessible before the server-authorised start time.                                                                |

## **5.2 Backend Security**

| **Measure**              | **Implementation Detail**                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Time-Gated Quiz Access   | The GET /quiz/:id endpoint checks server-side time against startTime and endTime before returning any quiz data. Early or late access is rejected.         |
| Time-Gated Submission    | The POST /quiz/:id/submit endpoint verifies the quiz is still active before processing any submission. Late submissions are rejected.                      |
| Admin JWT Authentication | All admin endpoints require a valid JWT token in the Authorization header. The token is signed with a secret key and has a defined expiry period.          |
| Role Verification        | JWT payload includes a role claim. Middleware verifies the role is 'admin' before permitting access to protected routes.                                   |
| Cloud Recording Storage  | Recordings are never stored locally. They are uploaded directly to AWS S3 or Google Cloud Storage. Only pre-signed or time-limited secure URLs are shared. |

## **5.3 Authoritative Time Control**

Server-side time is the single source of truth for all quiz timing decisions. The frontend timers are for display purposes only. Students cannot manipulate client-side clocks to gain access to quiz content early or submit answers after the window has closed. All access and submission gates are evaluated on the backend using the server's system time.

**6\. Question Management**

## **6.1 CSV Import Format**

Admins can upload a CSV file to populate quiz questions in bulk. The CSV must follow the format below. The header row is required. For short-answer questions, the option columns are left empty.

| **Column** | **Description**                                                                     |
| ---------- | ----------------------------------------------------------------------------------- |
| question   | The full text of the question.                                                      |
| type       | Either 'mcq' for multiple choice or 'short' for a short-answer question.            |
| option1    | First answer choice (MCQ only; leave blank for short-answer).                       |
| option2    | Second answer choice (MCQ only; leave blank for short-answer).                      |
| option3    | Third answer choice (MCQ only; leave blank for short-answer).                       |
| option4    | Fourth answer choice (MCQ only; leave blank for short-answer).                      |
| answer     | The correct answer string. Must exactly match one of the options for MCQ questions. |
| marks      | Integer value representing the marks awarded for a correct answer.                  |

_CSV Header Row (required): question, type, option1, option2, option3, option4, answer, marks_

## **6.2 Manual Question Entry**

Admins may also add questions individually through the admin dashboard interface. The form accepts all the same fields defined in the CSV format above. Manual entry is useful for single additions, edits, or when importing a full CSV is not practical.

## **6.3 Question Editing and Removal**

Any existing question within a quiz can be edited or removed from the admin dashboard prior to the quiz going live. Once a quiz has started and students may be actively attempting it, editing questions is not recommended and should be restricted. The admin interface should reflect this constraint clearly.

**7\. Scheduled Quiz Functionality**

## **7.1 Countdown Before Quiz Starts**

When a student views a quiz that has not yet reached its start time, the dashboard displays a real-time countdown timer showing hours, minutes, and seconds until the quiz becomes active. The quiz questions, question count, and marks are not shown during this period. Only the quiz title and scheduled start time are visible.

## **7.2 Live Quiz Behaviour**

Once the server time reaches the quiz start time, the quiz transitions to the Live state automatically on the next page load or via a client-side polling mechanism. At this point, the full quiz interface is unlocked: questions are rendered, the countdown timer resets to count down to the end time, and screen recording is initiated.

## **7.3 Automatic Quiz Closure**

When the countdown timer reaches zero, the quiz interface triggers an automatic submission. The current state of all answers is captured and submitted to the backend along with the screen recording file. The student is shown a confirmation screen indicating their quiz has been submitted and results will be communicated by their teacher. Further interaction with the quiz is blocked after submission.

## **7.4 Client-Side Polling**

To ensure the quiz transitions between states (Upcoming to Live, Live to Expired) without requiring a manual page refresh, the frontend polls the backend or uses a timer-based state check. The recommended approach is a lightweight client-side interval that compares the current time against the known start and end times fetched at page load. This minimises server load while keeping the UI responsive.

**8\. Email Results**

## **8.1 Trigger**

A result email is sent automatically every time a valid quiz submission is processed by the backend. The email is dispatched asynchronously after the submission is saved to the database, so it does not block or delay the submission response to the student.

## **8.2 Email Content**

The result email sent to the teacher contains all information needed to evaluate the student's performance:

- Student full name and student ID.
- Quiz title and the date and time of submission.
- Total score achieved and the maximum possible score.
- A per-question breakdown listing the question text, the student's answer, the correct answer (for MCQ), and whether the answer was correct.
- A secure link to the student's screen recording hosted in cloud storage.

## **8.3 Email Service**

The application supports two email service integrations: Gmail API (using OAuth 2.0 credentials) or SendGrid (using an API key). The specific service is configured via environment variables. The email is sent from a designated teacher or system email address configured during deployment. HTML-formatted emails are preferred for readability.

**9\. Deployment Plan**

| **Component**        | **Technology / Platform**                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Frontend Application | Next.js deployed on Vercel. Automatic builds triggered from the main branch.                                    |
| Backend API          | Node.js and Express deployed on Vercel API Routes (for serverless) or Railway / Render (for persistent server). |
| Database             | MongoDB Atlas - cloud-hosted managed cluster. Connection string stored as an environment variable.              |
| Recording Storage    | AWS S3 or Google Cloud Storage. Bucket access keys stored as environment variables.                             |
| Email Service        | Gmail API (OAuth 2.0) or SendGrid (API key). Credentials stored as environment variables.                       |

_All sensitive credentials - database connection strings, cloud storage keys, JWT secrets, and email service credentials - must be stored as environment variables and must never be committed to the source code repository._

**10\. Limitations and Considerations**

| **Area**                    | **Consideration**                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend-Only Student Login | The JSON-based login can be inspected or bypassed by a technically proficient student. Backend time-gating and submission validation remain the primary security enforcement layer.                                                        |
| Screen Recording            | The browser must grant screen-share permission. Students can decline. Large recording files may result in slow uploads, particularly on poor network connections. File size limits and compression should be evaluated during development. |
| Tab-Switching Enforcement   | Tab-switch detection via the visibility API is not foolproof. Students using a second physical device are not detectable by this method. It acts as a deterrent, not a guarantee.                                                          |
| Email Attachments           | Screen recordings must never be sent as email attachments due to file size. Secure cloud storage links must be used in all result emails.                                                                                                  |
| Short-Answer Grading        | Short-answer questions are stored for teacher review but are not automatically graded. Teachers must manually evaluate these responses through the admin dashboard.                                                                        |
| Concurrent Submissions      | At quiz end time, many students may submit simultaneously. The backend and database must be configured to handle burst traffic without data loss.                                                                                          |

**11\. Key Advantages**

- Fully automated quiz lifecycle from creation through result delivery - no manual teacher intervention required after scheduling.
- Server-authoritative time control ensures no student can access quizzes early or submit after the deadline.
- Screen recording provides a meaningful deterrent to academic dishonesty without requiring specialised proctoring software.
- CSV import enables rapid quiz creation - a full quiz can be prepared and uploaded in minutes.
- Supports both MCQ and short-answer questions in a single quiz.
- Admin dashboard with JWT-protected routes provides a clean, secure management interface.
- Cloud-based architecture - the entire platform is serverless-ready and scales without infrastructure management.
- Automatic email dispatch keeps teachers informed instantly without any manual steps.