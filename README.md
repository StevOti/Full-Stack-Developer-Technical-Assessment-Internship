# SmartSeason Field Monitoring System

A web application for tracking crop progress across multiple fields during a growing season. Built with Django REST Framework (backend) and React (frontend), backed by PostgreSQL.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Design Decisions](#design-decisions)
- [Field Status Logic](#field-status-logic)
- [API Overview](#api-overview)
- [Demo Credentials](#demo-credentials)
- [3-Day Execution Plan](#3-day-execution-plan)
- [Assumptions Made](#assumptions-made)

---

## Project Overview

SmartSeason allows agricultural coordinators (Admins) and field workers (Field Agents) to manage and monitor crop fields through a growing season. Admins have a full overview of all fields and agents, while Field Agents only see and update their assigned fields.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Django 5.x + Django REST Framework |
| Auth       | JWT via `djangorestframework-simplejwt` |
| Frontend   | React 18 + Axios + React Router v6 |
| Database   | PostgreSQL                        |
| Styling    | Tailwind CSS                      |

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/your-username/smartseason.git
cd smartseason/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DB credentials

# Run migrations
python manage.py migrate

# Seed demo users
python manage.py seed_users

# Start the server
python manage.py runserver
```

The backend will be running at `http://localhost:8000`

### Frontend Setup

```bash
cd smartseason/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# REACT_APP_API_URL=http://localhost:8000/api

# Start the development server
npm start
```

The frontend will be running at `http://localhost:3000`

---

## Design Decisions

### 1. Separate Frontend and Backend (API-first)

Django serves a pure JSON REST API. React consumes it. This clean separation makes it easy to swap either layer independently and keeps concerns well-defined. CORS is handled via `django-cors-headers`.

### 2. JWT Authentication

Used `djangorestframework-simplejwt` for stateless authentication. On login, the client receives an access token and a refresh token. The access token is stored in `localStorage` and attached to every API request via an Axios interceptor. Role-based access is enforced at the API level using custom DRF permission classes (`IsAdminUser`, `IsFieldAgent`).

### 3. Role-Based Access Control

Two roles are defined at the model level on the `User` model:
- **Admin (Coordinator):** Can create fields, assign agents, view all fields, and monitor all updates.
- **Field Agent:** Can only view their assigned fields and submit stage updates or notes.

API views filter querysets automatically based on the requesting user's role — an agent calling `GET /api/fields/` only ever receives their own assigned fields.

### 4. Data Model

- `User` — extends Django's `AbstractUser` with a `role` field (`admin` / `agent`)
- `Field` — core entity with `name`, `crop_type`, `planting_date`, `stage`, `assigned_agent` (FK to User), `notes`, `updated_at`
- `FieldUpdate` — log of stage changes and notes submitted by agents (optional audit trail)

### 5. Computed Status (not stored)

Field status is computed at query time via a serializer method field, not persisted in the database. This ensures status always reflects the latest data without needing to run background jobs or triggers.

---

## Field Status Logic

Each field has a computed `status` property derived from its `stage` and timestamps. The logic is as follows:

| Status      | Condition                                                                 |
|-------------|---------------------------------------------------------------------------|
| `Completed` | `stage` is `Harvested`                                                    |
| `At Risk`   | `stage` is `Growing` AND more than 60 days have passed since `planting_date` without reaching `Ready` |
| `Active`    | All other cases — field is progressing normally                           |

**Implementation:** The `status` field is a `SerializerMethodField` on `FieldSerializer`. It calls a `get_status(field)` method that evaluates the conditions above in order: Completed → At Risk → Active. No database column is needed.

```python
def get_status(self, obj):
    if obj.stage == 'harvested':
        return 'Completed'
    days_since_planting = (date.today() - obj.planting_date).days
    if obj.stage == 'growing' and days_since_planting > 60:
        return 'At Risk'
    return 'Active'
```

---

## API Overview

| Method | Endpoint                  | Role        | Description                          |
|--------|---------------------------|-------------|--------------------------------------|
| POST   | `/api/auth/login/`        | Any         | Obtain JWT access + refresh tokens   |
| POST   | `/api/auth/refresh/`      | Any         | Refresh access token                 |
| GET    | `/api/fields/`            | Both        | List fields (scoped by role)         |
| POST   | `/api/fields/`            | Admin only  | Create a new field                   |
| GET    | `/api/fields/:id/`        | Both        | Retrieve field detail                |
| PATCH  | `/api/fields/:id/`        | Agent/Admin | Update stage or notes                |
| GET    | `/api/dashboard/`         | Both        | Summary stats (scoped by role)       |
| GET    | `/api/users/?role=agent`  | Admin only  | List all field agents                |

---

## Demo Credentials

| Role         | Email                  | Password    |
|--------------|------------------------|-------------|
| Admin        | admin@smartseason.com  | Test1234!   |
| Field Agent  | agent@smartseason.com  | Test1234!   |

> These are created by running `python manage.py seed_users`

---

## 3-Day Execution Plan

This project was built over 3 days following a structured plan. Below is the breakdown.

### Day 1 — Sunday 20 April: Backend Foundation

**Focus:** Django setup, models, auth, APIs, status logic

| Task | Details |
|------|---------|
| Project scaffold | `django-admin startproject`, create `users` and `fields` apps, set up virtual environment, install DRF, SimpleJWT, CORS, psycopg2 |
| Database & models | PostgreSQL setup. `User` model with role field. `Field` model with name, crop type, planting date, stage, assigned agent FK. Run migrations. |
| JWT auth endpoints | `POST /api/auth/login/` returns access + refresh tokens. Demo users seeded. |
| Field CRUD API | List (role-scoped), create (admin), update stage/notes (agent). Custom permission classes. |
| Field status logic | Computed `status` property in serializer: Active / At Risk / Completed. |
| Dashboard endpoint | `GET /api/dashboard/` returns total fields, status breakdown, stage breakdown — scoped by role. |

---

### Day 2 — Monday 21 April: Frontend Core

**Focus:** React app, auth flow, dashboards, field management UI

| Task | Details |
|------|---------|
| React app setup | `create-react-app`, install Axios + React Router. Folder structure: `/pages`, `/components`, `/services`, `/context`. |
| Auth context + login page | `AuthContext` with JWT in localStorage. Login form → redirect by role. `PrivateRoute` HOC for protected pages. |
| Admin dashboard | Summary cards (total, active, at-risk, completed). Table of all fields with status badges. |
| Agent dashboard | Same layout, scoped to assigned fields. Empty state for no assignments. |
| Field detail + update form | Stage dropdown + notes textarea for agents. PATCH to `/api/fields/:id/`. |
| Admin field management | Create field form. Assign agent dropdown from `/api/users/?role=agent`. |

---

### Day 3 — Tuesday 22 April: Polish + Submission

**Focus:** QA, deployment config, documentation, submission

| Task | Details |
|------|---------|
| End-to-end test run | Admin creates fields, assigns agents. Agent updates stages. Verify dashboard updates and At Risk logic. |
| CORS + deployment config | `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` in Django settings. React build. Optional: Railway/Render + Vercel. |
| README | Setup instructions, design decisions, status logic explanation, demo credentials. |
| Code cleanup | Remove logs, check `.gitignore`, add `.env.example`, verify API error handling. |
| GitHub repo | Push, confirm README renders, test clone → setup flow. |
| Email submission | Deadline: 25 April. Repo link + access details. |

---

## Assumptions Made

1. **Single agent per field** — each field is assigned to exactly one field agent. Many-to-many assignment was considered but kept out of scope for simplicity.
2. **No real-time updates** — dashboards refresh on page load. WebSockets were out of scope.
3. **Notes are additive** — each update appends a note rather than replacing it. This provides a lightweight audit trail.
4. **Planting date is the baseline for At Risk calculation** — in the absence of a `last_stage_changed_at` field, planting date is used as the reference point for the 60-day At Risk threshold.
5. **No email verification** — user accounts are created directly via the seed command or Django admin. No signup flow is implemented.
6. **SQLite acceptable for local dev** — the app is configured for PostgreSQL in production but falls back to SQLite for local development if no `DATABASE_URL` is set.
