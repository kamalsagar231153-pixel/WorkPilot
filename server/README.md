# WorkPilot — API

Backend for WorkPilot, a small multi-tenant task manager. Each Organization is a
tenant and everyone only ever sees their own org's data.

Stack: Node + Express, MongoDB/Mongoose, JWT auth, bcrypt, express-validator.

## How the tenant isolation works

- On register we create the Organization and make the first user its `admin`.
- The JWT carries `organizationId` and `role`. The client never sends those - we
  read them off the verified token in `auth` middleware (`req.user`).
- Every DB query in the services is filtered by that `organizationId`. Asking for
  another org's record just returns 404.
- `requireRole('admin')` locks down the admin-only routes.

Layout is the usual route -> controller -> service -> model split.

## Structure

```
server/
├── server.js                  # app + startup live here
└── src/
    ├── config/db.js
    ├── models/                # Organization, User, Project, Task
    ├── middleware/            # auth, requireRole, validate, errorHandler
    ├── services/              # business logic + all DB access
    ├── controllers/           # thin req/res
    ├── routes/                # endpoints + validation rules
    └── utils/                 # ApiError, asyncHandler
```

## Run it

```bash
cd server
npm install
cp .env.example .env     # then fill in MONGO_URI + JWT_SECRET
npm run dev              # nodemon, http://localhost:5000
```

`.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/workpilot
JWT_SECRET=<long random string, e.g. openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

You need a MongoDB - local `mongod` or a free Atlas cluster. Health check is
`GET /api/health`.

## Endpoints

Base `/api`. Protected routes need `Authorization: Bearer <token>`.

Auth
- `POST /auth/register`  `{ name, orgName, email, password }` -> creates org + admin
- `POST /auth/login`     `{ email, password }`
- `GET  /auth/me`        current user + org

Organizations
- `GET /organizations/me`
- `PUT /organizations/me`  (admin) `{ name }`

Users (your org only)
- `GET /users`  /  `GET /users/:id`
- `POST /users`        (admin) `{ name, email, password, role? }`
- `PUT /users/:id`     (admin) `{ name?, role? }`
- `DELETE /users/:id`  (admin, can't delete yourself)

Projects
- `GET /projects` / `GET /projects/:id`
- `POST /projects`        `{ name, description? }`
- `PUT /projects/:id`     `{ name?, description? }`
- `DELETE /projects/:id`  (also drops its tasks)

Tasks
- `GET /tasks` (filter with `?projectId=`) / `GET /tasks/:id`
- `POST /tasks`        `{ title, projectId, description?, status?, assignee? }`
- `PUT /tasks/:id`     `{ title?, description?, status?, assignee?, projectId? }`
- `DELETE /tasks/:id`

`status` is one of `todo` / `in-progress` / `done`.

Errors come back as `{ "success": false, "message": "..." }`.
