# Midsoft — Global AI Discovery Programme (React + Express, one Vercel project)

The website is now a **React (Vite) app**; the backend is the **same Express + MongoDB + Razorpay server** as before
(routes, fee, admin, webhook, emails — unchanged). Both deploy together to Vercel.

## Folder map
```
src/                    React website
  pages/                Landing, Register, Payment, Success, NotFound
  components/landing/   Navbar, Hero, Ticker, Journey, Mentors, Challenge, RegisterCta, About, Contact, Footer
  data/content.js       ALL landing-page text (mentors, days, prizes, FAQ…) — edit here
  styles/               landing.css (original design, unchanged) + flow.css (register/payment/success)
public/logo.png         logo + favicon
index.html              Vite entry
api/index.js            Vercel serverless entry -> runs the Express app
server.js, routes/, models/, lib/, config.js    backend (unchanged; ₹29 fee lives in config.js)
tests/flow.test.js      npm test: builds the site, then checks the whole flow with fake DB + fake Razorpay
vercel.json             routing: /api, /admin, /health -> backend; everything else -> React
```

## Run locally (works in PowerShell, cmd, bash, WSL2)
```
npm install
Copy-Item .env.example .env        # bash: cp .env.example .env
# fill MONGODB_URI, Razorpay test keys, ADMIN_USER/ADMIN_PASS in .env
npm run dev
```
Open **http://localhost:5173** (hot reload). `npm run dev` starts the React dev server (5173) and the Express API (3000) together;
Vite forwards `/api`, `/admin` and `/health` to Express.

Production-style (one server, like Docker/Render): `npm run build` then `npm start` → http://localhost:3000.
Check everything: `npm test`.

## Deploy to Vercel (website + backend together)
1. MongoDB Atlas: create a free cluster, add a DB user, Network Access → allow `0.0.0.0/0`, copy the connection string.
2. Push this folder to GitHub (the repo root must contain `package.json`, `vercel.json`, `api/`, `src/`).
3. vercel.com → Add New → Project → import the repo. Framework Preset = **Vite** (auto-detected; build `npm run build`, output `dist`).
4. Add Environment Variables (Production): `MONGODB_URI`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
   `ADMIN_USER`, `ADMIN_PASS`, `NODE_ENV=production`; optional `SMTP_*`, `CONTACT_TO`, `REGISTRATION_CLOSES` (see `.env.example`). Deploy.
5. Razorpay Dashboard → Webhooks → `https://YOUR-APP.vercel.app/api/razorpay/webhook`, secret = `RAZORPAY_WEBHOOK_SECRET`,
   events `payment.captured` and `order.paid`.
CLI alternative: `npm i -g vercel`, then `vercel`, then `vercel --prod`.

After changing environment variables, redeploy. The pages load even before the variables exist; registering, paying and the contact form need them.

### If Vercel shows an error
- Deployments → latest → **Logs**: the first red line names the cause.
- Build fails: make sure Node is 22 (Project Settings → General → Node.js Version) and that `npm run build` works locally.
- Everything inside a sub-folder? Set Settings → General → **Root Directory** to that folder.
- Env vars must be added for **Production**, then redeploy.

## Routes
| Route | What it is |
|---|---|
| `/` | Landing page (About, Contact, FAQ included) |
| `/register` → `/payment/:token` → `/success/:token` | The 3 registration steps |
| `/admin`, `/admin/export.csv` | Registrations, revenue, contact messages (ADMIN_USER / ADMIN_PASS) |
| `POST /api/register`, `/api/payment/create-order`, `/api/payment/verify`, `/api/razorpay/webhook`, `/api/contact` | Backend API (unchanged) |
| `GET /api/registration/:token`, `GET /health` | Status helpers (unchanged) |

## Docker (optional, includes MongoDB)
`docker compose up --build` → http://localhost:3000 (copy `.env.example` to `.env` first).
