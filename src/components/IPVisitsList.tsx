
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type IPVisit = {
  id: string;
  ip_address: string;
  user_agent: string;
  visit_time: string;
  tracking_links: {
    name: string;
    slug: string;
  };
};

export default function IPVisitsList({ refresh }: { refresh: number }) {
  const [visits, setVisits] = useState<IPVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ip_visits")
          .select(`
            *,
            tracking_links:tracking_link_id (
              name,
              slug
            )
          `)
          .order("visit_time", { ascending: false });
        
        if (error) throw error;
        
        setVisits(data || []);
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisits();
  }, [refresh]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lượt truy cập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-md">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-4 w-[250px]" />
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
        <CardTitle>Lượt truy cập</CardTitle>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Chưa có lượt truy cập nào
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="p-4 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">IP:</p>
                    <p className="font-mono bg-gray-100 p-1 rounded text-sm">{visit.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thời gian:</p>
                    <p className="text-sm">{formatDate(visit.visit_time)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Link:</p>
                  <p className="text-sm">{visit.tracking_links?.name || 'N/A'}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">User Agent:</p>
                  <p className="text-xs text-gray-500 break-all">{visit.user_agent}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
