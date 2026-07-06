# Deployment guide — mojapsihoterapija.com

The site is an **Astro 5** app that prerenders every page to static HTML and runs
a small **Node server** only for the `/api/contact` form endpoint
(`@astrojs/node`, standalone mode). One Node process serves both the static
files and the API.

- `dist/client/` — 53 prerendered HTML pages + all assets (served as static files)
- `dist/server/entry.mjs` — the Node server (handles `/api/contact`, serves the client)

---

## 1. Build

```bash
npm ci          # install exact dependencies
npm run build   # outputs dist/
```

You can build locally and upload `dist/` + `package.json` + `package-lock.json`,
or clone the repo on the VPS and build there. Building on the VPS is simplest.

> Windows note: if `npm run build` fails locally with `EBUSY: resource busy or
> locked` during "Rearranging server assets", it's antivirus/Search indexing
> racing the build — just re-run it. This never happens on the Linux VPS.

---

## 2. Environment variables

Copy `.env.example` → `.env` and fill in real values (see section 5 & 6):

| Variable         | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| `GTM_ID`         | Google Tag Manager container (analytics + Google Ads). `GTM-XXXXXXX` disables it. |
| `RESEND_API_KEY` | Resend key for sending form emails. `re_xxxxxxxxxxxx` = log-only mode. |
| `CONTACT_EMAIL`  | Inbox that receives submissions.                               |
| `CONTACT_FROM`   | Sender address, on a Resend-verified domain.                  |

The server reads these from the **process environment at runtime**, so make sure
they're present when you start the Node process (PM2 / systemd load `.env` below).

---

## 3. Run on the VPS (Node + PM2 behind nginx)

Node 20+ required. Install PM2 once: `npm i -g pm2`.

Start the server bound to localhost (nginx will sit in front):

```bash
cd /var/www/mojapsihoterapija
HOST=127.0.0.1 PORT=4321 pm2 start dist/server/entry.mjs \
  --name mojapsihoterapija --update-env
pm2 save
pm2 startup     # run the printed command so it survives reboots
```

PM2 inherits the shell environment. To load `.env` automatically, either
`export $(grep -v '^#' .env | xargs)` before `pm2 start`, or use a PM2
ecosystem file with `env_file`.

Redeploy after changes:

```bash
git pull        # or upload the new dist/
npm ci && npm run build
pm2 restart mojapsihoterapija --update-env
```

---

## 4. nginx reverse proxy + SSL

`/etc/nginx/sites-available/mojapsihoterapija.com`:

```nginx
server {
    server_name mojapsihoterapija.com www.mojapsihoterapija.com;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 80;
}
```

```bash
ln -s /etc/nginx/sites-available/mojapsihoterapija.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d mojapsihoterapija.com -d www.mojapsihoterapija.com
```

Certbot adds the HTTPS (443) block and auto-renews.

> Optional: since only `/api/contact` needs Node, you could serve `dist/client/`
> directly with nginx and proxy only `/api` to Node. The single-process setup
> above is simpler and totally fine for this traffic level.

---

## 5. DNS (once you have domain access)

Point the domain at the VPS, then run certbot (section 4):

| Type | Name | Value            |
|------|------|------------------|
| A    | `@`  | `<VPS IP>`       |
| A    | `www`| `<VPS IP>`       |

Plus the Resend records from section 6.

---

## 6. Contact form email (Resend)

1. Create an account at [resend.com], add the domain `mojapsihoterapija.com`.
2. Add the **SPF + DKIM DNS records** Resend gives you (needed so mail isn't spam).
3. Create an API key → set `RESEND_API_KEY` in `.env`.
4. Set `CONTACT_FROM="Moja psihoterapija <kontakt@mojapsihoterapija.com>"`
   (any address on the verified domain).
5. Set `CONTACT_EMAIL` to wherever he wants to read submissions.

Until a real key is set, the form still "works" — submissions are logged to the
server console and the user sees the success message (no email is sent).

---

## 7. Analytics & Google Ads

Conversion tracking is already wired via GTM. `dataLayer` events are pushed for:

- `form_submit` — contact form sent
- `phone_click`, `whatsapp_click`, `viber_click`, `email_click` — contact clicks
- `area_click` — area-of-work card click

Setup:
1. Create a GTM container at tagmanager.google.com → set `GTM_ID` in `.env`, rebuild.
2. In Google Ads create conversion actions, then in GTM add Google Ads Conversion
   tags triggered by the `dataLayer` events above (e.g. trigger on `form_submit`
   and `phone_click`).
3. Submit the sitemap to Google Search Console: `https://mojapsihoterapija.com/sitemap-index.xml`.

---

## 8. Migrating from the old site

The old WordPress/whatever site currently on the domain will be replaced. When
DNS is switched to the VPS, keep an eye on the old site's top-ranking URLs — if
any differ from the new URL structure, add nginx `301` redirects so existing
Google rankings and backlinks carry over.
