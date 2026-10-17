# Langar House

Management system for a free community kitchen: a public website, plus a staff dashboard for visitors, kitchen output and waste, inventory, expenses, attendance and reports.

```
langar-house/
├── frontend/   React 19 + Vite + Tailwind CSS 4 + Recharts   (from LANGAR_HOUSE_1/frontend)
└── backend/    Spring Boot 3.5 REST API on Supabase Postgres (from langar-house-backend)
```

Sign-in uses **Supabase Auth**. The frontend gets a Supabase session and sends its access token to the Spring Boot API as `Authorization: Bearer …`. The backend checks the token against Supabase's JWKS and reads the user's role from the `profiles` table. `ADMIN` can read and write; `STAFF` can only read. The UI hides write actions from staff to match.

## Quick start: demo mode (no setup)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and choose **Staff login → As admin** (or **As staff**). When Supabase isn't configured, the dashboard runs against an in-browser copy of the API (`src/lib/demoApi.js`). It has the same request/response shapes, computed fields and validation messages as the backend, seeded with 60 days of sample data. Edits are kept in your browser's localStorage; use **Reset** in the sidebar to start over.

## Running the full stack

1. **Backend.** Follow [backend/README.md](backend/README.md): create the `profiles` table, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` and `SUPABASE_PROJECT_URL`, then run it with `./mvnw spring-boot:run` (needs Java 17). It listens on port 8080 and allows CORS from `localhost:5173`.
2. **Frontend.** Copy `frontend/.env.example` to `frontend/.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. In development, leave `VITE_API_URL` empty: Vite proxies `/api/*` to `http://localhost:8080` (override with `BACKEND_URL`).
3. **Production.** Build with `VITE_API_URL=https://<your-backend-host>` and set the backend's `FRONTEND_URL` to the deployed frontend origin so CORS allows it.

## Frontend layout

| Path | What's there |
|------|--------------|
| `src/lib/api.js` | Typed client for every backend endpoint, plus auth header and error handling |
| `src/lib/demoApi.js` | In-browser stand-in for the API, used only in demo mode |
| `src/lib/useApi.js`, `useEditor.js` | Data loading, and the add/edit/delete modal state shared by the CRUD pages |
| `src/components/ui/` | Button, Modal, Table (search, sort, paging, empty/error states), StatCard, Field, Badge, Meter, toasts |
| `src/components/charts/` | Recharts wrappers; series colours are CSS tokens in `index.css`, with separate light and dark steps |
| `src/pages/` | Public site (Home, About, Impact, Gallery, Contact) and dashboard pages |

## API used by the frontend

| Page | Endpoints |
|------|-----------|
| Overview | `GET /api/dashboard/summary?date=`, `GET /api/visitors`, `GET /api/food` |
| Visitors | `GET/POST /api/visitors`, `PUT/DELETE /api/visitors/{id}` |
| Kitchen | `GET/POST /api/food`, `PUT/DELETE /api/food/{id}` |
| Inventory | `GET/POST /api/inventory`, `PUT/DELETE /api/inventory/{id}`, `PATCH /api/inventory/{id}/quantity` |
| Expenses | `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/{id}` |
| Attendance | `GET /api/attendance`, `GET /api/attendance/by-date`, `POST`, `PUT/DELETE /api/attendance/{id}`; staff names come from Supabase `profiles` |
| Reports | `GET` on visitors, food, expenses and attendance; CSV export happens in the browser |
