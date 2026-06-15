from pathlib import Path
import pandas as pd

RAW_PATH = Path("archive")
PROCESSED_PATH = Path("data/processed")

PROCESSED_PATH.mkdir(
    parents=True,
    exist_ok=True
)

orders = pd.read_csv(
    RAW_PATH / "olist_orders_dataset.csv"
)

products = pd.read_csv(
    RAW_PATH / "olist_products_dataset.csv"
)

payments = pd.read_csv(
    RAW_PATH / "olist_order_payments_dataset.csv"
)

# remove duplicates

orders = orders.drop_duplicates()

products = products.drop_duplicates()

payments = payments.drop_duplicates()

# datetime

orders["order_purchase_timestamp"] = pd.to_datetime(
    orders["order_purchase_timestamp"]
)

# fill missing category

products["product_category_name"] = (
    products["product_category_name"]
    .fillna("Unknown")
)

orders.to_csv(
    PROCESSED_PATH / "orders_clean.csv",
    index=False
)

products.to_csv(
    PROCESSED_PATH / "products_clean.csv",
    index=False
)

payments.to_csv(
    PROCESSED_PATH / "payments_clean.csv",
    index=False
)

print("Cleaning complete")