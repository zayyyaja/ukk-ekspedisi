#!/bin/sh

set -eu

# ============================================================
# KONFIGURASI DATABASE
# ============================================================
DB_HOST="${DB_HOST:-database}"
DB_PORT="${DB_PORT:-3306}"

DB_RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"
DB_MAX_RETRIES="${DB_MAX_RETRIES:-60}"

attempt=1

echo "================================================"
echo " Menunggu database ${DB_HOST}:${DB_PORT}"
echo "================================================"

until nc -z "$DB_HOST" "$DB_PORT"; do
  if [ "$attempt" -ge "$DB_MAX_RETRIES" ]; then
    echo "Database tidak dapat diakses setelah ${DB_MAX_RETRIES} percobaan."
    exit 1
  fi

  echo "Database belum siap. Percobaan ${attempt}/${DB_MAX_RETRIES}..."

  attempt=$((attempt + 1))
  sleep "$DB_RETRY_INTERVAL"
done

echo "================================================"
echo " Database sudah dapat diakses"
echo " Container web: $(hostname)"
echo " Menjalankan aplikasi Next.js pada port 3000"
echo "================================================"

# exec memastikan proses Node menerima signal Docker secara langsung
exec npm run start