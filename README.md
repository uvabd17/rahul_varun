# LinkedIn Lite

A learning-focused, production-shaped web application. Micro-frontend UI in vanilla HTML/CSS/ES6+, Spring Boot microservices behind Eureka + API Gateway, MySQL for persistence, session-based auth (no JWT).

## Layout

```
rahul/
├── linkedin-lite/            Frontend micro-frontends
│   ├── shell-app/            Shell (nav, router, MFE loader)
│   ├── auth-mf/              Module 1 — register / login / logout
│   ├── shared/               httpClient, ui-components, tokens
│   └── event-bus/            In-browser pub/sub
│
└── linkedin-lite-backend/    Spring Boot microservices
    ├── eureka-server/        Service registry            :8761
    ├── api-gateway/          Single entry point          :8080
    ├── common-library/       Shared DTOs / enums
    └── user-service/         Module 1 — auth + users     :8081
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
mvn clean install -DskipTests           # build all modules once
mvn -pl eureka-server spring-boot:run   # terminal 1
mvn -pl api-gateway   spring-boot:run   # terminal 2
mvn -pl user-service  spring-boot:run   # terminal 3
```

**3. Frontend** (from `linkedin-lite/`)

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000/shell-app/`.

## API Docs

- Eureka dashboard — `http://localhost:8761`
- Swagger (user-service) — `http://localhost:8081/swagger-ui.html`
- All calls from the frontend go through the gateway — `http://localhost:8080/...`

## Modules

| # | Name           | Frontend        | Backend             | Status |
| - | -------------- | --------------- | ------------------- | ------ |
| 1 | Auth & User    | `auth-mf`       | `user-service`      | ✅ done |
| 2 | Profile        | `profile-mf`    | `user-service`      | ⏳ next |
| 3 | Posts          | `post-mf`       | `post-service`      | ⏳     |
| 4 | Connections    | `connection-mf` | `connection-service`| ⏳     |
| 5 | Jobs           | `job-mf`        | `job-service`       | ⏳     |

## Design reference

Full architecture, ER diagram, sequence diagrams: see the approved design doc.
