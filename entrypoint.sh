#!/bin/sh

set -eu

# Nama service database pada docker-compose.yml adalah "db"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"

DB_RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"
DB_MAX_RETRIES="${DB_MAX_RETRIES:-60}"

attempt=1

check_database() {
  DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" node -e '
    const net = require("node:net");

    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);

    const socket = net.createConnection({
      host,
      port,
    });

    socket.setTimeout(2000);

    socket.on("connect", () => {
      socket.end();
      process.exit(0);
    });

    socket.on("timeout", () => {
      socket.destroy();
      process.exit(1);
    });

    socket.on("error", () => {
      process.exit(1);
    });
  '
}

echo "================================================"
echo " Menunggu database ${DB_HOST}:${DB_PORT}"
echo "================================================"

until check_database; do
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
echo " Container aplikasi: $(hostname)"
echo " Menjalankan Next.js pada port 3000"
echo "================================================"

# exec memastikan proses Next.js menerima signal Docker
exec npm run start