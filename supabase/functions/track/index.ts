
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

interface IPInfo {
  ip: string;
  isPrivate: boolean;
  source: string;
}

const isPrivateIP = (ip: string): boolean => {
  // Kiểm tra xem có phải IP private không
  return (
    ip.startsWith('10.') || 
    ip.startsWith('192.168.') || 
    /^172\.(1[6-9]|2[0-9]|3[0-1])\..+/.test(ip) ||
    ip.startsWith('169.254.') || // Link-local address
    ip === '127.0.0.1' || // Localhost
    ip.startsWith('::1') || // IPv6 localhost
    ip.startsWith('fc00:') || // IPv6 unique local address
    ip.startsWith('fd') // IPv6 unique local address
  );
};

const getIP = (req: Request): IPInfo => {
  // Thử lấy IP gốc từ các header khác nhau
  const headers: {[key: string]: string} = {
    'true-client-ip': req.headers.get('true-client-ip') || '',
    'cf-connecting-ip': req.headers.get('cf-connecting-ip') || '',
    'x-real-ip': req.headers.get('x-real-ip') || '',
    'x-client-ip': req.headers.get('x-client-ip') || '',
    'x-forwarded-for': req.headers.get('x-forwarded-for') || '',
    'forwarded': req.headers.get('forwarded') || '',
    'via': req.headers.get('via') || ''
  };
  
  // Thử từng header và kiểm tra xem có chứa IP private không
  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (!headerValue) continue;
    
    // Xử lý x-forwarded-for đặc biệt vì nó có thể chứa nhiều IP
    if (headerName === 'x-forwarded-for') {
      const ips = headerValue.split(',').map(ip => ip.trim());
      // Kiểm tra từng IP trong chuỗi, ưu tiên IP đầu tiên (client gốc)
      for (const ip of ips) {
        if (isPrivateIP(ip)) {
          return { ip, isPrivate: true, source: `${headerName}` };
        }
      }
      // Nếu không có IP private, lấy IP đầu tiên
      if (ips.length > 0) {
        return { ip: ips[0], isPrivate: false, source: `${headerName}` };
      }
    } else {
      // Xử lý các header khác
      if (headerValue && isPrivateIP(headerValue)) {
        return { ip: headerValue, isPrivate: true, source: headerName };
      } else if (headerValue) {
        return { ip: headerValue, isPrivate: false, source: headerName };
      }
    }
  }
  
  // Nếu không tìm thấy IP nào, trả về localhost
  return { ip: '127.0.0.1', isPrivate: true, source: 'default' };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];

  if (!slug) {
    return new Response(
      JSON.stringify({ error: "No slug provided" }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const ipInfo = getIP(req);
    const userAgent = req.headers.get('user-agent') || "";
    
    // Thu thập thêm thông tin về request
    const referer = req.headers.get('referer') || "";
    const language = req.headers.get('accept-language') || "";
    
    // Chuẩn bị dữ liệu để gửi đến database
    const visitData = {
      slug_param: slug,
      ip: ipInfo.ip,
      user_agent: userAgent,
      is_private_ip: ipInfo.isPrivate,
      ip_source: ipInfo.source,
      referer: referer,
      language: language
    };
    
    console.log("Recording visit with data:", JSON.stringify(visitData));
    
    // Call the database function to record the visit
    // Lưu ý: Nếu database function chưa được cập nhật để chấp nhận các trường mới,
    // chúng ta chỉ gửi các trường cơ bản
    const { data, error } = await supabase.rpc(
      'record_ip_visit',
      { 
        slug_param: slug,
        ip: ipInfo.ip,
        user_agent: userAgent
      }
    );

    if (error) throw error;

    // Trả về thông tin chi tiết hơn về IP đã ghi nhận
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "IP recorded successfully",
        ip_info: {
          ip: ipInfo.ip,
          is_private: ipInfo.isPrivate,
          source: ipInfo.source,
          user_agent_summary: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error recording visit:", error);
    
    // Trả về thông báo lỗi chi tiết hơn
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to record visit", 
        details: errorMessage,
        slug: slug
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
