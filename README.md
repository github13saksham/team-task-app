# TeamTask - Project Management App

A full-stack team task management application with role-based access, project tracking, and dashboard analytics.

## 🚀 Features
- **Authentication**: Secure signup/login with JWT.
- **Project Management**: Create projects, add team members (Admin only).
- **Task Tracking**: Create tasks, assign priorities, set due dates, and track status.
- **Dashboard**: Real-time stats on total, pending, completed, and overdue tasks.
- **Role-Based Access**: Admins can manage projects; Members can manage tasks.
- **Modern UI**: Premium dark mode design with glassmorphism and smooth animations.

## ⚙️ Tech Stack
- **Frontend**: React (TypeScript), Vite, Vanilla CSS, Lucide React.
- **Backend**: Node.js, Express, TypeScript, Prisma.
- **Database**: PostgreSQL.
- **Deployment**: Railway.

## 🛠️ Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file (see `.env.example`).
4. `npx prisma generate`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a `.env` file (see `.env.example`).
4. `npm run dev`

## 🌐 Deployment
This app is designed to be deployed on Railway.
1. Connect your GitHub repo to Railway.
2. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`).
3. Railway will automatically detect the `package.json` files and deploy.

## 📝 License
MIT
