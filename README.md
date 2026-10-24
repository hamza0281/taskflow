# TaskFlow

A full-stack project management app built with the **MERN stack**. Teams can create projects, invite members, assign tasks, and track progress on a real-time drag-and-drop Kanban board.

**Live demo:** https://YOUR-FRONTEND-URL.onrender.com
**API:** https://taskflow-api-r361.onrender.com

> The backend runs on a free hosting plan and sleeps when idle. The first request after a quiet period can take 30 to 60 seconds. Please wait a moment and it will load.

**Demo login:** `demo@taskflow.com` / `demo1234` (or click "Try demo account" on the login page)

---

## Screenshots

| Landing page | Login |
|---|---|
| ![Landing](screenshots/landing.png) | ![Login](screenshots/login.png) |

| Dashboard | Kanban board |
|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Board](screenshots/board.png) |

---

## Features

**Authentication and security**
- Register and login with JWT authentication
- Passwords hashed with bcrypt
- Forgot / reset password with hashed, expiring (15 min), single-use tokens and email delivery
- Protected routes with auth middleware
- Security headers with `helmet` and rate limiting on auth routes

**Projects and teams**
- Create projects and invite members by email
- Owner controls: rename project, remove members, delete project
- Role-based access: only project members can see or change a project's tasks

**Kanban board**
- Drag and drop tasks between To Do, In Progress and Done
- Create, edit and delete tasks with priority, due date and assignee
- Task detail popup with description editing and comments
- Search and filters (text, priority, assignee, overdue only)
- Progress bar showing completion percentage

**Real-time and analytics**
- Live board updates for all members using Socket.io
- Activity log ("Riya moved Design homepage to Done")
- Dashboard stats and charts (tasks by status and priority) powered by a MongoDB aggregation endpoint

**UI and experience**
- Responsive design, light and dark mode
- Custom animated cursor that reacts to buttons, inputs and draggable tasks (desktop only)
- Toast notifications, loading skeletons, lazy-loaded pages, error boundary

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React (Vite), React Router, Axios, Recharts, @hello-pangea/dnd, Socket.io client, react-hot-toast, lucide-react |
| Backend | Node.js, Express, Socket.io, JWT, bcryptjs, helmet, express-rate-limit |
| Database | MongoDB with Mongoose (MongoDB Atlas in production) |
| Email | Brevo transactional email API |
| Hosting | Render (backend and static frontend) |

---

## Project structure

```
taskflow/
├── client/                     # React frontend
│   └── src/
│       ├── api.js              # Axios instance with auth token
│       ├── App.jsx             # Routes
│       ├── theme.css           # Design system, dark mode, cursor
│       ├── components/         # Navbar, TaskModal, StatsCharts, Cursor, ...
│       ├── context/            # AuthContext
│       └── pages/              # Landing, Login, Register, Dashboard, ProjectBoard, ...
└── server/                     # Express backend
    ├── config/                 # Database connection
    ├── controllers/            # Auth, project, task logic
    ├── middleware/             # JWT auth middleware
    ├── models/                 # User, Project, Task, Activity
    ├── routes/                 # API routes
    ├── utils/                  # Activity logger, email sender
    └── server.js
```

---

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/forgot-password` | Send reset link |
| PUT | `/api/auth/reset-password/:token` | Set a new password |
| GET / POST | `/api/projects` | List / create projects |
| GET | `/api/projects/stats` | Dashboard statistics (aggregation) |
| GET / PUT / DELETE | `/api/projects/:id` | View / rename / delete a project |
| POST | `/api/projects/:id/members` | Add a member by email |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member |
| GET | `/api/projects/:id/activity` | Recent activity |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/project/:projectId` | List a project's tasks |
| PUT / DELETE | `/api/tasks/:id` | Update / delete a task |
| POST | `/api/tasks/:id/comments` | Add a comment |

All routes except the auth routes require an `Authorization: Bearer <token>` header.

---

## Run it locally

**Requirements:** Node.js 18+ and a MongoDB database (local or MongoDB Atlas).

```bash
# 1. Clone the repo
git clone https://github.com/hamza0281/taskflow.git
cd taskflow

# 2. Backend
cd server
npm install
# create a .env file (see below)
npm run dev

# 3. Frontend (new terminal)
cd client
npm install
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### Environment variables

**`server/.env`**

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=use_a_long_random_string
CLIENT_URL=http://localhost:5173

# Optional, only for real emails (otherwise the reset link prints in the terminal)
BREVO_API_KEY=
EMAIL_FROM=
```

**`client/.env`** (only needed in production)

```
VITE_SERVER_URL=https://your-backend-url.onrender.com
```

---

## Deployment

- **Database:** MongoDB Atlas (free M0 cluster)
- **Backend:** Render Web Service. Root directory `server`, build `npm install`, start `npm start`
- **Frontend:** Render Static Site. Root directory `client`, build `npm install && npm run build`, publish directory `dist`, rewrite rule `/*` to `/index.html`

Both services redeploy automatically on every push to `main`.

---

## What I learned

- Designing a REST API with authentication, authorization and relational data in MongoDB
- Using MongoDB aggregation pipelines for analytics
- Building real-time features with Socket.io rooms
- Managing global state with React Context and optimistic UI updates for drag and drop
- Secure password reset flow with hashed, expiring tokens
- Deploying a full-stack app and handling cold starts, CORS and environment variables

---

## Future improvements

- Email invitations for new members
- Task attachments and labels
- Notifications for assigned tasks
- Unit and integration tests

---

## Author

**Hamza**
GitHub: [@hamza0281](https://github.com/hamza0281)
LinkedIn: add your link here

If you like this project, please give it a star.
