#!/bin/sh

# Fungsi untuk mengecek ketersediaan port MySQL menggunakan netcat (nc)
echo "=== [SYSTEM] Menunggu MySQL Container siap di port 3306... ==="
until nc -z db 3306; do
  sleep 2
done

echo "=== [SYSTEM] MySQL siap! Menjalankan Prisma DB Push... ==="
npx prisma db push --accept-data-loss

echo "=== [SYSTEM] Menjalankan Prisma DB Seed... ==="
npx prisma db seed

echo "=== [SYSTEM] Memulai Aplikasi Next.js di Mode Produksi... ==="
npm run start