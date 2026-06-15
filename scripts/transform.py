from pathlib import Path
import pandas as pd
import sqlite3

df = pd.read_csv()

PROCESSED_PATH = Path("data/processed")

orders = pd.read_csv(
    PROCESSED_PATH / "orders_clean.csv"
)

customers = pd.read_csv(
    "archive/olist_customers_dataset.csv"
)

products = pd.read_csv(
    PROCESSED_PATH / "products_clean.csv"
)

order_items = pd.read_csv(
    "archive/olist_order_items_dataset.csv"
)

payments = pd.read_csv(
    PROCESSED_PATH / "payments_clean.csv"
)

# ==========================   Join data

sales_fact = (
    orders
    .merge(
        customers,
        on="customer_id",
        how="left"
    )
    .merge(
        order_items,
        on="order_id",
        how="left"
    )
    .merge(
        products,
        on="product_id",
        how="left"
    )
    .merge(
        payments,
        on="order_id",
        how="left"
    )
)

print("Shape:", sales_fact.shape)
print("Revenue:", sales_fact["payment_value"].sum())
print("Orders:", sales_fact["order_id"].nunique())



# ==========================   Feature Engineering

sales_fact["order_purchase_timestamp"] = pd.to_datetime(
    sales_fact["order_purchase_timestamp"]
)

sales_fact["year"] = (
    sales_fact["order_purchase_timestamp"]
    .dt.year
)

sales_fact["month"] = (
    sales_fact["order_purchase_timestamp"]
    .dt.month
)

sales_fact["quarter"] = (
    sales_fact["order_purchase_timestamp"]
    .dt.quarter
)

# ==========================   CSV save
sales_fact.to_csv(
    "data/processed/sales_fact.csv",
    index=False
)

# ==========================   SQLite save

conn = sqlite3.connect(
    "database/sales.db"
)

sales_fact.to_sql(
    "sales_fact",
    conn,
    if_exists="replace",
    index=False
)

conn.close()

print("Fact table created")