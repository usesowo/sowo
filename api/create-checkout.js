// ─────────────────────────────────────────────────────────────────
//  Vercel Serverless Function: /api/create-checkout
//  Creates a Stripe Checkout session for a Sowo booking
//  Deployed automatically by Vercel from the /api folder
// ─────────────────────────────────────────────────────────────────

const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role key server-side
);

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { bookingId, serviceId, userId } = req.body;

    if (!bookingId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch booking + service details from Supabase
    const { data: booking, error: bErr } = await sb
      .from('bookings')
      .select(`
        *,
        providers ( *, profiles ( full_name ) ),
        services  ( id, name, price )
      `)
      .eq('id', bookingId)
      .single();

    if (bErr || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the booking belongs to this user
    if (booking.consumer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const service     = booking.services;
    const provider    = booking.providers?.profiles;
    const price       = service?.price || booking.total_amount || 0;
    const serviceName = service?.name  || 'Sowo booking';
    const providerName= provider?.full_name || 'Provider';

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode:        'payment',
      line_items:  [{
        quantity:    1,
        price_data:  {
          currency:     'gbp',
          unit_amount:  price,   // in pence
          product_data: {
            name:        serviceName,
            description: `Booking with ${providerName} via Sowo`,
          },
        },
      }],
      success_url: `${process.env.APP_URL}/dashboard?payment=success&booking=${bookingId}`,
      cancel_url:  `${process.env.APP_URL}/provider?id=${booking.provider_id}&payment=cancelled`,
      metadata:    {
        booking_id:  bookingId,
        user_id:     userId,
        provider_id: booking.provider_id,
        service_id:  serviceId || '',
      },
      payment_intent_data: {
        // Hold funds until job is confirmed complete (platform escrow logic)
        capture_method: 'automatic',
        metadata: {
          booking_id: bookingId,
        },
      },
    });

    // Save session ID on booking
    await sb
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', bookingId);

    res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error('[create-checkout]', err);
    res.status(500).json({ error: err.message });
  }
};
