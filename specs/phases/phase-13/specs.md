# Phase 13: Super Admin & Teacher Management

## **Goal**
Refactor the authentication system to support a Super Admin who manages Teachers and views the global state of the application.

## **Objectives**
- Implement Super Admin role (credentials via `.env`).
- Create `Teacher` model (Name, Email, Password, Status).
- Super Admin Dashboard:
    - CRUD for Teachers (Create, View, Delete).
    - Auto-generate random passwords for new Teachers.
    - Automatically send the generated password to the Teacher's email using existing Nodemailer logic.
- Global Quiz Visibility:
    - Super Admin can view a list of all quizzes created by all teachers (Title, Teacher Name, Date, Stats).
    - **Note:** Super Admin cannot "open" or edit the quiz questions/results; this is restricted to the owning teacher.

## **Technical Requirements**
- **Auth:** Distinct JWT roles for `SuperAdmin` and `Teacher`.
- **Database:** New `Teacher` collection in MongoDB.
- **Email:** Use the existing SMTP/Nodemailer system to notify new teachers of their credentials.
- **Access Control:** Super Admin dashboard route `/admin/super`.

## **Success Criteria**
- Super Admin can login and create a Teacher.
- The Teacher receives an email with their login password.
- Super Admin can see a list of all quizzes across the system.
