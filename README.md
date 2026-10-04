<<<<<<< HEAD
# BrightMart-IMS
=======
# BrightMart Inventory Management System

## Overview

BrightMart Inventory Management System is a multi-container Dockerized application for managing inventory, products, suppliers, stock movements, and authenticated administrative operations. The repository combines a React frontend, a Django REST API, an Nginx gateway, and a persistent MySQL database.

## Service architecture

| Service | Directory / image | Purpose |
| --- | --- | --- |
| `frontend` | `frontend/` | Builds and serves the React user interface with Nginx. |
| `inventory-service` | `inventory-service/` | Django REST Framework API, JWT authentication, admin site, and Gunicorn WSGI server. |
| `gateway` | `gateway/` | Nginx reverse proxy that exposes the application on port 80 and routes UI and API requests. |
| `db` | MySQL 8 image | Persistent relational database backed by the `mysql_data` named volume. |

All services communicate over the `brightmart-net` Docker bridge network. The gateway routes `/` to the frontend and `/api/` and `/admin/` to the inventory service.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- Docker Compose (included with current Docker Desktop and Docker Engine installations)
- Git

## Quickstart

### 1. Clone and configure the environment

Clone the repository and enter its root directory:

```bash
git clone <repository-url>
cd BrightMart-IMS
```

Create a local environment file from the safe template:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the placeholder secret and database passwords. Do not commit `.env` or real credentials.

### 2. Build and launch the containers

```bash
docker compose up --build -d
```

### 3. Check status and logs

List the service status:

```bash
docker compose ps
```

Follow logs from all services:

```bash
docker compose logs -f
```

To follow one service only, for example the API:

```bash
docker compose logs -f inventory-service
```

### 4. Run Django database migrations

After the database health check has passed, run migrations inside the running Django container:

```bash
docker compose exec inventory-service python manage.py migrate
```

### 5. Access the application

- Web application: <http://localhost>
- Django admin: <http://localhost/admin/>
- REST API: <http://localhost/api/>

## Stopping the application

Stop and remove the containers while preserving the named database volume:

```bash
docker compose down
```

To remove the database volume as well, which permanently deletes local MySQL data:

```bash
docker compose down -v
```
>>>>>>> 1c9281f (Task 6: BrightMart IMS containerized application release)
