# 🎯 Quizzy — Secure & Automated Assessment Platform

> A modern, full-stack examination platform for educators — built with **Next.js** and **Node.js**.
> From bulk MCQ imports to instant grading and emailed results, all in one place.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

[![View Documentation](https://img.shields.io/badge/📖%20View%20Docs%20Online-4f8ef7?style=for-the-badge)](https://quizzy-guide.netlify.app/)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔒 **Secure Exams** | Tab-switch detection flags any attempt to leave the exam window |
| 📅 **Flexible Scheduling** | Define exact visibility windows and per-student attempt durations |
| ⚡ **Auto Grading** | MCQs marked instantly; short answers get a dedicated instructor review portal |
| 📧 **Email Reports** | Detailed HTML answer sheets sent to the instructor's Gmail on submission |
| 🎨 **Premium UI** | Polished, professional interface designed for academic environments |

---

## 🛠️ Setup Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Okashanadeem/Quizzy
cd Quizzy
```

---

### Step 2 — Configure Environment Variables

Navigate to `backend/` and create your `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Quizzy?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_URL=http://localhost:3000
```

> ⚠️ **Before deploying:** Update `CLIENT_URL` and `MONGODB_URI` with your live Vercel and Atlas URLs. Never push your `.env` file to GitHub.

---

### Step 3 — Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free **Shared Cluster**
2. Go to **Database Access** → create a user with **Read/Write** permissions
   - Avoid special characters (`@ # $`) in your password, or [URL-encode them](https://www.urlencoder.org/)
3. Go to **Network Access** → **Add IP Address** → select **Allow Access from Anywhere** `(0.0.0.0/0)`
4. Go to **Deployment → Database → Connect → Drivers**, copy the URI
   - Add `/Quizzy` before the `?` in the URI to name your database

Your final URI should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/Quizzy?retryWrites=true&w=majority
```

---

### Step 4 — Set Up Gmail App Password

Quizzy emails result sheets automatically. You must use a **Gmail App Password**, not your regular password.

1. Go to [Google Account Security](https://myaccount.google.com/security) and enable **2-Step Verification**
2. Search for **App Passwords** in your Google Account search bar
3. Click **Create** → select **Other** → name it `Quizzy` → click **Generate**
4. Copy the **16-digit code** and paste it into `GMAIL_APP_PASSWORD` in your `.env`

> 💡 **Tip:** The App Password is shown only once. Copy it immediately — if you lose it, generate a new one.

---

### Step 5 — Add Students

Students log in using credentials stored in a JSON file. Only students listed here can access the exam portal.

**File:** `backend/src/data/students.json`

```json
[
  { "id": "BSE-25F-001", "name": "Okasha Nadeem" },
  { "id": "BSE-25F-002", "name": "Muhammad Tabish" }
]
```

> ⚠️ After editing this file, **commit and push to GitHub** so the deployed frontend recognizes the new students.

---

## 🌐 Deployment

Quizzy is deployed as **two separate Vercel projects** — backend first, then frontend.

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure Quizzy for deployment"
git push origin main
```

### 2. Deploy the Backend

1. Go to [Vercel](https://vercel.com) → **Add New → Project**
2. Import the `backend/` folder from your repository
3. Add all keys from your `backend/.env` as **Environment Variables**
4. Click **Deploy** and copy the deployment URL (e.g. `https://quizzy-api.vercel.app`)

### 3. Deploy the Frontend

1. Go to [Vercel](https://vercel.com) → **Add New → Project**
2. Import the `frontendApp/` folder
3. Add this **Environment Variable:**

```env
NEXT_PUBLIC_API_URL=https://quizzy-api.vercel.app
```

4. Click **Deploy** — your platform is now live! 🎉

> ℹ️ After both are deployed, go back to your `backend/.env`, update `CLIENT_URL` to your live frontend URL, and redeploy the backend so CORS works correctly.

---

## 🔗 Quick Links

| Resource | Link |
|---|---|
| MongoDB Atlas | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) |
| Google Account Security | [myaccount.google.com/security](https://myaccount.google.com/security) |
| URL Encoder (for passwords) | [urlencoder.org](https://www.urlencoder.org/) |
| Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Developer GitHub | [github.com/Okashanadeem](https://github.com/Okashanadeem) |

---

## 👨‍💻 Developer

**Quizzy** is a premium solution developed with precision.

- **Lead Developer:** [Okasha Nadeem](https://github.com/Okashanadeem)
- **Role:** CR of BSSE Fall 2025
- **Institution:** SMIU
- **Brand:** A Product of **CAMS**

---

*For support or technical inquiries, visit the [developer's Portfolio](https://okashadev.vercel.app).*
