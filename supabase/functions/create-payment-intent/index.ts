import Stripe from 'https://esm.sh/stripe@13.11.0/deno/stripe.mjs'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, orderId, currency = 'usd' } = await req.json()

    const supportedCurrencies = ['usd', 'eur', 'gbp', 'ngn', 'jpy', 'cad', 'aud']
    const currencyToUse = supportedCurrencies.includes(currency.toLowerCase())
      ? currency.toLowerCase()
      : 'usd'

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currencyToUse,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    console.error('Payment intent error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
