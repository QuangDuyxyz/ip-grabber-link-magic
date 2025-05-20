
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the slug from the URL
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()
    
    if (!slug) {
      return new Response(JSON.stringify({ error: 'No slug provided' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the user's IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Record the visit using our database function
    const { data, error } = await supabase.rpc(
      'record_ip_visit',
      { 
        slug_param: slug,
        ip: ip,
        user_agent: userAgent
      }
    )

    if (error) {
      console.error('Error recording visit:', error)
      return new Response(JSON.stringify({ error: 'Failed to record visit' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Redirect to a thank you page or return the IP
    const responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>IP recorded</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
              color: #333;
              text-align: center;
              padding: 0 1rem;
            }
            .container {
              max-width: 500px;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 { color: #2563eb; margin-bottom: 1rem; }
            p { margin-bottom: 1rem; line-height: 1.5; }
            .ip { 
              font-family: monospace;
              background: #f0f9ff;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              border: 1px solid #bfdbfe;
              font-size: 1.25rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Cảm ơn bạn!</h1>
            <p>IP của bạn đã được ghi lại.</p>
            <p>Địa chỉ IP của bạn là: <span class="ip">${ip}</span></p>
          </div>
        </body>
      </html>
    `;

    return new Response(responseHtml, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
