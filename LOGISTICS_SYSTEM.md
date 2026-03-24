# 📱 PhoneShop Warehouse Management System

Hệ thống Quản lý Kho (Warehouse Management System - WMS) chuyên dụng cho cửa hàng điện thoại và bán lẻ, được xây dựng với kiến trúc hiện đại, hỗ trợ quản lý tồn kho theo lô (FIFO), theo dõi IMEI và quy trình sửa chữa chuyên nghiệp.

---

## 🏗️ Kiến trúc Công nghệ (Tech Stack)

### **Backend: NestJS (Node.js framework)**
- **Database:** SQL Server (MSSQL)
- **ORM:** TypeORM
- **Tính năng chính:** 
  - API RESTful với tiền tố `/api`.
  - Quản lý giao dịch (Transactions) đảm bảo tính toàn vẹn dữ liệu.
  - Logic trừ kho theo nguyên tắc **FIFO** (First In - First Out).
  - Tự động ghi log lịch sử biến động kho (`stock_movements`).

### **Frontend: React + Vite**
- **UI Framework:** Vanilla CSS (Premium Dark Theme) + Tailwind-inspired utilities.
- **Icons:** Lucide React.
- **Tính năng chính:**
  - Dashboard tổng quan với các chỉ số real-time.
  - Quản lý danh mục sản phẩm, nhà cung cấp & dịch vụ sửa chữa.
  - Form nhập hàng/bán hàng linh hoạt.
  - Theo dõi tồn kho tổng hợp và lịch sử chi tiết.

---

## 🔄 Quy trình Nghiệp vụ (Business Flow)

### 1. Quy trình Nhập hàng (Import Flow)
Mô tả cách thức hàng hóa được đưa vào kho và quản lý theo lô.

```mermaid
graph TD
    A[📦 Nhà cung cấp] -->|Cung cấp hàng| B(Tạo Phiếu nhập - Import Receipt)
    B --> C{Phân loại?}
    C -->|Có IMEI| D[Quét mã IMEI từng máy]
    C -->|Không có IMEI| E[Nhập số lượng tổng]
    D --> F[Khởi tạo Lô hàng - Stock Batch]
    E --> F
    F --> G[Cập nhật Tồn kho thực tế]
    G --> H[Ghi Log biến động - Stock Movement]
    H --> I((Hoàn tất nhập kho))
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#00ff00,stroke:#333,stroke-width:2px
```

### 2. Quy trình Bán hàng & Logic FIFO (Sales & FIFO Flow)
Hệ thống tự động ưu tiên xuất các lô hàng nhập trước để tối ưu dòng vốn và hạn sử dụng.

```mermaid
graph TD
    Start[🛒 Khách hàng mua hàng] --> Invoice(Tạo Hóa đơn - Sales Invoice)
    Invoice --> Check{Kiểm tra tồn kho?}
    Check -->|Hết hàng| OutOfStock[Thông báo & Gợi ý nhập hàng]
    Check -->|Còn hàng| FIFO[Áp dụng thuật toán FIFO]
    
    FIFO --> SelectBatch[Tìm Lô hàng cũ nhất còn tồn]
    SelectBatch --> Deduct[Trừ số lượng tại Lô hàng đó]
    Deduct --> IMEISold[Cập nhật trạng thái IMEI: SOLD]
    IMEISold --> Log[Ghi Log Stock Movement]
    Log --> End((Xuất hóa đơn & Giao hàng))

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style End fill:#00ff00,stroke:#333,stroke-width:2px
```

### 3. Quy trình Dịch vụ Sửa chữa (Repair & Replacement Flow)
Quy trình đặc thù kết hợp giữa dịch vụ kỹ thuật và quản lý linh kiện.

```mermaid
graph TD
    Rec[🛠️ Tiếp nhận thiết bị] --> Type{Loại dịch vụ?}
    
    Type -->|Sửa chữa - Repair| Service[Tính phí dịch vụ/nhân công]
    
    Type -->|Thay thế - Replacement| StockCheck{Chọn linh kiện & Check kho}
    StockCheck -->|Còn hàng| FIFORep[Áp dụng FIFO trừ linh kiện]
    StockCheck -->|Hết hàng| Order[Yêu cầu nhập linh kiện mới]
    
    Service --> Finish[Hoàn tất sửa chữa]
    FIFORep --> Finish
    
    Finish --> Payment[Thanh toán & Xuất hóa đơn]
    Payment --> Movement[Ghi nhận biến động kho linh kiện]
    
    style Rec fill:#f9f,stroke:#333,stroke-width:2px
    style Payment fill:#0066ff,stroke:#fff,stroke-width:2px
```

### 4. Quản lý Danh mục Dịch vụ (Service Management Flow) - Mới
Dành cho người quản trị để thiết lập bảng giá dịch vụ và linh kiện.

```mermaid
graph LR
    A[Quản trị viên] --> B{Thao tác?}
    B -->|Tạo mới| C[Nhập Tên, Loại, Giá mặc định]
    B -->|Chỉnh sửa| D[Cập nhật Giá/Tên dịch vụ]
    B -->|Xóa dịch vụ| E[Xác nhận trạng thái & Xóa]
    
    C --> F[Lưu DB: repair_services]
    D --> F
    E --> G[Kiểm tra ràng buộc & Xóa]
    
    style A fill:#f66,stroke:#333,stroke-width:2px
```

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

### **4. Quản lý Sửa chữa & Dịch vụ (Repairs & Services)**
- **Ticket sửa chữa:** Quản lý quy trình tiếp nhận, theo dõi linh kiện.
- **Danh mục dịch vụ:** Thêm/Sửa/Xóa các dịch vụ định sẵn (thay pin, thay màn hình...).
- **Tích hợp kho:** Tự động trừ kho linh kiện khi sử dụng dịch vụ loại `REPLACEMENT`.

---

## 🗃️ Cấu trúc Cơ sở dữ liệu (Database Schema)

- `products`: Thông tin sản phẩm & linh kiện.
- `suppliers`: Nhà cung cấp.
- `import_receipts` & `import_receipt_items`: Phiếu nhập và chi tiết lô hàng.
- `stocks`: Theo dõi số lượng còn lại của từng lô nhập (Trái tim của FIFO).
- `sales_invoices`: Hóa đơn bán lẻ.
- `repairs` & `repair_services`: Quản lý dịch vụ sửa chữa và thay thế.
- `stock_movements`: Nhật ký biến động kho tập trung.
- `product_imeis`: Quản lý định danh duy nhất (IMEI/Serial).

---

## 🔧 Hướng dẫn Cài đặt

### **Bước 1: Cấu hình Backend**
1. Vào thư mục `backend/`.
2. Tạo file `.env` và cấu hình SQL Server:
   ```env
   DB_HOST=localhost
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=your_password
   DB_DATABASE=PhoneShopDB
   PORT=3000
   ```
3. Chạy: `npm install` và `npm run start:dev`.

### **Bước 2: Cấu hình Frontend**
1. Vào thư mục `frontend/`.
2. Chạy: `npm install`.
3. Khởi động: `npm run dev`.


