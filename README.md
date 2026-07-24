# LinkedIn Lite

A learning-focused, production-shaped web application. Micro-frontend UI in vanilla HTML/CSS/ES6+, Spring Boot microservices behind Eureka + API Gateway, MySQL for persistence, session-based auth (no JWT).

## Layout

```
rahul/
├── linkedin-lite/            Frontend micro-frontends
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
    ├── user-service/         Module 1+2 — auth + profile   :8081
    ├── post-service/         Module 3 — posts / feed       :8082
    ├── connection-service/   Module 4 — connections        :8083
    └── job-service/          Module 5 — jobs / apps        :8084
```

Later modules (profile / posts / connections / jobs) plug into the same layout.

## Prerequisites

- JDK 17
- Maven 3.9+
- MySQL 8
- Python 3 (or any static file server) to serve the frontend

## Local run

**1. Database**

```sql
CREATE DATABASE IF NOT EXISTS linkedin_lite
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Default dev credentials in `application-dev.yml` are `root` / `root`. Override with `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` if needed.

**2. Backend** (from `linkedin-lite-backend/`)

```bash
mvn clean install -DskipTests                  # build all modules once
mvn -pl eureka-server      spring-boot:run     # terminal 1
mvn -pl api-gateway        spring-boot:run     # terminal 2
mvn -pl user-service       spring-boot:run     # terminal 3
mvn -pl post-service       spring-boot:run     # terminal 4
mvn -pl connection-service spring-boot:run     # terminal 5
mvn -pl job-service        spring-boot:run     # terminal 6
```

No MySQL? Add `-Dspring-boot.run.profiles=h2` to every service — they share
one file-backed H2 database via `AUTO_SERVER=TRUE` (at `/tmp/linkedin-lite-h2/`).
Delete that directory to reset all data.

**3. Frontend** (from `linkedin-lite/`)

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000/shell-app/`.

## API Docs

- Eureka dashboard — `http://localhost:8761`
- Swagger — one per service:
  - `http://localhost:8081/swagger-ui.html` (user-service)
  - `http://localhost:8082/swagger-ui.html` (post-service)
  - `http://localhost:8083/swagger-ui.html` (connection-service)
  - `http://localhost:8084/swagger-ui.html` (job-service)
- All calls from the frontend go through the gateway — `http://localhost:8080/...`

## Modules

| # | Name           | Frontend        | Backend             | Status |
| - | -------------- | --------------- | ------------------- | ------ |
| 1 | Auth & User    | `auth-mf`       | `user-service`      | ✅ done |
| 2 | Profile        | `profile-mf`    | `user-service`      | ✅ done |
| 3 | Posts          | `post-mf`       | `post-service`      | ✅ done |
| 4 | Connections    | `connection-mf` | `connection-service`| ✅ done |
| 5 | Jobs           | `job-mf`        | `job-service`       | ✅ done |

## Design reference

Full architecture, ER diagram, sequence diagrams: see the approved design doc.
