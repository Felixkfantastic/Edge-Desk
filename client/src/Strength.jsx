import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"]

const PAIRS_MAP = [
  { symbol: "OANDA:EUR_USD", base: "EUR", quote: "USD" },
  { symbol: "OANDA:GBP_USD", base: "GBP", quote: "USD" },
  { symbol: "OANDA:USD_JPY", base: "USD", quote: "JPY" },
  { symbol: "OANDA:USD_CHF", base: "USD", quote: "CHF" },
  { symbol: "OANDA:AUD_USD", base: "AUD", quote: "USD" },
  { symbol: "OANDA:USD_CAD", base: "USD", quote: "CAD" },
  { symbol: "OANDA:NZD_USD", base: "NZD", quote: "USD" },
  { symbol: "OANDA:EUR_GBP", base: "EUR", quote: "GBP" },
  { symbol: "OANDA:EUR_JPY", base: "EUR", quote: "JPY" },
  { symbol: "OANDA:GBP_JPY", base: "GBP", quote: "JPY" },
]

function getStrengthColor(score) {
  if (score >= 7) return "#22c55e"
  if (score >= 5) return "#86efac"
  if (score >= 4) return "#f59e0b"
  if (score >= 2) return "#fca5a5"
  return "#ef4444"
}

function getStrengthLabel(score) {
  if (score >= 7) return "VERY STRONG"
  if (score >= 5) return "STRONG"
  if (score >= 4) return "NEUTRAL"
  if (score >= 2) return "WEAK"
  return "VERY WEAK"
}

export default function StrengthTab() {
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  const fetchStrength = async () => {
    setLoading(true)
    setError(null)
    try {
      const counts = {}
      const totals = {}
      CURRENCIES.forEach(c => { counts[c] = 0; totals[c] = 0 })

      const results = await Promise.allSettled(
        PAIRS_MAP.map(pair =>
          axios.get(`${API}/api/candles/${pair.symbol}?resolution=D&count=6`)
            .then(r => ({ ...pair, data: r.data }))
        )
      )

      results.forEach(result => {
        if (result.status !== "fulfilled") return
        const { base, quote, data } = result.value
        if (!data.c || data.s === "no_data" || data.c.length < 2) return

        const closes = data.c
        let pairScore = 0
        for (let i = 1; i < closes.length; i++) {
          if (closes[i] > closes[i - 1]) pairScore++
          else if (closes[i] < closes[i - 1]) pairScore--
        }

        totals[base] += pairScore
        counts[base]++
        totals[quote] -= pairScore
        counts[quote]++
      })

      const normalized = {}
      CURRENCIES.forEach(c => {
        if (counts[c] === 0) { normalized[c] = 4; return }
        const raw = totals[c] / counts[c]
        normalized[c] = Math.max(0, Math.min(8, raw + 4))
      })

      setScores(normalized)
      setLastUpdate(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (e) {
      setError("Failed to calculate strength")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStrength()
  }, [])

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>RELATIVE PERFORMANCE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Currency Strength</div>
          {lastUpdate && <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 4 }}>Updated: {lastUpdate}</div>}
        </div>
        <button onClick={fetchStrength}
          style={{ padding: "8px 16px", background: "#070b14", border: "1px solid #0f172a", borderRadius: 6, color: "#22c55e", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
          ↻ REFRESH
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#334155", fontFamily: "monospace", fontSize: 12, letterSpacing: 2 }}>
          CALCULATING STRENGTH...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: 40, color: "#ef4444", fontFamily: "monospace", fontSize: 12 }}>{error}</div>
      )}

      {!loading && !error && strongest && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, background: "#070b14", border: "1px solid #14532d", borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>STRONGEST</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e", fontFamily: "monospace" }}>{strongest[0]}</div>
              <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", marginTop: 4 }}>{getStrengthLabel(strongest[1])}</div>
            </div>
            <div style={{ flex: 1, background: "#070b14", border: "1px solid #7f1d1d", borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>WEAKEST</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>{weakest[0]}</div>
              <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "monospace", marginTop: 4 }}>{getStrengthLabel(weakest[1])}</div>
            </div>
            <div style={{ flex: 1, background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>BEST PAIR</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace" }}>{strongest[0]}/{weakest[0]}</div>
              <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "monospace", marginTop: 4 }}>STRONGEST VS WEAKEST</div>
            </div>
          </div>

          <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 20 }}>STRENGTH RANKING</div>
            {sorted.map(([currency, score], i) => {
              const color = getStrengthColor(score)
              const pct = (score / 8) * 100
              return (
                <div key={currency} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", minWidth: 16 }}>#{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace", minWidth: 40 }}>{currency}</span>
                      <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1,
                        background: `${color}22`, color }}>{getStrengthLabel(score)}</span>
                    </div>
                    <span style={{ fontSize: 12, color, fontFamily: "monospace", fontWeight: 700 }}>{score.toFixed(1)}/8</span>
                  </div>
                  <div style={{ height: 6, background: "#0f172a", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s" }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>TRADE SUGGESTIONS</div>
            {sorted.slice(0, 3).map(([strong]) =>
              sorted.slice(-3).map(([weak]) => {
                const pairExists = PAIRS_MAP.some(p =>
                  (p.base === strong && p.quote === weak) || (p.base === weak && p.quote === strong)
                )
                if (!pairExists || strong === weak) return null
                const direction = PAIRS_MAP.find(p => p.base === strong && p.quote === weak) ? "BUY" : "SELL"
                const label = PAIRS_MAP.find(p => p.base === strong && p.quote === weak)
                  ? `${strong}/${weak}`
                  : `${weak}/${strong}`
                return (
                  <div key={`${strong}${weak}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace", minWidth: 80 }}>{label}</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, padding: "3px 10px", borderRadius: 4,
                      background: direction === "BUY" ? "#14532d" : "#7f1d1d",
                      color: direction === "BUY" ? "#22c55e" : "#ef4444" }}>{direction}</span>
                    <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>Strong {strong} vs Weak {weak}</span>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}