# Chatbot với Gemini AI

Hướng dẫn xây dựng hệ thống chatbot đơn giản sử dụng Google Gemini AI.

## Yêu cầu tiên quyết

- Node.js (version 14 hoặc cao hơn)
- Tài khoản Google AI Studio với API key

## Cài đặt

1. Clone project này.
2. Chạy lệnh cài đặt dependencies:

```bash
npm install
```

3. Lấy API key từ [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Thay thế `YOUR_API_KEY` trong file `.env` bằng API key thực tế của bạn.

## Chạy ứng dụng

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`. Mở trình duyệt và vào URL đó để sử dụng chatbot.

## Cách hoạt động

- Server Express chạy trên port 3000.
- Frontend HTML đơn giản với JavaScript để gửi và nhận tin nhắn.
- Khi người dùng gửi tin nhắn, nó được gửi đến API `/api/chat`.
- Router hướng đến controller để xử lý logic gọi Gemini AI và trả về phản hồi.

## Cấu trúc dự án

Sử dụng mô hình MVC để tổ chức code:

- `index.js`: Khởi tạo server và sử dụng routes.
- `controllers/chatController.js`: Xử lý logic nghiệp vụ của chat.
- `routes/chat.js`: Định nghĩa routes cho chat API.
- `models/Message.js`: Schema Mongoose cho tin nhắn (placeholder cho tương lai).
- `public/index.html`: Giao diện người dùng đơn giản.
- `package.json`: Các dependencies và scripts.

## Mở rộng

- Thêm authentication để bảo mật.
- Lưu trữ lịch sử cuộc trò chuyện (database như MongoDB).
- Tích hợp với Telegram, Discord, v.v.
- Thêm xử lý lỗi chi tiết hơn.

## Lưu ý an toàn

- Không lưu API key trực tiếp trong code. Sử dụng biến môi trường (env) thay thế.
- Giới hạn rate limiting để tránh lạm dụng API.

