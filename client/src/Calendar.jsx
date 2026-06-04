import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://edge-desk-production.up.railway.app"

const IMPACT_COLOR = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
}

const CURRENCY_FLAGS = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
  CHF: "🇨🇭", AUD: "🇦🇺", CAD: "🇨🇦", NZD: "🇳🇿",
  CNY: "🇨🇳",
}

export default function CalendarTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [currencyFilter, setCurrencyFilter] = useState("ALL")

  useEffect(() => {
    axios.get(`${API}/api/calendar`)
      .then(r => {
        const data = r.data.economicCalendar || []
        const sorted = data.sort((a, b) => new Date(a.time) - new Date(b.time))
        setEvents(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const currencies = ["ALL", "USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"]

  const filtered = events.filter(e => {
    const impactMatch = filter === "ALL" || e.impact?.toLowerCase() === filter.toLowerCase()
    const currencyMatch = currencyFilter === "ALL" || e.country === currencyFilter
    return impactMatch && currencyMatch
  })

  const getSignal = (event) => {
    const name = event.event?.toLowerCase() || ""
    const actual = parseFloat(event.actual)
    const forecast = parseFloat(event.estimate)
    const prev = parseFloat(event.prev)

    if (!event.actual || event.actual === "") return { label: "PENDING", color: "#475569" }

    if (!isNaN(actual) && !isNaN(forecast)) {
      if (actual > forecast) return { label: "BULLISH", color: "#22c55e" }
      if (actual < forecast) return { label: "BEARISH", color: "#ef4444" }
    }

    if (!isNaN(actual) && !isNaN(prev)) {
      if (actual > prev) return { label: "BULLISH", color: "#22c55e" }
      if (actual < prev) return { label: "BEARISH", color: "#ef4444" }
    }

    return { label: "NEUTRAL", color: "#f59e0b" }
  }

  const groupByDate = (events) => {
    const groups = {}
    events.forEach(e => {
      const date = new Date(e.time).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      if (!groups[date]) groups[date] = []
      groups[date].push(e)
    })
    return groups
  }

  const grouped = groupByDate(filtered)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>UPCOMING EVENTS</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Economic Calendar</div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>IMPACT</div>
          <div style={{ display: "flex", gap: 4 }}>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  borderColor: filter === f ? "#22c55e" : "#0f172a",
                  background: filter === f ? "#14532d" : "#070b14",
                  color: filter === f ? "#22c55e" : "#475569" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>CURRENCY</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {currencies.map(c => (
              <button key={c} onClick={() => setCurrencyFilter(c)}
                style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
                  borderColor: currencyFilter === c ? "#22c55e" : "#0f172a",
                  background: currencyFilter === c ? "#14532d" : "#070b14",
                  color: currencyFilter === c ? "#22c55e" : "#475569" }}>
                {c !== "ALL" ? CURRENCY_FLAGS[c] : ""} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: "monospace", fontSize: 12, letterSpacing: 2 }}>
          FETCHING CALENDAR...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: "monospace", fontSize: 12 }}>
          NO EVENTS FOUND
        </div>
      )}

      {Object.entries(grouped).map(([date, dayEvents]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #0f172a" }}>
            {date.toUpperCase()}
          </div>
          {dayEvents.map((event, i) => {
            const signal = getSignal(event)
            const impact = event.impact?.toLowerCase() || "low"
            return (
              <div key={i} style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${IMPACT_COLOR[impact] || "#22c55e"}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 40px 1fr auto auto auto auto", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                    {new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 13 }}>{CURRENCY_FLAGS[event.country] || "🌐"}</span>
                  <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>{event.event}</span>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginBottom: 2 }}>PREV</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{event.prev || "—"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginBottom: 2 }}>FORECAST</div>
                    <div style={{ fontSize: 12, color: "#f59e0b", fontFamily: "monospace" }}>{event.estimate || "—"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginBottom: 2 }}>ACTUAL</div>
                    <div style={{ fontSize: 12, color: "#f1f5f9", fontFamily: "monospace", fontWeight: 700 }}>{event.actual || "—"}</div>
                  </div>
                  <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1,
                    background: `${signal.color}22`, color: signal.color }}>
                    {signal.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}