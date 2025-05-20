
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function TrackingLinkCreator({ onLinkCreated }: { onLinkCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const generateRandomSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSlug(result);
  };

  const createTrackingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !slug) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    setLoading(true);
    
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("Bạn cần đăng nhập để tạo link tracking");
      }
      
      const { error } = await supabase
        .from("tracking_links")
        .insert([{ 
          name, 
          slug,
          created_by: sessionData.session.user.id // Add the user ID explicitly
        }]);
      
      if (error) throw error;
      
      toast.success("Tạo link tracking thành công!");
      setName("");
      setSlug("");
      onLinkCreated(); // Refresh the list
    } catch (error: any) {
      if (error.code === "23505") { // Unique constraint violation
        toast.error("Slug này đã được sử dụng, vui lòng chọn slug khác");
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo link tracking mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={createTrackingLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên link</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Link cho chiến dịch XYZ"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex space-x-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-link"
                required
              />
              <Button type="button" onClick={generateRandomSlug} variant="outline">
                Tạo ngẫu nhiên
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
