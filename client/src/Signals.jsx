import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://edge-desk-production.up.railway.app"

const PAIRS = [
  { label: "EUR/USD", base: "EUR", quote: "USD" },
  { label: "GBP/USD", base: "GBP", quote: "USD" },
  { label: "USD/JPY", base: "USD", quote: "JPY" },
  { label: "USD/CHF", base: "USD", quote: "CHF" },
  { label: "BTC/USD", base: "BTC", quote: "USD" },
  { label: "US30",    base: "USD", quote: "DJI" },
  { label: "NASDAQ",  base: "USD", quote: "NDX" },
]

const KEYWORDS = {
  USD: {
    bullish: ["fed hike","rate hike","hawkish fed","strong jobs","nfp beat","gdp beat","cpi beat","dollar strength","fed tightening","strong retail","powell hawkish","tariff","sanctions","safe haven","risk off"],
    bearish: ["fed cut","rate cut","dovish fed","weak jobs","nfp miss","gdp miss","cpi miss","dollar weakness","fed easing","weak retail","powell dovish","recession","debt ceiling","deficit"],
  },
  EUR: {
    bullish: ["ecb hike","hawkish ecb","euro strength","eurozone growth","german gdp","eu surplus","lagarde hawkish","ecb tightening","strong pmi","eu gdp beat"],
    bearish: ["ecb cut","dovish ecb","euro weakness","eurozone recession","german recession","eu deficit","lagarde dovish","ecb easing","weak pmi","eu gdp miss","energy crisis"],
  },
  GBP: {
    bullish: ["boe hike","hawkish boe","pound strength","uk gdp beat","uk jobs beat","bailey hawkish","strong uk","uk cpi beat","boe tightening"],
    bearish: ["boe cut","dovish boe","pound weakness","uk gdp miss","uk jobs miss","bailey dovish","weak uk","uk cpi miss","boe easing","brexit"],
  },
  JPY: {
    bullish: ["boj hike","hawkish boj","yen strength","japan gdp beat","ueda hawkish","boj tightening","intervention","japan cpi beat"],
    bearish: ["boj cut","dovish boj","yen weakness","japan gdp miss","ueda dovish","boj easing","ultra loose","yield curve control"],
  },
  CHF: {
    bullish: ["snb hike","hawkish snb","franc strength","swiss gdp beat","safe haven","risk off","snb tightening"],
    bearish: ["snb cut","dovish snb","franc weakness","swiss gdp miss","snb easing","snb intervention"],
  },
  BTC: {
    bullish: ["bitcoin rally","crypto rally","btc surge","bitcoin etf","institutional buying","crypto adoption","btc halving","bitcoin bullish"],
    bearish: ["bitcoin crash","crypto crash","btc dump","bitcoin ban","crypto regulation","exchange hack","bitcoin bearish","crypto winter"],
  },
}

function scoreNews(news, currency) {
  const keywords = KEYWORDS[currency]
  if (!keywords) return { score: 0, matches: [] }

  let score = 0
  const matches = []

  news.forEach(item => {
    const text = (item.headline + " " + (item.summary || "")).toLowerCase()
    keywords.bullish.forEach(kw => {
      if (text.includes(kw)) { score += 1; matches.push({ keyword: kw, direction: "bull" }) }
    })
    keywords.bearish.forEach(kw => {
      if (text.includes(kw)) { score -= 1; matches.push({ keyword: kw, direction: "bear" }) }
    })
  })

  return { score, matches }
}

function getPairSignal(news, base, quote) {
  const baseScore = scoreNews(news, base)
  const quoteScore = scoreNews(news, quote)
  const net = baseScore.score - quoteScore.score
  const allMatches = [...baseScore.matches, ...quoteScore.matches]

  let signal, color, strength
  if (net >= 2) { signal = "BUY"; color = "#22c55e"; strength = Math.min(net * 20, 100) }
  else if (net <= -2) { signal = "SELL"; color = "#ef4444"; strength = Math.min(Math.abs(net) * 20, 100) }
  else if (net === 1) { signal = "WEAK BUY"; color = "#86efac"; strength = 30 }
  else if (net === -1) { signal = "WEAK SELL"; color = "#fca5a5"; strength = 30 }
  else { signal = "NEUTRAL"; color = "#f59e0b"; strength = 0 }

  return { signal, color, strength, net, matches: allMatches.slice(0, 5) }
}

export default function SignalsTab() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchNews = () => {
    setLoading(true)
    axios.get(`${API}/api/news`)
      .then(r => {
        setNews(r.data)
        setLastUpdate(new Date().toLocaleTimeString())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const signals = PAIRS.map(pair => ({
    ...pair,
    ...getPairSignal(news, pair.base, pair.quote)
  }))

  const buys = signals.filter(s => s.signal.includes("BUY")).length
  const sells = signals.filter(s => s.signal.includes("SELL")).length
  const neutral = signals.filter(s => s.signal === "NEUTRAL").length

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>RULE BASED SCANNER</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Signal Scanner</div>
          {lastUpdate && <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 4 }}>Last updated: {lastUpdate} · Auto-refreshes every 5min</div>}
        </div>
        <button onClick={fetchNews}
          style={{ padding: "8px 16px", background: "#070b14", border: "1px solid #0f172a", borderRadius: 6, color: "#22c55e", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
          ↻ REFRESH
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "BUY SIGNALS", value: buys, color: "#22c55e" },
          { label: "SELL SIGNALS", value: sells, color: "#ef4444" },
          { label: "NEUTRAL", value: neutral, color: "#f59e0b" },
          { label: "NEWS SCANNED", value: news.length, color: "#f1f5f9" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: "12px 20px", textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        {signals.map((s, i) => (
          <div key={i} onClick={() => setSelected(selected === i ? null : i)}
            style={{ background: "#070b14", border: `1px solid ${selected === i ? s.color : "#0f172a"}`, borderRadius: 10, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace" }}>{s.label}</span>
              <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 900, padding: "4px 12px", borderRadius: 4, letterSpacing: 1,
                background: `${s.color}22`, color: s.color }}>
                {loading ? "SCANNING..." : s.signal}
              </span>
            </div>
            <div style={{ height: 6, background: "#0f172a", borderRadius: 3, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${s.strength}%`, background: s.color, borderRadius: 3, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>
                {s.base} score: {scoreNews(news, s.base).score > 0 ? "+" : ""}{scoreNews(news, s.base).score}
              </span>
              <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>
                {s.quote} score: {scoreNews(news, s.quote).score > 0 ? "+" : ""}{scoreNews(news, s.quote).score}
              </span>
            </div>

            {selected === i && s.matches.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #0f172a" }}>
                <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 8 }}>KEYWORDS DETECTED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {s.matches.map((m, j) => (
                    <span key={j} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, fontFamily: "monospace",
                      background: m.direction === "bull" ? "#14532d" : "#7f1d1d",
                      color: m.direction === "bull" ? "#86efac" : "#fca5a5" }}>
                      {m.keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 8 }}>⚠ DISCLAIMER</div>
        <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", lineHeight: 1.8 }}>
          Signals are generated from news keyword analysis only. Always confirm with your own technical analysis before entering any trade. This is a decision support tool, not financial advice.
        </div>
      </div>
    </div>
  )
}