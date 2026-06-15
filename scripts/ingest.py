from pathlib import Path
import pandas as pd

RAW_PATH = Path("archive")

orders = pd.read_csv(
    RAW_PATH / "olist_orders_dataset.csv"
)

customers = pd.read_csv(
    RAW_PATH / "olist_customers_dataset.csv"
)

order_items = pd.read_csv(
    RAW_PATH / "olist_order_items_dataset.csv"
)

products = pd.read_csv(
    RAW_PATH / "olist_products_dataset.csv"
)

payments = pd.read_csv(
    RAW_PATH / "olist_order_payments_dataset.csv"
)

print("Data loaded successfully")