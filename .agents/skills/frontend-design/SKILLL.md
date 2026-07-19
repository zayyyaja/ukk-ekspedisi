# Panduan Praktik Demonstrasi UKK
## Next.js, Docker, MySQL, Nginx, FTP, dan SSH Key-Based Authentication

Panduan ini disesuaikan dengan dokumen **09.FR.IA.02 Tugas Praktik Demonstrasi** dan project Next.js Ekspedisi.

> **IP yang digunakan berdasarkan baris No. 10 pada tabel**
>
> - Network: `192.168.12.0/24`
> - DNS: `8.8.8.8`
> - Gateway: `192.168.12.1`
> - IP Host: `192.168.12.92`
> - IP VM1: `192.168.12.93`
> - IP VM2: `192.168.12.94`
>
> Panduan ini menganggap asesor memang menetapkan **baris No. 10** kepadamu. Apabila “nomor absen 10” dimaksudkan sebagai nomor peserta aktual yang masuk rentang 2–11, IP-nya berbeda. Konfirmasi satu kali kepada asesor sebelum mengubah IP.

> **Klarifikasi penting**
>
> Soal menetapkan VM1 sebagai FTP dan SSH server, serta VM2 sebagai web dan database server. Pada bagian deployment terdapat satu kalimat yang menyebut aplikasi disiapkan di VM1, tetapi judul bagian dan skenario menempatkannya di VM2. Panduan ini menempatkan deployment Docker di **VM2**.
>
> Soal menyebut Laravel, sedangkan project yang digunakan adalah Next.js. Pastikan asesor mengizinkan Next.js sebagai aplikasi custom image.

---

# 1. Target akhir

```text
HOST
IP 192.168.12.92/24
│
├── VM1: ujikom1_nama
│   IP Bridge 192.168.12.93/24
│   ├── FTP Server
│   │   ├── directory /ujikom-share
│   │   ├── user ujikom
│   │   ├── password ujikom
│   │   ├── full access
│   │   └── anonymous ditolak
│   └── SSH Server
│
└── VM2: ujikom2_nama
    IP Bridge 192.168.12.94/24
    ├── Docker Engine
    ├── app-1, Next.js, expose 3000
    ├── app-2, Next.js, expose 3000
    ├── db, MySQL, 3306:3306
    ├── loadbalancer, Nginx, 8080:80
    ├── app-volume
    ├── db-volume
    └── ujikom-net
```

Akses aplikasi:

```text
http://192.168.12.94:8080
```

---

# 2. Siapkan project

Pastikan file penting tersedia:

```text
ekspedisi/
├── nginx/nginx.conf
├── prisma/schema.prisma
├── prisma/seed.ts
├── public/
├── src/
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── entrypoint.sh
├── next.config.ts
├── package.json
└── package-lock.json
```

## 2.1 Endpoint pembuktian load balancing

Buat `src/app/api/instance/route.ts`:

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

## 2.2 `.gitignore`

```gitignore
node_modules/
.next/
out/

.env
.env.*
!.env.example

*.tsbuildinfo
*.log
coverage/

scratch/
.agents/
.vscode/
.idea/

.DS_Store
Thumbs.db
```

## 2.3 `.dockerignore`

```dockerignore
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

.next/
out/
.env*

.git/
.github/
.gitignore

Dockerfile
Dockerfile.*
docker-compose.yml
docker-compose.*.yml
compose.yml
compose.yaml
.dockerignore

nginx/
mysql/
ssl/

*.pem
*.key
*.crt
*.p12
*.pfx

.agents/
scratch/
.vscode/
.idea/

*.log
*.tsbuildinfo
.eslintcache
lighthouse-report.json

__tests__/
coverage/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx

.DS_Store
Thumbs.db
*.swp
*.swo

README.md
setup.sh
```

Jangan memasukkan `prisma/` atau `prisma/seed.ts`.

## 2.4 `.env.example`

```env
APP_URL=http://localhost:3000
DATABASE_URL=mysql://root:@127.0.0.1:3306/ekspedisi_aja

JWT_ACCESS_SECRET=replace-with-random-access-secret-min-32-chars
JWT_REFRESH_SECRET=replace-with-random-refresh-secret-min-32-chars
JWT_EMAIL_VERIFICATION_SECRET=replace-with-random-email-verification-secret

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
MAILTRAP_FROM="DRG Ekspedisi <noreply@example.com>"
```

## 2.5 Dockerfile

```dockerfile
FROM node:20-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

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

RUN mkdir -p /app/storage \
    && chown -R node:node /app/storage \
    && sed -i 's/\r$//' ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && chown node:node ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
```

## 2.6 entrypoint.sh

```sh
#!/bin/sh

set -eu

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

    socket.on("error", () => process.exit(1));
  '
}

echo "Menunggu database ${DB_HOST}:${DB_PORT}"

until check_database; do
  if [ "$attempt" -ge "$DB_MAX_RETRIES" ]; then
    echo "Database tidak dapat diakses."
    exit 1
  fi

  echo "Percobaan ${attempt}/${DB_MAX_RETRIES}"
  attempt=$((attempt + 1))
  sleep "$DB_RETRY_INTERVAL"
done

echo "Database siap"
echo "Container aplikasi: $(hostname)"

exec npm run start
```

Pada `package.json`, pastikan:

```json
"start": "next start --hostname 0.0.0.0 --port 3000"
```

## 2.7 docker-compose.yml

```yaml
services:
  db:
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
      - db-volume:/var/lib/mysql

    networks:
      - ujikom-net

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
      DATABASE_URL: mysql://ekspedisi:ekspedisi_secret@db:3306/ekspedisi_aja

    depends_on:
      db:
        condition: service_healthy

    entrypoint:
      - /bin/sh
      - -c

    command:
      - |
        set -eu
        npx prisma db push --skip-generate
        npx prisma db seed

    networks:
      - ujikom-net

  app:
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
      DATABASE_URL: mysql://ekspedisi:ekspedisi_secret@db:3306/ekspedisi_aja
      APP_URL: http://192.168.12.94:8080
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: "3306"

    expose:
      - "3000"

    volumes:
      - app-volume:/app/storage

    depends_on:
      db:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully

    networks:
      - ujikom-net

  loadbalancer:
    image: nginx:alpine
    restart: unless-stopped

    ports:
      - "8080:80"

    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro

    depends_on:
      app:
        condition: service_started

    networks:
      - ujikom-net

volumes:
  app-volume:
    name: app-volume

  db-volume:
    name: db-volume

networks:
  ujikom-net:
    name: ujikom-net
    driver: bridge
```

Tidak boleh ada `container_name` pada service `app`.

## 2.8 nginx/nginx.conf

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

upstream nextjs_cluster {
    least_conn;
    server app:3000;
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
        proxy_next_upstream_tries 2;

        add_header X-Upstream-Address $upstream_addr always;
    }
}
```

---

# 3. Push project ke GitHub

```powershell
npm ci
npx prisma validate
npx prisma generate
npm run build
```

Periksa:

```powershell
git check-ignore -v .env
git status --short
```

Pastikan `.env`, `node_modules`, dan `.next` tidak masuk.

```powershell
git init -b main
git add .
git status
git commit -m "Prepare real UKK deployment"
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git remote -v
git push -u origin main
```

---

# 4. Buat VM1 dan VM2

## VM1

```text
Hostname  : ujikom1_nama
Peran     : FTP dan SSH
RAM       : 2 GB
CPU       : 1–2 core
Disk      : 20 GB
Adapter 1 : NAT
Adapter 2 : Bridged Adapter
IP Bridge : 192.168.12.93/24
```

## VM2

```text
Hostname  : ujikom2_nama
Peran     : Web, database, load balancer
RAM       : 3–4 GB
CPU       : 2 core
Disk      : 30 GB
Adapter 1 : NAT
Adapter 2 : Bridged Adapter
IP Bridge : 192.168.12.94/24
```

Pada VirtualBox:

1. Matikan VM.
2. Adapter 1: NAT.
3. Adapter 2: Bridged Adapter.
4. Pilih adapter fisik host yang terhubung ke jaringan UKK.
5. Aktifkan Cable Connected.
6. Catat MAC Address kedua adapter.
7. Gunakan adapter Bridge yang sama pada VM1 dan VM2.

---

# 5. Konfigurasi IP host Windows

Atur adapter fisik jaringan UKK:

```text
IP address      : 192.168.12.92
Subnet mask     : 255.255.255.0
Default gateway : 192.168.12.1
Preferred DNS   : 8.8.8.8
```

Buka:

```text
Settings
→ Network & Internet
→ Advanced network settings
→ More network adapter options
→ Properties adapter aktif
→ Internet Protocol Version 4
```

Periksa:

```powershell
ipconfig /all
```

---

# 6. Atur hostname

## VM1

```bash
sudo hostnamectl set-hostname ujikom1_nama
sudo nano /etc/hosts
```

Pastikan:

```text
127.0.1.1 ujikom1_nama
```

## VM2

```bash
sudo hostnamectl set-hostname ujikom2_nama
sudo nano /etc/hosts
```

Pastikan:

```text
127.0.1.1 ujikom2_nama
```

Restart:

```bash
sudo reboot
```

---

# 7. Identifikasi interface NAT dan Bridge

Pada masing-masing VM:

```bash
ip -br link
ip -br addr
ip link
ip route
```

Biasanya:

```text
enp0s3 = NAT
enp0s8 = Bridge
```

Pastikan dengan mencocokkan `link/ether` di output `ip link` dengan MAC Address VirtualBox.

Jangan meneruskan sebelum mapping interface sudah pasti.

---

# 8. Backup Netplan

Pada VM1 dan VM2:

```bash
sudo mkdir -p /root/netplan-backup
sudo cp -a /etc/netplan/. /root/netplan-backup/
ls -lah /etc/netplan
sudo cat /etc/netplan/*.yaml
```

Jika file menyebut `generated by cloud-init`:

```bash
echo 'network: {config: disabled}' \
  | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

Pindahkan YAML lama:

```bash
sudo mkdir -p /root/netplan-original
sudo mv /etc/netplan/*.yaml /root/netplan-original/
```

Lakukan dari console VirtualBox agar mudah memulihkan jika jaringan terputus.

---

# 9. Netplan VM1

Buat di VM1:

```bash
sudo nano /etc/netplan/01-ukk.yaml
```

Ganti nama interface jika berbeda:

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
        - 192.168.12.93/24
      routes:
        - to: default
          via: 192.168.12.1
          metric: 200
```

Terapkan:

```bash
sudo chmod 600 /etc/netplan/01-ukk.yaml
sudo netplan generate
sudo netplan try --timeout 120
sudo netplan apply
```

Periksa:

```bash
ip -br addr
ip route
ip route get 8.8.8.8
ip route get 192.168.12.94
resolvectl status
```

NAT harus diprioritaskan karena metric `100`. Bridge memakai metric `200`.

---

# 10. Netplan VM2

Buat **di VM2**:

```bash
sudo nano /etc/netplan/01-ukk.yaml
```

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
        - 192.168.12.94/24
      routes:
        - to: default
          via: 192.168.12.1
          metric: 200
```

Terapkan:

```bash
sudo chmod 600 /etc/netplan/01-ukk.yaml
sudo netplan generate
sudo netplan try --timeout 120
sudo netplan apply
```

Periksa:

```bash
ip -br addr
ip route
ip route get 8.8.8.8
ip route get 192.168.12.93
resolvectl status
```

Jika internet terganggu dan route internet melewati Bridge, hapus blok `routes` pada Bridge setelah diklarifikasi kepada asesor.

Pemulihan:

```bash
sudo rm -f /etc/netplan/01-ukk.yaml
sudo cp -a /root/netplan-backup/. /etc/netplan/
sudo netplan generate
sudo netplan apply
```

---

# 11. Uji jaringan

## Dari VM1

```bash
ping -c 4 192.168.12.92
ping -c 4 192.168.12.94
ping -c 4 192.168.12.1
ping -c 4 8.8.8.8
getent hosts github.com
```

Uji Bridge secara eksplisit:

```bash
ping -I enp0s8 -c 4 192.168.12.94
```

## Dari VM2

```bash
ping -c 4 192.168.12.92
ping -c 4 192.168.12.93
ping -c 4 192.168.12.1
ping -c 4 8.8.8.8
getent hosts github.com
```

## Dari host

```powershell
ping 192.168.12.93
ping 192.168.12.94
```

Jangan lanjut sebelum host, VM1, dan VM2 saling terhubung.

---

# 12. FTP Server VM1

## 12.1 Install

```bash
sudo apt update
sudo apt install -y vsftpd
sudo systemctl enable --now vsftpd
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup
```

## 12.2 Buat user persis sesuai soal

```bash
sudo adduser --disabled-password --gecos "" ujikom
echo "ujikom:ujikom" | sudo chpasswd
```

## 12.3 Buat share

```bash
sudo mkdir -p /ujikom-share
sudo chown -R ujikom:ujikom /ujikom-share
sudo chmod -R 0777 /ujikom-share
sudo -u ujikom touch /ujikom-share/ftp-server-aktif.txt
```

## 12.4 Izinkan hanya user ujikom

```bash
echo "ujikom" | sudo tee /etc/vsftpd.user_list
```

## 12.5 Konfigurasi

```bash
sudo nano /etc/vsftpd.conf
```

Isi minimal:

```ini
listen=YES
listen_ipv6=NO

anonymous_enable=NO
local_enable=YES
write_enable=YES

local_root=/ujikom-share
local_umask=000
file_open_mode=0777

chroot_local_user=YES
allow_writeable_chroot=YES

userlist_enable=YES
userlist_deny=NO
userlist_file=/etc/vsftpd.user_list

dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES

pam_service_name=vsftpd
secure_chroot_dir=/var/run/vsftpd/empty

pasv_enable=YES
pasv_address=192.168.12.93
pasv_min_port=40000
pasv_max_port=40100

ssl_enable=NO
```

Restart:

```bash
sudo systemctl restart vsftpd
sudo systemctl status vsftpd --no-pager
ss -tulpn | grep :21
```

Jika UFW aktif:

```bash
sudo ufw allow 20/tcp
sudo ufw allow 21/tcp
sudo ufw allow 40000:40100/tcp
sudo ufw reload
```

## 12.6 Uji FileZilla

```text
Host       : 192.168.12.93
Port       : 21
Protocol   : FTP
Encryption : Only use plain FTP
User       : ujikom
Password   : ujikom
```

Buktikan:

- login berhasil
- direktori `/ujikom-share`
- upload
- rename
- create folder
- delete
- download
- anonymous login gagal

---

# 13. SSH key dua arah

Install pada kedua VM:

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh --no-pager
ss -tulpn | grep :22
```

Jika UFW aktif:

```bash
sudo ufw allow OpenSSH
```

## VM1 ke VM2

Di VM1:

```bash
ssh-keygen -t ed25519 -C "vm1-to-vm2"
ssh-copy-id USER_VM2@192.168.12.94
ssh -o PasswordAuthentication=no \
  USER_VM2@192.168.12.94 \
  "hostname && whoami"
```

## VM2 ke VM1

Di VM2:

```bash
ssh-keygen -t ed25519 -C "vm2-to-vm1"
ssh-copy-id USER_VM1@192.168.12.93
ssh -o PasswordAuthentication=no \
  USER_VM1@192.168.12.93 \
  "hostname && whoami"
```

Jika gagal:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

# 14. Install Docker di VM2

```bash
sudo apt remove -y \
  docker.io docker-compose docker-compose-v2 docker-doc \
  podman-docker containerd runc
```

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
```

```bash
sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc
```

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

```bash
sudo apt update

sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

```bash
sudo systemctl enable --now docker
sudo systemctl enable --now containerd
sudo usermod -aG docker "$USER"
newgrp docker
```

Verifikasi:

```bash
docker version
docker compose version
docker buildx version
docker run --rm hello-world
```

---

# 15. Clone project ke VM2

```bash
sudo mkdir -p /deploy/ujikom
sudo chown -R "$USER":"$USER" /deploy/ujikom
cd /deploy/ujikom
```

```bash
git clone https://github.com/USERNAME/NAMA-REPOSITORY.git ekspedisi-aja
cd /deploy/ujikom/ekspedisi-aja
```

Periksa:

```bash
pwd
ls -la
git remote -v
```

Target:

```text
/deploy/ujikom/ekspedisi-aja
```

Buat `.env`:

```bash
cp .env.example .env
nano .env
chmod +x entrypoint.sh
```

Validasi:

```bash
docker compose config > /dev/null
docker compose config --services
```

Target:

```text
db
migrate
app
loadbalancer
```

---

# 16. Build dan jalankan dua app

```bash
docker buildx ls
docker buildx inspect --bootstrap
```

```bash
docker compose build --no-cache app
```

Target:

```text
Image ekspedisi-app:ukk Built
```

Periksa image:

```bash
docker images
docker run --rm --entrypoint sh ekspedisi-app:ukk -c "npx prisma -v"
```

Jalankan:

```bash
docker compose up -d --scale app=2
docker compose restart loadbalancer
docker compose ps -a
```

Target:

```text
db             running healthy
migrate        exited 0
app-1          running
app-2          running
loadbalancer   running
```

Jika gagal:

```bash
docker compose logs db
docker compose logs migrate
docker compose logs app
docker compose logs loadbalancer
```

---

# 17. Pengujian deployment

## Nginx

```bash
curl http://localhost:8080/nginx-health
```

Dari host:

```powershell
curl.exe http://192.168.12.94:8080/nginx-health
```

Browser:

```text
http://192.168.12.94:8080
```

## Dua app

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

## Load balancing

```bash
for i in $(seq 1 12); do
  curl -s "http://localhost:8080/api/instance?request=$i"
  echo
done
```

Harus muncul dua hostname berbeda, yaitu `app-1` dan `app-2`.

## App tidak dibuka langsung

```bash
curl http://localhost:3000
```

Harus gagal.

## Database

```bash
docker compose exec db \
  mysql -uekspedisi -pekspedisi_secret \
  ekspedisi_aja -e "SHOW TABLES;"
```

```bash
docker compose exec db \
  mysql -uekspedisi -pekspedisi_secret \
  ekspedisi_aja \
  -e "SELECT COUNT(*) AS jumlah_cabang FROM branches;"
```

## Network dan volume

```bash
docker network inspect ujikom-net
docker volume inspect app-volume
docker volume inspect db-volume
```

## Buktikan app-volume

```bash
docker compose exec app \
  sh -c 'echo "app-volume aktif" > /app/storage/bukti-app-volume.txt'
```

```bash
docker compose exec app \
  cat /app/storage/bukti-app-volume.txt
```

## Persistence

1. Tambahkan data melalui aplikasi.
2. Catat data.
3. Jalankan:

```bash
docker compose down
```

4. Periksa:

```bash
docker volume ls | grep -E 'app-volume|db-volume'
```

5. Jalankan kembali:

```bash
docker compose up -d --scale app=2
docker compose restart loadbalancer
```

6. Pastikan data database dan file app-volume tetap ada.

Jangan memakai:

```bash
docker compose down -v
```

---

# 18. Uji restart policy

## VM1

```bash
sudo reboot
```

Setelah hidup:

```bash
sudo systemctl status ssh --no-pager
sudo systemctl status vsftpd --no-pager
```

## VM2

```bash
cd /deploy/ujikom/ekspedisi-aja
sudo reboot
```

Setelah hidup:

```bash
cd /deploy/ujikom/ekspedisi-aja
docker compose ps -a
curl http://localhost:8080/nginx-health
```

`db`, dua app, dan loadbalancer harus aktif kembali. `migrate` tetap `exited 0`.

---

# 19. Bukti yang dikumpulkan

1. NAT dan Bridge VM1.
2. NAT dan Bridge VM2.
3. Hostname kedua VM.
4. IP Host `.92`.
5. IP VM1 `.93`.
6. IP VM2 `.94`.
7. Route kedua VM.
8. Ping Host, VM1, dan VM2.
9. FTP aktif.
10. `/ujikom-share`.
11. Login FTP `ujikom`.
12. Full access FTP.
13. Anonymous ditolak.
14. SSH VM1 ke VM2 tanpa password.
15. SSH VM2 ke VM1 tanpa password.
16. Project di `/deploy/ujikom/ekspedisi-aja`.
17. Dockerfile dan Compose.
18. Custom image.
19. Database healthy.
20. Migrate exited 0.
21. Dua app running.
22. Loadbalancer 8080.
23. `app-volume`.
24. `db-volume`.
25. `ujikom-net`.
26. Dua hostname dari `/api/instance`.
27. Port host 3000 tertutup.
28. Tabel dan data database.
29. Persistence.
30. Restart policy.

---

# 20. Urutan demonstrasi

1. Tunjukkan dua VM dan adapter.
2. Tunjukkan hostname dan IP.
3. Tunjukkan ping.
4. Tunjukkan FTP VM1.
5. Buktikan user `ujikom` full access.
6. Buktikan anonymous gagal.
7. Buktikan SSH dua arah tanpa password.
8. Tunjukkan project pada VM2.
9. Tunjukkan custom image.
10. Tunjukkan `db`, `migrate`, dua app, dan loadbalancer.
11. Tunjukkan volume dan network.
12. Buktikan port 3000 tidak terbuka.
13. Buka aplikasi melalui port 8080.
14. Buktikan dua hostname.
15. Tunjukkan database.
16. Buktikan persistence.
17. Buktikan restart otomatis.
18. Jelaskan persetujuan penggunaan Next.js.

---

# 21. Checklist akhir

- [ ] Host `192.168.12.92`.
- [ ] VM1 `192.168.12.93`.
- [ ] VM2 `192.168.12.94`.
- [ ] Hostname VM1 `ujikom1_nama`.
- [ ] Hostname VM2 `ujikom2_nama`.
- [ ] NAT dan Bridge aktif.
- [ ] Semua mesin saling terhubung.
- [ ] FTP `/ujikom-share`.
- [ ] User/password FTP `ujikom`.
- [ ] Full access FTP.
- [ ] Anonymous ditolak.
- [ ] SSH key dua arah.
- [ ] Project di `/deploy/ujikom/ekspedisi-aja`.
- [ ] Custom image tersedia.
- [ ] Dua app berjalan.
- [ ] App hanya expose 3000.
- [ ] DB menggunakan 3306:3306.
- [ ] Loadbalancer menggunakan 8080:80.
- [ ] `app-volume` tersedia.
- [ ] `db-volume` tersedia.
- [ ] `ujikom-net` tersedia.
- [ ] Dua hostname terbukti.
- [ ] Persistence terbukti.
- [ ] Restart policy terbukti.
- [ ] Semua proses didokumentasikan.
