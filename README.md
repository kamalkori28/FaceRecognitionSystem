<h1 align="center">🧠 FaceNova AI Attendance System</h1>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&pause=1000&color=00C2FF&center=true&vCenter=true&width=700&lines=AI+Powered+Face+Recognition+System;Real-time+Attendance+Tracking;Flask+%7C+React+%7C+WebSockets;Smart+%26+Scalable+SaaS+Dashboard" />
</p>

<p align="center">
  🚀 A <strong>production-ready AI attendance platform</strong> powered by face recognition with a sleek SaaS dashboard. <br/>
  Built using <strong>Flask</strong>, <strong>React</strong>, and <strong>WebSockets</strong> for real-time performance.
</p>

---

## ⚙️ Tech Stack  

### 🖥️ Frontend  
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Fast%20Build-purple?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Modern-blue?style=for-the-badge)
![Framer](https://img.shields.io/badge/Framer%20Motion-Animations-black?style=for-the-badge)

### 🔧 Backend  
![Flask](https://img.shields.io/badge/Flask-API-black?style=for-the-badge&logo=flask)
![WebSockets](https://img.shields.io/badge/WebSockets-RealTime-green?style=for-the-badge)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-red?style=for-the-badge)

### 🧠 AI & Data  
![face_recognition](https://img.shields.io/badge/face--recognition-AI-blue?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightgrey?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-blue?style=for-the-badge)

---

## ✨ Features  

✅ AI-based **face recognition attendance**  
✅ Real-time detection via **WebSocket streaming**  
✅ 📸 Webcam dataset creation (auto capture 20–30 images)  
✅ 🧬 Encoding pipeline (`encodings.pkl`)  
✅ 📊 Premium dashboard with analytics & charts  
✅ 🔐 Admin authentication (JWT-based)  
✅ 🗂️ Attendance stored in **SQLite + CSV export**  
✅ 🌙 Dark/Light mode UI  
✅ 📱 Fully responsive SaaS-style interface  

---

## 📁 Project Structure  

```bash
/backend        # Flask API + WebSocket server
/frontend       # React + Tailwind dashboard
/dataset        # Captured face images
/encodings      # Encoded face data
/attendance     # CSV attendance logs
```

---

## 🚀 Getting Started  

### 🔧 Backend Setup  

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env

python run.py
```

🌐 Backend runs on: `http://localhost:5000`

---

### 🎨 Frontend Setup  

```bash
cd frontend

npm install

copy .env.example .env

npm run dev
```

🌐 Frontend runs on: `http://localhost:5173`

---

## 🧪 First Run Workflow  

1. Start backend and frontend  
2. Login with admin account  
3. Go to Dataset page  
4. Add employee details  
5. Click **Auto Capture** 📸  
6. Save person  
7. Click **Rebuild Encodings**  
8. Start scan from dashboard  
9. 🎉 Attendance will be marked automatically  

---

## 📡 API Highlights  

```
POST   /api/auth/login
GET    /api/system/overview
POST   /api/persons
POST   /api/encodings/rebuild
GET    /api/attendance/history
GET    /api/analytics/summary
WS     /ws/events
WS     /ws/recognition
```

<p align="center">
  💡 Built for real-world AI deployment • Smart • Fast • Scalable
</p>