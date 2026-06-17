# WorkPilot — Web client

React + Vite frontend for WorkPilot. Talks to the Node/Express API.

Stack: React 18, React Router v6, Context API for the session, Axios, and a
hand-rolled CSS theme (no UI kit). Fonts are Fraunces + Hanken Grotesk; the
palette is the green -> teal -> cyan -> navy brand spectrum.

## What's here

- Protected routes - logged-out users get sent to `/login`; `/team` and
  `/settings` are admin-only behind an `AdminRoute`.
- `AuthContext` keeps the session, decodes the JWT for role/org, exposes
  `isAdmin`, `organization`, etc.
- One Axios instance: a request interceptor adds the token to every call, a
  response interceptor clears the token and redirects on a 401.
- Pages: login, signup, projects dashboard, a drag-and-drop Kanban board per
  project, plus Team and Settings for admins.
- Every data screen has loading / error (with retry) / empty states, and
  actions confirm with a toast.

## Run it

Backend needs to be running first (default `http://localhost:5000`).

```bash
cd client
npm install
cp .env.example .env     # optional, defaults are fine for local dev
npm run dev              # http://localhost:5173
```

In dev, Vite proxies `/api` to the backend so there's no CORS to deal with.

## Build

```bash
npm run build            # outputs to dist/
```

For a deployed build set `VITE_API_URL` to the live backend URL before building.
It's an SPA, so host it with a catch-all rewrite to `/index.html` (on Netlify a
`_redirects` file with `/*  /index.html  200`; on Vercel a rewrite of `/(.*)` ->
`/index.html`).

## Structure

```
client/src/
├── main.jsx            # boot + providers
├── App.jsx             # routes + guards
├── api/axios.js        # axios instance + interceptors + token store
├── context/            # AuthContext, ToastContext
├── services/           # thin API wrappers
├── components/         # Layout, Modal, Icon, States, ProtectedRoute
└── pages/              # Login, Signup, Dashboard, TaskBoard, Team, Settings
```
