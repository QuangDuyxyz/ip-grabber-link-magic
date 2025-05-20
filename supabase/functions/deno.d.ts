// Khai báo kiểu cho Deno và các module liên quan
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
    rpc: (functionName: string, params: any) => Promise<{ data: any; error: any }>;
  }

  export function createClient(url: string, key: string): SupabaseClient;
}
