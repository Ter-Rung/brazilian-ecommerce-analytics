# 📊 Olist Sales Performance Dashboard

Ứng dụng Dashboard trực quan hóa và phân tích dữ liệu kinh doanh từ bộ dữ liệu thương mại điện tử Olist (Brazil). Hệ thống hỗ trợ theo dõi các chỉ số KPI cốt lõi, xu hướng doanh thu, trạng thái đơn hàng và bảng xếp hạng danh mục/sản phẩm bán chạy nhất theo thời gian và khu vực.

---

## 🚀 Tính Năng Chính

- **KPI Metrics:** Theo dõi tổng doanh thu (Revenue), số lượng đơn hàng (Orders), số lượng khách hàng (Customers) và giá trị trung bình trên mỗi đơn hàng (AOV).
- **Revenue Trend:** Biểu đồ đường trực quan hóa xu hướng doanh thu theo dòng thời gian (Năm-Tháng).
- **Order Status:** Biểu đồ hình quạt (Pie/Donut Chart) phân tích tỷ lệ trạng thái các đơn hàng.
- **Top Categories:** Biểu đồ cột đứng hiển thị top 10 danh mục sản phẩm đem lại doanh thu cao nhất.
- **Top Products (Cải tiến):** Biểu đồ thanh ngang hiển thị top 10 sản phẩm bán chạy nhất. Nhãn trục Y hiển thị tên danh mục bằng chữ trực quan thay vì mã băm ID loằng ngoằng, hỗ trợ bong bóng hover xem chi tiết mã sản phẩm.
- **Dynamic Filters:** Bộ lọc động theo Năm, Tháng, Bang (State), Danh mục (Category) và Trạng thái đơn hàng (Status) áp dụng đồng bộ thời gian thực lên toàn bộ Dashboard.
- **Export Data:** Hỗ trợ trích xuất dữ liệu báo cáo động ra file CSV theo đúng các điều kiện bộ lọc đang chọn trên màn hình.

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend:** Python, Flask, Flask-CORS, Pandas
- **Database:** SQLite3
- **Frontend:** HTML5, CSS3 (Giao diện Dark Mode hiện đại), JavaScript (ES6+), Plotly.js (Thư viện dựng biểu đồ tương tác)
- **Public Server:** Ngrok (Hỗ trợ mở cổng public để demo từ xa)

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
├── database/
│   └── sales.db          # Cơ sở dữ liệu SQLite chứa bảng sales_fact
├── templates/
│   └── index.html        # Giao diện chính của Dashboard
├── static/
│   ├── css/
│   │   └── style.css     # Định dạng giao diện (Dark Theme, Layout)
│   └── js/
│   │   └── dashboard.js  # Xử lý gọi API và render biểu đồ Plotly
├── app.py                # File khởi chạy Server Flask & API Endpoints
├── README.md             # Tài liệu hướng dẫn dự án
└── requirements.txt      # Các thư viện Python cần cài đặt
