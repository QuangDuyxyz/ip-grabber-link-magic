# Check IP - Hệ thống theo dõi IP

## Giới thiệu

Đây là ứng dụng web được xây dựng với React, TypeScript và Supabase cho phép người dùng:

1. Xem địa chỉ IP gốc (private IP) và IP công cộng của họ
2. Tạo và quản lý các liên kết theo dõi để ghi lại địa chỉ IP của người truy cập
3. Xem lịch sử các lượt truy cập với thông tin chi tiết

## Tính năng chính

- **Xác thực người dùng**: Đăng ký và đăng nhập an toàn qua Supabase Auth
- **Lấy IP gốc**: Sử dụng WebRTC để lấy địa chỉ IP gốc (private IP) của thiết bị
- **Tạo liên kết theo dõi**: Tạo các liên kết với slug tùy chỉnh hoặc ngẫu nhiên
- **Quản lý liên kết**: Xem, sao chép, mở và xóa các liên kết theo dõi
- **Theo dõi lượt truy cập**: Ghi lại địa chỉ IP, user agent và thời gian truy cập

## Công nghệ sử dụng

- **Frontend**: React, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **Triển khai**: Vercel

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường phát triển
npm run dev

# Build cho production
npm run build
```

## Cấu trúc dự án

- `/src`: Mã nguồn frontend
  - `/components`: Các component React
  - `/pages`: Các trang của ứng dụng
  - `/integrations`: Tích hợp với các dịch vụ bên ngoài (Supabase)
  - `/hooks`: Custom React hooks
  - `/lib`: Tiện ích và hàm helper

- `/supabase`: Mã nguồn backend
  - `/functions`: Supabase Edge Functions
    - `/track`: Edge Function xử lý việc theo dõi IP

## Lưu ý bảo mật

Ứng dụng này chỉ nên được sử dụng cho mục đích hợp pháp và có sự đồng ý của người dùng. Việc thu thập địa chỉ IP nên tuân thủ các quy định về bảo vệ dữ liệu và quyền riêng tư.
