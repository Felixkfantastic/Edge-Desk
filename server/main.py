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
def get_candles(symbol: str, resolution: str = "D", count: int = 100):
    import time
    end = int(time.time())
    start = end - (count * 24 * 60 * 60)
    url = f"https://finnhub.io/api/v1/forex/candle?symbol={symbol}&resolution={resolution}&from={start}&to={end}&token={FINNHUB_KEY}"
    response = requests.get(url)
    return response.json()

@app.get("/api/news")
def get_news():
    url = f"https://finnhub.io/api/v1/news?category=forex&token={FINNHUB_KEY}"
    response = requests.get(url)
    return response.json()