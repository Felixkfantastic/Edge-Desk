from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FINNHUB_KEY = os.getenv("FINNHUB_KEY")

@app.get("/")
def root():
    return {"status": "EdgeDesk server running"}

@app.get("/api/candles/{symbol}")
def get_candles(symbol: str, resolution: str = "D", count: int = 150):
    import time
    end = int(time.time())
    if resolution == "D":
        start = end - (count * 24 * 60 * 60)
    elif resolution == "W":
        start = end - (count * 7 * 24 * 60 * 60)
    elif resolution == "60":
        start = end - (count * 60 * 60)
    elif resolution == "30":
        start = end - (count * 30 * 60)
    elif resolution == "15":
        start = end - (count * 15 * 60)
    else:
        start = end - (count * 24 * 60 * 60)
    url = f"https://finnhub.io/api/v1/forex/candle?symbol={symbol}&resolution={resolution}&from={start}&to={end}&token={FINNHUB_KEY}"
    response = requests.get(url)
    return response.json()

@app.get("/api/news")
def get_news():
    url1 = f"https://finnhub.io/api/v1/news?category=forex&token={FINNHUB_KEY}"
    url2 = f"https://finnhub.io/api/v1/news?category=general&token={FINNHUB_KEY}"
    r1 = requests.get(url1).json()
    r2 = requests.get(url2).json()
    combined = r1 + r2
    seen = set()
    unique = []
    for item in combined:
        if item["id"] not in seen:
            seen.add(item["id"])
            unique.append(item)
    return unique[:20]