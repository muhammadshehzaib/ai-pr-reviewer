# Deploy to the Contabo VPS

Topology (same pattern as the other apps on this VPS): Docker containers bound to
`127.0.0.1`, fronted by the host Nginx on two subdomains with certbot TLS.

- `reviewer.shehzaib.com`    → web (127.0.0.1:8091)
- `reviewerapi.shehzaib.com` → API + Socket.IO + GitHub webhooks (127.0.0.1:8090)

## 0. One-time prerequisites

1. **DNS**: two A records → `109.123.244.167`: `reviewer` and `reviewerapi`.
2. **GitHub OAuth App** for production (an OAuth app has ONE callback URL, so keep
   the local one separate). Create at github.com/settings/developers with callback:
   `https://reviewerapi.shehzaib.com/api/auth/github/callback`
3. If ports 8090/8091 are taken on the VPS (`ss -tlnp | grep -E '8090|8091'`),
   change them in `docker-compose.prod.yml` AND the two nginx confs.

## 1. Clone and configure

```bash
ssh root@109.123.244.167
git clone https://github.com/muhammadshehzaib/ai-pr-reviewer.git /opt/ai-pr-reviewer
cd /opt/ai-pr-reviewer
cp .env.prod.example .env.prod
# fill in: POSTGRES_PASSWORD + ENCRYPTION_KEY + JWT_SECRET (openssl rand -hex 32 each),
# prod OAuth app client id/secret, bot PAT, random GITHUB_WEBHOOK_SECRET
nano .env.prod
```

## 2. Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
# backend runs `prisma migrate deploy` automatically on boot
curl -s http://127.0.0.1:8090/health   # {"status":"UP",...}
curl -sI http://127.0.0.1:8091 | head -1
```

## 3. Nginx + TLS

```bash
cp deploy/nginx/reviewer.shehzaib.com.conf /etc/nginx/sites-available/reviewer.shehzaib.com
cp deploy/nginx/reviewerapi.shehzaib.com.conf /etc/nginx/sites-available/reviewerapi.shehzaib.com
ln -s /etc/nginx/sites-available/reviewer.shehzaib.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/reviewerapi.shehzaib.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d reviewer.shehzaib.com -d reviewerapi.shehzaib.com
```

## 4. Smoke test

1. `https://reviewer.shehzaib.com` → log in with GitHub (prod OAuth app).
2. Vault page → save the AI key (Groq key goes under provider **GROK**).
3. Connect a repo you own → webhook installs for real here (public URL), so
   pushes and PRs auto-review via webhook. Third-party repos still work via the
   poller (PRs you author).
4. Check `docker logs -f aipr-backend` while pushing a commit.

## Update to a new version

```bash
cd /opt/ai-pr-reviewer && git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Notes

- The backend container runs API + BullMQ worker + repo poller in one process.
- Webhook signature verification is HMAC over the raw body; NODE_ENV=production
  fails closed if GITHUB_WEBHOOK_SECRET is unset.
- Losing ENCRYPTION_KEY makes saved vault keys unrecoverable (users re-save).
- Postgres data persists in the `aipr_pgdata` volume; it is never exposed publicly.
