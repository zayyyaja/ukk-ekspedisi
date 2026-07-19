# Panduan Lengkap Simulasi UKK
## Deployment Next.js dengan Docker, MySQL, Nginx, SSH, dan FTP

**Versi pembaruan:** 19 Juli 2026  
**Stack project:** Next.js 15, Node.js 20, Prisma 5.22, MySQL 8, Nginx, Docker Compose  
**Rancangan:** Load balancing aplikasi berada di VM1. VM2 digunakan untuk SSH password-less dan FTP.

> [!IMPORTANT]
> Dokumen Simulasi UKK resmi masih mencantumkan tiga container Apache/Nginx dan load balancing tambahan pada VM2. Panduan ini mengikuti rancangan modifikasi: seluruh container aplikasi dan load balancing berada di VM1, sedangkan VM2 hanya menjalankan SSH dan FTP. Pastikan perubahan ini sudah disetujui asesor atau guru sebelum ujian.

---

# Daftar Isi

1. [Data yang harus diisi](#1-data-yang-harus-diisi)
2. [Target akhir sistem](#2-target-akhir-sistem)
3. [Kesesuaian dengan kriteria UKK](#3-kesesuaian-dengan-kriteria-ukk)
4. [Peralatan yang harus disiapkan](#4-peralatan-yang-harus-disiapkan)
5. [Struktur project final](#5-struktur-project-final)
6. [File konfigurasi final](#6-file-konfigurasi-final)
7. [Validasi project di komputer pengembangan](#7-validasi-project-di-komputer-pengembangan)
8. [Mengatasi masalah Docker Desktop dan BuildKit](#8-mengatasi-masalah-docker-desktop-dan-buildkit)
9. [Push project ke GitHub](#9-push-project-ke-github)
10. [Membuat VM1 dan VM2](#10-membuat-vm1-dan-vm2)
11. [Mengatur hostname](#11-mengatur-hostname)
12. [Konfigurasi IP address dan topologi jaringan](#12-konfigurasi-ip-address-dan-topologi-jaringan)
13. [Pengujian jaringan sebelum deployment](#13-pengujian-jaringan-sebelum-deployment)
14. [Install Docker Engine pada VM1](#14-install-docker-engine-pada-vm1)
15. [Clone project dan menyiapkan environment di VM1](#15-clone-project-dan-menyiapkan-environment-di-vm1)
16. [Build dan menjalankan deployment di VM1](#16-build-dan-menjalankan-deployment-di-vm1)
17. [Pengujian lengkap deployment VM1](#17-pengujian-lengkap-deployment-vm1)
18. [Konfigurasi SSH password-less pada VM2](#18-konfigurasi-ssh-password-less-pada-vm2)
19. [Konfigurasi FTP pada VM2](#19-konfigurasi-ftp-pada-vm2)
20. [Pengujian restart policy](#20-pengujian-restart-policy)
21. [Dokumentasi yang harus dikumpulkan](#21-dokumentasi-yang-harus-dikumpulkan)
22. [Urutan demonstrasi kepada asesor](#22-urutan-demonstrasi-kepada-asesor)
23. [Troubleshooting lengkap](#23-troubleshooting-lengkap)
24. [Checklist akhir](#24-checklist-akhir)

---

# 1. Data yang harus diisi

Isi tabel ini sebelum mulai. Jangan meneruskan konfigurasi jaringan sebelum IP dari asesor sudah jelas.

| Data | Nilai |
|---|---|
| Nama asesi | `ISI_NAMA` |
| Nomor absen | `ISI_NOMOR_ABSEN` |
| Username GitHub | `ISI_USERNAME_GITHUB` |
| Nama repository | `ISI_NAMA_REPOSITORY` |
| Username Ubuntu VM1 | `ISI_USER_VM1` |
| Username Ubuntu VM2 | `ISI_USER_VM2` |
| IP host | `ISI_IP_HOST` |
| IP VM1 | `ISI_IP_VM1` |
| IP VM2 | `ISI_IP_VM2` |
| Network | `172.20.3.0/24` |
| Gateway | `172.20.3.1` |
| DNS | `8.8.8.8` |
| Nama aplikasi | `ekspedisi-aja` |
| Direktori VM1 | `/home/ujikom/ekspedisi-aja` |

## 1.1 Contoh pengisian

Contoh berikut hanya digunakan apabila nomor absen termasuk kelompok yang memperoleh:

```text
IP Host : 172.20.3.12
IP VM1  : 172.20.3.13
IP VM2  : 172.20.3.14
```

Gunakan IP yang benar-benar diberikan oleh asesor. Jangan menyalin contoh tersebut jika kelompokmu berbeda.

## 1.2 IP yang diketahui dari tabel UKK

| Rentang nomor absen | IP Host | IP VM1 | IP VM2 |
|---|---:|---:|---:|
| 2 sampai 11 | 172.20.3.2 | 172.20.3.3 | 172.20.3.4 |
| 12 sampai 21 | 172.20.3.12 | 172.20.3.13 | 172.20.3.14 |
| 22 sampai 31 | 172.20.3.22 | 172.20.3.23 | 172.20.3.24 |
| 32 sampai 41 | 172.20.3.32 | 172.20.3.33 | 172.20.3.34 |
| 42 sampai 51 | 172.20.3.42 | 172.20.3.43 | 172.20.3.44 |
| 52 sampai 61 | 172.20.3.52 | 172.20.3.53 | 172.20.3.54 |
| 62 sampai 71 | 172.20.3.62 | 172.20.3.63 | 172.20.3.64 |
| 72 sampai 81 | 172.20.3.72 | 172.20.3.73 | 172.20.3.74 |
| 82 sampai 91 | 172.20.3.82 | 172.20.3.83 | 172.20.3.84 |
| 92 sampai 101 | 172.20.3.92 | 172.20.3.93 | 172.20.3.94 |
| 102 sampai 111 | 172.20.3.102 | 172.20.3.103 | 172.20.3.104 |
| 112 sampai 121 | 172.20.3.112 | 172.20.3.113 | 172.20.3.114 |
| 122 sampai 131 | 172.20.3.122 | 172.20.3.123 | 172.20.3.124 |
| 132 sampai 141 | 172.20.3.132 | 172.20.3.133 | 172.20.3.134 |
| 142 sampai 151 | 172.20.3.142 | 172.20.3.143 | 172.20.3.144 |
| 152 sampai 161 | 172.20.3.152 | 172.20.3.153 | 172.20.3.154 |

> [!WARNING]
> Beberapa baris lanjutan pada dokumen resmi tidak terisi. Untuk nomor absen yang IP-nya kosong, tanyakan kepada asesor. Jangan membuat pola sendiri tanpa persetujuan.

---

# 2. Target akhir sistem

```text
KOMPUTER HOST
├── GitHub
├── Browser / curl
├── FileZilla
│
├── VM1: namasiswa_deployment
│   ├── Adapter 1: NAT
│   ├── Adapter 2: Bridged Adapter
│   ├── Docker Engine dan Docker Compose
│   ├── MySQL 8
│   │   ├── host port 3306
│   │   └── volume-ujikom
│   ├── Prisma migrate dan seed
│   ├── Next.js web-1, expose 3000
│   ├── Next.js web-2, expose 3000
│   ├── Next.js web-3, expose 3000
│   ├── Nginx loadbalancer, 8080:80
│   └── network-ujikom
│
└── VM2: namasiswa_management
    ├── Adapter 1: NAT
    ├── Adapter 2: Bridged Adapter
    ├── OpenSSH Server
    └── vsftpd FTP Server
```

## 2.1 Alur request

```text
Browser host
    │
    │ http://IP_VM1:8080
    ▼
Nginx loadbalancer
    │
    ├── Next.js web-1
    ├── Next.js web-2
    └── Next.js web-3
             │
             ▼
       MySQL database
```

Aplikasi Next.js tidak boleh dibuka langsung melalui port host `3000`. User hanya mengakses aplikasi melalui Nginx pada port `8080`.

---

# 3. Kesesuaian dengan kriteria UKK

| Kriteria | Implementasi |
|---|---|
| Dua Ubuntu Server | VM1 dan VM2 |
| Dua adapter per VM | NAT dan Bridged Adapter |
| Hostname VM1 | `namasiswa_deployment` |
| Hostname VM2 | `namasiswa_management` |
| Project di VM1 | `/home/ujikom/ekspedisi-aja` |
| Custom image | `ekspedisi-app:ukk` |
| Tiga container web | `docker compose up -d --scale web=3` |
| Web hanya expose | `expose: "3000"` |
| Database | MySQL 8 |
| Port database | `3306:3306` |
| Volume database | `volume-ujikom` |
| Network Docker | `network-ujikom` |
| Load balancer | Nginx |
| Port load balancer | `8080:80` |
| Restart otomatis | `restart: unless-stopped` |
| Bukti load balancing | Endpoint `/api/instance` |
| SSH password-less | VM1 ke VM2 memakai SSH key |
| FTP | Host ke VM2 memakai FileZilla |

---

# 4. Peralatan yang harus disiapkan

## 4.1 Komputer host

Rekomendasi:

- RAM minimal 8 GB, lebih nyaman 16 GB.
- CPU minimal 4 thread.
- Ruang kosong minimal 60 GB.
- Virtualization Technology aktif pada BIOS atau UEFI.
- Koneksi internet stabil.
- Windows, Linux, atau macOS sebagai host.

## 4.2 Software pada host

- VirtualBox atau VMware Workstation.
- ISO Ubuntu Server 22.04 LTS atau 24.04 LTS.
- Git.
- Visual Studio Code.
- Docker Desktop untuk pengujian lokal Windows.
- Browser.
- FileZilla.
- PowerShell atau Command Prompt.

## 4.3 Akun dan file

- Akun GitHub.
- Repository private atau public sesuai instruksi.
- Source code aplikasi.
- File `.env` asli yang tidak di-push.
- File `.env.example` tanpa token asli.
- IP Host, VM1, dan VM2 dari asesor.

---

# 5. Struktur project final

```text
ekspedisi/
├── nginx/
│   └── nginx.conf
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/              # jika tersedia
├── public/
├── scripts/
├── src/
│   └── app/
│       └── api/
│           └── instance/
│               └── route.ts
├── .dockerignore
├── .env                         # lokal, jangan push
├── .env.example                 # boleh push
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── entrypoint.sh
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```

---

# 6. File konfigurasi final

## 6.1 `.gitignore`

```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.*
!.env.example

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# TypeScript
*.tsbuildinfo

# Tests
coverage/

# Local folders
scratch/
.agents/

# Editors
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## 6.2 `.dockerignore`

```dockerignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Next.js output
.next/
out/

# Environment and secrets
.env*

# Git
.git/
.github/
.gitignore

# Docker orchestration files
Dockerfile
Dockerfile.*
docker-compose.yml
docker-compose.*.yml
compose.yml
compose.yaml
.dockerignore

# Files used by separate services
nginx/
mysql/

# SSL
ssl/
*.pem
*.key
*.crt
*.p12
*.pfx

# Local folders
.agents/
scratch/
.vscode/
.idea/

# Logs and cache
*.log
*.tsbuildinfo
.eslintcache
lighthouse-report.json

# Tests
__tests__/
coverage/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx

# OS and editor temp
.DS_Store
Thumbs.db
*.swp
*.swo

# Documentation and setup
README.md
setup.sh
```

Jangan masukkan baris berikut:

```dockerignore
prisma/
prisma/seed.ts
```

Service `migrate` membutuhkan `schema.prisma` dan `seed.ts` di dalam image.

## 6.3 `.env.example`

```env
# ============================================================
# APPLICATION
# ============================================================

# Untuk npm run dev langsung dari komputer pengembangan.
# Docker Compose akan menimpa APP_URL untuk container.
APP_URL=http://localhost:3000

# ============================================================
# DATABASE LOKAL
# ============================================================

# Untuk MySQL lokal pada komputer pengembangan.
# Docker Compose akan menimpa DATABASE_URL menjadi host "database".
DATABASE_URL=mysql://root:@127.0.0.1:3306/ekspedisi_aja

# ============================================================
# JWT / SESSION
# ============================================================

JWT_ACCESS_SECRET=replace-with-random-access-secret-min-32-chars
JWT_REFRESH_SECRET=replace-with-random-refresh-secret-min-32-chars
JWT_EMAIL_VERIFICATION_SECRET=replace-with-random-email-verification-secret

# ============================================================
# GOOGLE RECAPTCHA
# ============================================================

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# ============================================================
# MIDTRANS
# ============================================================

MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# ============================================================
# SMTP / MAILTRAP
# ============================================================

SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
MAILTRAP_FROM="DRG Ekspedisi <noreply@example.com>"
```

> [!IMPORTANT]
> `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` adalah nilai publik yang dimasukkan ke bundle browser ketika proses build. Secret reCAPTCHA, JWT, Midtrans server key, dan password SMTP tidak boleh masuk GitHub.

## 6.4 `Dockerfile`

Versi ini menggunakan Debian slim agar kompatibilitas Prisma dan OpenSSL lebih stabil dibanding Alpine pada project ini.

```dockerfile
# ============================================================
# BASE
# ============================================================
FROM node:20-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


# ============================================================
# DEPENDENCIES
# ============================================================
FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate


# ============================================================
# BUILDER
# ============================================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ============================================================
# RUNNER
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/entrypoint.sh ./entrypoint.sh

RUN sed -i 's/\r$//' ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && chown node:node ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
```

## 6.5 `entrypoint.sh`

Versi ini tidak membutuhkan `netcat`. Pengecekan port MySQL menggunakan modul bawaan Node.js.

```sh
#!/bin/sh

set -eu

DB_HOST="${DB_HOST:-database}"
DB_PORT="${DB_PORT:-3306}"
DB_RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"
DB_MAX_RETRIES="${DB_MAX_RETRIES:-60}"

attempt=1

check_database() {
  DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" node -e '
    const net = require("node:net");

    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);

    const socket = net.createConnection({ host, port });
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
echo " Container web: $(hostname)"
echo " Menjalankan Next.js pada port 3000"
echo "================================================"

exec npm run start
```

## 6.6 `docker-compose.yml`

Ganti `http://IP_VM1:8080` dengan IP VM1 yang diberikan asesor sebelum deployment.

```yaml
services:
  database:
    image: mysql:8.0
    restart: unless-stopped

    environment:
      MYSQL_DATABASE: ekspedisi_aja
      MYSQL_USER: ekspedisi
      MYSQL_PASSWORD: ekspedisi_secret
      MYSQL_ROOT_PASSWORD: root_super_secret_pass

    ports:
      - "3306:3306"

    volumes:
      - volume-ujikom:/var/lib/mysql

    networks:
      - network-ujikom

    healthcheck:
      test:
        - CMD-SHELL
        - mysqladmin ping -h 127.0.0.1 -uroot -proot_super_secret_pass --silent
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 20s


  migrate:
    image: ekspedisi-app:ukk
    restart: "no"

    environment:
      DATABASE_URL: mysql://ekspedisi:ekspedisi_secret@database:3306/ekspedisi_aja

    depends_on:
      database:
        condition: service_healthy

    entrypoint:
      - /bin/sh
      - -c

    command:
      - |
        set -eu

        echo "Menyiapkan schema database..."
        npx prisma db push --skip-generate

        echo "Menjalankan seed database..."
        npx prisma db seed

        echo "Database berhasil disiapkan."

    networks:
      - network-ujikom


  web:
    image: ekspedisi-app:ukk

    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

    restart: unless-stopped

    env_file:
      - .env

    environment:
      DATABASE_URL: mysql://ekspedisi:ekspedisi_secret@database:3306/ekspedisi_aja
      APP_URL: http://IP_VM1:8080
      NODE_ENV: production
      DB_HOST: database
      DB_PORT: "3306"

    expose:
      - "3000"

    depends_on:
      database:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully

    networks:
      - network-ujikom


  loadbalancer:
    image: nginx:alpine
    restart: unless-stopped

    ports:
      - "8080:80"

    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro

    depends_on:
      web:
        condition: service_started

    networks:
      - network-ujikom


volumes:
  volume-ujikom:
    name: volume-ujikom


networks:
  network-ujikom:
    name: network-ujikom
    driver: bridge
```

### Catatan tentang file upload

Project memiliki endpoint upload. Apabila file disimpan ke filesystem lokal container, setiap replica dapat mempunyai file berbeda. Periksa lokasi penyimpanan upload.

Jika aplikasi menulis ke `/app/public/uploads`, tambahkan volume bersama:

```yaml
web:
  volumes:
    - uploads-ujikom:/app/public/uploads

volumes:
  volume-ujikom:
    name: volume-ujikom
  uploads-ujikom:
    name: uploads-ujikom
```

Gunakan hanya jika source code memang menyimpan file di path tersebut.

## 6.7 `nginx/nginx.conf`

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

upstream nextjs_cluster {
    least_conn;

    server web:3000;

    keepalive 32;
}

server {
    listen 80 default_server;
    server_name _;

    client_max_body_size 25M;

    location = /nginx-health {
        access_log off;
        default_type text/plain;
        return 200 "Nginx load balancer aktif\n";
    }

    location / {
        proxy_pass http://nextjs_cluster;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;

        add_header X-Upstream-Address $upstream_addr always;
    }
}
```

## 6.8 Endpoint pembuktian load balancing

Buat file:

```text
src/app/api/instance/route.ts
```

Isi:

```ts
import os from "node:os";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      message: "Request berhasil diproses",
      instance: os.hostname(),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
```

## 6.9 Periksa script `start`

Pastikan `package.json` memiliki:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start --hostname 0.0.0.0 --port 3000"
  }
}
```

---

# 7. Validasi project di komputer pengembangan

Lakukan dari root project di VS Code.

## 7.1 Pastikan secret tidak akan masuk Git

```powershell
git check-ignore -v .env
git status --short
```

`.env` harus diabaikan. `.env.example` harus tetap terlihat sebagai file yang dapat di-commit.

## 7.2 Install dependency dengan lock file

```powershell
npm ci
```

Peringatan deprecated package tidak otomatis menggagalkan build. Jangan langsung menjalankan `npm audit fix --force`.

Periksa vulnerability:

```powershell
npm audit
npm audit --omit=dev
```

## 7.3 Validasi Prisma

```powershell
npx prisma validate
npx prisma generate
```

Target:

```text
The schema at prisma\schema.prisma is valid
Generated Prisma Client
```

## 7.4 Build Next.js lokal

```powershell
npm run build
```

Pastikan route berikut muncul:

```text
/api/instance
```

## 7.5 Validasi Compose tanpa menampilkan semua secret

```powershell
docker compose config > $null
docker compose config --services
```

Target:

```text
database
migrate
web
loadbalancer
```

## 7.6 Periksa port lokal

```powershell
netstat -ano | findstr :3306
netstat -ano | findstr :8080
```

Jika MySQL lokal memakai port `3306`, hentikan sementara MySQL lokal sebelum menjalankan Compose.

---

# 8. Mengatasi masalah Docker Desktop dan BuildKit

Bagian ini hanya untuk pengujian lokal di Windows. Deployment akhir tetap dilakukan pada VM1 Ubuntu.

## 8.1 Pastikan Docker Desktop hidup

Buka Docker Desktop dan tunggu sampai engine berstatus running.

```powershell
docker version
docker info
docker run --rm hello-world
```

`docker version` harus menampilkan bagian `Client` dan `Server`.

## 8.2 Pastikan Linux context aktif

```powershell
docker context ls
docker context use desktop-linux
```

## 8.3 Periksa builder

```powershell
docker buildx ls
docker buildx inspect --bootstrap
```

Builder harus berstatus `running`.

## 8.4 Jika muncul error h2c atau HTTP 500

Contoh:

```text
listing workers for Build: failed to list workers
unable to upgrade to h2c, received 500
```

Lakukan:

```powershell
wsl --shutdown
```

Kemudian:

1. Quit Docker Desktop.
2. Buka kembali Docker Desktop.
3. Tunggu engine running.
4. Jalankan:

```powershell
docker version
docker run --rm hello-world
docker buildx inspect --bootstrap
```

## 8.5 Buat builder baru jika builder default rusak

```powershell
docker buildx create `
  --name ukk-builder `
  --driver docker-container `
  --bootstrap `
  --use
```

Periksa:

```powershell
docker buildx ls
docker buildx inspect ukk-builder
```

Aktifkan untuk sesi PowerShell:

```powershell
$env:BUILDX_BUILDER = "ukk-builder"
```

Setelah selesai:

```powershell
Remove-Item Env:BUILDX_BUILDER
```

## 8.6 Uji build kecil sebelum build project

```powershell
$testDir = Join-Path $env:TEMP "buildkit-test"
New-Item -ItemType Directory -Force -Path $testDir | Out-Null

@"
FROM alpine:3.23
RUN echo BuildKit-OK
"@ | Set-Content "$testDir\Dockerfile"

docker buildx build --load -t buildkit-test $testDir
```

Jika berhasil, hapus folder:

```powershell
Remove-Item -Recurse -Force $testDir
```

## 8.7 Build image project

```powershell
docker compose build --no-cache web
```

Target akhir:

```text
Image ekspedisi-app:ukk Built
```

Tidak boleh ada:

```text
ERROR
failed to solve
libssl.so.1.1: No such file or directory
```

## 8.8 Jalankan lokal

Untuk lokal, sementara ubah `APP_URL` di Compose menjadi:

```yaml
APP_URL: http://localhost:8080
```

Kemudian:

```powershell
docker compose up -d --scale web=3
docker compose restart loadbalancer
docker compose ps -a
```

Uji:

```powershell
curl.exe http://localhost:8080/nginx-health

1..12 | ForEach-Object {
  curl.exe -s http://localhost:8080/api/instance
  Write-Host ""
}
```

Setelah pengujian:

```powershell
docker compose down
```

Jangan gunakan `docker compose down -v` jika data ingin dipertahankan.

---

# 9. Push project ke GitHub

## 9.1 Buat repository

Buat repository kosong di GitHub. Jangan otomatis membuat README, `.gitignore`, atau license jika file tersebut sudah ada secara lokal.

Gunakan repository private jika konfigurasi demo masih memuat password database.

## 9.2 Inisialisasi Git

```powershell
git init -b main
git add .
git status
```

Pastikan tidak ada:

```text
.env
node_modules/
.next/
```

Commit:

```powershell
git commit -m "Prepare UKK Docker deployment"
```

## 9.3 Tambahkan remote

```powershell
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git remote -v
```

## 9.4 Push

```powershell
git push -u origin main
```

## 9.5 Verifikasi GitHub

Harus terlihat:

- `Dockerfile`
- `docker-compose.yml`
- `entrypoint.sh`
- `nginx/nginx.conf`
- `.dockerignore`
- `.env.example`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/`
- `public/`

Tidak boleh terlihat:

- `.env`
- `node_modules`
- `.next`
- secret asli

---

# 10. Membuat VM1 dan VM2

## 10.1 VM1

| Komponen | Nilai |
|---|---|
| Nama VM | `deployment` |
| Hostname | `namasiswa_deployment` |
| OS | Ubuntu Server |
| RAM | 3 sampai 4 GB |
| CPU | 2 core |
| Disk | 25 sampai 30 GB |
| Adapter 1 | NAT |
| Adapter 2 | Bridged Adapter |

## 10.2 VM2

| Komponen | Nilai |
|---|---|
| Nama VM | `management` |
| Hostname | `namasiswa_management` |
| OS | Ubuntu Server |
| RAM | 2 GB |
| CPU | 1 sampai 2 core |
| Disk | 20 GB |
| Adapter 1 | NAT |
| Adapter 2 | Bridged Adapter |

## 10.3 Konfigurasi adapter VirtualBox

Matikan VM terlebih dahulu.

Untuk setiap VM:

1. Pilih VM.
2. Buka **Settings**.
3. Buka **Network**.
4. Pada **Adapter 1**:
   - Centang `Enable Network Adapter`.
   - Attached to: `NAT`.
   - Centang `Cable Connected`.
5. Pada **Adapter 2**:
   - Centang `Enable Network Adapter`.
   - Attached to: `Bridged Adapter`.
   - Name: pilih Wi-Fi atau Ethernet host yang sedang digunakan.
   - Centang `Cable Connected`.
6. Catat MAC Address Adapter 1 dan Adapter 2 dari menu **Advanced**.

Gunakan adapter fisik yang sama untuk Bridge pada VM1 dan VM2.

---

# 11. Mengatur hostname

## 11.1 VM1

Jalankan di terminal VM1:

```bash
sudo hostnamectl set-hostname namasiswa_deployment
sudo nano /etc/hosts
```

Pastikan ada:

```text
127.0.1.1 namasiswa_deployment
```

## 11.2 VM2

Jalankan di terminal VM2:

```bash
sudo hostnamectl set-hostname namasiswa_management
sudo nano /etc/hosts
```

Pastikan ada:

```text
127.0.1.1 namasiswa_management
```

## 11.3 Restart

Pada masing-masing VM:

```bash
sudo reboot
```

Setelah menyala:

```bash
hostname
hostnamectl
```

---

# 12. Konfigurasi IP address dan topologi jaringan

Bagian ini harus dikerjakan dengan teliti.

## 12.1 Fungsi masing-masing adapter

| Adapter | Mode | Fungsi |
|---|---|---|
| Adapter 1 | NAT | Internet, `apt`, GitHub, Docker Hub |
| Adapter 2 | Bridge | Komunikasi Host, VM1, dan VM2 pada `172.20.3.0/24` |

NAT menggunakan DHCP. Jangan memberi IP statis asesor pada interface NAT.

IP dari asesor dipasang pada interface Bridge.

## 12.2 Konfigurasi IP komputer host

Dokumen UKK memberikan IP Host. Host harus berada pada subnet yang sama dengan interface Bridge VM.

Contoh:

```text
IP Host : 172.20.3.12
Subnet  : 255.255.255.0
Gateway : 172.20.3.1
DNS     : 8.8.8.8
```

### Cara mengatur di Windows saat berada di laboratorium UKK

1. Buka **Settings**.
2. Pilih **Network & Internet**.
3. Pilih **Advanced network settings**.
4. Pilih **More network adapter options**.
5. Klik kanan adapter fisik yang digunakan oleh Bridge.
6. Pilih **Properties**.
7. Pilih **Internet Protocol Version 4 (TCP/IPv4)**.
8. Klik **Properties**.
9. Pilih **Use the following IP address**.
10. Isi:
    - IP address: IP Host dari asesor.
    - Subnet mask: `255.255.255.0`.
    - Default gateway: `172.20.3.1`.
    - Preferred DNS: `8.8.8.8`.
11. Klik OK.
12. Jalankan:

```powershell
ipconfig /all
```

### Latihan di rumah

Jangan mengganti konfigurasi internet utama jika jaringan rumah bukan `172.20.3.0/24`.

Untuk latihan, salah satu pilihan berikut dapat digunakan:

- Tambahkan IP sekunder `172.20.3.x/24` tanpa gateway pada adapter host.
- Gunakan Host-Only Adapter sementara.
- Buat jaringan laboratorium khusus.

Pada ujian tetap gunakan Bridged Adapter jika itu yang ditetapkan asesor.

## 12.3 Identifikasi interface NAT dan Bridge pada Ubuntu

Jalankan di VM1:

```bash
ip -br link
ip -br addr
ip link
ip route
```

Contoh:

```text
enp0s3  UP  10.0.2.15/24
enp0s8  UP
```

Biasanya:

```text
enp0s3 = NAT
enp0s8 = Bridge
```

Jangan langsung berasumsi. Cocokkan MAC Address:

1. Buka VirtualBox Settings VM.
2. Catat MAC Address Adapter 1 dan Adapter 2.
3. Di Ubuntu jalankan:

```bash
ip link
```

4. Cari `link/ether`.
5. Cocokkan MAC Ubuntu dengan MAC VirtualBox.

Ulangi proses ini pada VM2. Nama interface VM2 bisa berbeda dari VM1.

## 12.4 Periksa file Netplan

Jalankan pada masing-masing VM:

```bash
ls -lah /etc/netplan
sudo cat /etc/netplan/*.yaml
```

Nama file dapat berupa:

```text
00-installer-config.yaml
01-netcfg.yaml
50-cloud-init.yaml
```

## 12.5 Backup Netplan

Pada VM1:

```bash
sudo mkdir -p /root/netplan-backup
sudo cp -a /etc/netplan/*.yaml /root/netplan-backup/
```

Pada VM2 lakukan perintah yang sama.

## 12.6 Jika file dikelola cloud-init

Periksa:

```bash
grep -R "generated by cloud-init" /etc/netplan || true
```

Jika hasil menunjukkan `50-cloud-init.yaml`, jalankan:

```bash
echo 'network: {config: disabled}' \
  | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

Pindahkan file YAML lama dari direktori aktif:

```bash
sudo mkdir -p /root/netplan-original
sudo mv /etc/netplan/*.yaml /root/netplan-original/
```

Jika tidak dikelola cloud-init, kamu tetap boleh memindahkan YAML lama ke backup agar tidak terjadi penggabungan konfigurasi.

```bash
sudo mkdir -p /root/netplan-original
sudo mv /etc/netplan/*.yaml /root/netplan-original/
```

Konfigurasi jaringan yang sedang aktif tidak langsung hilang sampai `netplan apply` dijalankan.

## 12.7 Buat Netplan VM1

Jalankan di VM1:

```bash
sudo nano /etc/netplan/01-ukk.yaml
```

Contoh untuk:

```text
IP VM1  : 172.20.3.13
Gateway : 172.20.3.1
DNS     : 8.8.8.8
NAT     : enp0s3
Bridge  : enp0s8
```

Isi:

```yaml
network:
  version: 2
  renderer: networkd

  ethernets:
    enp0s3:
      dhcp4: true
      dhcp6: false
      optional: true
      dhcp4-overrides:
        route-metric: 100
        use-dns: false
      nameservers:
        addresses:
          - 8.8.8.8

    enp0s8:
      dhcp4: false
      dhcp6: false
      optional: true
      addresses:
        - 172.20.3.13/24
      routes:
        - to: default
          via: 172.20.3.1
          metric: 200
```

Yang wajib diganti:

- `enp0s3` sesuai interface NAT VM1.
- `enp0s8` sesuai interface Bridge VM1.
- `172.20.3.13/24` sesuai IP VM1 dari asesor.

Jangan mengganti `8.8.8.8` dengan gateway. `8.8.8.8` adalah DNS.

## 12.8 Buat Netplan VM2

Jalankan di terminal VM2:

```bash
sudo nano /etc/netplan/01-ukk.yaml
```

Contoh untuk IP VM2 `172.20.3.14`:

```yaml
network:
  version: 2
  renderer: networkd

  ethernets:
    enp0s3:
      dhcp4: true
      dhcp6: false
      optional: true
      dhcp4-overrides:
        route-metric: 100
        use-dns: false
      nameservers:
        addresses:
          - 8.8.8.8

    enp0s8:
      dhcp4: false
      dhcp6: false
      optional: true
      addresses:
        - 172.20.3.14/24
      routes:
        - to: default
          via: 172.20.3.1
          metric: 200
```

Yang wajib diganti:

- Nama interface sesuai VM2.
- IP `172.20.3.14/24` sesuai IP VM2 dari asesor.

## 12.9 Arti metric

```text
NAT route metric    : 100
Bridge route metric : 200
```

Metric lebih kecil diprioritaskan. Internet akan memakai NAT, sedangkan Bridge tetap digunakan untuk subnet `172.20.3.0/24`.

## 12.10 Jika asesor tidak meminta default route Bridge

Jika jaringan bermasalah setelah menambahkan route Bridge, hapus blok berikut pada `enp0s8`:

```yaml
routes:
  - to: default
    via: 172.20.3.1
    metric: 200
```

IP Host, VM1, dan VM2 tetap dapat berkomunikasi karena semuanya berada pada subnet `172.20.3.0/24`.

## 12.11 Periksa permission file

Pada masing-masing VM:

```bash
sudo chmod 600 /etc/netplan/01-ukk.yaml
```

## 12.12 Validasi sintaks

Jalankan dari console VM, bukan hanya dari koneksi SSH:

```bash
sudo netplan generate
```

Jika tidak ada error:

```bash
sudo netplan try --timeout 120
```

Konfirmasi konfigurasi jika koneksi tetap normal.

Kemudian:

```bash
sudo netplan apply
```

## 12.13 Jika Netplan gagal

Jangan panik. Karena kamu berada di console VM, restore:

```bash
sudo rm -f /etc/netplan/01-ukk.yaml
sudo cp -a /root/netplan-backup/*.yaml /etc/netplan/
sudo netplan generate
sudo netplan apply
```

## 12.14 Verifikasi VM1

```bash
ip -br addr
ip route
ip route get 8.8.8.8
ip route get IP_VM2
resolvectl status
```

Contoh hasil yang diharapkan:

```text
enp0s3  UP  10.0.2.15/24
enp0s8  UP  172.20.3.13/24
```

Route internet seharusnya melalui NAT:

```text
8.8.8.8 via 10.0.2.2 dev enp0s3
```

Route ke VM2 seharusnya melalui Bridge:

```text
172.20.3.14 dev enp0s8 src 172.20.3.13
```

## 12.15 Verifikasi VM2

```bash
ip -br addr
ip route
ip route get 8.8.8.8
ip route get IP_VM1
resolvectl status
```

## 12.16 Kesalahan YAML yang umum

Salah:

```yaml
addresses:
-172.20.3.13/24
```

Benar:

```yaml
addresses:
  - 172.20.3.13/24
```

Gunakan spasi, bukan tab.

---

# 13. Pengujian jaringan sebelum deployment

Jangan install Docker atau menjalankan deployment sebelum seluruh pengujian penting berhasil.

## 13.1 Dari VM1

Ganti placeholder dengan IP nyata:

```bash
ping -c 4 IP_VM2
ping -c 4 IP_HOST
ping -c 4 172.20.3.1
ping -c 4 8.8.8.8
getent hosts github.com
```

Untuk memastikan Bridge dipakai:

```bash
ping -I INTERFACE_BRIDGE_VM1 -c 4 IP_VM2
```

Contoh:

```bash
ping -I enp0s8 -c 4 172.20.3.14
```

## 13.2 Dari VM2

```bash
ping -c 4 IP_VM1
ping -c 4 IP_HOST
ping -c 4 172.20.3.1
ping -c 4 8.8.8.8
getent hosts github.com
```

## 13.3 Dari host Windows

```powershell
ping IP_VM1
ping IP_VM2
```

## 13.4 Target minimum

- Host dapat ping VM1.
- Host dapat ping VM2.
- VM1 dapat ping VM2.
- VM2 dapat ping VM1.
- VM1 dapat mengakses `8.8.8.8`.
- VM1 dapat resolve `github.com`.
- VM2 dapat mengakses internet untuk instalasi SSH dan FTP.

## 13.5 Jika ping host ke VM gagal

Periksa:

- Adapter Bridge aktif.
- VM1 dan VM2 memilih adapter fisik host yang sama.
- IP berada pada subnet `/24` yang sama.
- Windows Firewall tidak memblokir ICMP.
- Access point tidak mengaktifkan client isolation.
- Cable Connected aktif.

---

# 14. Install Docker Engine pada VM1

Jalankan hanya di VM1.

## 14.1 Hapus package konflik jika ada

```bash
sudo apt remove -y \
  docker.io \
  docker-compose \
  docker-compose-v2 \
  docker-doc \
  podman-docker \
  containerd \
  runc
```

Tidak masalah jika beberapa package tidak ditemukan.

## 14.2 Install dependency repository

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
```

## 14.3 Tambahkan GPG key Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc
```

## 14.4 Tambahkan repository Docker

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

## 14.5 Install Docker

```bash
sudo apt update

sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

## 14.6 Aktifkan service

```bash
sudo systemctl enable --now docker
sudo systemctl enable --now containerd
```

## 14.7 Tambahkan user ke grup Docker

```bash
sudo usermod -aG docker "$USER"
```

Logout lalu login kembali, atau:

```bash
newgrp docker
```

## 14.8 Verifikasi

```bash
docker version
docker compose version
docker buildx version
docker run --rm hello-world
```

---

# 15. Clone project dan menyiapkan environment di VM1

## 15.1 Buat direktori UKK

```bash
sudo mkdir -p /home/ujikom
sudo chown -R "$USER":"$USER" /home/ujikom
cd /home/ujikom
```

## 15.2 Clone repository

```bash
git clone https://github.com/USERNAME/NAMA-REPOSITORY.git ekspedisi-aja
cd /home/ujikom/ekspedisi-aja
```

Periksa:

```bash
pwd
ls -la
git remote -v
git log --oneline -3
```

## 15.3 Buat `.env`

```bash
cp .env.example .env
nano .env
```

Isi token asli untuk:

- JWT.
- reCAPTCHA.
- Midtrans.
- SMTP.

`DATABASE_URL` pada `.env` boleh tetap:

```env
DATABASE_URL=mysql://root:@127.0.0.1:3306/ekspedisi_aja
```

Compose akan menimpanya di dalam container menjadi:

```text
mysql://ekspedisi:ekspedisi_secret@database:3306/ekspedisi_aja
```

## 15.4 Ubah `APP_URL` Compose

```bash
nano docker-compose.yml
```

Ganti:

```yaml
APP_URL: http://IP_VM1:8080
```

menjadi IP VM1 sebenarnya, contoh:

```yaml
APP_URL: http://172.20.3.13:8080
```

## 15.5 Permission entrypoint

```bash
chmod +x entrypoint.sh
```

## 15.6 Validasi Compose

```bash
docker compose config > /dev/null
docker compose config --services
```

Target:

```text
database
migrate
web
loadbalancer
```

---

# 16. Build dan menjalankan deployment di VM1

## 16.1 Periksa builder VM1

```bash
docker buildx ls
docker buildx inspect --bootstrap
```

## 16.2 Build custom image

```bash
docker compose build --no-cache web
```

Target:

```text
Image ekspedisi-app:ukk Built
```

## 16.3 Periksa image

```bash
docker images
docker image inspect ekspedisi-app:ukk
```

## 16.4 Verifikasi Prisma di image

```bash
docker run --rm \
  --entrypoint sh \
  ekspedisi-app:ukk \
  -c "npx prisma -v"
```

Periksa file:

```bash
docker run --rm \
  --entrypoint sh \
  ekspedisi-app:ukk \
  -c "test -f /app/prisma/schema.prisma \
      && test -f /app/prisma/seed.ts \
      && test -x /app/entrypoint.sh \
      && echo FILE_OK"
```

Target:

```text
FILE_OK
```

## 16.5 Jalankan semua service

```bash
docker compose up -d --scale web=3
```

## 16.6 Restart Nginx setelah scaling

```bash
docker compose restart loadbalancer
```

## 16.7 Periksa status

```bash
docker compose ps -a
```

Target:

```text
database       running healthy
migrate        exited 0
web-1          running
web-2          running
web-3          running
loadbalancer   running
```

Nama lengkap container dapat memiliki prefix nama project.

## 16.8 Jika ada service gagal

```bash
docker compose logs database
docker compose logs migrate
docker compose logs web
docker compose logs loadbalancer
```

Gunakan log follow:

```bash
docker compose logs -f web
```

Tekan `Ctrl + C` untuk berhenti melihat log.

---

# 17. Pengujian lengkap deployment VM1

## 17.1 Uji health Nginx dari VM1

```bash
curl http://localhost:8080/nginx-health
```

Target:

```text
Nginx load balancer aktif
```

## 17.2 Uji dari host

Buka browser:

```text
http://IP_VM1:8080
```

PowerShell:

```powershell
curl.exe http://IP_VM1:8080/nginx-health
```

## 17.3 Buktikan tiga container web

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

## 17.4 Buktikan load balancing

```bash
for i in $(seq 1 15); do
  curl -s "http://localhost:8080/api/instance?request=$i"
  echo
done
```

Harus muncul minimal tiga hostname berbeda:

```text
ekspedisi-aja-web-1
ekspedisi-aja-web-2
ekspedisi-aja-web-3
```

Urutan tidak wajib berurutan.

## 17.5 Periksa header upstream

```bash
curl -I http://localhost:8080
```

Cari:

```text
X-Upstream-Address
```

## 17.6 Buktikan web tidak dapat diakses langsung

```bash
curl http://localhost:3000
```

Perintah harus gagal karena service web hanya memakai `expose`.

## 17.7 Periksa network

```bash
docker network inspect network-ujikom
```

Pastikan database, web, dan loadbalancer terhubung.

## 17.8 Periksa volume

```bash
docker volume inspect volume-ujikom
```

## 17.9 Periksa tabel MySQL

```bash
docker compose exec database \
  mysql \
  -uekspedisi \
  -pekspedisi_secret \
  ekspedisi_aja \
  -e "SHOW TABLES;"
```

## 17.10 Periksa seed

```bash
docker compose exec database \
  mysql \
  -uekspedisi \
  -pekspedisi_secret \
  ekspedisi_aja \
  -e "SELECT COUNT(*) AS jumlah_cabang FROM branches;"
```

## 17.11 Uji data aplikasi

1. Login ke aplikasi.
2. Tambahkan atau ubah satu data.
3. Catat ID atau nama datanya.
4. Refresh halaman.
5. Pastikan data tetap tampil.

## 17.12 Uji persistence database

```bash
docker compose down
```

Periksa volume:

```bash
docker volume ls | grep volume-ujikom
```

Jalankan kembali:

```bash
docker compose up -d --scale web=3
docker compose restart loadbalancer
```

Pastikan data yang dicatat masih ada.

> [!DANGER]
> Jangan menjalankan `docker compose down -v` saat menguji persistence. Opsi `-v` menghapus volume database.

---

# 18. Konfigurasi SSH password-less pada VM2

## 18.1 Install OpenSSH pada VM2

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
```

Periksa:

```bash
sudo systemctl status ssh --no-pager
ss -tulpn | grep :22
```

## 18.2 Jika UFW aktif

```bash
sudo ufw status
sudo ufw allow OpenSSH
sudo ufw reload
```

## 18.3 Buat key dari VM1

Jalankan di VM1:

```bash
ssh-keygen -t ed25519 -C "ukk-vm1-to-vm2"
```

Tekan Enter untuk lokasi default.

Jika diminta password-less penuh, kosongkan passphrase.

## 18.4 Salin key ke VM2

```bash
ssh-copy-id USER_VM2@IP_VM2
```

Masukkan password akun VM2 satu kali.

## 18.5 Periksa permission di VM2

Login ke VM2, lalu:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 18.6 Uji tanpa password

Dari VM1:

```bash
ssh -o PasswordAuthentication=no \
  USER_VM2@IP_VM2 \
  "hostname && whoami"
```

Target:

```text
namasiswa_management
USER_VM2
```

---

# 19. Konfigurasi FTP pada VM2

FTP biasa tidak mengenkripsi password dan data. Gunakan hanya untuk demonstrasi laboratorium.

## 19.1 Install vsftpd

```bash
sudo apt update
sudo apt install -y vsftpd
sudo systemctl enable --now vsftpd
```

Backup:

```bash
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup
```

## 19.2 Buat user FTP

```bash
sudo adduser ftpukk
```

Buat folder:

```bash
sudo mkdir -p /home/ftpukk/upload
sudo chown -R ftpukk:ftpukk /home/ftpukk/upload
```

## 19.3 Edit konfigurasi

```bash
sudo nano /etc/vsftpd.conf
```

Pastikan:

```ini
listen=NO
listen_ipv6=YES

anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022

dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES

chroot_local_user=YES
allow_writeable_chroot=YES

pam_service_name=vsftpd
secure_chroot_dir=/var/run/vsftpd/empty

pasv_enable=YES
pasv_min_port=40000
pasv_max_port=40100

ssl_enable=NO
```

Pastikan tidak ada dua nilai yang bertentangan dalam file.

## 19.4 Restart

```bash
sudo systemctl restart vsftpd
sudo systemctl status vsftpd --no-pager
ss -tulpn | grep :21
```

## 19.5 Firewall

Jika UFW aktif:

```bash
sudo ufw allow 21/tcp
sudo ufw allow 40000:40100/tcp
sudo ufw reload
```

## 19.6 Uji dengan FileZilla dari host

| Kolom | Nilai |
|---|---|
| Host | IP VM2 |
| Port | 21 |
| Protocol | FTP |
| Encryption | Only use plain FTP |
| Logon Type | Normal |
| User | `ftpukk` |
| Password | Password user `ftpukk` |

Lakukan:

1. Login.
2. Buka folder `upload`.
3. Upload `bukti-ftp.txt`.
4. Periksa di VM2:

```bash
ls -lah /home/ftpukk/upload
```

5. Download kembali file ke host.
6. Ambil screenshot.

---

# 20. Pengujian restart policy

## 20.1 VM1

```bash
cd /home/ujikom/ekspedisi-aja
docker compose ps -a
sudo reboot
```

Setelah VM1 hidup:

```bash
cd /home/ujikom/ekspedisi-aja
docker compose ps -a
curl http://localhost:8080/nginx-health
```

Database, web, dan loadbalancer harus aktif kembali. Service `migrate` tetap `exited 0`, dan itu normal.

## 20.2 VM2

```bash
sudo reboot
```

Setelah hidup:

```bash
sudo systemctl status ssh --no-pager
sudo systemctl status vsftpd --no-pager
```

---

# 21. Dokumentasi yang harus dikumpulkan

1. Pengaturan Adapter 1 NAT VM1.
2. Pengaturan Adapter 2 Bridge VM1.
3. Pengaturan Adapter 1 NAT VM2.
4. Pengaturan Adapter 2 Bridge VM2.
5. MAC Address setiap adapter.
6. Hostname VM1.
7. Hostname VM2.
8. `ip -br addr` VM1.
9. `ip route` VM1.
10. `ip -br addr` VM2.
11. `ip route` VM2.
12. Ping VM1 ke VM2.
13. Ping VM2 ke VM1.
14. Ping host ke VM1.
15. Ping host ke VM2.
16. Repository GitHub.
17. Hasil `git clone`.
18. Struktur `/home/ujikom/ekspedisi-aja`.
19. Isi Dockerfile.
20. Isi `docker-compose.yml`.
21. Isi `nginx/nginx.conf`.
22. Hasil `docker images`.
23. Hasil `docker compose ps -a`.
24. Database healthy.
25. Migrate exited 0.
26. Tiga replica web.
27. Loadbalancer pada port 8080.
28. `docker network inspect network-ujikom`.
29. `docker volume inspect volume-ujikom`.
30. Output `/api/instance` dengan tiga hostname.
31. Bukti port host 3000 tidak dapat diakses.
32. Tabel MySQL.
33. Data seed.
34. Data tetap ada setelah `down` dan `up`.
35. Container aktif kembali setelah reboot.
36. SSH VM1 ke VM2 tanpa password.
37. FTP upload dari host.
38. FTP download ke host.

Nama file screenshot yang disarankan:

```text
01-adapter-vm1.png
02-adapter-vm2.png
03-hostname-vm1.png
04-hostname-vm2.png
05-ip-vm1.png
06-ip-vm2.png
07-ping-vm1-vm2.png
08-docker-images.png
09-compose-ps.png
10-load-balancing.png
11-database.png
12-ssh-passwordless.png
13-ftp.png
```

---

# 22. Urutan demonstrasi kepada asesor

1. Tunjukkan dua VM.
2. Tunjukkan Adapter NAT dan Bridge pada VM1.
3. Tunjukkan Adapter NAT dan Bridge pada VM2.
4. Tunjukkan hostname kedua VM.
5. Tunjukkan IP address dan route.
6. Tunjukkan ping Host, VM1, dan VM2.
7. Tunjukkan repository GitHub.
8. Tunjukkan project di `/home/ujikom/ekspedisi-aja`.
9. Tunjukkan custom image.
10. Tunjukkan database, migrate, tiga web, dan loadbalancer.
11. Tunjukkan `network-ujikom`.
12. Tunjukkan `volume-ujikom`.
13. Buktikan port 3000 host tidak terbuka.
14. Buka aplikasi melalui `http://IP_VM1:8080`.
15. Jalankan curl berulang ke `/api/instance`.
16. Tunjukkan tiga hostname berbeda.
17. Tunjukkan tabel dan data MySQL.
18. Buktikan persistence.
19. Buktikan restart policy.
20. Dari VM1, login ke VM2 tanpa password.
21. Dari host, upload dan download FTP.
22. Jelaskan bahwa penyederhanaan VM2 sudah disetujui asesor.

---

# 23. Troubleshooting lengkap

## 23.1 `docker compose config` menampilkan YAML error

Penyebab umum:

- Kutip tidak berpasangan.
- Format list `[...]` salah.
- Indentasi salah.
- Menggunakan tab.

Gunakan healthcheck bentuk blok:

```yaml
healthcheck:
  test:
    - CMD-SHELL
    - mysqladmin ping -h 127.0.0.1 -uroot -proot_super_secret_pass --silent
```

## 23.2 Docker daemon Windows tidak aktif

Error:

```text
failed to connect to the docker API
dockerDesktopLinuxEngine
```

Solusi:

1. Buka Docker Desktop.
2. Tunggu engine running.
3. Jalankan:

```powershell
docker version
docker info
docker run --rm hello-world
```

## 23.3 BuildKit h2c error

```text
unable to upgrade to h2c, received 500
```

Solusi:

```powershell
wsl --shutdown
```

Restart Docker Desktop, lalu:

```powershell
docker buildx inspect --bootstrap
```

Jika tetap gagal, buat `ukk-builder`.

## 23.4 Prisma OpenSSL error

```text
libssl.so.1.1: No such file or directory
```

Gunakan Dockerfile `node:20-bookworm-slim` pada panduan ini. Jangan memakai hasil image lama.

Build ulang:

```bash
docker compose build --no-cache web
```

## 23.5 Alpine DNS transient error

```text
DNS: transient error
```

Nginx dan MySQL masih menggunakan image Alpine atau Oracle Linux yang perlu ditarik dari internet. Periksa DNS Docker:

```bash
docker run --rm alpine:3.23 nslookup dl-cdn.alpinelinux.org
```

Restart Docker atau jaringan jika gagal.

## 23.6 Web tidak bisa di-scale

Penyebab: ada `container_name`.

Hapus `container_name` dari service `web`.

## 23.7 Migrate tidak menemukan image

Build image terlebih dahulu:

```bash
docker compose build web
docker compose up -d --scale web=3
```

## 23.8 Database tidak healthy

```bash
docker compose logs database
```

Periksa:

- Port 3306 tidak bentrok.
- Password healthcheck sama.
- Volume lama tidak berisi konfigurasi password berbeda.

Untuk mengulang database dari nol hanya saat data boleh dihapus:

```bash
docker compose down -v
```

## 23.9 Migrate gagal

```bash
docker compose logs migrate
```

Periksa:

- `prisma/seed.ts` masuk image.
- `DATABASE_URL` memakai host `database`.
- Database healthy.
- Seed idempotent.

## 23.10 Nginx 502

```bash
docker compose logs web
docker compose logs loadbalancer
docker compose restart loadbalancer
```

Pastikan tiga web running.

## 23.11 Hanya satu hostname muncul

Restart Nginx setelah scaling:

```bash
docker compose restart loadbalancer
```

Gunakan request tanpa cache:

```bash
curl -s "http://localhost:8080/api/instance?x=$(date +%s%N)"
```

## 23.12 Port 3306 bentrok

```bash
sudo ss -tulpn | grep :3306
```

Hentikan MySQL lokal pada VM1. Kriteria UKK tetap meminta `3306:3306`.

## 23.13 `entrypoint.sh: permission denied`

```bash
chmod +x entrypoint.sh
docker compose build --no-cache web
```

Dockerfile juga menghapus CRLF dengan `sed`.

## 23.14 `netplan generate` gagal

Periksa:

```bash
sudo cat -n /etc/netplan/01-ukk.yaml
```

Pastikan tidak ada tab.

## 23.15 Internet gagal setelah Netplan

Periksa:

```bash
ip route
ip route get 8.8.8.8
```

Jika route internet lewat Bridge yang tidak bekerja, hapus route default Bridge dan apply ulang.

## 23.16 VM tidak saling ping

Periksa:

- IP dan prefix `/24`.
- Adapter Bridge.
- MAC mapping.
- Adapter fisik yang dipilih.
- Windows Firewall.
- Client isolation Wi-Fi.

## 23.17 SSH masih meminta password

```bash
ssh-copy-id USER_VM2@IP_VM2
```

Di VM2:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 23.18 FTP gagal login

```bash
sudo systemctl status vsftpd
sudo journalctl -u vsftpd --no-pager -n 100
```

Periksa user, password, port 21, dan passive ports.

---

# 24. Checklist akhir

## Project dan GitHub

- [ ] `.env` tidak masuk GitHub.
- [ ] `.env.example` sesuai source.
- [ ] Dockerfile final digunakan.
- [ ] `entrypoint.sh` final digunakan.
- [ ] Compose final digunakan.
- [ ] Nginx final digunakan.
- [ ] `/api/instance` tersedia.
- [ ] Project berhasil di-push.

## Virtualisasi

- [ ] VM1 Ubuntu Server tersedia.
- [ ] VM2 Ubuntu Server tersedia.
- [ ] VM1 memiliki NAT dan Bridge.
- [ ] VM2 memiliki NAT dan Bridge.
- [ ] Hostname VM1 benar.
- [ ] Hostname VM2 benar.

## Jaringan

- [ ] IP Host sesuai asesor.
- [ ] IP VM1 sesuai asesor.
- [ ] IP VM2 sesuai asesor.
- [ ] DNS 8.8.8.8 dikonfigurasi.
- [ ] Gateway 172.20.3.1 dikonfigurasi jika diwajibkan.
- [ ] NAT menjadi route prioritas.
- [ ] Host dapat ping VM1.
- [ ] Host dapat ping VM2.
- [ ] VM1 dapat ping VM2.
- [ ] VM2 dapat ping VM1.
- [ ] VM1 dapat mengakses internet.
- [ ] VM2 dapat mengakses internet.

## Docker VM1

- [ ] Docker Engine aktif.
- [ ] Docker Compose aktif.
- [ ] Custom image `ekspedisi-app:ukk` tersedia.
- [ ] Database healthy.
- [ ] Migrate exited 0.
- [ ] Tiga web running.
- [ ] Loadbalancer running.
- [ ] Web hanya expose 3000.
- [ ] Loadbalancer menggunakan 8080:80.
- [ ] Database menggunakan 3306:3306.
- [ ] `volume-ujikom` tersedia.
- [ ] `network-ujikom` tersedia.
- [ ] Tiga hostname terbukti.
- [ ] Data database persisten.
- [ ] Restart policy terbukti.

## VM2

- [ ] SSH Server aktif.
- [ ] VM1 dapat login ke VM2 tanpa password.
- [ ] FTP Server aktif.
- [ ] Host dapat upload file.
- [ ] Host dapat download file.
- [ ] Penyederhanaan VM2 sudah disetujui asesor.

## Dokumentasi

- [ ] Semua screenshot tersimpan.
- [ ] Output command penting disimpan.
- [ ] Urutan demonstrasi sudah dilatih.
- [ ] Backup repository dan konfigurasi tersedia.

---

# Referensi resmi

- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose: https://docs.docker.com/compose/
- Docker Buildx inspect: https://docs.docker.com/reference/cli/docker/buildx/inspect/
- Docker builder management: https://docs.docker.com/build/builders/manage/
- Netplan YAML reference: https://netplan.readthedocs.io/en/latest/netplan-yaml/
- Prisma Docker guide: https://www.prisma.io/docs/guides/deployment/docker

Panduan ini juga disusun berdasarkan dokumen Simulasi UKK dan panduan sebelumnya yang diberikan pengguna.
