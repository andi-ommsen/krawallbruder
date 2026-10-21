#!/bin/sh
set -eu

# Configure flags and build dependencies follow the official PHP FPM image:
# https://github.com/docker-library/php/blob/f6048b5f6e3c2202ee082665a4ccc0d90de291a3/8.3/bookworm/fpm/Dockerfile
: "${PHP_VERSION:?}" "${PHP_URL:?}" "${PHP_SHA256:?}"
savedAptMark="$(apt-mark showmanual)"
apt-get update
apt-get install -y --no-install-recommends \
    $PHPIZE_DEPS libargon2-dev libcurl4-openssl-dev libonig-dev \
    libreadline-dev libsodium-dev libsqlite3-dev libssl-dev libxml2-dev zlib1g-dev

docker-php-source delete
curl --fail --show-error --location --retry 3 "$PHP_URL" -o /usr/src/php.tar.xz
echo "$PHP_SHA256  /usr/src/php.tar.xz" | sha256sum --check --strict -
docker-php-source extract
cd /usr/src/php

export CFLAGS="$PHP_CFLAGS" CPPFLAGS="$PHP_CPPFLAGS" LDFLAGS="$PHP_LDFLAGS"
gnuArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)"
debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"
./configure \
    --build="$gnuArch" \
    --sysconfdir="${PHP_INI_DIR%/php}" \
    --with-config-file-path="$PHP_INI_DIR" \
    --with-config-file-scan-dir="$PHP_INI_DIR/conf.d" \
    --enable-option-checking=fatal \
    --with-mhash --with-pic --enable-mbstring --enable-mysqlnd \
    --with-password-argon2 --with-sodium=shared \
    --with-pdo-sqlite=/usr --with-sqlite3=/usr \
    --with-curl --with-iconv --with-openssl --with-readline --with-zlib \
    --disable-phpdbg --with-pear --with-libdir="lib/$debMultiarch" \
    --disable-cgi --enable-fpm --with-fpm-user=www-data --with-fpm-group=www-data

# Limit parallelism to keep the production VPS responsive during the build.
make -j2
make install
make clean
cd /
docker-php-source delete

# Preserve runtime libraries while removing dependencies needed only for compilation.
apt-mark auto '.*' > /dev/null
apt-mark manual $savedAptMark > /dev/null
find /usr/local -type f -executable -exec ldd '{}' ';' \
    | awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) next; gsub("^/(usr/)?", "", so); printf "*%s\n", so }' \
    | sort -u | xargs -rt dpkg-query --search \
    | awk 'sub(":$", "", $1) { print $1 }' | sort -u | xargs -r apt-mark manual
apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false
rm -rf /var/lib/apt/lists/*

# Do not produce an image unless both CLI and FPM contain the patched release.
php -r 'exit(PHP_VERSION === getenv("PHP_VERSION") ? 0 : 1);'
php-fpm -v | grep -F "PHP $PHP_VERSION "
