import { useState } from "react"

const PAIRS = [
  { label: "EUR/USD", tv: "OANDA:EURUSD" },
  { label: "GBP/USD", tv: "OANDA:GBPUSD" },
  { label: "USD/JPY", tv: "OANDA:USDJPY" },
  { label: "USD/CHF", tv: "OANDA:USDCHF" },
  { label: "BTC/USD", tv: "BITSTAMP:BTCUSD" },
  { label: "US30",    tv: "FOREXCOM:DJI" },
  { label: "NASDAQ",  tv: "NASDAQ:NDX" },
]

const RESOLUTIONS = [
  { label: "15M", value: "15" },
  { label: "1H",  value: "60" },
  { label: "4H",  value: "240" },
  { label: "1D",  value: "D" },
  { label: "1W",  value: "W" },
]

const btnStyle = (active) => ({
  padding: "6px 12px", borderRadius: 4, border: "1px solid",
  cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: 700,
  borderColor: active ? "#22c55e" : "#0f172a",
  background: active ? "#14532d" : "#070b14",
  color: active ? "#22c55e" : "#475569"
})

export default function ChartTab() {
  const [pair, setPair] = useState(PAIRS[0])
  const [resolution, setResolution] = useState(RESOLUTIONS[2])

  const src = `https://s.tradingview.com/widgetembed/?frametools=1&symbol=${pair.tv}&interval=${resolution.value}&theme=dark&style=1&locale=en&toolbar_bg=%23070b14&hide_top_toolbar=0&hide_legend=0&saveimage=0&backgroundColor=%23070b14`

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>PRICE ACTION</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Structure Engine</div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>INSTRUMENT</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PAIRS.map(p => (
              <button key={p.tv} onClick={() => setPair(p)} style={btnStyle(pair.tv === p.tv)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>TIMEFRAME</div>
          <div style={{ display: "flex", gap: 4 }}>
            {RESOLUTIONS.map(res => (
              <button key={res.value} onClick={() => setResolution(res)} style={btnStyle(resolution.value === res.value)}>
                {res.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <iframe
          key={`${pair.tv}-${resolution.value}`}
          src={src}
          width="100%"
          height="520"
          frameBorder="0"
          allowTransparency={true}
          scrolling="no"
          allowFullScreen={true}
          style={{ display: "block" }}
        />
      </div>

      <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>STRUCTURE NOTES</div>
        <textarea placeholder="Mark your observations — swing highs, OBs, liquidity levels, BOS..." rows={3}
          style={{ width: "100%", background: "transparent", border: "none", color: "#94a3b8", fontFamily: "monospace", fontSize: 12, resize: "vertical", outline: "none", lineHeight: 1.6 }} />
      </div>
    </div>
  )
}