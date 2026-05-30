import { useState, useEffect } from "react"

const STORAGE_KEY = "edgedesk_challenge"

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") } catch { return null }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const defaultChallenge = {
  name: "",
  startBalance: "",
  targetBalance: "",
  currentBalance: "",
  maxDailyDD: "",
  maxTotalDD: "",
  startDate: new Date().toISOString().slice(0, 10),
  days: [],
  active: false,
}

export default function ChallengeTab() {
  const [challenge, setChallenge] = useState(() => load() || defaultChallenge)
  const [form, setForm] = useState(defaultChallenge)
  const [todayPnl, setTodayPnl] = useState("")
  const [note, setNote] = useState("")
  const [setup, setSetup] = useState(!challenge.active)

  const inputStyle = {
    width: "100%", padding: "10px 12px", background: "#070b14",
    border: "1px solid #0f172a", borderRadius: 6, color: "#f1f5f9",
    fontSize: 14, fontFamily: "monospace", boxSizing: "border-box"
  }

  const startChallenge = () => {
    if (!form.startBalance || !form.targetBalance || !form.maxDailyDD || !form.maxTotalDD) return
    const c = { ...form, currentBalance: parseFloat(form.startBalance), active: true, days: [] }
    setChallenge(c)
    save(c)
    setSetup(false)
  }

  const logDay = () => {
    if (!todayPnl) return
    const pnl = parseFloat(todayPnl)
    const newBalance = parseFloat(challenge.currentBalance) + pnl
    const day = {
      date: new Date().toLocaleDateString(),
      pnl,
      balance: newBalance,
      note,
    }
    const updated = { ...challenge, currentBalance: newBalance, days: [...challenge.days, day] }
    setChallenge(updated)
    save(updated)
    setTodayPnl("")
    setNote("")
  }

  const resetChallenge = () => {
    localStorage.removeItem(STORAGE_KEY)
    setChallenge(defaultChallenge)
    setForm(defaultChallenge)
    setSetup(true)
  }

  const start = parseFloat(challenge.startBalance)
  const target = parseFloat(challenge.targetBalance)
  const current = parseFloat(challenge.currentBalance)
  const maxDD = parseFloat(challenge.maxTotalDD)
  const maxDailyDD = parseFloat(challenge.maxDailyDD)

  const progress = Math.min(((current - start) / (target - start)) * 100, 100).toFixed(1)
  const totalDrawdown = (((current - start) / start) * 100).toFixed(2)
  const ddUsed = Math.min((Math.abs(Math.min(0, current - start)) / (start * maxDD / 100)) * 100, 100).toFixed(1)
  const todayLoss = challenge.days.filter(d => d.date === new Date().toLocaleDateString()).reduce((a, b) => a + b.pnl, 0)
  const dailyDDUsed = Math.min((Math.abs(Math.min(0, todayLoss)) / (start * maxDailyDD / 100)) * 100, 100).toFixed(1)
  const remainingDailyRisk = Math.max(0, (start * maxDailyDD / 100) + Math.min(0, todayLoss)).toFixed(2)
  const remainingTotalRisk = Math.max(0, (start * maxDD / 100) - Math.abs(Math.min(0, current - start))).toFixed(2)

  const isDailyDanger = parseFloat(dailyDDUsed) >= 80
  const isTotalDanger = parseFloat(ddUsed) >= 80
  const isTargetHit = current >= target
  const isBlownDaily = parseFloat(dailyDDUsed) >= 100
  const isBlownTotal = parseFloat(ddUsed) >= 100

  if (setup) return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>PROP FIRM / PERSONAL</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Challenge Setup</div>
      </div>
      <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 28, maxWidth: 600 }}>
        <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", letterSpacing: 2, marginBottom: 20 }}>CONFIGURE YOUR CHALLENGE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "CHALLENGE NAME", key: "name", placeholder: "FTMO 10K Phase 1" },
            { label: "STARTING BALANCE ($)", key: "startBalance", placeholder: "10000" },
            { label: "TARGET BALANCE ($)", key: "targetBalance", placeholder: "11000" },
            { label: "MAX DAILY DRAWDOWN (%)", key: "maxDailyDD", placeholder: "5" },
            { label: "MAX TOTAL DRAWDOWN (%)", key: "maxTotalDD", placeholder: "10" },
            { label: "START DATE", key: "startDate", placeholder: "", type: "date" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type || "text"} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inputStyle} />
            </div>
          ))}
        </div>
        <button onClick={startChallenge}
          style={{ marginTop: 24, width: "100%", padding: "14px", background: "#22c55e", border: "none", borderRadius: 8, color: "#0a0a0f", fontWeight: 900, fontSize: 13, fontFamily: "monospace", cursor: "pointer", letterSpacing: 2 }}>
          START CHALLENGE
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>CHALLENGE TRACKER</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{challenge.name || "My Challenge"}</div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginTop: 4 }}>Started {challenge.startDate}</div>
        </div>
        <button onClick={resetChallenge}
          style={{ padding: "8px 16px", background: "transparent", border: "1px solid #1e293b", borderRadius: 6, color: "#475569", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
          RESET
        </button>
      </div>

      {(isBlownDaily || isBlownTotal) && (
        <div style={{ background: "#7f1d1d", border: "1px solid #ef4444", borderRadius: 8, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fca5a5", fontFamily: "monospace", letterSpacing: 2 }}>
            ⚠ {isBlownTotal ? "TOTAL DRAWDOWN EXCEEDED — STOP TRADING" : "DAILY DRAWDOWN EXCEEDED — STOP FOR TODAY"}
          </div>
        </div>
      )}

      {isTargetHit && (
        <div style={{ background: "#14532d", border: "1px solid #22c55e", borderRadius: 8, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#86efac", fontFamily: "monospace", letterSpacing: 2 }}>
            🎯 TARGET REACHED — CHALLENGE PASSED
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "CURRENT BALANCE", value: `$${parseFloat(current).toLocaleString()}`, color: current >= start ? "#22c55e" : "#ef4444" },
          { label: "TARGET", value: `$${parseFloat(target).toLocaleString()}`, color: "#f1f5f9" },
          { label: "DAILY RISK LEFT", value: `$${remainingDailyRisk}`, color: isDailyDanger ? "#ef4444" : "#22c55e" },
          { label: "TOTAL RISK LEFT", value: `$${remainingTotalRisk}`, color: isTotalDanger ? "#ef4444" : "#22c55e" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#070b14", border: `1px solid ${s.color === "#ef4444" ? "#7f1d1d" : "#0f172a"}`, borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5 }}>TARGET PROGRESS</span>
            <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", fontWeight: 700 }}>{Math.max(0, progress)}%</span>
          </div>
          <div style={{ height: 8, background: "#0f172a", borderRadius: 4, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${Math.max(0, progress)}%`, background: "#22c55e", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
            ${(current - start).toFixed(2)} gained of ${(target - start).toFixed(2)} needed
          </div>
        </div>

        <div style={{ background: "#070b14", border: `1px solid ${isTotalDanger ? "#7f1d1d" : "#0f172a"}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5 }}>TOTAL DRAWDOWN USED</span>
            <span style={{ fontSize: 11, color: isTotalDanger ? "#ef4444" : "#f59e0b", fontFamily: "monospace", fontWeight: 700 }}>{ddUsed}%</span>
          </div>
          <div style={{ height: 8, background: "#0f172a", borderRadius: 4, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${ddUsed}%`, background: isTotalDanger ? "#ef4444" : "#f59e0b", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
            Max allowed: {challenge.maxTotalDD}% (${(start * maxDD / 100).toFixed(2)})
          </div>
        </div>

        <div style={{ background: "#070b14", border: `1px solid ${isDailyDanger ? "#7f1d1d" : "#0f172a"}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 1.5 }}>DAILY DRAWDOWN USED</span>
            <span style={{ fontSize: 11, color: isDailyDanger ? "#ef4444" : "#22c55e", fontFamily: "monospace", fontWeight: 700 }}>{dailyDDUsed}%</span>
          </div>
          <div style={{ height: 8, background: "#0f172a", borderRadius: 4, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${dailyDDUsed}%`, background: isDailyDanger ? "#ef4444" : "#22c55e", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
            Today P&L: {todayLoss >= 0 ? "+" : ""}${todayLoss.toFixed(2)}
          </div>
        </div>

        <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace", letterSpacing: 1.5, marginBottom: 12 }}>LOG TODAY'S RESULT</div>
          <input type="number" value={todayPnl} onChange={e => setTodayPnl(e.target.value)}
            placeholder="P&L in $ (use - for loss)"
            style={{ ...inputStyle, marginBottom: 8 }} />
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{ ...inputStyle, marginBottom: 12 }} />
          <button onClick={logDay}
            style={{ width: "100%", padding: "10px", background: "#22c55e", border: "none", borderRadius: 6, color: "#0a0a0f", fontWeight: 900, fontSize: 12, fontFamily: "monospace", cursor: "pointer", letterSpacing: 1 }}>
            LOG DAY
          </button>
        </div>
      </div>

      {challenge.days.length > 0 && (
        <div style={{ background: "#070b14", border: "1px solid #0f172a", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", letterSpacing: 2, marginBottom: 16 }}>TRADING HISTORY</div>
          {[...challenge.days].reverse().map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #0f172a" }}>
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", minWidth: 90 }}>{d.date}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: d.pnl >= 0 ? "#22c55e" : "#ef4444", minWidth: 80 }}>
                {d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>Balance: ${d.balance.toFixed(2)}</span>
              {d.note && <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{d.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}