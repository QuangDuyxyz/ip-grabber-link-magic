
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import TrackingLinkCreator from "@/components/TrackingLinkCreator";
import TrackingLinkList from "@/components/TrackingLinkList";
import IPVisitsList from "@/components/IPVisitsList";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      }
      setLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          navigate("/auth");
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">IP Tracking System</h1>
          <Button 
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <TrackingLinkCreator onLinkCreated={() => setRefresh(prev => prev + 1)} />
          <TrackingLinkList refresh={refresh} />
          <IPVisitsList refresh={refresh} />
        </div>
      </main>
    </div>
  );
}
