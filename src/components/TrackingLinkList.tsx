
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ExternalLink, Trash2 } from "lucide-react";

type TrackingLink = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function TrackingLinkList({ refresh }: { refresh: number }) {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tracking_links")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setLinks(data || []);
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLinks();
  }, [refresh]);

  const getTrackingUrl = (slug: string) => {
    return `https://ugsvremrwtqflqsmqjfa.supabase.co/functions/v1/track/${slug}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };
  
  const deleteLink = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("tracking_links")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== id));
      toast.success("Đã xóa link thành công");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link tracking của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link tracking của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Bạn chưa tạo link tracking nào
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md">
                <div className="space-y-1">
                  <h3 className="font-medium">{link.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500 break-all">
                      {getTrackingUrl(link.slug)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <Button 
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(getTrackingUrl(link.slug))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(getTrackingUrl(link.slug), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteLink(link.id)}
                    disabled={deleting === link.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
