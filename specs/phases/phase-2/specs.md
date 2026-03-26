# Phase 2: Admin Quiz Management

## **Goal**
Provide a secure administrative interface for teachers to create, read, update, and delete quizzes and questions.

## **Tasks**
- [x] T006: Implement Admin Login (JWT-protected).
- [x] T007: Design Admin Dashboard layout.
- [x] T008: Implement Quiz CRUD (Create, Read, Update, Delete) endpoints.
- [x] T009: Implement manual Question Entry form with a 'Screen Recording' toggle.
- [x] T010: Implement CSV Import functionality for questions.
- [x] T011: Verify Admin-only access to management routes.

## **Implementation Details**
- **Auth:** JWT-signed tokens, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (env).
- **Schema Update:** Add `isRecordingEnabled: Boolean` (default: false) to the Quiz model.
- **CRUD:** Express routes for `/admin/quizzes` (POST, GET, PUT, DELETE).
- **CSV:** `multer` and `csv-parser` for handling bulk question uploads.
- **Validation:** Protected routes must reject non-JWT requests with 401 Unauthorized.
