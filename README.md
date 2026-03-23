# 📱 PhoneShop Warehouse Management — Hướng dẫn Cài đặt

Chào mừng bạn đến với hệ thống quản lý kho chuyên dụng cho cửa hàng điện thoại. Dưới đây là các bước để cài đặt và vận hành toàn bộ giải pháp từ Backend đến Frontend.

---

## 📋 Yêu cầu hệ thống (Prerequisites)

- **Node.js**: Phiên bản 18.x trở lên.
- **npm**: Thường đi kèm với Node.js.
- **SQL Server (MSSQL)**: Cần có một instance đang chạy (Local hoặc Docker) và bật quyền truy cập (SQL Server Authentication).
- **Trình duyệt**: Khuyến nghị dùng Chrome hoặc Edge.

---

## 🛠️ Bước 1: Cấu hình Cơ sở dữ liệu (Backend)

1.  **Tru cập thư mục Backend**:
    ```bash
    cd backend
    ```
2.  **Cài đặt thư viện**:
    ```bash
    npm install
    ```
3.  **Thiết lập tham số môi trường**:
    Tạo hoặc chỉnh sửa tệp `.env` trong thư mục `backend/` với nội dung sau:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=1433
    DB_USERNAME=sa
    DB_PASSWORD=your_password  # Thay bằng mật khẩu SQL Server của bạn
    DB_DATABASE=PhoneShopDB
    ```
4.  **Khởi động Backend**:
    ```bash
    npm run start:dev
    ```
    *(Hệ thống sẽ tự động tạo các bảng dữ liệu trong SQL Server khi chạy lần đầu).*

---

## 💻 Bước 2: Cài đặt Giao diện (Frontend)

1.  **Tru cập thư mục Frontend**:
    ```bash
    cd ../frontend  # Quay lại thư mục gốc rồi vào frontend
    ```
2.  **Cài đặt thư viện**:
    ```bash
    npm install
    ```
3.  **Khởi tạo Giao diện**:
    ```bash
    npm run dev
    ```
    *Mặc định giao diện sẽ chạy tại `http://localhost:5173`.*

---

## 🚀 Cách chạy nhanh (Quick Start)

Nếu bạn ở trên Windows, bạn có thể sử dụng tệp lệnh đã tạo sẵn:
1.  Chạy tệp `start.bat` ở thư mục gốc để tự động cài đặt và khởi động đồng thời cả Backend và Frontend.

---

## 📑 Các phân hệ quản lý chính

Sau khi vào hệ thống (`http://localhost:5173`), bạn nên thiết lập theo thứ tự sau để dữ liệu chuẩn nhất:
1.  **Danh mục (Categories)**: Laptop, Smartphone, Phụ kiện...
2.  **Thương hiệu (Brands)**: Apple, Samsung, Xiaomi...
3.  **Nhà cung cấp (Suppliers)**: Các đối tác cung ứng hàng.
4.  **Sản phẩm (Products)**: Nhập thông tin chi tiết từng dòng máy.
5.  **Nhập kho (Imports)**: Thực hiện nhập hàng vào kho (sau bước này tồn kho sẽ tăng).
6.  **Bán hàng (Sales)**: Xuất kho theo lô FIFO (Nhập trước xuất trước).

---

## ⚠️ Lưu ý kỹ thuật

- **FIFO Logic**: Hệ thống tự động trừ tồn kho dựa trên thời điểm nhập hàng (Lô cũ trừ trước, lô mới trừ sau). Đừng quên kiểm định mã IMEI khi thực hiện xuất kho.
- **SQL Server**: Đảm bảo cổng `1433` không bị chặn bởi Tường lửa (Firewall).
- **API**: Frontend mặc định gọi API tới `http://localhost:3000/api`.

---
*Tài liệu hướng dẫn được biên soạn bởi Antigravity AI - 2026*
