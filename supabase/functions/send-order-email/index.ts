import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, customerEmail, customerName, items, total, shippingAddress, currency = '₦' } = await req.json()

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get store settings for branding
    const { data: settings } = await supabase
      .from('store_settings')
      .select('setting_value')
      .eq('setting_key', 'general')
      .single()

    const storeName = settings?.setting_value?.storeName || 'Dnite Store'
    const storeEmail = settings?.setting_value?.contactEmail || 'support@dnitestore.com'

    // Format order items for email
    const itemsHtml = items && items.length > 0 ? items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e8e4dc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.emoji ? `<span style="font-size: 32px;">${item.emoji}</span>` : ''}
            <div>
              <strong style="display: block; margin-bottom: 4px;">${item.name}</strong>
              <span style="color: #666; font-size: 14px;">Qty: ${item.quantity}</span>
            </div>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e8e4dc; text-align: right; white-space: nowrap;">
          <strong>${currency}${(item.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #666;">Order items will be confirmed shortly</td></tr>'

    // Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content { 
              padding: 30px; 
            }
            .content p {
              margin: 0 0 16px 0;
            }
            .order-details { 
              background: #f9f8f6; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 24px 0; 
            }
            .order-details h3 {
              margin: 0 0 16px 0;
              font-size: 18px;
              color: #1a1a2e;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 12px;
            }
            .total-row {
              background: #fff;
              font-weight: bold;
            }
            .total-row td {
              padding: 16px 12px !important;
              border-bottom: none !important;
              font-size: 18px;
            }
            .shipping-address {
              background: #e8f5e9;
              border-left: 4px solid #4caf50;
              padding: 16px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .shipping-address h4 {
              margin: 0 0 8px 0;
              color: #2e7d32;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #e94560 0%, #d63850 100%);
              color: white; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin-top: 24px;
              font-weight: 600;
              box-shadow: 0 4px 6px rgba(233, 69, 96, 0.3);
            }
            .button:hover {
              background: linear-gradient(135deg, #d63850 0%, #c72040 100%);
            }
            .info-box {
              background: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 16px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px; 
              color: #666; 
              font-size: 14px;
              background: #f9f8f6;
              border-top: 1px solid #e8e4dc;
            }
            .footer p {
              margin: 8px 0;
            }
            .social-links {
              margin-top: 16px;
            }
            .social-links a {
              display: inline-block;
              margin: 0 8px;
              color: #666;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Order Confirmed</h1>
              <p>Thank you for shopping with ${storeName}!</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; color: #1a1a2e;"><strong>Hi ${customerName},</strong></p>
              <p>Great news! Your order has been confirmed and is being prepared for shipment.</p>
              
              <div class="order-details">
                <h3>Order #${orderId}</h3>
                
                <table>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td style="text-align: right;">
                      <span style="color: #e94560; font-size: 24px;">${currency}${parseFloat(total).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              ${shippingAddress ? `
                <div class="shipping-address">
                  <h4>📦 Shipping Address</h4>
                  <p style="margin: 0; line-height: 1.6;">${shippingAddress.replace(/\n/g, '<br>')}</p>
                </div>
              ` : ''}
              
              <div class="info-box">
                <p style="margin: 0;"><strong>What's Next?</strong></p>
                <p style="margin: 8px 0 0 0;">• We'll send you a shipping confirmation with tracking info<br>
                • Your order typically ships within 1-2 business days<br>
                • Questions? We're here to help!</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SITE_URL') || 'https://yoursite.com'}/track-order" class="button">
                  Track Your Order
                </a>
              </div>
              
              <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e4dc; color: #666; font-size: 14px;">
                Need help? Reply to this email or contact us at <a href="mailto:${storeEmail}" style="color: #e94560; text-decoration: none;">${storeEmail}</a>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>${storeName}</strong></p>
              <p>Premium products delivered with care</p>
              <div class="social-links">
                <a href="#">Facebook</a> • 
                <a href="#">Twitter</a> • 
                <a href="#">Instagram</a>
              </div>
              <p style="margin-top: 16px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} ${storeName}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${storeName} <${storeEmail}>`,
        to: [customerEmail],
        subject: `Order Confirmation #${orderId} - ${storeName}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
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