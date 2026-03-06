FROM php:8.3-fpm

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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer installieren
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Opcache konfigurieren (Production)
RUN docker-php-ext-install opcache
COPY opcache.ini /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Der Backend-Code wird per Volume-Mount bereitgestellt (docker-compose.yml).
# Nach dem Start: docker-compose exec php composer install

EXPOSE 9000
CMD ["php-fpm"]
