# Krawallbruder – Projektdokumentation

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Tech-Stack](#2-tech-stack)
3. [Projektstruktur](#3-projektstruktur)
4. [Lokale Entwicklung](#4-lokale-entwicklung)
5. [Backend (Symfony API)](#5-backend-symfony-api)
6. [Frontend (React/Vite)](#6-frontend-reactvite)
7. [Admin-Panel](#7-admin-panel)
8. [VServer-Deployment](#8-vserver-deployment)
9. [GitHub Actions CI/CD](#9-github-actions-cicd)
10. [SSL mit Let's Encrypt](#10-ssl-mit-lets-encrypt)
11. [Umgebungsvariablen](#11-umgebungsvariablen)

---

## 1. Projektübersicht

Krawallbruder ist ein persönlicher Motorrad-Blog mit folgenden Inhalten:

- **Blog** – Tourenberichte, Konzerte, Reisebeschreibungen
- **Bikes** – Vorstellung der eigenen Motorräder mit Galerie und technischen Daten
- **YouTube** – Eingebettete Videos
- **About** – Über den Autor

---

## 2. Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | React 18, Vite, React Router |
| Backend | Symfony 7, API Platform 3 |
| Datenbank | PostgreSQL 16 |
| Webserver | Nginx (Docker) |
| PHP | PHP 8.2-FPM |
| Containerisierung | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| SSL | Let's Encrypt / Certbot |

---

## 3. Projektstruktur

```
krawallbruder/
├── .github/workflows/deploy.yml     # CI/CD Pipeline
├── .env.prod.example                # Vorlage für Prod-Secrets
├── docker-compose.yml               # Lokale Dev-Umgebung
├── docker-compose.prod.yml          # Produktions-Compose
├── Makefile                         # Shortcuts: make up/down/install/dev
├── logo.png
│
├── backend/                         # Symfony 7 + API Platform 3
│   ├── config/
│   │   ├── bundles.php
│   │   └── packages/
│   │       ├── nelmio_cors.yaml
│   │       └── ...
│   ├── migrations/                  # Doctrine-Migrationen
│   ├── public/index.php             # Symfony Entry-Point
│   └── src/
│       ├── Controller/
│       │   └── AdminAuthController.php  # Login-Endpoint
│       ├── Entity/                  # Doctrine-Entities
│       ├── DataFixtures/            # Testdaten (nur dev)
│       └── Security/
│
├── frontend/                        # React/Vite
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Blog.jsx / BlogPost.jsx
│       │   ├── Bikes.jsx / BikeDetail.jsx
│       │   ├── YoutubeVideos.jsx
│       │   ├── AboutMe.jsx
│       │   └── admin/               # Admin-Panel
│       ├── components/              # Header, Footer, etc.
│       └── services/api.js          # Axios-Wrapper
│
└── docker/
    ├── nginx/
    │   ├── Dockerfile.prod          # Multi-Stage: Node Build + Nginx
    │   ├── nginx.conf               # Dev-Config
    │   └── nginx.prod.conf          # Prod-Config
    └── php/
        ├── Dockerfile               # Dev: PHP-FPM
        ├── Dockerfile.prod          # Prod: PHP-FPM, Code im Image
        └── opcache.ini
```

---

## 4. Lokale Entwicklung

### Voraussetzungen

- Docker + Docker Compose
- Node.js 18+

### Start

```bash
# Alle Container starten (Backend + Datenbank + Nginx + Adminer)
make up
# oder: docker-compose up -d --build

# Frontend-Dependencies installieren (einmalig)
make install
# oder: cd frontend && npm install

# Frontend Dev-Server starten (Hot Reload)
make dev
# oder: cd frontend && npm run dev
```

### Erster Start: Datenbank einrichten

```bash
# Migration erstellen (nur wenn neue Entities angelegt wurden)
docker-compose exec php php bin/console doctrine:migrations:diff

# Migrationen ausführen
docker-compose exec php php bin/console doctrine:migrations:migrate --no-interaction

# Testdaten laden
docker-compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

### Zugriff

| Dienst | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080/api |
| API Docs | http://localhost:8080/api/docs |
| Adminer (DB) | http://localhost:8081 |

---

## 5. Backend (Symfony API)

### Entities

| Entity | Beschreibung |
|--------|-------------|
| `BlogPost` | Blogartikel mit Titel, Inhalt, Bilder, Kategorie, Bike-Referenz |
| `Bike` | Motorrad mit Beschreibung, technischen Daten, Galerie |
| `YouTubeVideo` | YouTube-Link mit Thumbnail und Bike-Referenz |
| `AboutPage` | Über-mich-Seite (Singleton) |

### API-Endpunkte (API Platform)

```
GET  /api/blog_posts          # Alle Blog-Posts (paginiert)
GET  /api/blog_posts/{id}     # Einzelner Post
GET  /api/bikes               # Alle Bikes
GET  /api/bikes/{id}          # Einzelnes Bike
GET  /api/you_tube_videos     # Alle Videos
GET  /api/about_pages         # About-Inhalt

POST /api/admin/login         # Admin-Login → gibt Token zurück
```

### Authentifizierung

Der Admin nutzt **kein Datenbank-User**, sondern Umgebungsvariablen:

```
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
ADMIN_TOKEN=...   # wird bei Login zurückgegeben, dann als Bearer-Token gesendet
```

### Neue Migration erstellen

```bash
docker-compose exec php php bin/console doctrine:migrations:diff
```

---

## 6. Frontend (React/Vite)

### Routing

| Pfad | Seite |
|------|-------|
| `/` | Startseite |
| `/blog` | Blog-Übersicht |
| `/blog/:slug` | Blog-Artikel |
| `/bikes` | Bike-Übersicht |
| `/bikes/:slug` | Bike-Detail |
| `/videos` | YouTube-Videos |
| `/about` | Über mich |
| `/geheim-admin/login` | Admin-Login |
| `/geheim-admin/*` | Admin-Panel |

### API-Kommunikation

`frontend/src/services/api.js` – Axios-Wrapper, liest `VITE_API_URL` aus der Umgebung.

### Build

```bash
cd frontend
npm run build
# → dist/ enthält die statischen Dateien
```

---

## 7. Admin-Panel

**Login-URL:** `/geheim-admin/login`

Nach dem Login (mit Username/Passwort aus den Env-Variablen) wird ein Token gespeichert und bei allen Admin-API-Requests als `Authorization: Bearer <token>` mitgesendet.

**Funktionen:**

- Blog-Posts erstellen, bearbeiten, löschen
- Bikes verwalten (inkl. Bilder-Upload und Galerie-Sortierung)
- Bild-Upload direkt im Browser

---

## 8. VServer-Deployment

### Voraussetzungen auf dem Server

- Ubuntu/Debian Linux
- Docker + Docker Compose V2
- Git
- Nginx (Host-Level, für SSL-Terminierung)
- Certbot

### Ersteinrichtung (einmalig)

```bash
# Als root oder sudo-User

# Deploy-User anlegen
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# SSH-Key für GitHub Actions hinterlegen
su - deploy
mkdir -p ~/.ssh
echo "DEIN_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Projekt klonen
cd /home/deploy
git clone https://github.com/DEIN_USER/krawallbruder.git
cd krawallbruder

# Produktions-Umgebungsvariablen anlegen
cp .env.prod.example .env.prod
nano .env.prod
# → alle Platzhalter ersetzen (siehe Abschnitt 11)
```

### .env.prod befüllen

```bash
# Zufällige Secrets generieren:
openssl rand -hex 32    # für APP_SECRET
openssl rand -hex 32    # für ADMIN_TOKEN
```

Dann in `.env.prod` eintragen (siehe [Abschnitt 11](#11-umgebungsvariablen)).

### Manueller Erststart

```bash
cd /home/deploy/krawallbruder

# Images bauen
VITE_API_URL=https://deine-domain.de \
docker compose --env-file .env.prod -f docker-compose.prod.yml build

# Container starten
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

# Migrationen ausführen
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T php \
  php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

### Nützliche Docker-Befehle auf dem Server

```bash
cd /home/deploy/krawallbruder

# Status aller Container
docker compose -f docker-compose.prod.yml ps

# Logs anzeigen
docker compose -f docker-compose.prod.yml logs -f php
docker compose -f docker-compose.prod.yml logs -f nginx

# PHP-Container neu starten (z.B. nach .env.prod-Änderung)
docker compose --env-file .env.prod -f docker-compose.prod.yml restart php

# Alles stoppen
docker compose -f docker-compose.prod.yml down

# Alte Images aufräumen
docker image prune -f
```

### Architektur Produktion

```
Internet
    │
    ▼
Host-Nginx (Port 443, SSL)
    │  proxy_pass http://127.0.0.1:8080
    ▼
Docker-Nginx (Port 8080, intern)
    ├── /api/* → PHP-FPM (php:9000, Symfony)
    └── /*     → React SPA (statische Dateien)
          │
          ▼
    PostgreSQL (nur intern erreichbar)
```

---

## 9. GitHub Actions CI/CD

### Ablauf bei Push auf `master`

1. SSH-Verbindung zum VServer via `appleboy/ssh-action`
2. `git pull origin master`
3. Docker-Images bauen (`--no-cache`)
4. Container neu starten (`up -d --remove-orphans`)
5. 5 Sekunden warten
6. Doctrine-Migrationen ausführen
7. Alte Images aufräumen (`docker image prune -f`)

### Benötigte GitHub Secrets

| Secret | Beschreibung |
|--------|-------------|
| `SSH_HOST` | IP oder Domain des VServers |
| `SSH_PORT` | SSH-Port (meist `22`) |
| `SSH_USER` | SSH-Benutzername (z.B. `deploy` oder `root`) |
| `SSH_PRIVATE_KEY` | Privater SSH-Key (mehrzeilig, komplett mit Header) |
| `REMOTE_APP_PATH` | Pfad zum Projektverzeichnis auf dem Server |
| `VITE_API_URL` | Produktions-URL der API (z.B. `https://krawallbruder.de`) |

### Secrets setzen (GitHub CLI)

```bash
gh secret set SSH_HOST --body "1.2.3.4"
gh secret set SSH_PORT --body "22"
gh secret set SSH_USER --body "deploy"
gh secret set REMOTE_APP_PATH --body "/home/deploy/krawallbruder"
gh secret set VITE_API_URL --body "https://krawallbruder.de"

# SSH-Key (Windows PowerShell):
Get-Content ~/.ssh/id_ed25519 -Raw | gh secret set SSH_PRIVATE_KEY
# SSH-Key (Linux/macOS):
cat ~/.ssh/id_ed25519 | gh secret set SSH_PRIVATE_KEY
```

---

## 10. SSL mit Let's Encrypt

### Host-Nginx konfigurieren

Datei anlegen: `/etc/nginx/sites-available/krawallbruder`

```nginx
server {
    listen 80;
    server_name krawallbruder.de www.krawallbruder.de;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Symlink aktivieren
ln -s /etc/nginx/sites-available/krawallbruder /etc/nginx/sites-enabled/

# Konfiguration testen und Nginx neuladen
nginx -t && systemctl restart nginx

# SSL-Zertifikat ausstellen (Certbot ergänzt nginx-Config automatisch)
certbot --nginx -d krawallbruder.de -d www.krawallbruder.de
```

Certbot richtet automatisch die HTTPS-Weiterleitung ein und erneuert das Zertifikat per Cronjob.

---

## 11. Umgebungsvariablen

### `.env.prod` (auf dem VServer, NICHT in Git)

```env
# Symfony
APP_ENV=prod
APP_SECRET=<openssl rand -hex 32>
APP_BASE_URL=https://krawallbruder.de
CORS_ALLOW_ORIGIN=https://krawallbruder.de

# Admin-Login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<sicheres_passwort>
ADMIN_TOKEN=<openssl rand -hex 32>

# Datenbank (PostgreSQL im Docker-Netzwerk)
DATABASE_URL="postgresql://kb_user:SICHERES_PASSWORT@database:5432/krawallbruder?serverVersion=16&charset=utf8"

# PostgreSQL Container-Variablen
POSTGRES_DB=krawallbruder
POSTGRES_USER=kb_user
POSTGRES_PASSWORD=SICHERES_PASSWORT

# Frontend-URL (wird beim Docker Build übergeben)
VITE_API_URL=https://krawallbruder.de
```

> **Wichtig:** `POSTGRES_PASSWORD` muss in `DATABASE_URL` und `POSTGRES_PASSWORD` identisch sein.

### `.env` (Backend, in Git, nur Defaults für Dev)

Liegt unter `backend/.env` – wird im Dev-Betrieb verwendet. Produktionswerte immer über `.env.prod` setzen.
