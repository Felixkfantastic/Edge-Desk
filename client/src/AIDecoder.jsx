import { useState } from "react"
import axios from "axios"

const API = "https://edge-desk-production.up.railway.app"

const CONF_COLOR = { HIGH: "#d4a847", MEDIUM: "#94a3b8", LOW: "#475569" }

export default function AIDecoderTab() {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const decode = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(`${API}/api/decode`)
      if (r.data.error) { setError(r.data.error); setLoading(false); return }
      setSignals(r.data)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch {
      setError("Failed to decode — check Railway logs")
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>AI POWERED</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>News Decoder</div>
        {lastUpdate && <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace", marginTop: 4 }}>Decoded at {lastUpdate}</div>}
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #1e2433", borderRadius: 10, padding: 24, marginBottom: 24, maxWidth: 560 }}>
        <div style={{ fontSize: 11, color: "#d4a847", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>HOW IT WORKS</div>
        <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", lineHeight: 1.8, marginBottom: 20 }}>
          Claude reads the latest 10 forex headlines and returns a directional bias per pair. One click, instant analysis, no jargon.
        </div>
        <button onClick={decode} disabled={loading}
          style={{
            width: "100%", padding: "14px", border: "none", borderRadius: 8, fontWeight: 900,
            fontSize: 13, fontFamily: "monospace", cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: 2, transition: "all 0.2s",
            background: loading ? "#1e293b" : "#d4a847",
            color: loading ? "#475569" : "#0a0a0f"
          }}>
          {loading ? "CLAUDE IS READING THE MARKET..." : "⚡ DECODE MARKET NOW"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#2d0f0f", border: "1px solid #f85149", borderRadius: 8, padding: 16, marginBottom: 20, color: "#f85149", fontFamily: "monospace", fontSize: 12 }}>
          {error}
        </div>
      )}

      {signals.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>AI ANALYSIS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 16 }}>
            {signals.map((s, i) => {
              const isBuy = s.bias === "BUY"
              const isSell = s.bias === "SELL"
              const color = isBuy ? "#3fb950" : isSell ? "#f85149" : "#d4a847"
              const bg = isBuy ? "#0d2718" : isSell ? "#2d0f0f" : "#2a2000"
              return (
                <div key={i} style={{ background: "#0d1117", border: `1px solid ${color}33`, borderRadius: 10, padding: 20, borderTop: `3px solid ${color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#f1f5f9", fontFamily: "monospace" }}>{s.pair}</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 900, padding: "4px 12px", borderRadius: 4, background: bg, color, letterSpacing: 1 }}>
                      {s.bias}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{s.reason}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, color: "#334155", fontFamily: "monospace", letterSpacing: 1 }}>CONFIDENCE:</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: CONF_COLOR[s.confidence] || "#475569" }}>
                      {s.confidence}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ background: "#0d1117", border: "1px solid #1e2433", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#30363d", fontFamily: "monospace", lineHeight: 1.8 }}>
              ⚠ AI analysis is sentiment based. Confirm with your own technical analysis before trading. Not financial advice.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}