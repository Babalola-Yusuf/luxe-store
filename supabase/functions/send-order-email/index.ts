import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, customerEmail, customerName, total } = await req.json()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-id { font-size: 24px; font-weight: bold; color: #e94560; margin: 20px 0; }
            .total { font-size: 28px; font-weight: bold; color: #1a1a2e; }
            .button { display: inline-block; background: #e94560; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for your order! We're excited to get your items to you.</p>
              
              <div class="order-id">Order #${orderId}</div>
              
              <p><strong>Order Total:</strong></p>
              <div class="total">$${parseFloat(total).toFixed(2)}</div>
              
              <p>We'll send you another email when your order ships.</p>
              
              <a href="https://your-store.vercel.app/track-order" class="button">Track Your Order</a>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Questions? Reply to this email or contact us at support@luxe.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Luxe Store <orders@yourdomain.com>',
        to: [customerEmail],
        subject: `Order Confirmation - ${orderId}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Email error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})