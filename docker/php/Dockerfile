FROM php:8.3.35-fpm-bookworm

# Sicherheitsrelease selbst bauen, bis das offizielle Docker-Image verfügbar ist.
ENV PHP_VERSION=8.3.36 \
    PHP_URL=https://www.php.net/distributions/php-8.3.36.tar.xz \
    PHP_SHA256=dd54693aa334c5c4d72e9aee96b082c2473750a18a6c1d105789c93a3b1692fd
COPY build-security-release.sh /usr/local/bin/build-security-release
RUN sh /usr/local/bin/build-security-release

# System-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer installieren
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Opcache konfigurieren (Production)
RUN docker-php-ext-install opcache
COPY opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# Der Backend-Code wird per Volume-Mount bereitgestellt (docker-compose.yml).
# Nach dem Start: docker-compose exec php composer install

EXPOSE 9000
CMD ["php-fpm"]
