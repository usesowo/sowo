// ─────────────────────────────────────────────────────────────────
//  SOWO CONFIG  –  fill these in after creating your services
// ─────────────────────────────────────────────────────────────────
//
//  Supabase  →  https://supabase.com  →  New project
//              Project Settings → API → copy URL + anon key
//
//  Stripe    →  https://stripe.com   →  Developers → API keys
//              Copy Publishable key (pk_live_... or pk_test_...)
//
// ─────────────────────────────────────────────────────────────────

const SOWO_CONFIG = {

  supabase: {
    url:     'https://svwzsvmvqmkmtgsclatz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d3pzdm12cW1rbXRnc2NsYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA4MzYsImV4cCI6MjA5MTU4NjgzNn0.IFieYIoxpGOM3IWeYDb89Sy0fMxAPTfwMH88O8bz_Mo',
  },

  stripe: {
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY', // pk_live_ or pk_test_
  },

  app: {
    name:    'Sowo',
    url:     'https://usesowo.com',
    support: 'hello@usesowo.com',
  },

};
