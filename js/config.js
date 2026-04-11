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
    url:     'YOUR_SUPABASE_URL',       // e.g. https://abcxyz.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY',  // eyJhbGci...
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
