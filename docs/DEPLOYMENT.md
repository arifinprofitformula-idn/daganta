# Daganta Deployment Guide

Panduan ini merangkum deployment Daganta ke VPS Ubuntu 22.04 dengan Docker Compose, Nginx reverse proxy, TLS wildcard, dan database managed di Sumobase.

## 1. Persiapan VPS

Gunakan VPS Ubuntu 22.04 LTS minimal:

- 2 vCPU
- 4 GB RAM
- 40 GB SSD
- akses SSH memakai key
- port publik dibuka: 22, 80, 443

Update sistem:

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Install Docker dan Compose

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker compose version
```

## 3. Clone Repository

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
git clone git@github.com:arifinprofitformula-idn/daganta.git /var/www/daganta
cd /var/www/daganta
```

## 4. Setup Environment Production

Buat `.env.production` di VPS dari `.env.example`.

```bash
cp .env.example .env.production
chmod 600 .env.production
```

Isi nilai production asli:

- `DATABASE_URL`: Sumobase Transaction Pooler
- `DIRECT_URL`: Sumobase Direct Connection
- `AUTH_PROVIDER="supabase"`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL="https://daganta.store"`
- `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN="daganta.store"`

Jangan commit `.env.production`, `.env`, atau secret apa pun.

## 5. Setup DNS

Di DNS provider domain, arahkan record berikut ke IP publik VPS:

```text
A  @      VPS_IP
A  www    VPS_IP
A  *      VPS_IP
```

Wildcard `*.daganta.store` wajib agar tenant seperti `toyanusantara.daganta.store` langsung masuk ke aplikasi dan tetap membawa header `Host` asli ke Next.js.

## 6. Setup SSL Wildcard

Wildcard certificate membutuhkan DNS challenge. Script yang disediakan memakai Cloudflare DNS plugin.

Contoh credential Cloudflare di VPS:

```bash
sudo mkdir -p /etc/letsencrypt
sudo nano /etc/letsencrypt/cloudflare.ini
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
```

Isi file:

```ini
dns_cloudflare_api_token = your-cloudflare-api-token
```

Jalankan:

```bash
cd /var/www/daganta
sudo sh nginx/certbot-setup.sh
```

Certificate harus tersedia di:

```text
/etc/letsencrypt/live/daganta.store/fullchain.pem
/etc/letsencrypt/live/daganta.store/privkey.pem
```

## 7. Build dan Jalankan Compose

Build image:

```bash
docker compose --env-file .env.production -f compose.production.yml build
```

Jalankan migration satu kali saat release:

```bash
docker compose --env-file .env.production -f compose.production.yml --profile release run --rm migrate
```

Jalankan aplikasi dan Nginx:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d
```

## 8. Verifikasi

```bash
docker compose -f compose.production.yml ps
curl --fail http://127.0.0.1:3000/api/health
curl --fail https://daganta.store/api/health
curl --fail https://toyanusantara.daganta.store/api/health
```

Expected response:

```json
{"status":"ok","timestamp":"...","version":"0.1.0"}
```

## 9. GitHub Actions Secrets

Set secrets berikut di GitHub repository settings:

- `SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`

Push ke branch `main` akan menjalankan CI build, lalu deploy ke `/var/www/daganta` di VPS.

## 10. Operasional

- Jangan expose port app `3000` ke internet; Nginx adalah public entrypoint.
- Jangan menjalankan seed di production.
- Jalankan migration sebagai langkah release terkontrol.
- Pantau `/api/health` dan container healthcheck.
- Pastikan certbot renewal aktif dan reload/restart nginx setelah renewal.
