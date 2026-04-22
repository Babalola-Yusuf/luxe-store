import Stripe from 'https://esm.sh/stripe@13.11.0/deno/stripe.mjs'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')             ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature     = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const body          = await req.text()

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId
    console.log('Payment succeeded for order:', orderId)

    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Processing' })
        .eq('id', orderId)
      if (error) console.error('Supabase update error:', error.message)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent  = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId
    console.log('Payment failed for order:', orderId)

    if (orderId) {
      await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId)
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})