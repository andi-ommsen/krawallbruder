# Backend-Testplan

## Ziel

Eine schnelle, reproduzierbare Testsuite für die Symfony-/API-Platform-Anwendung aufbauen. Sie schützt die öffentlichen API-Verträge, Authentifizierung und Kommentar-Erstellung gegen Regressionen, ohne Produktionsdaten, externe Dienste oder Implementierungsdetails zu testen.

**Ausgangslage:** `backend/tests/`, PHPUnit-Konfiguration und Test-Runner fehlen. Das Projekt verwendet Symfony 7.4, API Platform 4.3, Doctrine ORM 3 und PostgreSQL. Der PHP-Container läuft mit PHP 8.3.

## Leitplanken

- Tests laufen ausschließlich mit `APP_ENV=test` und einer separaten PostgreSQL-Testdatenbank. Niemals gegen die Dev- oder Produktionsdatenbank.
- PostgreSQL bleibt die Testdatenbank. SQLite würde UUID-, JSON-, Filter- und SQL-Unterschiede verdecken.
- Functional Tests senden echte HTTP-Requests durch den Symfony-Kernel; externe Netze werden nicht angesprochen.
- Assertions prüfen HTTP-Status, JSON-Vertrag, Persistenz und Zugriffsrechte — keine CSS-, Container- oder interne Methodenaufrufe.
- Jede Testmethode erstellt nur die Daten, die sie benötigt. Gemeinsamer, veränderbarer Fixture-Zustand ist verboten.
- Die Suite wird nach der einmaligen Datenbankvorbereitung mit einem dokumentierten Befehl im PHP-8.3-Docker-Container ausgeführt.

## Zielstruktur

```text
backend/
├── .env.test
├── phpunit.dist.xml
├── tests/
│   ├── Functional/
│   │   ├── Api/
│   │   │   ├── PublicResourceTest.php
│   │   │   ├── AdminAuthenticationTest.php
│   │   │   ├── AdminWriteAccessTest.php
│   │   │   └── CommentCreationTest.php
│   │   └── Support/
│   │       ├── ApiTestCase.php
│   │       └── FixtureFactory.php
│   └── Unit/
│       ├── Security/AdminTokenAuthenticatorTest.php
│       └── Service/TurnstileVerifierTest.php
└── config/packages/test/
    ├── cache.yaml
    ├── framework.yaml
    └── dama_doctrine_test_bundle.yaml
```

`ApiTestCase` kapselt nur wiederkehrende Testmechanik: JSON-Request, Bearer-Token und Datenaufbau. Fachliche Assertions bleiben in den einzelnen Tests.

## Phase 1 — Testfundament

1. Im Container die Testwerkzeuge als Entwicklungsabhängigkeiten hinzufügen:

   ```bash
   docker compose exec php composer require --dev \
     phpunit/phpunit:^11.5 \
     symfony/phpunit-bridge:^7.4 \
     symfony/browser-kit:^7.4 \
     symfony/css-selector:^7.4 \
     dama/doctrine-test-bundle
   ```

   `symfony/phpunit-bridge` stellt den Runner und Deprecation-Handling bereit. `BrowserKit` führt HTTP-Functional-Tests im Symfony-Kernel aus. Das DAMA-Bundle rollt jede Testtransaktion zurück und verhindert Datenlecks zwischen Testfällen.

2. `phpunit.dist.xml` anlegen:
   - `APP_ENV=test`, `APP_DEBUG=1`, `KERNEL_CLASS=App\Kernel` setzen.
   - `tests/` als Testsuite registrieren.
   - Deprecations über den Symfony-Bridge-Helper in CI als Fehler behandeln.

3. `.env.test` anlegen:
   - `DATABASE_URL` auf die ausschließlich verwendete Testdatenbank richten; der bestehende `when@test`-Suffix muss wirksam bleiben.
   - Eindeutige, nicht produktive `ADMIN_USERNAME`, `ADMIN_PASSWORD` und `ADMIN_TOKEN` setzen.
   - Den vorhandenen Turnstile-Test-Secret `1x0000000000000000000000000000000AA` setzen, damit Comment-Tests keine Cloudflare-Anfrage auslösen.
   - Einen eigenen Test-Cache-Namespace konfigurieren, damit Login- und Rate-Limit-Zähler keine Dev-Werte berühren.

4. `config/packages/test/dama_doctrine_test_bundle.yaml` mit `enable_static_connection: true` anlegen. Die bestehende `when@test`-Konfiguration in `config/packages/doctrine.yaml` behält den Datenbank-Suffix bei. Ein Test-Run migriert die Testdatenbank einmal, danach rollt jede Testmethode ihre Transaktion zurück.

5. Composer-Scripts ergänzen:

   ```json
   {
     "test:prepare": "php bin/console doctrine:database:create --if-not-exists --env=test && php bin/console doctrine:migrations:migrate --no-interaction --env=test",
     "test": [
       "@test:prepare",
       "php bin/phpunit"
     ]
   }
   ```

   Der konkrete Aufruf ist damit:

   ```bash
   docker compose exec php composer test
   ```

**Abnahme:** Zwei direkt aufeinanderfolgende Testläufe sind grün; der zweite Lauf enthält keine Daten aus dem ersten.

## Phase 2 — Priorisierte Functional Tests

### Öffentliche Ressourcen

`Functional/Api/PublicResourceTest.php`

- `GET /api/bikes`, `/api/blog_posts`, `/api/you_tube_videos` und `/api/about_pages` antworten erfolgreich.
- JSON-LD-Collections enthalten unter API Platform 4 `member` und `totalItems`; ältere `hydra:member`-Felder werden nicht mehr erwartet.
- Filter für `slug`, `bike.slug` und Pagination liefern nur passende Datensätze und korrekte Gesamtzahl.
- Öffentliche Lesezugriffe funktionieren ohne Bearer-Token.

### Admin-Login und Rate Limit

`Functional/Api/AdminAuthenticationTest.php`

- Korrekte Zugangsdaten liefern genau den konfigurierten Token.
- Falscher Benutzer oder falsches Passwort liefert `401`, ohne Details über die fehlerhafte Komponente preiszugeben.
- Nach zehn Fehlschlägen liefert der elfte Request `429`.
- Ein erfolgreicher Login löscht den Fehlversuchs-Zähler.
- `OPTIONS /api/admin/login` liefert `204`.

### Schreibschutz und CRUD-Zugriff

`Functional/Api/AdminWriteAccessTest.php`

- `POST`, `PUT`, `PATCH` und `DELETE` an geschützten API-Platform-Operationen werden ohne oder mit falschem Token abgewiesen.
- Ein korrekter Bearer-Token erlaubt die jeweilige Operation.
- Ein erfolgreicher Schreibzugriff liefert den erwarteten Status und der Datensatz ist anschließend über die öffentliche API sichtbar.

Mit je einer repräsentativen Resource beginnen (`Bike`), dann alle abweichenden Operationen von `BlogPost`, `YouTubeVideo` und `AboutPage` ergänzen. Keine identischen Copy/Paste-Tests für gleichartige Endpunkte.

### Kommentar-Erstellung

`Functional/Api/CommentCreationTest.php`

- Fehlende Pflichtfelder, ein leerer Wert sowie Grenzen von 100 Zeichen für Name und 2.000 Zeichen für Inhalt liefern `422`.
- HTML in Name und Inhalt wird vor dem Speichern entfernt.
- Nicht existierende oder unveröffentlichte Posts liefern `404`.
- Bei gültigem Test-Captcha wird ein Kommentar mit `201` gespeichert; Response und gespeicherte Entity stimmen überein.
- Nach fünf Requests derselben IP liefert der nächste Request `429`.
- `OPTIONS /api/comments` liefert `204`.

**Abnahme:** Jede der oben genannten fachlichen und sicherheitsrelevanten Grenzen besitzt genau einen deterministischen Test.

## Phase 3 — Kleine Unit Tests nach Entkopplung

Unit Tests sind hier nur sinnvoll, wenn I/O aus den Controllern herausgelöst wird:

1. `TurnstileVerifier` als Interface und HTTP-basierte Implementierung extrahieren. Die Functional Tests verwenden einen Test-Double; Unit Tests prüfen erfolgreiche, abgelehnte, ungültige und Timeout-Antworten ohne Netz.
2. `AdminTokenAuthenticator` isoliert testen: fehlender Header, falsches Bearer-Schema, falscher Token und gültiger Token.
3. Keine Getter-/Setter-Tests für Doctrine-Entities anlegen. Sie schützen keinen beobachtbaren Vertrag.

**Abnahme:** Unit Tests benötigen keinen Symfony-Kernel und keine Datenbank.

## Phase 4 — CI vor Deployment

Die bestehende Deploy-Pipeline erhält einen vorgeschalteten `test`-Job; `deploy` hängt mit `needs: test` davon ab.

1. PHP 8.3 und PostgreSQL 16 im GitHub-Runner bereitstellen.
2. `composer install --no-interaction --prefer-dist` ausführen.
3. Testdatenbank vorbereiten (`composer test:prepare`).
4. `composer test` und anschließend `composer audit --locked` ausführen.
5. Den Frontend-Build getrennt mit `npm ci && npm run build` ausführen.
6. Nur bei grünen Jobs darf der bestehende SSH-Deploy laufen.

**Abnahme:** Ein absichtlich fehlschlagender Test blockiert den Deploy-Job.

## Einführungsreihenfolge

1. Phase 1 vollständig aufbauen und einen erfolgreichen Smoke-Test als Referenz festhalten.
2. `AdminAuthenticationTest` und `CommentCreationTest` zuerst implementieren — sie decken Token, Rate-Limits, Captcha-Umgehung im Testmodus und Persistenz ab.
3. Öffentliche Ressourcen und eine geschützte Schreiboperation ergänzen.
4. Erst danach Verifier-Entkopplung und Unit Tests umsetzen.
5. Nach lokaler Stabilisierung die CI-Gate aktivieren.

## Nicht im ersten Schritt

- Keine Testabdeckungsvorgabe und keine Coverage-Gates. Sie führen bei einer neuen Suite zu Testballast statt besserer Verträge.
- Keine Browser-End-to-End-Tests für Backend-Verhalten; dafür sind Functional Tests durch den Kernel schneller und präziser.
- Keine Tests gegen Turnstile, YouTube oder andere externe Dienste.
- Keine automatische Fixture-Vollbeladung pro Testfall; gezielt erzeugte Daten sind schneller und isolierter.
