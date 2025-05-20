
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const getIpAddress = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) {
        throw new Error("Không thể lấy được địa chỉ IP");
      }
      const data = await response.json();
      setIpAddress(data.ip);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lấy được địa chỉ IP của bạn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-blue-700">Xem địa chỉ IP của bạn</CardTitle>
          <CardDescription>Nhấp vào nút bên dưới để hiển thị địa chỉ IP của bạn</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Button 
            onClick={getIpAddress} 
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Đang lấy địa chỉ IP..." : "Lấy địa chỉ IP của tôi"}
          </Button>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Địa chỉ IP của bạn:</h3>
            
            {loading ? (
              <Skeleton className="h-6 w-full" />
            ) : ipAddress ? (
              <div className="flex items-center">
                <p className="text-xl font-mono bg-gray-100 w-full text-center py-2 px-4 rounded border border-gray-200 font-semibold">
                  {ipAddress}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-center italic">
                Chưa có thông tin IP
              </p>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Lưu ý: Ứng dụng này chỉ hiển thị địa chỉ IP công cộng của bạn.
            <br />
            Chúng tôi không lưu trữ thông tin IP của bạn.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
