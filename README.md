# FaceNova AI Attendance System

A production-minded face recognition attendance platform with a premium SaaS dashboard, Flask REST + WebSocket backend, React + Tailwind frontend, SQLite persistence, CSV export, and a webcam-driven dataset pipeline.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, shadcn-style UI, Framer Motion, React Webcam, TanStack Query, Recharts, Sonner
- Backend: Flask, Flask-Sock WebSockets, OpenCV, face_recognition, SQLAlchemy, JWT auth
- Data: SQLite by default, PostgreSQL-ready through `DATABASE_URL`
- Storage: `dataset/`, `encodings/encodings.pkl`, `attendance/*.csv`

## Features

- Admin authentication with seeded login
- Employee dataset creation from webcam captures
- Batch image capture flow with 24-frame default profile generation
- Encoding rebuild pipeline to `encodings.pkl`
- Realtime face recognition over WebSocket frame streaming
- Live attendance marking with duplicate prevention per day/session
- Attendance persistence in SQLite and CSV mirrors
- Premium dashboard with analytics, activity stream, system status, dark/light mode, and responsive layout

## Project Structure

```text
/backend
/frontend
/dataset
/encodings
/attendance
```

## Backend Setup

1. Create and activate a Python virtual environment inside `D:\MyProjects\CodeProjects\backend`.
2. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy environment variables:
   ```bash
   copy .env.example .env
   ```
4. Start the API server:
   ```bash
   python run.py
   ```

The backend runs on `http://localhost:5000`.

## Frontend Setup

1. Open `D:\MyProjects\CodeProjects\frontend`.
2. Install packages:
   ```bash
   npm install
   ```
   If PowerShell blocks `npm.ps1`, use `npm.cmd install`.
3. Copy frontend env values:
   ```bash
   copy .env.example .env
   ```
4. Start the Vite app:
   ```bash
   npm run dev
   ```
   If needed in PowerShell, use `npm.cmd run dev`.

The frontend runs on `http://localhost:5173`.

## Default Admin Login

- Email: `admin@facenova.ai`
- Password: `Admin@123`

Change these in `backend/.env` before production use.

## First Run Workflow

1. Start backend and frontend.
2. Sign in with the seeded admin account.
3. Open the Dataset page.
4. Enter the employee name, code, and optional department.
5. Click `Auto Capture` and collect 20 to 30 images.
6. Click `Save Person`.
7. Click `Rebuild Encodings`.
8. Return to Dashboard and click `Start Scan`.
9. Recognized faces will appear in the live preview and attendance ledger automatically.

## Production Notes

- Switch to PostgreSQL by setting `DATABASE_URL` to a PostgreSQL connection string.
- Replace the default `SECRET_KEY` and admin credentials.
- Put the Flask app behind Gunicorn or Waitress plus a reverse proxy that supports WebSockets.
- Store `dataset/`, `encodings/`, and `attendance/` on persistent volumes in deployment.
- For higher throughput, move recognition to a worker process or GPU-enabled service and keep the same WebSocket contract.

## API Highlights

- `POST /api/auth/login`
- `GET /api/system/overview`
- `POST /api/persons`
- `POST /api/persons/:id/images`
- `POST /api/encodings/rebuild`
- `GET /api/attendance/history`
- `GET /api/analytics/summary`
- `WS /ws/events`
- `WS /ws/recognition`

## Important Notes

- The backend relies on `face_recognition`, which requires native dependencies. On Windows, install the required Visual C++ build tools and CMake/dlib prerequisites if needed.
- This sandbox did not have Python installed, so runtime execution was not validated here. The codebase was assembled and checked structurally, but you should run the install and start commands locally to complete verification.
