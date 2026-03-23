# 📱 PhoneShop Warehouse Management System

Hệ thống Quản lý Kho (Warehouse Management System - WMS) chuyên dụng cho cửa hàng điện thoại và bán lẻ, được xây dựng với kiến trúc hiện đại, hỗ trợ quản lý tồn kho theo lô (FIFO), theo dõi IMEI và báo cáo doanh thu.

---

## 🏗️ Kiến trúc Công nghệ (Tech Stack)

### **Backend: NestJS (Node.js framework)**
- **Database:** SQL Server (MSSQL)
- **ORM:** TypeORM
- **Tính năng chính:** 
  - API RESTful với tiền tố `/api`.
  - Quản lý giao dịch (Transactions) để đảm bảo tính toàn vẹn dữ liệu kho.
  - Logic trừ kho theo nguyên tắc **FIFO** (Nhập trước - Xuất trước).
  - Tự động ghi log lịch sử biến động kho (`stock_movements`).

### **Frontend: React + Vite**
- **UI Framework:** Vanilla CSS (Premium Dark Theme) + Tailwind-inspired utilities.
- **Icons:** Lucide React.
- **Tính năng chính:**
  - Dashboard tổng quan với các chỉ số real-time.
  - Quản lý danh mục sản phẩm, nhà cung cấp.
  - Form nhập hàng/bán hàng linh hoạt với nhiều dòng sản phẩm.
  - Theo dõi tồn kho tổng hợp và lịch sử chi tiết.

---

## 📦 Các Phân hệ Chức năng

### **1. Tổng quan (Dashboard)**
- Hiển thị tổng số sản phẩm, tổng tồn kho thực tế.
- Cảnh báo sản phẩm sắp hết hàng (Low Stock).
- Danh sách 10 hoạt động kho gần nhất.

### **2. Sản phẩm & Nhà cung cấp**
- Quản lý thông tin chi tiết: Mã SP, Barcode, Thương hiệu, Đơn giá, Tồn tối thiểu.
- Quản lý danh sách đối tác cung cấp hàng.

### **3. Quản lý Nhập kho (Imports)**
- Tạo phiếu nhập hàng với nhiều sản phẩm cùng lúc.
- Mỗi lần nhập sẽ tạo ra một **Lô hàng (Stock Batch)** riêng biệt.
- Hỗ trợ lưu mã IMEI cho từng máy khi nhập vào.

### **4. Quản lý Bán hàng (Sales)**
- Tạo hóa đơn bán lẻ/đối tác.
- **Logic FIFO:** Hệ thống tự động tìm các lô hàng cũ nhất còn tồn để trừ số lượng.
- Tự động cập nhật trạng thái IMEI sang `SOLD`.

### **5. Quản lý Tồn kho & Lịch sử**
- **Tồn kho:** Xem tổng cộng số lượng đã nhập và hiện còn lại của mỗi sản phẩm.
- **Lịch sử kho:** Truy xuất mọi biến động (Nhập, Xuất, Điều chỉnh) có kèm mã tham chiếu phiếu nhập/hóa đơn.
- **IMEI:** Quản lý trạng thái từng mã máy (Trong kho, Đã bán, Trả hàng, Bảo hành).

---

## 🗃️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng mô hình quan hệ chuẩn:
- `products`: Thông tin sản phẩm.
- `suppliers`: Nhà cung cấp.
- `import_receipts` & `import_receipt_items`: Phiếu nhập và chi tiết lô hàng.
- `stocks`: Theo dõi số lượng còn lại của từng lô nhập (Trái tim của FIFO).
- `sales_invoices` & `sales_invoice_items`: Hóa đơn và chi tiết xuất kho.
- `stock_movements`: Nhật ký biến động kho.
- `product_imeis`: Quản lý định danh duy nhất cho thiết bị di động.

---

## 🔧 Hướng dẫn Cài đặt

### **Bước 1: Cấu hình Backend**
1. Vào thư mục `backend/`.
2. Tạo file `.env` (nếu chưa có) và cấu hình SQL Server:
   ```env
   DB_HOST=localhost
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=your_password
   DB_DATABASE=PhoneShopDB
   PORT=3000
   ```
3. Chạy lệnh: `npm install` và `npm run start:dev`.

### **Bước 2: Cấu hình Frontend**
1. Vào thư mục `frontend/`.
2. Chạy lệnh: `npm install`.
3. Khởi động giao diện: `npm run dev`.

---

## ✨ Điểm nổi bật về Thiết kế (UX/UI)
- **Giao diện Dark Mode:** Mang lại cảm giác cao cấp, chuyên nghiệp.
- **Hiệu ứng Glassmorphism:** Sử dụng hiệu ứng kính mờ cho các Modal và Sidebar.
- **Smooth Transitions:** Các trạng thái Hover, Loading được tối ưu mượt mà.
- **Tương tác thông minh:** Tự động tính tổng tiền, tự động gợi ý giá bán khi tạo hóa đơn.

---
*Phát triển bởi Antigravity AI Assistant - 2026*
