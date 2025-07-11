# Quizzy 🧠💡  
An AI-powered quiz app that generates dynamic quizzes based on user-selected topics and difficulty levels using Gemini API.

🌐 *Live Demo*: [quizzy-project.vercel.app](https://quizzy-project.vercel.app/)

---

## 🚀 Features

- 💬 Choose your *name, topic, difficulty, and question count*
- ⚙ Uses *Google Gemini API* to dynamically generate quiz questions
- 🧠 Supports *MCQs* and *Fill in the Blank* for Expert level
- ✅ Real-time answer tracking with scoring
- 📥 Download results as a PDF
- 📊 Answer review with status (Correct/Incorrect)

---

## 🛠 Tech Stack

| Frontend          | Backend/API Integration     |
|-------------------|-----------------------------|
| React (Vite)      | Google Gemini 2.5 Pro API |
| Tailwind CSS      | Node.js (internal logic)    |
| React Router DOM  | Environment Variables (.env)|
| Vercel Hosting    | JSON Parsing + State Mgmt   |

---

## 🧑‍💻 Contributors

| Name                      | GitHub                     | Role         |
|---------------------------|----------------------------|--------------|
| Jaya Krishna Pavan Mummaneni     | [@jkplearner](https://github.com/jkplearner) | 🔧 Backend, API Integration |
| Srineela Reddy M         | [@srinime1806](https://github.com/srinime1806) | 🎨 Frontend & UI Design     |

---

## 🧪 How It Works

1. User fills in the *name, topic, difficulty, and number of questions*
2. Quizzy sends a prompt to *Gemini API* requesting formatted questions
3. Questions are rendered one-by-one (MCQ or FIB)
4. At the end, user sees *score* and *answer review*
5. Option to *download results as a PDF*

---

## 🗝 Environment Setup

Create a .env file in the root with your Gemini API key:
env
VITE_GEMINI_API_KEY=your_api_key_here

Clone the repository and install dependencies and run locally by using these commands 

npm install

To run the application

npm run dev

# 📦 Deployment
Frontend is deployed via Vercel

Backend handled inside frontend via secure Gemini fetch logic

No external database or server used — all state is client-managed
