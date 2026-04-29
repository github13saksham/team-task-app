# 🚀 TeamTask: Enterprise Task Management System

TeamTask is a high-performance, role-based project management application designed for seamless collaboration. Built with a focus on speed (Optimistic UI) and premium aesthetics (Glassmorphism), it provides distinct workspaces for Administrators and Team Members.

![TeamTask Preview](https://raw.githubusercontent.com/github13saksham/team-task-app/main/preview.png) *(Add your screenshot here)*

## ✨ Key Features

### 👑 Admin Workspace (Executive Control)
*   **Executive Dashboard**: Global system health report, total task metrics, and project performance tracking.
*   **Project Management**: Create and delete workspaces with instant reflection.
*   **Team Invitation**: Invite members by email and manage permissions.
*   **Task Orchestration**: Create tasks, set priorities (Low/Medium/High), and assign them to specific team members.
*   **Smart Deletion**: Protect active data with logic that only allows deleting completed tasks or cleaning up duplicates.

### 👤 Member Workspace (Productivity Focused)
*   **Personal Workspace**: A dedicated view of assigned tasks and upcoming deadlines.
*   **Progress Tracking**: Real-time status updates (To Do → Progress → Done) with instant UI feedback.
*   **Overdue Alerts**: Automatic identification of tasks past their due dates.
*   **Team Collaboration**: View project health and team contributors at a glance.

## 🛠️ Tech Stack

*   **Frontend**: React.js, TypeScript, Vite, Lucide Icons, Date-fns.
*   **Styling**: Custom CSS (Premium Glassmorphism & Fluid Animations).
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL via Prisma ORM (Hosted on Neon).
*   **Authentication**: JWT (JSON Web Tokens) with Secure Password Hashing (Bcrypt).
*   **Performance**: Optimistic UI Updates for zero-lag interactions.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A PostgreSQL Database (Neon.tech recommended)

### 1. Clone the repository
```bash
git clone https://github.com/github13saksham/team-task-app.git
cd team-task-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_random_secret_key"
PORT=5000
```
Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL="http://localhost:5000/api"
```
Run the app:
```bash
npm run dev
```

## 🚆 Deployment (Railway)

This app is optimized for **Railway** deployment:
1.  Connect your GitHub repo to Railway.
2.  Set the Environment Variables in the Railway dashboard.
3.  The backend will automatically run `prisma generate && tsc` during build.
4.  After deployment, run `npx prisma migrate deploy` in the Railway terminal to sync your database.

## 📄 License
Distributed under the MIT License.

---
Created with ❤️ by Saksham Makhija
