import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    console.log('Paystack webhook received:', body)

    const signature = req.headers.get('x-paystack-signature')
    if (signature) {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(paystackSecretKey),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      )
      const hash = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(rawBody)
      )
      const hashArray = Array.from(new Uint8Array(hash))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      if (hashHex !== signature) {
        console.error('Invalid signature')
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    if (body.event === 'charge.success') {
      const reference = body.data.reference
      const orderId = body.data.metadata?.order_id || reference

      console.log('Processing payment for order:', orderId)

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'Processing',
          payment_reference: reference,
          payment_method: 'Paystack',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (orderError) {
        console.error('Error updating order:', orderError)
        throw orderError
      }

      console.log('Order updated successfully')
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
