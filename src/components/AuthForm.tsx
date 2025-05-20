
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (error) throw error;
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px] shadow-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Đăng nhập để quản lý tracking links của bạn" 
            : "Tạo tài khoản mới"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading 
              ? "Đang xử lý..." 
              : mode === "login" ? "Đăng nhập" : "Đăng ký"
            }
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {mode === "login" ? (
          <Button 
            variant="link"
            onClick={() => setMode("signup")}
          >
            Chưa có tài khoản? Đăng ký
          </Button>
        ) : (
          <Button 
            variant="link"
            onClick={() => setMode("login")}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
