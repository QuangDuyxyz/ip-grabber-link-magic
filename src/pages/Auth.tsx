
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/AuthForm";

export default function Auth() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkUser();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">IP Tracking System</h1>
        <AuthForm />
      </div>
    </div>
  );
}
