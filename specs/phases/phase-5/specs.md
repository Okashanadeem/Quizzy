# Phase 5: Security & Screen Recording

## **Goal**
Incorporate security measures to prevent cheating and monitor student activity through tab-switch detection and screen recording.

## **Tasks**
- [x] T022: Implement tab-switching detection (Visibility API).
- [x] T023: Implement on-screen warning system for violations.
- [x] T024: Implement conditional screen recording (Only if 'isRecordingEnabled' is true).
- [x] T025: Request and handle screen-share permissions only when recording is required.
- [x] T026: Capture and prepare recording blob (only if applicable).

## **Implementation Details**
- **Conditional Logic:** Frontend must check `quiz.isRecordingEnabled` before calling WebRTC.
- **Security:** Use `document.visibilityState` for tab-switches (active for all quizzes).
- **Recording:** `MediaRecorder` API using `getDisplayMedia` (if required).
- **Validation:** If recording is enabled but permission is denied, the quiz must be blocked.
