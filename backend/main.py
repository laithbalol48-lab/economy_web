from pathlib import Path
from datetime import datetime
import math

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "exchange_rate.csv"
FRONTEND_DIR = BASE_DIR / "frontend"

INDICATORS = {
    "usd_syp": {"label": "سعر الصرف الرسمي", "unit": "ليرة سورية / دولار"},
    "purchasing_power": {"label": "القدرة الشرائية", "unit": "مؤشر"},
    "gold_price": {"label": "سعر الذهب", "unit": "ليرة سورية / غرام"},
    "economic_confidence": {"label": "الثقة الاقتصادية", "unit": "مؤشر"},
}

app = FastAPI(title="Mirsad Economic Observatory", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


def read_data():
    if not DATA_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="لم يُعثر على data/exchange_rate.csv. انسخ ملف البيانات الحالي إلى مجلد data."
        )
    try:
        df = pd.read_csv(DATA_FILE)
        if "year" not in df.columns:
            raise HTTPException(status_code=422, detail="ملف البيانات يجب أن يحتوي على عمود year.")
        df["year"] = pd.to_numeric(df["year"], errors="coerce")
        df = df.dropna(subset=["year"]).copy()
        df["year"] = df["year"].astype(int)
        for col in df.columns:
            if col not in {"year", "source", "notes", "type"}:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        df = df.sort_values("year").drop_duplicates("year", keep="last").reset_index(drop=True)
        return df
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"تعذرت قراءة ملف البيانات: {exc}")


@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now().isoformat(timespec="minutes")}


@app.get("/api/indicators")
def indicators():
    df = read_data()
    result = []
    for key, meta in INDICATORS.items():
        available = key in df.columns and df[key].notna().sum() >= 3
        result.append({"key": key, **meta, "available": available})
    return {"indicators": result}


@app.get("/api/dashboard")
def dashboard(indicator: str = "usd_syp", target_year: int = 2030):
    if indicator not in INDICATORS:
        raise HTTPException(status_code=400, detail="المؤشر المطلوب غير معروف.")
    if target_year < 2027 or target_year > 2035:
        raise HTTPException(status_code=400, detail="سنة التوقع يجب أن تكون بين 2027 و2035.")

    df = read_data()
    if indicator not in df.columns:
        raise HTTPException(status_code=404, detail=f"لا توجد بيانات لمؤشر {INDICATORS[indicator]['label']} بعد.")
    valid = df[["year", indicator]].dropna().sort_values("year")
    if len(valid) < 3:
        raise HTTPException(status_code=422, detail="يلزم وجود ثلاث سنوات صالحة على الأقل لبناء النموذج.")

    years = valid["year"].to_numpy().reshape(-1, 1)
    values = valid[indicator].to_numpy(dtype=float)
    split = max(2, min(int(len(valid) * 0.8), len(valid) - 1))
    test_model = LinearRegression().fit(years[:split], values[:split])
    test_pred = test_model.predict(years[split:])
    mae = float(mean_absolute_error(values[split:], test_pred)) if len(test_pred) else None
    rmse = float(math.sqrt(mean_squared_error(values[split:], test_pred))) if len(test_pred) else None

    model = LinearRegression().fit(years, values)
    last_year = int(valid["year"].max())
    future_years = np.arange(last_year + 1, target_year + 1)
    future_values = model.predict(future_years.reshape(-1, 1)) if len(future_years) else []

    actual = [
        {"year": int(y), "value": float(v), "kind": "actual"}
        for y, v in zip(valid["year"], valid[indicator])
    ]
    forecast = [
        {"year": int(y), "value": float(v), "kind": "forecast"}
        for y, v in zip(future_years, future_values)
    ]

    return {
        "indicator": indicator,
        "label": INDICATORS[indicator]["label"],
        "unit": INDICATORS[indicator]["unit"],
        "first_year": int(valid["year"].min()),
        "last_year": last_year,
        "count": int(len(valid)),
        "latest_value": float(valid.iloc[-1][indicator]),
        "target_year": target_year,
        "model": "Linear Regression",
        "mae": mae,
        "rmse": rmse,
        "actual": actual,
        "forecast": forecast,
        "updated_at": datetime.now().isoformat(timespec="minutes"),
        "source": "ملف البيانات المحلي data/exchange_rate.csv",
    }
