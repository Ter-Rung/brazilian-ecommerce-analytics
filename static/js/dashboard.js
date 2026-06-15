const API_URL = ""; 

/* ==========================================================================
   1. GLOBAL CONFIGURATION
   ========================================================================== */

const CHART_THEME = {
    paper_bgcolor: "rgba(0, 0, 0, 0)", 
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    font: {
        color: "#94a3b8", // Màu chữ xám mờ hiện đại (Slate 400)
        family: "Inter, sans-serif"
    },
    margin: { t: 50, l: 60, r: 20, b: 50 }
};


const GRID_STYLE = {
    showgrid: true,
    gridcolor: "rgba(255, 255, 255, 0.05)", // Đường lưới mảnh, tối
    zeroline: false
};


const COLOR_PALETTE = {
    primary: "#7c3aed",   
    success: "#10b981",     
    warning: "#f59e0b",      
    multi: ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a855f7"]
};


const PLOTLY_CONFIG = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d']
};

/* ==========================================================================
   2. UTILS & FILTERS
   ========================================================================== */
function getFilters() {
    return {
        year: document.getElementById("yearFilter").value,
        month: document.getElementById("monthFilter").value,
        state: document.getElementById("stateFilter").value,
        category: document.getElementById("categoryFilter").value,
        status: document.getElementById("statusFilter").value
    };
}

// Hàm bổ sung trạng thái Loading/Error trực quan cho người dùng
function updateChartContainer(id, content) {
    document.getElementById(id).innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%; color:#64748b; font-size:14px;">
            ${content}
        </div>`;
}

/* ==========================================================================
   3. DATA FETCHING & VISUALIZATION
   ========================================================================== */

async function loadKPI() {
    try {
        const f = getFilters();
        const response = await fetch(`${API_URL}/api/kpi?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        document.getElementById("revenue").innerText = "$" + Number(data.revenue || 0).toLocaleString();
        document.getElementById("orders").innerText = Number(data.orders || 0).toLocaleString();
        document.getElementById("customers").innerText = Number(data.customers || 0).toLocaleString();
        document.getElementById("aov").innerText = "$" + Number(data.aov || 0).toFixed(2);
    } catch (err) {
        console.error("KPI Error:", err);
    }
}

async function loadRevenueTrend() {
    const id = "revenueChart";
    updateChartContainer(id, "⏳ Loading trend...");
    try {
        const f = getFilters();
        const response = await fetch(`${API_URL}/api/revenue-trend?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data.length) { return updateChartContainer(id, "⚠️ No data available"); }

        const trace = {
            x: data.map(i => i.year_month),
            y: data.map(i => i.revenue),
            type: "scatter",
            mode: "lines+markers",
            name: "Revenue",
            line: { width: 3, color: COLOR_PALETTE.primary },
            marker: { size: 6, color: COLOR_PALETTE.success },
            fill: "tozeroy",
            fillcolor: "rgba(124, 58, 237, 0.08)", 
            hovertemplate: "<b>%{x}</b><br>Revenue: $%{y:,}<extra></extra>"
        };

        const layout = {
            ...CHART_THEME,
            xaxis: { ...GRID_STYLE, title: "Timeline" },
            yaxis: { ...GRID_STYLE, title: "Revenue ($)" },
            transition: {
                duration: 500,
                easing: "cubic-in-out"
            },
            frame: {
                duration: 500
            }
        };

        Plotly.newPlot(id, [trace], layout, PLOTLY_CONFIG);
    } catch (err) {
        updateChartContainer(id, "❌ Failed to load graph");
    }
}

async function loadOrderStatus() {
    const id = "statusChart";
    updateChartContainer(id, "⏳ Loading status...");
    try {
        const f = getFilters();
        const response = await fetch(`${API_URL}/api/order-status?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data.length) { return updateChartContainer(id, "⚠️ No data available"); }

        const trace = {
            labels: data.map(i => i.order_status),
            values: data.map(i => i.total_orders),
            type: "pie",
            hole: 0.6,
            marker: { colors: COLOR_PALETTE.multi },
            textinfo: "percent",
            hovertemplate: "<b>%{label}</b><br>Orders: %{value:,} (%{percent})<extra></extra>"
        };

        const layout = {
            ...CHART_THEME,
            showlegend: true,
            legend: { orientation: "h", y: -0.1, font: { size: 11 } }
        };

        Plotly.newPlot(id, [trace], layout, PLOTLY_CONFIG);
    } catch (err) {
        updateChartContainer(id, "❌ Failed to load graph");
    }
}

async function loadTopCategories() {
    const id = "categoryChart";
    updateChartContainer(id, "⏳ Loading categories...");
    try {
        const f = getFilters();
        const response = await fetch(`${API_URL}/api/top-categories?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data.length) { return updateChartContainer(id, "⚠️ No data available"); }

        const trace = {
            x: data.map(i => i.category),
            y: data.map(i => i.revenue),
            type: "bar",
            marker: {
                color: COLOR_PALETTE.primary,
                border: { radius: 8 } 
            },
            hovertemplate: "<b>%{x}</b><br>Revenue: $%{y:,}<extra></extra>"
        };

        const layout = {
            ...CHART_THEME,
            xaxis: { ...GRID_STYLE, title: "Category", tickangle: -25 },
            yaxis: { ...GRID_STYLE, title: "Revenue ($)" },
            transition: {
                duration: 500,
                easing: "sin-in-out"
            }
        };

        Plotly.newPlot(id, [trace], layout, PLOTLY_CONFIG);
    } catch (err) {
        updateChartContainer(id, "❌ Failed to load graph");
    }
}

async function loadRevenueByState() {
    const id = "stateChart";
    updateChartContainer(id, "⏳ Loading states...");
    try {
        const f = getFilters();
        const response = await fetch(`${API_URL}/api/revenue-by-state?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data.length) { return updateChartContainer(id, "⚠️ No data available"); }

        const sortedData = data.reverse();

        const trace = {
            x: sortedData.map(i => i.revenue),
            y: sortedData.map(i => i.customer_state),
            type: "bar",
            orientation: "h",
            marker: { color: COLOR_PALETTE.success },
            hovertemplate: "<b>State: %{y}</b><br>Revenue: $%{x:,}<extra></extra>"
        };

        const layout = {
            ...CHART_THEME,
            xaxis: { ...GRID_STYLE, title: "Revenue ($)" },
            yaxis: { ...GRID_STYLE, dtick: 1 },
            transition: {
                duration: 600,
                easing: "back-in-out"
            }
        };

        Plotly.newPlot(id, [trace], layout, PLOTLY_CONFIG);
    } catch (err) {
        updateChartContainer(id, "❌ Failed to load graph");
    }
}

async function loadTopProducts() {
    const id = "productChart";
    updateChartContainer(id, "⏳ Loading products...");
    try {
        const f = getFilters();
        // Gọi API với đường dẫn tương đối để đồng bộ cổng 5000
        const response = await fetch(`/api/top-products?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data.length) { return updateChartContainer(id, "⚠️ No data available"); }

        const sortedData = data.reverse();

        const trace = {
            x: sortedData.map(i => i.revenue),
            y: sortedData.map(i => i.display_name), // Tên chữ danh mục nằm ở trục Y
            type: "bar",
            orientation: "h",
            marker: { color: COLOR_PALETTE.warning },
            
            // XÓA DÒNG 'text: sortedData.map(...)' CŨ ĐI
            // Thay bằng cấu trúc hover hoàn toàn độc lập dưới đây:
            hovertext: sortedData.map(i => i.product_id), // Đẩy ID vào hovertext để dùng riêng cho bong bóng hover
            hovertemplate: "<b>Category:</b> %{y}<br><b>Product ID:</b> %{hovertext}<br><b>Revenue:</b> $%{x:,}<extra></extra>"
        };

        const layout = {
            ...CHART_THEME,
            // Nới lề trái rộng ra (khoảng 180px) để làm chỗ đứng cho chữ căn trái
            margin: { ...CHART_THEME.margin, l: 180 }, 
            xaxis: { ...GRID_STYLE, title: "Revenue ($)" },
            yaxis: { 
                showticklabels: true,
                dtick: 1,
                side: "left", // Đảm bảo nhãn nằm bên trái hệ trục tọa độ
                automargin: false, // Tắt automargin để tránh bị Plotly tự động kéo giật lề về bên phải
                font: { 
                    size: 11,
                    family: "Inter, sans-serif"
                }
            }
        };


        Plotly.newPlot(id, [trace], layout, PLOTLY_CONFIG);
        } catch (err) {
            console.error("Top Products Chart Error:", err);
            updateChartContainer(id, "❌ Failed to load graph");
        }
}
/* ==========================================================================
   4. FILTERS INITIALIZATION & APP LIFECYCLE
   ========================================================================== */
async function loadCategories() {
    const response = await fetch(`${API_URL}/api/categories`);
    const data = await response.json();
    const select = document.getElementById("categoryFilter");
    select.innerHTML = '<option value="">All Categories</option>';
    data.forEach(c => {
        const o = document.createElement("option");
        o.value = c; o.textContent = c; select.appendChild(o);
    });
}

async function loadStatuses() {
    const response = await fetch(`${API_URL}/api/statuses`);
    const data = await response.json();
    const select = document.getElementById("statusFilter");
    select.innerHTML = '<option value="">All Status</option>';
    data.forEach(s => {
        const o = document.createElement("option");
        o.value = s; o.textContent = s; select.appendChild(o);
    });
}

// --- 1. THÊM HÀM NÀY VÀO TRONG JS (Xếp cùng nhóm với loadCategories, loadStatuses) ---
async function loadStates() {
    try {
        const response = await fetch(`${API_URL}/api/states`);
        const data = await response.json();
        const select = document.getElementById("stateFilter");
        
        select.innerHTML = '<option value="">All States</option>';
        data.forEach(state => {
            const o = document.createElement("option");
            o.value = state;
            o.textContent = state;
            select.appendChild(o);
        });
    } catch (err) {
        console.error("Error loading states:", err);
    }
}


async function loadYears() {
    try {
        const response = await fetch(`${API_URL}/api/years`);
        const data = await response.json();
        const select = document.getElementById("yearFilter");
        
        select.innerHTML = '<option value="">All Years</option>';
        data.forEach(year => {
            const o = document.createElement("option");
            o.value = year;
            o.textContent = year;
            select.appendChild(o);
        });
    } catch (err) {
        console.error("Error loading years:", err);
    }
}

// --- 1. HÀM XỬ LÝ DOWNLOAD CSV ĐỘNG THEO FILTER ---
async function exportToCsv() {
    const btn = document.getElementById("exportCsvBtn");
    const originalText = btn.innerText;
    
    try {
        // Đổi trạng thái nút bấm để người dùng biết hệ thống đang xử lý
        btn.innerText = "⏳ Exporting...";
        btn.style.opacity = "0.7";

        const f = getFilters();
        // Gọi API export kèm theo các filter hiện tại trên màn hình
        const response = await fetch(`${API_URL}/api/export-csv?year=${f.year}&month=${f.month}&state=${f.state}&category=${f.category}&status=${f.status}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            alert("No data available for the current filters to export!");
            btn.innerText = originalText;
            btn.style.opacity = "1";
            return;
        }

        // Tạo tiêu đề cột cho file CSV (BOM \uFEFF giúp Excel không bị lỗi font UTF-8)
        let csvContent = "\uFEFFTime_Period,Customer_State,Category,Total_Orders,Total_Revenue\n";
        
        // Duyệt qua dữ liệu trả về để nối thành các dòng CSV
        data.forEach(row => {
            // Bao bọc category bằng dấu nháy kép đề phòng tên danh mục chứa dấu phẩy làm vỡ cột CSV
            const categorySafe = row.Category ? `"${row.Category}"` : "";
            csvContent += `${row.Time_Period},${row.Customer_State || ""},${categorySafe},${row.Total_Orders},${row.Total_Revenue}\n`;
        });

        // Tạo một liên kết ngầm (Blob) để kích hoạt sự kiện download của trình duyệt
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        // Tên file đặt động theo ngày xuất báo cáo
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("href", url);
        link.setAttribute("download", `Olist_Sales_Report_${dateStr}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (err) {
        console.error("Export Error:", err);
        alert("Failed to export CSV. Please try again.");
    } finally {
        // Trả lại trạng thái ban đầu cho nút bấm
        btn.innerText = originalText;
        btn.style.opacity = "1";
    }
}

// --- 2. ĐĂNG KÝ SỰ KIỆN CLICK CHO NÚT BẤM (Đặt ở cuối file, chỗ cụm addEventListener) ---
document.getElementById("exportCsvBtn").addEventListener("click", exportToCsv);


function reloadDashboard() {
    loadKPI();
    loadRevenueTrend();
    loadOrderStatus();
    loadTopCategories();
    loadRevenueByState();
    loadTopProducts();
}

async function init() {
    await loadYears(); 
    await loadCategories();
    await loadStatuses();
    await loadStates();
    reloadDashboard();
}

// Gom nhóm lắng nghe sự kiện thay đổi bộ lọc gọn gàng bằng vòng lặp array
["yearFilter", "monthFilter", "stateFilter", "categoryFilter", "statusFilter"].forEach(id => {
    document.getElementById(id).addEventListener("change", reloadDashboard);
});

init();