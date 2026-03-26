# Phase 3: Student Entry & Dashboard

## **Goal**
Enable student login via local JSON file validation and provide a dashboard showing quizzes according to their scheduled times.

## **Tasks**
- [x] T012: Bundle student credentials JSON into the frontend.
- [x] T013: Implement Student Login page (JSON-based).
- [x] T014: Design Student Dashboard with quiz categorization (Upcoming/Live/Expired).
- [x] T015: Implement countdown timers for upcoming quizzes.
- [x] T016: Verify time-based quiz visibility logic.

## **Implementation Details**
- **Auth:** Client-side matching of `name` and `ID` in `students.json`.
- **Dashboard:** Three sections: "Upcoming", "Live", "Expired".
- **Timers:** `useEffect` and `setInterval` to handle real-time countdown.
- **Validation:** Quiz questions must not be accessible for "Upcoming" quizzes.
