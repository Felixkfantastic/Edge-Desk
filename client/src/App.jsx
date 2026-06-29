import { useState, useEffect } from "react"
import axios from "axios"
import { SpeedInsights } from '@vercel/speed-insights/react'
import ChartTab from "./Chart"
import CalendarTab from "./Calendar"
import SignalsTab from "./Signals"
import StrengthTab from "./Strength"
import ChallengeTab from "./Challenge"
const API = "https://edge-desk-production.up.railway.app"

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8" }}>
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  )
}

function Sidebar({ active, setActive, open, setOpen }) {
  const tabs = [
    { id: "news", icon: "◈", label: "INTELLIGENCE" },
    { id: "chart", icon: "▣", label: "STRUCTURE" },
    { id: "signals", icon: "◆", label: "SIGNALS" },
    { id: "calendar", icon: "◷", label: "CALENDAR" },
    { id: "strength", icon: "▲", label: "STRENGTH" },
    { id: "risk", icon: "⬡", label: "RISK DESK" },
    { id: "bias", icon: "◎", label: "BIAS BOARD" },
    { id: "challenge", icon: "◉", label: "CHALLENGE" },
    { id: "journal", icon: "▦", label: "JOURNAL" },
  ]

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", letterSpacing: 3, fontFamily: "monospace" }}>EDGE</span>
        </div>
        <div style={{ fontSize: 9, color: "#334155", letterSpacing: 4, fontFamily: "monospace", paddingLeft: 16 }}>DESK v1.0</div>
      </div>
      <nav style={{ flex: 1, padding: "16px 0" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActive(t.id); setOpen(false) }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 20px", border: "none", cursor: "pointer", textAlign: "left",
              background: active === t.id ? "#0f172a" : "transparent",
              borderLeft: active === t.id ? "2px solid #22c55e" : "2px solid transparent",
              transition: "all 0.15s"
            }}>
            <span style={{ fontSize: 14, color: active === t.id ? "#22c55e" : "#334155" }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: 1.5, fontWeight: 700,
              color: active === t.id ? "#f1f5f9" : "#475569" }}>{t.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid #0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>FOREX OPEN</span>
        </div>
      </div>
    </div>
  )
}

function TopBar() {
  return (
    <div style={{ height: 48, background: "#070b14", borderBottom: "1px solid #0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", letterSpacing: 2 }}>MARKET INTELLIGENCE TERMINAL</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Clock />
        <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 1 }}>● LIVE</span>
      </div>
    </div>
  )
}
function NewsTab() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/news`).then(r => { setNews(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const isHigh = item => item.headline.toLowerCase().includes("fed") || item.headline.toLowerCase().includes("ecb") || item.headline.toLowerCase().includes("rate") || item.headline.toLowerCase().includes("tariff")
  const filtered = filter === "HIGH" ? news.filter(isHigh) : news

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>MARKET INTELLIGENCE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>News Feed</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "HIGH"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid", borderColor: filter === f ? "#22c55e" : "#0f172a", background: filter === f ? "#14532d" : "transparent", color: filter === f ? "#22c55e" : "#475569", fontSize: 10, fontFamily: "monospace", letterSpacing: 1, cursor: "pointer" }}>
              {f} IMPACT
            </button>
          ))}
        </div>
      </div>
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: "monospace", fontSize: 12, letterSpacing: 2 }}>FETCHING INTELLIGENCE...</div>}
      {filtered.map((item, i) => (
        <div key={i} onClick={() => setExpanded(expanded === i ? null : i)}
          style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 16, marginBottom: 10, cursor: "pointer", borderLeft: `3px solid ${isHigh(item) ? "#ef4444" : "#22c55e"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: isHigh(item) ? "#7f1d1d" : "#14532d", color: isHigh(item) ? "#fca5a5" : "#86efac" }}>
                  {isHigh(item) ? "HIGH" : "MED"}
                </span>
                <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>
                  {item.source} · {new Date(item.datetime * 1000).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{item.headline}</div>
            </div>
            <span style={{ color: "#334155", fontSize: 12 }}>{expanded === i ? "▲" : "▼"}</span>
          </div>
          {expanded === i && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #0f172a" }}>
              <a href={item.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                style={{ fontSize: 11, color: "#3b82f6", fontFamily: "monospace", letterSpacing: 1 }}>
                READ FULL ARTICLE →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RiskTab() {
  const pairs = [
    { label: "EUR/USD", value: "EURUSD", type: "forex4" },
    { label: "GBP/USD", value: "GBPUSD", type: "forex4" },
    { label: "USD/JPY", value: "USDJPY", type: "forex2" },
    { label: "USD/CHF", value: "USDCHF", type: "forex4" },
    { label: "BTC/USD", value: "BTCUSD", type: "crypto" },
    { label: "US30",    value: "US30",   type: "index" },
    { label: "NASDAQ",  value: "NAS100", type: "index" },
  ]
  const [pair, setPair] = useState(pairs[0])
  const [balance, setBalance] = useState("")
  const [risk, setRisk] = useState("1")
  const [entry, setEntry] = useState("")
  const [sl, setSl] = useState("")
  const [tp, setTp] = useState("")
  const [result, setResult] = useState(null)

  const calculate = () => {
    const b = parseFloat(balance)
    const r = parseFloat(risk) / 100
    const e = parseFloat(entry)
    const s = parseFloat(sl)
    const t = parseFloat(tp)
    if (!b || !r || !e || !s) return

    const riskAmount = b * r
    const diff = Math.abs(e - s)
    let lots, pips, pipValue, rr, potential

    if (pair.type === "forex4") {
      pips = diff * 10000
      pipValue = 10
      lots = parseFloat((riskAmount / (pips * pipValue)).toFixed(2))
      rr = tp ? parseFloat((Math.abs(t - e) / diff).toFixed(2)) : null
      potential = tp && rr ? parseFloat((riskAmount * rr).toFixed(2)) : null
    } else if (pair.type === "forex2") {
      pips = diff * 100
      pipValue = 10
      lots = parseFloat((riskAmount / (pips * pipValue)).toFixed(2))
      rr = tp ? parseFloat((Math.abs(t - e) / diff).toFixed(2)) : null
      potential = tp && rr ? parseFloat((riskAmount * rr).toFixed(2)) : null
    } else if (pair.type === "crypto") {
      pips = diff
      lots = parseFloat((riskAmount / diff).toFixed(6))
      rr = tp ? parseFloat((Math.abs(t - e) / diff).toFixed(2)) : null
      potential = tp && rr ? parseFloat((riskAmount * rr).toFixed(2)) : null
    } else {
      pips = diff
      lots = parseFloat((riskAmount / diff).toFixed(2))
      rr = tp ? parseFloat((Math.abs(t - e) / diff).toFixed(2)) : null
      potential = tp && rr ? parseFloat((riskAmount * rr).toFixed(2)) : null
    }

    setResult({ lots, riskAmount: riskAmount.toFixed(2), pips: parseFloat(pips).toFixed(1), rr, potential, unit: pair.type === "crypto" ? "BTC" : pair.type === "index" ? "contracts" : "lots" })
  }

  const inputStyle = { width: "100%", padding: "10px 12px", background: "#070b14", border: "1px solid #0f172a", borderRadius: 6, color: "#f1f5f9", fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>POSITION SIZING</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Risk Desk</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 8 }}>SELECT INSTRUMENT</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pairs.map(p => (
            <button key={p.value} onClick={() => { setPair(p); setResult(null) }}
              style={{ padding: "8px 14px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                borderColor: pair.value === p.value ? "#22c55e" : "#0f172a",
                background: pair.value === p.value ? "#14532d" : "#070b14",
                color: pair.value === p.value ? "#22c55e" : "#475569" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 800 }}>
        <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2 }}>ACCOUNT SETUP</div>
          <div>
            <label style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>ACCOUNT BALANCE ($)</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10000" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>RISK PER TRADE (%)</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {["0.5","1","2","3"].map(v => (
                <button key={v} onClick={() => setRisk(v)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 4, border: "1px solid", borderColor: risk === v ? "#22c55e" : "#0f172a", background: risk === v ? "#14532d" : "#0a0f1e", color: risk === v ? "#22c55e" : "#475569", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                  {v}%
                </button>
              ))}
            </div>
            <input type="number" value={risk} onChange={e => setRisk(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2 }}>TRADE SETUP — {pair.label}</div>
          {[["ENTRY PRICE", entry, setEntry], ["STOP LOSS", sl, setSl], ["TAKE PROFIT (optional)", tp, setTp]].map(([label, val, set]) => (
            <div key={label}>
              <label style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>{label}</label>
              <input type="number" value={val} onChange={e => set(e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={calculate}
        style={{ marginTop: 20, padding: "14px 40px", background: "#22c55e", border: "none", borderRadius: 8, color: "#0a0a0f", fontWeight: 900, fontSize: 13, fontFamily: "monospace", cursor: "pointer", letterSpacing: 2 }}>
        CALCULATE POSITION
      </button>

      {result && (
        <div style={{ marginTop: 24, maxWidth: 800 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
            {[
              { label: result.unit.toUpperCase(), value: result.lots, color: "#22c55e", big: true },
              { label: "RISK AMOUNT", value: `$${result.riskAmount}`, color: "#f1f5f9" },
              { label: pair.type === "crypto" || pair.type === "index" ? "POINTS AT RISK" : "PIPS AT RISK", value: result.pips, color: "#f1f5f9" },
              { label: "RISK:REWARD", value: result.rr ? `1:${result.rr}` : "—", color: result.rr >= 2 ? "#22c55e" : result.rr ? "#f59e0b" : "#475569" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#070b14", border: `1px solid ${s.big ? "#22c55e44" : "#0f172a"}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: s.big ? 28 : 20, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>
          {result.potential && (
            <div style={{ background: "#070b14", border: "1px solid #14532d", borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6 }}>POTENTIAL PROFIT IF TP HIT</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#22c55e", fontFamily: "monospace" }}>+${result.potential}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
function BiasTab() {
  const currencies = [
    { pair: "USD", bias: "BEARISH", strength: 35, reason: "Fed on hold, tariff uncertainty weighing on dollar" },
    { pair: "EUR", bias: "BULLISH", strength: 68, reason: "ECB hawkish, potential June hike priced in" },
    { pair: "GBP", bias: "NEUTRAL", strength: 50, reason: "Mixed UK data, BoE cautious" },
    { pair: "JPY", bias: "BEARISH", strength: 30, reason: "BoJ ultra-loose, intervention risk above 160" },
    { pair: "XAU", bias: "BEARISH", strength: 38, reason: "Hawkish central banks dragging gold lower" },
    { pair: "AUD", bias: "NEUTRAL", strength: 45, reason: "Softer CPI, RBA data dependent" },
  ]
  const color = b => b === "BULLISH" ? "#22c55e" : b === "BEARISH" ? "#ef4444" : "#f59e0b"

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>FUNDAMENTAL ANALYSIS</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Bias Board</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 900 }}>
        {currencies.map((c, i) => (
          <div key={i} style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20, borderTop: `3px solid ${color(c.bias)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace" }}>{c.pair}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: 1, padding: "3px 8px", borderRadius: 4, background: `${color(c.bias)}22`, color: color(c.bias), fontWeight: 700 }}>{c.bias}</span>
            </div>
            <div style={{ height: 4, background: "#0f172a", borderRadius: 2, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${c.strength}%`, background: color(c.bias), borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{c.reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function JournalTab() {
  const [trades, setTrades] = useState([])
  const [form, setForm] = useState({ pair: "EURUSD", direction: "BUY", entry: "", sl: "", tp: "", result: "OPEN", pnl: "", notes: "" })

  const save = () => {
    if (!form.entry || !form.sl) return
    const updated = [{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...trades]
    setTrades(updated)
  }

  const remove = id => setTrades(trades.filter(t => t.id !== id))

  const wins = trades.filter(t => t.result === "WIN").length
  const losses = trades.filter(t => t.result === "LOSS").length
  const wr = trades.length ? ((wins / (wins + losses || 1)) * 100).toFixed(0) : 0

  const inputStyle = { width: "100%", padding: "8px 10px", background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 6, color: "#f1f5f9", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>TRADE TRACKING</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Journal</div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "TOTAL TRADES", value: trades.length, color: "#f1f5f9" },
          { label: "WIN RATE", value: `${wr}%`, color: wr >= 50 ? "#22c55e" : "#ef4444" },
          { label: "WINS", value: wins, color: "#22c55e" },
          { label: "LOSSES", value: losses, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: "12px 20px", textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20, marginBottom: 24, maxWidth: 800 }}>
        <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>LOG NEW TRADE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
          {[
            { label: "PAIR", key: "pair", placeholder: "EURUSD" },
            { label: "ENTRY", key: "entry", placeholder: "1.16477" },
            { label: "STOP LOSS", key: "sl", placeholder: "1.16000" },
            { label: "TAKE PROFIT", key: "tp", placeholder: "1.17000" },
            { label: "P&L ($)", key: "pnl", placeholder: "0.00" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input type="text" value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, display: "block", marginBottom: 4 }}>RESULT</label>
            <select value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))}
              style={{ ...inputStyle, padding: "9px 10px" }}>
              {["OPEN","WIN","LOSS","BREAKEVEN"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, display: "block", marginBottom: 4 }}>NOTES</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["BUY","SELL"].map(d => (
            <button key={d} onClick={() => setForm(p => ({ ...p, direction: d }))}
              style={{ padding: "8px 20px", borderRadius: 4, border: "1px solid", fontFamily: "monospace", fontSize: 11, cursor: "pointer", letterSpacing: 1, fontWeight: 700,
                borderColor: form.direction === d ? (d === "BUY" ? "#22c55e" : "#ef4444") : "#0f172a",
                background: form.direction === d ? (d === "BUY" ? "#14532d" : "#7f1d1d") : "transparent",
                color: form.direction === d ? (d === "BUY" ? "#22c55e" : "#ef4444") : "#475569" }}>
              {d === "BUY" ? "▲" : "▼"} {d}
            </button>
          ))}
          <button onClick={save}
            style={{ marginLeft: "auto", padding: "8px 24px", background: "#22c55e", border: "none", borderRadius: 6, color: "#0a0a0f", fontWeight: 900, fontSize: 11, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
            LOG TRADE
          </button>
        </div>
      </div>
      {trades.map(t => (
        <div key={t.id} style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 16, maxWidth: 800 }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#475569", minWidth: 80 }}>{t.date}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace", minWidth: 70 }}>{t.pair}</span>
          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: t.direction === "BUY" ? "#22c55e" : "#ef4444" }}>{t.direction}</span>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>E: {t.entry} · SL: {t.sl}{t.tp ? ` · TP: ${t.tp}` : ""}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            color: t.result === "WIN" ? "#22c55e" : t.result === "LOSS" ? "#ef4444" : t.result === "BREAKEVEN" ? "#f59e0b" : "#64748b" }}>{t.result}</span>
          {t.pnl && <span style={{ fontSize: 12, fontFamily: "monospace", color: parseFloat(t.pnl) >= 0 ? "#22c55e" : "#ef4444" }}>{parseFloat(t.pnl) >= 0 ? "+" : ""}{t.pnl}</span>}
          <button onClick={() => remove(t.id)}
            style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState("news")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0a0f1e" }}>
      <div className={`overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", color: "#22c55e", fontSize: 22, cursor: "pointer" }}>
            ☰
          </button>
          <span style={{ fontSize: 13, color: "#334155", fontFamily: "monospace", letterSpacing: 2 }}>EDGE DESK</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Clock />
          <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>● LIVE</span>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="main-content">
          {active === "news" && <NewsTab />}
          {active === "chart" && <ChartTab />}
          {active === "signals" && <SignalsTab />}
          {active === "calendar" && <CalendarTab />}
          {active === "strength" && <StrengthTab />}
          {active === "risk" && <RiskTab />}
          {active === "bias" && <BiasTab />}
          {active === "challenge" && <ChallengeTab />}
          {active === "journal" && <JournalTab />}
        </main>
      </div>
      <SpeedInsights />
    </div>
  )
}