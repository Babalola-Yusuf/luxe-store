const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret key')
    }

    const { amount, currency = 'usd', orderId } = await req.json()

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    const body = new URLSearchParams()
    body.set('amount', String(Math.round(amount * 100)))
    body.set('currency', currency)
    body.set('automatic_payment_methods[enabled]', 'true')
    if (orderId) {
      body.set('metadata[orderId]', orderId)
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const paymentIntent = await stripeRes.json()
    if (!stripeRes.ok) {
      throw new Error(paymentIntent.error?.message || 'Stripe API error')
    }

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})