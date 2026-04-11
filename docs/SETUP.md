# Sowo — Full-Stack Setup Guide

Follow these steps in order to go from static site to a fully functional marketplace.
The whole setup takes about 30–45 minutes.

---

## Step 1 — Supabase (Database + Auth)

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. New project → Name it `sowo` → Choose region `eu-west-2 (London)` → Create

### 1.2 Run the database schema
1. In Supabase → **SQL Editor** → New query
2. Paste the entire contents of `docs/supabase-schema.sql`
3. Click **Run** — you should see "Success" with no errors

### 1.3 Create the media storage bucket
1. In Supabase → **Storage** → New bucket
2. Name: `media` → Toggle **Public bucket ON** → Create

### 1.4 Enable Google Auth (optional but recommended)
1. In Supabase → **Authentication** → Providers → Google → Enable
2. Follow the guide to get a Google OAuth Client ID + Secret from Google Cloud Console
3. Paste both into Supabase

### 1.5 Get your API keys
1. In Supabase → **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public** key (starts with `eyJhbGci...`)

---

## Step 2 — Stripe (Payments)

### 2.1 Create an account
1. Go to [stripe.com](https://stripe.com) → Sign up
2. You can start in **test mode** — no need to activate the account yet

### 2.2 Get your API keys
1. In Stripe → **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2.3 Set up webhook (for payment confirmation)
1. In Stripe → **Developers** → **Webhooks** → Add endpoint
2. Endpoint URL: `https://usesowo.com/api/stripe-webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

---

## Step 3 — Fill in config.js

Open `js/config.js` and replace the placeholder values:

```js
const SOWO_CONFIG = {
  supabase: {
    url:     'https://YOUR_PROJECT.supabase.co',   // ← paste from Step 1.5
    anonKey: 'eyJhbGci...',                         // ← paste from Step 1.5
  },
  stripe: {
    publishableKey: 'pk_test_...',                  // ← paste from Step 2.2
  },
};
```

---

## Step 4 — Set Vercel environment variables

In Vercel → Your project → **Settings** → **Environment Variables**, add:

| Variable name                  | Value                         |
|-------------------------------|-------------------------------|
| `SUPABASE_URL`                 | Your Supabase project URL     |
| `SUPABASE_SERVICE_ROLE_KEY`    | From Supabase → Settings → API → service_role key |
| `STRIPE_SECRET_KEY`            | Your Stripe secret key        |
| `STRIPE_WEBHOOK_SECRET`        | From Step 2.3                |
| `APP_URL`                      | `https://usesowo.com`         |

These are used by the serverless functions in `/api/`.

---

## Step 5 — Deploy to GitHub + Vercel

1. Upload all files to `github.com/usesowo/sowo` (replace existing files)
2. Vercel auto-deploys on every push (takes ~30 seconds)
3. Visit `https://usesowo.com` to see the live site

---

## Step 6 — Test the full flow

1. Go to `/signup` → create an account
2. Go to `/become-provider` → fill in the 4-step form → create a provider profile
3. Log out → create a second account (or use incognito)
4. Go to `/browse` → find your provider → click **View**
5. Select a service → pick a date → click **Request booking**
6. In test mode: use Stripe test card `4242 4242 4242 4242` to pay
7. Go to `/dashboard` in the provider account → confirm the booking
8. Go to `/dashboard` in the consumer account → leave a vouch

---

## What's live after setup

| Feature                     | Status |
|-----------------------------|--------|
| User sign up / login        | ✅ Live |
| Google OAuth                | ✅ Live (after Step 1.4) |
| Browse providers            | ✅ Live |
| Provider profile pages      | ✅ Live |
| Become a provider (4 steps) | ✅ Live |
| Booking requests            | ✅ Live |
| Stripe checkout             | ✅ Live (after Stripe setup) |
| Consumer dashboard          | ✅ Live |
| Provider dashboard          | ✅ Live |
| Vouch / reviews             | ✅ Live |

---

## Coming next (v2)

- In-app messaging between consumer and provider
- Push notifications (via Supabase Realtime)
- Provider payout via Stripe Connect
- Admin dashboard for moderation
- Mobile app (React Native)

---

*Questions? hello@usesowo.com*
