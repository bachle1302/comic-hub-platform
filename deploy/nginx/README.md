# Nginx Reverse Proxy

This is a sample production reverse proxy for:

- Frontend: `https://manga.example.com` -> `http://127.0.0.1:3000`
- Backend API: `https://api.manga.example.com` -> `http://127.0.0.1:4000`

Copy the config:

```bash
sudo cp deploy/nginx/manga.conf.example /etc/nginx/sites-available/manga.conf
```

Edit real domains and certificate paths:

```bash
sudo nano /etc/nginx/sites-available/manga.conf
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/manga.conf /etc/nginx/sites-enabled/manga.conf
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Create HTTPS certificates with Certbot:

```bash
sudo certbot --nginx -d manga.example.com -d api.manga.example.com
```

## Notes

- If using Cloudflare, set SSL mode to Full or Full (strict).
- PayOS webhook must use a public HTTPS URL:
  `https://api.manga.example.com/payments/payos/webhook`
- Google OAuth JavaScript origin should include:
  `https://manga.example.com`
- Backend `CORS_ORIGINS` should be:
  `https://manga.example.com`
- Backend `FRONTEND_URL` and `APP_URL` should be:
  `https://manga.example.com`
- Frontend `NEXT_PUBLIC_API_URL` should be:
  `https://api.manga.example.com`
- Socket.IO uses the default transport path `/socket.io` even when the namespace is `/notifications`, so `/socket.io/` must be proxied to the backend.
