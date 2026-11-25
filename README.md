# Midsoft — Global AI Discovery Programme (complete website + backend)

One project: the website (frontend) and the Node.js server (backend) run together.
Registrations and contact messages are stored in MongoDB; the ₹29 fee is taken with Razorpay.

## Folder map
- `pages/` — the website pages (landing, register, payment, success, 404)
- `public/` — CSS, JS and logo used by the pages
- `routes/api.js` — register, Razorpay order/verify/webhook, contact form
- `routes/admin.js` — password-protected `/admin` (registrations + messages + CSV)
- `lib/mailer.js` — optional emails; `config.js` — the ₹29 fee lives here
- `tests/flow.test.js` — `npm test` checks the whole flow (no accounts needed)

## Run it — option A: Docker (easiest, includes MongoDB)
1. Copy `.env.example` to `.env` and put in your Razorpay **test** keys.
2. `docker compose up --build` → open http://localhost:3000

## Run it — option B: Node
1. Install Node 18+ and MongoDB (or use a free MongoDB Atlas URL in `MONGODB_URI`).
2. `npm install`
3. Copy `.env.example` to `.env` and fill it in.
4. `npm start` → open http://localhost:3000   (`npm test` to self-check)

## Pages and routes
| Route | What it is |
|---|---|
| `/` | Landing page (About, Contact, FAQ included) |
| `/register` → `/payment/:token` → `/success/:token` | The 3 registration steps |
| `/admin`, `/admin/export.csv` | Registrations, revenue, contact messages (login: ADMIN_USER / ADMIN_PASS) |
| `POST /api/register` | Saves the registration as `pending` |
| `POST /api/payment/create-order` | Razorpay order for exactly ₹29 |
| `POST /api/payment/verify` | Checks Razorpay's signature, marks `paid` |
| `POST /api/razorpay/webhook` | Razorpay confirms the payment even if the browser was closed |
| `POST /api/contact` | Saves the contact message (and emails it to you if SMTP is set) |
| `GET /health` | For hosting health checks |

## Razorpay webhook (important)
Dashboard → Settings → Webhooks → Add:
- URL: `https://YOUR-DOMAIN/api/razorpay/webhook`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `order.paid`

Locally, use a tunnel such as ngrok for this URL.

## Emails (optional)
Fill the `SMTP_*` lines in `.env` (Gmail needs an **App password**). Then the user gets a
confirmation email after paying, and contact messages arrive in midsoftglobal@gmail.com.
Without SMTP everything still works — messages are saved and visible in `/admin`.

## Put it online (example: Render + MongoDB Atlas)
1. Create a free MongoDB Atlas database and copy its connection string.
2. Push this folder to GitHub → Render → New Web Service → Build `npm install`, Start `npm start`
   (or deploy with the included Dockerfile).
3. Add all `.env` values in Render's Environment tab, with `NODE_ENV=production` and the
   `rzp_live_` keys once you are ready for real payments.
4. Add the webhook in Razorpay using your Render URL.

Optional: `REGISTRATION_CLOSES=2026-11-30T23:59:59+05:30` stops new registrations after that time.
