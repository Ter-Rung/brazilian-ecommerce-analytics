from pathlib import Path
import pandas as pd

folder = Path("archive")

summary = []

for file in folder.glob("*.csv"):
    df = pd.read_csv(file)

    try:
        summary.append({
        "file": file.name,
        "rows": len(df),
        "cols": len(df.columns),
        "nulls": int(df.isnull().sum().sum()),
        "numeric_cols": len(df.select_dtypes(include="number").columns),
        "object_cols": len(df.select_dtypes(include="object").columns)
        })
    
    except Exception:
        print("Invalid data!")

report = pd.DataFrame(summary)

print(report.sort_value("row", ascending=False))
