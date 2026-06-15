
from flask_cors import CORS
import sqlite3
import pandas as pd
from flask import Flask, jsonify, request, render_template # Thêm render_template ở đây




app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

def get_connection():
    return sqlite3.connect("database/sales.db")

def get_filters():

    return {

        "year":
            request.args.get("year"),

        "month":
            request.args.get("month"),

        "state":
            request.args.get("state"),

        "category":
            request.args.get("category"),

        "status":
            request.args.get("status")
    }

def apply_filters(query, filters):

    params = []

    if filters["year"]:
        query += " AND year = ? "
        params.append(filters["year"])

    if filters["month"]:
        query += " AND month = ? "
        params.append(filters["month"])

    if filters["state"]:
        query += " AND customer_state = ? "
        params.append(filters["state"])

    if filters["category"]:
        query += " AND product_category_name = ? "
        params.append(filters["category"])

    if filters["status"]:
        query += " AND order_status = ? "
        params.append(filters["status"])

    return query, params

@app.route("/api/kpi", methods=["GET"])
def kpi():

    conn = get_connection()

    filters = get_filters()

    query = """
    SELECT
        ROUND(SUM(payment_value), 2) AS revenue,
        COUNT(DISTINCT order_id) AS orders,
        COUNT(DISTINCT customer_id) AS customers,
        ROUND(
            SUM(payment_value)
            /
            NULLIF(
                COUNT(DISTINCT order_id),
                0
            ),
            2
        ) AS aov
    FROM sales_fact
    WHERE 1=1
    """

    query, params = apply_filters(
        query,
        filters
    )

    df = pd.read_sql(
        query,
        conn,
        params=params
    )

    conn.close()

    return jsonify(
        df.iloc[0].to_dict()
    )

@app.route("/api/revenue-trend", methods=["GET"])
def revenue_trend():

    conn = get_connection()

    filters = get_filters()

    query = """
    SELECT
        year || '-' || printf('%02d', month) AS year_month,
        ROUND(SUM(payment_value), 2) AS revenue
    FROM sales_fact
    WHERE 1=1
    """

    query, params = apply_filters(
        query,
        filters
    )

    query += """
    GROUP BY year, month
    ORDER BY year, month
    """

    df = pd.read_sql(
        query,
        conn,
        params=params
    )

    conn.close()

    return jsonify(
        df.to_dict(orient="records")
    )

@app.route("/api/order-status")
def order_status():

    conn = get_connection()

    filters = get_filters()

    query = """
    SELECT
        order_status,
        COUNT(DISTINCT order_id) AS total_orders
    FROM sales_fact
    WHERE 1=1
    """

    query, params = apply_filters(
        query,
        filters
    )

    query += """
    GROUP BY order_status
    ORDER BY total_orders DESC
    """

    df = pd.read_sql(
        query,
        conn,
        params=params
    )

    conn.close()

    return jsonify(
        df.to_dict(orient="records")
    )

@app.route("/api/top-categories")
def top_categories():
    conn = get_connection()
    filters = get_filters()

    # Câu lệnh SQL chuẩn chỉnh lấy ra top danh mục doanh thu cao nhất
    query = """
    SELECT
        product_category_name AS category,
        ROUND(SUM(payment_value), 2) AS revenue
    FROM sales_fact
    WHERE product_category_name IS NOT NULL
    """

    # Nối filter tự động của mày vào (chạy cực an toàn)
    query, params = apply_filters(
        query,
        filters
    )

    query += """
    GROUP BY product_category_name
    ORDER BY revenue DESC
    LIMIT 10
    """

    df = pd.read_sql(
        query,
        conn,
        params=params
    )
    conn.close()

    # Chống lỗi NaN làm sập JSON
    df = df.fillna("")

    return jsonify(
        df.to_dict(orient="records")
    )

@app.route("/api/top-products")
def top_products():
    conn = get_connection()
    filters = get_filters()

    # Lấy cả product_id và product_category_name từ sales_fact
    # Đặt alias là display_name để TRÁNH TRÙNG với bộ lọc của hàm apply_filters
    query = """
    SELECT
        product_id,
        COALESCE(product_category_name, 'Other') AS display_name,
        ROUND(SUM(payment_value), 2) AS revenue
    FROM sales_fact
    WHERE product_id IS NOT NULL
    """

    # Hàm apply_filters của mày sẽ nối các điều kiện lọc an toàn vào đây
    query, params = apply_filters(
        query,
        filters
    )

    # Nhóm theo product_id để tính chính xác sản phẩm nào bán chạy nhất,
    # sau đó nhóm thêm cả display_name để SQLite trả về tên chữ chuẩn
    query += """
    GROUP BY product_id, product_category_name
    ORDER BY revenue DESC
    LIMIT 10
    """

    df = pd.read_sql(
        query,
        conn,
        params=params
    )
    conn.close()

    # Bảo hiểm chống lỗi NaN cho JSON
    df = df.fillna("")

    return jsonify(
        df.to_dict(orient="records")
    )

@app.route("/api/revenue-by-state")
def revenue_by_state():

    conn = get_connection()

    filters = get_filters()

    query = """
    SELECT
        customer_state,
        ROUND(SUM(payment_value),2) AS revenue
    FROM sales_fact
    WHERE 1=1
    AND customer_state IS NOT NULL
    """

    query, params = apply_filters(
        query,
        filters
    )

    query += """
    GROUP BY customer_state
    ORDER BY revenue DESC
    """

    df = pd.read_sql(
        query,
        conn,
        params=params
    )

    conn.close()

    return jsonify(
        df.to_dict(orient="records")
    )

@app.route("/api/years")
def get_years():
    conn = get_connection()
    query = """
    SELECT DISTINCT year
    FROM sales_fact
    WHERE year IS NOT NULL
    ORDER BY year DESC
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df["year"].tolist())

@app.route("/api/categories")
def get_categories():

    conn = get_connection()

    query = """
    SELECT DISTINCT product_category_name
    FROM sales_fact
    WHERE product_category_name IS NOT NULL
    ORDER BY product_category_name
    """

    df = pd.read_sql(query, conn)

    conn.close()

    return jsonify(
        df.iloc[:, 0].tolist()
    )

@app.route("/api/statuses")
def get_statuses():

    conn = get_connection()

    query = """
    SELECT DISTINCT order_status
    FROM sales_fact
    ORDER BY order_status
    """

    df = pd.read_sql(query, conn)

    conn.close()

    return jsonify(
        df["order_status"].tolist()
    )

@app.route("/api/states")
def get_states():
    conn = get_connection()
    query = """
    SELECT DISTINCT customer_state
    FROM sales_fact
    WHERE customer_state IS NOT NULL
    ORDER BY customer_state
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df["customer_state"].tolist())

@app.route("/api/export-csv", methods=["GET"])
def export_csv_data():
    try:
        conn = get_connection()
        
        # Lấy bộ lọc từ request url params
        year = request.args.get("year", "")
        month = request.args.get("month", "")
        state = request.args.get("state", "")
        category = request.args.get("category", "")
        status = request.args.get("status", "")

        # Câu lệnh SQL gốc
        query = """
        SELECT
            year || '-' || printf('%02d', month) AS [Time_Period],
            customer_state AS [Customer_State],
            product_category_name AS [Category],
            COUNT(DISTINCT order_id) AS [Total_Orders],
            ROUND(SUM(payment_value), 2) AS [Total_Revenue]
        FROM sales_fact
        WHERE 1=1
        """
        
        params = []
        
        # KIỂM TRA CHẶT CHẼ: Chỉ thêm điều kiện lọc nếu biến có giá trị (không rỗng)
        if year and year.strip() != "":
            query += " AND year = ?"
            params.append(int(year))
            
        if month and month.strip() != "":
            query += " AND month = ?"
            params.append(int(month))
            
        if state and state.strip() != "":
            query += " AND customer_state = ?"
            params.append(state)
            
        if category and category.strip() != "":
            query += " AND product_category_name = ?"
            params.append(category)
            
        if status and status.strip() != "":
            query += " AND order_status = ?"
            params.append(status)

        # Nhóm dữ liệu và sắp xếp
        query += "\nGROUP BY year, month, customer_state, product_category_name\nORDER BY year DESC, month DESC"
        
        df = pd.read_sql(query, conn, params=params)
        conn.close()
        
        df = df.fillna("")
        
        print(f"--- Export CSV Debug: Đã tìm thấy {len(df)} dòng dữ liệu ---")
        
        return jsonify(df.to_dict(orient="records"))
        
    except Exception as e:
        print(f"❌ Lỗi crash tại API Export: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)