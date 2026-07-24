# LinkedIn Lite

A learning-focused, production-shaped web application. Micro-frontend UI in vanilla HTML/CSS/ES6+, Spring Boot microservices behind Eureka + API Gateway, MySQL for persistence, session-based auth (no JWT).

## Layout

```
rahul/
├── linkedin-lite/            Frontend micro-frontends (:3000)
│   ├── shell-app/            Shell (nav, router, MFE loader)
│   ├── auth-mf/              Module 1 — register / login / home
│   ├── profile-mf/           Module 2 — profile view + edit
│   ├── post-mf/              Module 3 — feed, create, edit, delete
│   ├── connection-mf/        Module 4 — find / accept / manage
│   ├── job-mf/               Module 5 — browse / apply / manage
│   ├── shared/               httpClient, ui-components, tokens
│   └── event-bus/            In-browser pub/sub
│
└── linkedin-lite-backend/    Spring Boot microservices
    ├── eureka-server/        Service registry              :8761
    ├── api-gateway/          Single entry point            :8080
    ├── common-library/       Shared DTOs / enums
    ├── user-service/         Modules 1+2 — auth + profile  :8081
    ├── post-service/         Module 3 — posts / feed       :8082
    ├── connection-service/   Module 4 — connections        :8083
    └── job-service/          Module 5 — jobs / apps        :8084
```

## Port map

| Port | What                          | URL                                   |
| ---- | ----------------------------- | ------------------------------------- |
| 3000 | Frontend (static)             | http://localhost:3000/shell-app/      |
| 8080 | API Gateway (public API)      | http://localhost:8080                 |
| 8761 | Eureka dashboard              | http://localhost:8761                 |
| 8081 | user-service (Swagger)        | http://localhost:8081/swagger-ui.html |
| 8082 | post-service (Swagger)        | http://localhost:8082/swagger-ui.html |
| 8083 | connection-service (Swagger)  | http://localhost:8083/swagger-ui.html |
| 8084 | job-service (Swagger)         | http://localhost:8084/swagger-ui.html |

All calls from the frontend go through the gateway. Direct-service URLs above are just for API docs.

## Prerequisites

- JDK 17
- Maven 3.9+
- **Either** MySQL 8 **or** nothing (H2 fallback profile ships in the repo)
- Python 3 (or any static file server) to serve the frontend

## Local run

### Backend

**1. Database — MySQL path**

```sql
CREATE DATABASE IF NOT EXISTS linkedin_lite
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Default dev credentials in `application-dev.yml` are `root` / `root`. Override with `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`.

**1. Database — H2 path (no install)**

Every service ships an `h2` Spring profile that swaps the JDBC URL for a file-backed H2 at `/tmp/linkedin-lite-h2/`. All four services share the same physical file via `AUTO_SERVER=TRUE`. Delete `/tmp/linkedin-lite-h2/` to reset all data.

**2. Build once**

```bash
cd linkedin-lite-backend
mvn clean install -DskipTests
```

**3. Start each service** (add `-Dspring-boot.run.profiles=h2` to every command below if using H2)

```bash
mvn -pl eureka-server      spring-boot:run    # terminal 1  → :8761
mvn -pl api-gateway        spring-boot:run    # terminal 2  → :8080
mvn -pl user-service       spring-boot:run    # terminal 3  → :8081
mvn -pl post-service       spring-boot:run    # terminal 4  → :8082
mvn -pl connection-service spring-boot:run    # terminal 5  → :8083
mvn -pl job-service        spring-boot:run    # terminal 6  → :8084
```

Order matters: start Eureka first, then anything else in any order.

### Frontend

```bash
cd linkedin-lite
python3 -m http.server 3000
```

Open **http://localhost:3000/shell-app/**.

### Stopping everything

If you launched each service in its own terminal, `Ctrl+C` each one.

If you backgrounded them (e.g. via `nohup java -jar … &` with the PID captured to `/tmp/ll-run/<name>.pid`):

```bash
for n in eureka gateway user post conn job web; do
  pid=$(cat /tmp/ll-run/$n.pid 2>/dev/null) && kill $pid 2>/dev/null && echo "killed $n ($pid)"
done
```

## Nav map

Once signed in the shell exposes these routes (hash-based, one MFE per):

| Route            | MFE            | Screen                                                          |
| ---------------- | -------------- | --------------------------------------------------------------- |
| `#/home`         | auth-mf        | Welcome + your identity card, admin sees the users table.       |
| `#/feed`         | post-mf        | Compose box + everyone's posts, tabs for Feed / My posts, search. |
| `#/connections`  | connection-mf  | Find people, incoming requests inbox, your accepted list.        |
| `#/jobs`         | job-mf         | Browse with filters, your applications, admin's Manage panel.    |
| `#/profile`      | profile-mf     | View + edit headline / about / skills / education / experience.  |
| `#/login`        | auth-mf        | Sign in.                                                         |
| `#/register`     | auth-mf        | Create account (with a "Create as admin" checkbox for demo).     |

## API surface (via `http://localhost:8080`)

**Auth & Users** — `user-service`
```
POST   /auth/register              create user + empty profile
POST   /auth/login                 → { sessionId, user }
POST   /auth/logout                marks session INACTIVE
GET    /users?q=                   search all users
GET    /users/{id}                 detail
PATCH  /users/{id}/status          admin: activate / deactivate
```

**Profile** — `user-service`
```
GET    /profile/me                 current user's profile
GET    /profile/{userId}           anyone's profile
PUT    /profile/{userId}           owner or admin — full update
POST   /profile/{userId}/picture   owner or admin — { url }
```

**Posts** — `post-service`
```
POST   /posts                      create
GET    /posts?q=                   feed with LIKE search
GET    /posts/user/{userId}        someone's posts
GET    /posts/{id}                 single
PUT    /posts/{id}                 owner or admin
DELETE /posts/{id}                 owner or admin (soft delete)
```

**Connections** — `connection-service`
```
POST   /connections/request        { receiverId }
GET    /connections                my accepted (either side)
GET    /connections/pending        incoming pending (I'm receiver)
PATCH  /connections/{id}/accept    receiver only
PATCH  /connections/{id}/reject    receiver only
DELETE /connections/{id}           either side may remove
GET    /connections/reports        admin: totals by status
```

**Jobs** — `job-service`
```
GET    /jobs?q=&type=&location=    search + filter
GET    /jobs/{id}                  detail
POST   /jobs                       admin
PUT    /jobs/{id}                  admin
PATCH  /jobs/{id}/status           admin — { status: OPEN | CLOSED }
DELETE /jobs/{id}                  admin
POST   /jobs/{id}/apply            user apply (409 duplicate, 400 if closed)
GET    /jobs/applied               my applications
GET    /jobs/{id}/applicants       admin
```

Every response uses the shared envelope `{ success, data, message, timestamp }`. Errors use `{ success:false, code, message, fieldErrors[], timestamp }`.

Every non-public endpoint requires an `X-Session-Id` header. The `HttpClient` in `linkedin-lite/shared/httpClient.js` attaches it automatically from `sessionStorage`.

## Seeding demo accounts

Nothing is auto-seeded. The quickest way to get accounts to poke around with is to run the shell script below once the whole stack is up. It creates one admin + two users, adds a post, sends a connection request, and posts a job:

```bash
GW=http://localhost:8080
sid_of() {
  curl -s -X POST $GW/auth/login -H "Content-Type: application/json" \
    -d "$1" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["sessionId"])'
}

# Register admin + 2 users
curl -s -X POST $GW/auth/register -H "Content-Type: application/json" \
  -d '{"firstName":"Vera","lastName":"Admin","email":"vera@example.com","password":"password123","role":"ADMIN"}' > /dev/null
curl -s -X POST $GW/auth/register -H "Content-Type: application/json" \
  -d '{"firstName":"Rahul","lastName":"Kumar","email":"rahul@example.com","password":"password123"}' > /dev/null
curl -s -X POST $GW/auth/register -H "Content-Type: application/json" \
  -d '{"firstName":"Priya","lastName":"Patel","email":"priya@example.com","password":"password123"}' > /dev/null

VERA=$(sid_of  '{"email":"vera@example.com","password":"password123"}')
RAHUL=$(sid_of '{"email":"rahul@example.com","password":"password123"}')

# Rahul writes a post
curl -s -X POST $GW/posts -H "Content-Type: application/json" -H "X-Session-Id: $RAHUL" \
  -d '{"content":"Shipping the LinkedIn Lite POC today!"}' > /dev/null

# Vera posts a job
curl -s -X POST $GW/jobs -H "Content-Type: application/json" -H "X-Session-Id: $VERA" \
  -d '{"title":"Backend Engineer","company":"Acme","location":"Bengaluru","description":"Spring Boot + microservices.","jobType":"FULL_TIME"}' > /dev/null

echo "Seeded. Sign in as vera@example.com / rahul@example.com / priya@example.com — all password123."
```

## Modules

| # | Name           | Frontend        | Backend             | Status |
| - | -------------- | --------------- | ------------------- | ------ |
| 1 | Auth & User    | `auth-mf`       | `user-service`      | ✅ done |
| 2 | Profile        | `profile-mf`    | `user-service`      | ✅ done |
| 3 | Posts          | `post-mf`       | `post-service`      | ✅ done |
| 4 | Connections    | `connection-mf` | `connection-service`| ✅ done |
| 5 | Jobs           | `job-mf`        | `job-service`       | ✅ done |

## Design reference

Full architecture, ER diagram, sequence diagrams: see the approved design doc that started this project.
