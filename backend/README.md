# Langar House — Backend Management System

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.12-6DB33F?style=flat&logo=spring-boot)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-316192?style=flat&logo=postgresql)
![Deployed](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat&logo=render)

A REST API backend for managing daily langar (community kitchen) operations — including visitor tracking, food waste analytics, inventory alerts, expense management, and staff attendance — secured with Supabase JWT authentication and role-based access control.
<img width="1627" height="855" alt="image" src="https://github.com/user-attachments/assets/25972e45-9cb4-4dbf-9938-1442ff7752b9" />

---

## Features

- **JWT Authentication** — Supabase ES256 JWT verification via JWKS (no custom auth system)
- **Role-Based Access Control** — ADMIN (full CRUD) and STAFF (read-only), enforced server-side
- **Dashboard API** — Aggregated daily summary across all modules
- **Food Waste Analytics** — Computed consumption and efficiency (prepared − wasted)
- **Low Stock Alerts** — Threshold-based inventory detection
- **Duplicate Prevention** — Staff cannot be marked present twice on the same date
- **Rate Limiting** — 100 requests/minute per IP
- **Global Exception Handling** — Clean JSON error responses
- **Swagger UI** — Interactive API documentation at `/swagger-ui.html`
- **Pagination** — All list endpoints support `page` and `size` parameters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.12 |
| Security | Spring Security 6 + JJWT 0.12.6 |
| Database | PostgreSQL (Supabase) |
| ORM | Hibernate / Spring Data JPA |
| Auth | Supabase Auth (ES256 JWT) |
| API Docs | Springdoc OpenAPI / Swagger UI |
| Deployment | Render |
| Build | Maven |

---

## Architecture

```
Client
  ↓ Bearer JWT
RateLimitFilter     → 100 req/min per IP
JwtAuthFilter       → Verify ES256 via Supabase JWKS
SecurityConfig      → ADMIN / STAFF route enforcement
  ↓
Controller → Service → Repository → Supabase PostgreSQL
```

**Pattern:** Controller (HTTP) → Service (business logic) → Repository (data) → Database

---

## Security Model

- No custom login/register — Supabase Auth handles all user management
- JWT uses ES256 asymmetric signing — verified using Supabase public JWKS
- Roles stored in `profiles` table and fetched on every request
- Stateless — no server-side sessions

| HTTP Method | ADMIN | STAFF |
|-------------|-------|-------|
| GET | ✅ | ✅ |
| POST / PUT / DELETE | ✅ | ❌ |

---

## Modules & Endpoints

### Visitors `/api/visitors`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visitors` | All visitor logs |
| GET | `/api/visitors/by-date?date=YYYY-MM-DD` | Filter by date |
| GET | `/api/visitors/paged?page=0&size=10` | Paginated |
| POST | `/api/visitors` | Create log |
| PUT | `/api/visitors/{id}` | Update |
| DELETE | `/api/visitors/{id}` | Delete |

### Food Prepared `/api/food`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | All records (includes computed consumed + efficiency) |
| GET | `/api/food/by-date?date=` | Filter by date |
| POST | `/api/food` | Create (validates wasted ≤ prepared) |
| PUT | `/api/food/{id}` | Update |
| DELETE | `/api/food/{id}` | Delete |

### Inventory `/api/inventory`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/low-stock` | Items below threshold |
| GET | `/api/inventory/category/{category}` | By category |
| POST | `/api/inventory` | Add item |
| PATCH | `/api/inventory/{id}/quantity?quantity=` | Update stock only |

### Expenses `/api/expenses`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/by-date?date=` | Filter by date |
| GET | `/api/expenses/total?date=` | Total spend for a date |
| POST | `/api/expenses` | Create (auto-computes total = qty × price) |

### Attendance `/api/attendance`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/by-date?date=` | By date |
| GET | `/api/attendance/present-count?date=` | Count present staff |
| POST | `/api/attendance` | Mark (rejects duplicates) |

### Dashboard `/api/dashboard`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary?date=` | Visitors, food, expenses, inventory, attendance |

---

## Local Setup

### Prerequisites
- Java 17+, Maven 3.8+, a Supabase project

### 1. Clone
```bash
git clone https://github.com/yourusername/langar-house-backend.git
cd langar-house-backend
```

### 2. Supabase — create profiles table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF'
        CHECK (role IN ('ADMIN', 'STAFF')),
    full_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO profiles (id, role, full_name)
VALUES ('your-user-uuid', 'ADMIN', 'Your Name');
```

### 3. Create `src/main/resources/application-local.yaml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.xxxx.supabase.co:5432/postgres
    username: postgres
    password: YOUR_DB_PASSWORD
supabase:
  jwt:
    secret: YOUR_JWT_SECRET
  project:
    url: https://xxxx.supabase.co
```

### 4. Run
In IntelliJ: **Run → Edit Configurations → Active profiles → `local`**
```bash
mvn spring-boot:run
```

### 5. Get a test JWT
```bash
curl -X POST 'https://xxxx.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@email.com","password":"pass","grant_type":"password"}'
```
Use the `access_token` as `Authorization: Bearer <token>` on all requests.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | JDBC PostgreSQL URL from Supabase |
| `DB_USERNAME` | Always `postgres` |
| `DB_PASSWORD` | Supabase database password |
| `SUPABASE_JWT_SECRET` | From Supabase → Settings → API |
| `SUPABASE_PROJECT_URL` | e.g. `https://xxxx.supabase.co` |

---

## Project Structure

```
src/main/java/com/langarhouse/backend/
├── visitor/          Visitor tracking
├── food/             Food prepared + waste analytics
├── inventory/        Stock + low-stock detection
├── expense/          Expense tracking
├── attendance/       Staff attendance
├── dashboard/        Aggregated summary
├── profile/          User roles
├── security/         JWT filter + rate limiter
├── config/           OpenAPI / Swagger
└── exception/        Global error handler
```

---

## API Documentation

Swagger UI (live): `https://your-render-url.onrender.com/swagger-ui.html`

Local: `http://localhost:8080/swagger-ui.html`
