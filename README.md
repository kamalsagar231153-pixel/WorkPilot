# WorkPilot

A lightweight, multi-tenant task management SaaS — think a simplified Trello/Jira.
Each **Organization** is a tenant, and users only ever see and act on data that
belongs to their own organization. Built on the MERN stack.

**Live demo:** https://work-pilot-8zjx.vercel.app
**API:** https://work-pilot-five.vercel.app
**Repo:** https://github.com/kamalsagar231153-pixel/WorkPILOT

> First time? Use **Create a workspace** to sign up — that spins up a new
> organization with you as its admin.

---

## What it does

- Sign up / sign in with JWT auth. Signing up creates a fresh organization and
  makes you its admin.
- Create projects, and manage tasks on a drag-and-drop **Kanban board**
  (To do / In progress / Done).
- **Admins** can invite team members, set roles, and rename the organization.
  **Members** can only manage tasks.
- Strict per-organization data isolation — one tenant can never reach another
  tenant's projects, tasks, or users.

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Context API, Axios
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT, bcrypt,
  express-validator
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (client as a static site, server as a serverless function)

## How the multi-tenancy works

This is the core of the project, so it's worth spelling out:

1. On register, an Organization is created and the first user becomes its `admin`
   (done inside a MongoDB transaction so you never get an org with no user).
2. The signed **JWT carries `organizationId` and `role`**. The client never sends
   those — the server reads them off the verified token in the `auth` middleware
   and puts them on `req.user`.
3. **Every database query in the service layer is filtered by that
   `organizationId`.** Asking for another org's record just returns 404, so you
   can't even confirm it exists.
4. `requireRole('admin')` guards the admin-only routes (managing users, org
   settings).

The backend follows a normal route → controller → service → model split.

## Project structure

```
WorkPILOT/
├── client/        # React + Vite frontend
│   └── src/
│       ├── api/axios.js     # axios instance + interceptors + token store
│       ├── context/         # AuthContext, ToastContext
│       ├── services/        # thin API wrappers
│       ├── components/      # Layout, Modal, Icon, States, ProtectedRoute
│       └── pages/           # Login, Signup, Dashboard, TaskBoard, Team, Settings
└── server/        # Node/Express API
    ├── server.js            # app + startup (and the serverless entry)
    └── src/
        ├── config/db.js
        ├── models/          # Organization, User, Project, Task
        ├── middleware/      # auth, requireRole, validate, errorHandler
        ├── services/        # business logic + all DB access
        ├── controllers/     # thin req/res
        ├── routes/          # endpoints + validation rules
        └── utils/           # ApiError, asyncHandler
```

## Running locally

You need Node.js and a MongoDB connection string (local `mongod` or a free
MongoDB Atlas cluster).

**Backend**

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGO_URI + JWT_SECRET
npm run dev               # http://localhost:5000
```

`server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/workpilot
JWT_SECRET=<long random string, e.g. openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** (in a second terminal)

```bash
cd client
npm install
cp .env.example .env       # optional, defaults work for local dev
npm run dev                # http://localhost:5173
```

In dev, Vite proxies `/api` to the backend, so there's no CORS to deal with.
For a deployed build, set `VITE_API_URL` to the live API URL (with `/api` on the
end).

## API overview

Base `/api`. Protected routes need `Authorization: Bearer <token>`.

| Resource      | Endpoints                                                        |
|---------------|------------------------------------------------------------------|
| Auth          | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`        |
| Organizations | `GET /organizations/me`, `PUT /organizations/me` (admin)         |
| Users         | `GET /users`, `GET /users/:id`, `POST/PUT/DELETE /users/:id` (admin) |
| Projects      | `GET /projects`, `GET /projects/:id`, `POST/PUT/DELETE /projects` |
| Tasks         | `GET /tasks?projectId=`, `GET /tasks/:id`, `POST/PUT/DELETE /tasks` |

`status` is one of `todo` / `in-progress` / `done`. Errors come back as
`{ "success": false, "message": "..." }`.

## Deployment

Deployed as two Vercel projects from this one repo — the frontend (root
directory `client`, Vite) and the backend (root directory `server`, run as a
serverless function via `server/vercel.json`), with MongoDB Atlas as the
database. The full step-by-step is in `DEPLOYMENT.md`.

## Architecture notes (enterprise-stack comparison)

The same multi-tenant design maps onto an Angular + Java/Spring Boot stack:

- **Frontend state:** React Context/Redux ↔ Angular `BehaviorSubject` + singleton
  services.
- **Injecting the tenant token:** the Axios request interceptor here does the
  same job as an Angular `HttpInterceptor`.
- **Backend tenant context:** Express middleware (`req.user`) ↔ Spring Boot's
  `OncePerRequestFilter` + `ThreadLocal`.
- **Layering:** route → controller → service → model ↔ Spring Boot's
  Controller → Service → Repository.
