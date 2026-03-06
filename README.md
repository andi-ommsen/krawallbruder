# Krawallbruder – Motorrad-Blog

Motorradtouren, Roller-Erlebnisse und Asphalt-Abenteuer.

**Tech-Stack:** React + Vite · Symfony 7 + API Platform 3 · PostgreSQL 16 · Docker

---

## Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inkl. Docker Compose)
- [Node.js 20+](https://nodejs.org/) (für lokale Frontend-Entwicklung ohne Docker)
- [Composer](https://getcomposer.org/) (für lokale Symfony-Entwicklung ohne Docker)

---

## Setup (Docker)

```bash
# 1. Repository klonen / Verzeichnis öffnen
cd krawallbruder

# 2. Umgebungsvariablen kopieren
cp .env.example .env
cp backend/.env.local.example backend/.env.local

# 3. Assets ablegen
#    logo.png          → frontend/public/logo.png
#    RockvilleSolid.otf → frontend/public/fonts/RockvilleSolid.otf
#    (bereits erledigt, wenn Dateien im Root-Verzeichnis lagen)

# 4. Container starten
docker-compose up -d

# 5. Backend-Abhängigkeiten installieren (beim ersten Start)
docker-compose exec php composer install

# 6. Datenbank-Migrationen ausführen
docker-compose exec php php bin/console doctrine:migrations:migrate --no-interaction

# 7. Beispieldaten laden
docker-compose exec php php bin/console doctrine:fixtures:load --no-interaction

# 8. Frontend-Abhängigkeiten installieren (Development)
cd frontend && npm install
```

### Zugriff

| Dienst     | URL                      | Beschreibung                    |
|------------|--------------------------|----------------------------------|
| Frontend   | http://localhost:3000    | React-App (Vite Dev Server)      |
| Backend    | http://localhost:8080    | Symfony API                      |
| API Docs   | http://localhost:8080/api | API Platform Swagger/Hydra       |
| Adminer    | http://localhost:8081    | Datenbank-Verwaltung             |

---

## Lokale Entwicklung (ohne Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
composer install

# Datenbank-URL in .env.local anpassen (lokales PostgreSQL)
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

symfony serve
# oder: php -S localhost:8000 -t public/
```

---

## Projektstruktur

```
krawallbruder/
├── frontend/                  # React App (Vite)
│   ├── src/
│   │   ├── components/        # Header, Footer, BlogCard, BikeCard, VideoPlayer
│   │   ├── pages/             # Home, Blog, BlogPost, Bikes, BikeDetail, AboutMe, YouTube
│   │   ├── hooks/             # useApi (generischer Datenlad-Hook)
│   │   ├── services/          # Axios API Service
│   │   └── styles/            # CSS Variables, globale Styles
│   ├── public/
│   │   ├── logo.png           # → hier manuell ablegen
│   │   └── fonts/
│   │       └── RockvilleSolid.otf  # → hier manuell ablegen
│   ├── netlify.toml
│   └── vite.config.js
│
├── backend/                   # Symfony 7
│   ├── src/
│   │   ├── Entity/            # BlogPost, Bike, YouTubeVideo, AboutPage
│   │   ├── Repository/        # Doctrine Repositories
│   │   └── DataFixtures/      # Beispieldaten
│   ├── config/
│   │   └── packages/          # api_platform.yaml, doctrine.yaml, nelmio_cors.yaml
│   └── public/index.php
│
├── docker/
│   ├── nginx/nginx.conf       # Nginx-Konfiguration für Symfony
│   └── php/Dockerfile         # PHP 8.3-FPM Image
│
├── docker-compose.yml
├── docker-compose.override.yml  # Dev-Overrides (Volumes, Hot Reload)
└── .env.example
```

---

## Netlify Deployment (Frontend)

```bash
# 1. Netlify CLI installieren
npm install -g netlify-cli

# 2. In das Frontend-Verzeichnis wechseln
cd frontend

# 3. Backend-URL als Umgebungsvariable setzen
#    → Netlify Dashboard → Site Settings → Environment Variables
#    VITE_API_URL = https://dein-backend.railway.app

# 4. Build erstellen und deployen
npm run build
netlify deploy --prod --dir dist
```

Die `netlify.toml` ist bereits konfiguriert:
- Build-Command: `npm run build`
- Publish-Directory: `dist`
- SPA-Redirect: `/* → /index.html`

---

## Backend Deployment (Railway / Render)

```bash
# Railway
railway login
railway new
railway up

# Umgebungsvariablen setzen:
# DATABASE_URL, APP_SECRET, APP_ENV=prod
```

---

## Umgebungsvariablen

| Variable            | Beschreibung                              | Beispiel                          |
|---------------------|-------------------------------------------|-----------------------------------|
| `VITE_API_URL`      | URL des Symfony-Backends (Frontend)       | `http://localhost:8080`           |
| `DATABASE_URL`      | PostgreSQL Connection String (Symfony)    | `postgresql://...`                |
| `APP_SECRET`        | Symfony App-Secret (mind. 32 Zeichen)     | `random_secret_string`            |
| `APP_ENV`           | Symfony Umgebung                          | `dev` / `prod`                    |
| `CORS_ALLOW_ORIGIN` | Erlaubte Origins für CORS                 | `^https?://localhost(:[0-9]+)?$`  |

---

## Fonts & Assets

Die folgenden Dateien müssen manuell in das Projekt kopiert werden:

| Datei                     | Zielverzeichnis                         |
|---------------------------|-----------------------------------------|
| `logo.png`                | `frontend/public/logo.png`              |
| `RockvilleSolid.otf`      | `frontend/public/fonts/RockvilleSolid.otf` |

---

## API-Endpunkte

| Methode | Pfad                          | Beschreibung                    |
|---------|-------------------------------|---------------------------------|
| GET     | `/api/blog_posts`             | Blog-Beiträge (paginiert)       |
| GET     | `/api/blog_posts?slug=...`    | Beitrag nach Slug               |
| GET     | `/api/bikes`                  | Alle Bikes                      |
| GET     | `/api/bikes?slug=...`         | Bike nach Slug                  |
| GET     | `/api/you_tube_videos`        | Alle YouTube-Videos             |
| GET     | `/api/about_pages`            | Über mich                       |

Filter-Parameter (alle GET-Requests):
- `?category=Vespa` – nach Kategorie filtern
- `?bike.slug=vespa-px-200` – nach Bike filtern
- `?title=Brenner` – nach Titel suchen
- `?page=2&itemsPerPage=5` – Pagination

---

## Lizenz

Privates Projekt – alle Rechte vorbehalten.
© Krawallbruder
