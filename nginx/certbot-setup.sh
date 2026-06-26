#!/usr/bin/env sh
set -eu

DOMAIN="daganta.store"
EMAIL="${CERTBOT_EMAIL:-admin@daganta.store}"
CLOUDFLARE_CREDENTIALS="${CLOUDFLARE_CREDENTIALS:-/etc/letsencrypt/cloudflare.ini}"

if ! command -v certbot >/dev/null 2>&1; then
  if command -v apk >/dev/null 2>&1; then
    apk add --no-cache certbot certbot-dns-cloudflare
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y certbot python3-certbot-dns-cloudflare
  else
    echo "Unsupported package manager. Install certbot and the Cloudflare DNS plugin manually."
    exit 1
  fi
fi

if [ ! -f "$CLOUDFLARE_CREDENTIALS" ]; then
  echo "Cloudflare credentials file not found: $CLOUDFLARE_CREDENTIALS"
  echo "Create it with: dns_cloudflare_api_token = <token>"
  echo "Then run: chmod 600 $CLOUDFLARE_CREDENTIALS"
  exit 1
fi

certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials "$CLOUDFLARE_CREDENTIALS" \
  --dns-cloudflare-propagation-seconds 60 \
  --agree-tos \
  --non-interactive \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "*.$DOMAIN"

(crontab -l 2>/dev/null | grep -v 'certbot renew'; echo '15 3 * * * certbot renew --quiet && docker compose -f /var/www/daganta/compose.production.yml restart nginx') | crontab -

echo "Wildcard certificate ready for $DOMAIN"
echo "For non-wildcard testing only, standalone mode can be used with:"
echo "certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN"
