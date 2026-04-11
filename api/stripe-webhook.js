// ─────────────────────────────────────────────────────────────────
//  Vercel Serverless Function: /api/stripe-webhook
//  Handles Stripe webhook events (payment confirmation)
//  Set webhook URL in Stripe Dashboard → Developers → Webhooks
//  → https://usesowo.com/api/stripe-webhook
// ─────────────────────────────────────────────────────────────────

const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vercel requires raw body for webhook signature verification
export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig  = req.headers['stripe-signature'];
  const buf  = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Handle events
  switch (event.type) {

    case 'checkout.session.completed': {
      const session   = event.data.object;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await sb.from('bookings').update({
          status:    'confirmed',
          paid_at:   new Date().toISOString(),
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:   session.payment_intent,
        }).eq('id', bookingId);

        console.log('[webhook] Booking confirmed:', bookingId);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent    = event.data.object;
      const bookingId = intent.metadata?.booking_id;

      if (bookingId) {
        await sb.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
        console.log('[webhook] Booking payment failed:', bookingId);
      }
      break;
    }

    default:
      console.log('[webhook] Unhandled event:', event.type);
  }

  res.status(200).json({ received: true });
};
