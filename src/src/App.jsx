import { useState, useEffect, useCallback } from "react";

const ACTIVITIES = ["Gym", "Tennis", "Walk", "Swim", "Run", "Cycling", "Yoga", "Other"];
const CATEGORIES = ["Food", "Transport", "Health", "Shopping", "Business", "Social", "Other"];
const CAT_COLORS = {
  Food: "#E1F5EE", FoodT: "#0F6E56",
  Transport: "#E6F1FB", TransportT: "#185FA5",
  Health: "#EEEDFE", HealthT: "#534AB7",
  Shopping: "#FAEEDA", ShoppingT: "#854F0B",
  Business: "#EAF3DE", BusinessT: "#3B6D11",
  Social: "#FAECE7", SocialT: "#993C1D",
  Other: "#F1EFE8", OtherT: "#5F5E5A",
};

function fmtDate(d) { return d.toISOString().split("T")[0]; }
function isWD(dateStr) { const d = new Date(dateStr + "T12:00:00"); return d.getDay() >= 1 && d.getDay() <= 5; }
function dayDone(d) { return !!(d && d.activity && d.bible && d.book && d.personalTime); }
function dayOf(start, today) {
  const s = new Date(start + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  return Math.min(Math.floor((t - s) / 86400000) + 1, 75);
}
function allExpenses(days) {
  const all = [];
  Object.entries(days).forEach(([date, dd]) => (dd.expenses || []).forEach(e => all.push({ ...e, date })));
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

function Pill({ label, bg, color }) {
  return (
    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: bg, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function StatCard({ v, l }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px", textAlign: "center" }}>
      <div style={{ fontSize: "17px", fontWeight: "500", color: "var(--color-text-primary)" }}>{v}</div>
      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{l}</div>
    </div>
  );
}

function BarRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)" }}>{count} days · {pct}%</span>
      </div>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "3px", height: "5px", overflow: "hidden" }}>
        <div style={{ background: color, height: "100%", width: `${pct}%`, borderRadius: "3px" }} />
      </div>
    </div>
  );
}

function CheckItem({ label, sub, done, onToggle, children }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "11px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <div onClick={onToggle} style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1.5px solid ${done ? "#1D9E75" : "var(--color-border-secondary)"}`, background: done ? "#1D9E75" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "2px" }}>
        {done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)", marginBottom: "2px" }}>{label}</div>
        {sub && <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function TodayTab({ data, update, today }) {
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("Food");
  const expenses = data.expenses || [];
  const todayTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const wd = isWD(today);
  const allDone = data.activity && data.bible && data.book && data.personalTime;

  function addExp() {
    if (!desc.trim() || !amt) return;
    update("expenses", [...expenses, { id: Date.now(), desc: desc.trim(), amount: parseFloat(amt), cat }]);
    setDesc(""); setAmt("");
  }
  function removeExp(id) { update("expenses", expenses.filter(e => e.id !== id)); }

  return (
    <div>
      {allDone && (
        <div style={{ background: "#E1F5EE", border: "0.5px solid #5DCAA5", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: "12px", fontSize: "13px", color: "#0F6E56", fontWeight: "500" }}>
          Day complete — great work!
        </div>
      )}
      {wd && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "8px" }}>Wake time</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="time" value={data.wakeTime || ""} onChange={e => update("wakeTime", e.target.value)}
              style={{ fontSize: "22px", fontWeight: "500", color: "var(--color-text-primary)", border: "none", background: "transparent", outline: "none", padding: 0 }} />
            {data.wakeTime && <Pill label="Logged" bg="#E1F5EE" color="#0F6E56" />}
          </div>
        </div>
      )}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>Daily checklist</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "11px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1.5px solid ${data.activity ? "#1D9E75" : "var(--color-border-secondary)"}`, background: data.activity ? "#1D9E75" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
            {data.activity && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)", marginBottom: "8px" }}>Daily activity</div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {ACTIVITIES.map(a => (
                <button key={a} onClick={() => update("activity", data.activity === a ? null : a)}
                  style={{ padding: "4px 10px", borderRadius: "12px", border: `0.5px solid ${data.activity === a ? "#1D9E75" : "var(--color-border-secondary)"}`, background: data.activity === a ? "#E1F5EE" : "transparent", color: data.activity === a ? "#0F6E56" : "var(--color-text-secondary)", fontSize: "12px", cursor: "pointer" }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <CheckItem label="Read Bible" sub="Daily scripture reading" done={!!data.bible} onToggle={() => update("bible", !data.bible)} />
        <CheckItem label="Read a book" sub="Personal development or professional reading" done={!!data.book} onToggle={() => update("book", !data.book)} />
        <CheckItem label="2+ hours personal time" sub="CSCP study, business planning, school work" done={!!data.personalTime} onToggle={() => update("personalTime", !data.personalTime)}>
          <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="number" min="0" max="12" step="0.5" placeholder="hrs" value={data.personalHours || ""}
              onChange={e => update("personalHours", parseFloat(e.target.value) || "")}
              style={{ width: "64px", fontSize: "12px", padding: "3px 8px", borderRadius: "4px", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }} />
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>hours logged today</span>
          </div>
        </CheckItem>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em" }}>Expenses today</div>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)" }}>{Math.round(todayTotal).toLocaleString()} RWF</div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && addExp()} placeholder="What did you spend on?" style={{ flex: "2", minWidth: "120px", fontSize: "13px", padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }} />
          <input value={amt} onChange={e => setAmt(e.target.value)} onKeyDown={e => e.key === "Enter" && addExp()} type="number" placeholder="RWF" style={{ width: "90px", fontSize: "13px", padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }} />
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ fontSize: "12px", padding: "6px 8px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", outline: "none" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={addExp} style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", fontSize: "13px", cursor: "pointer" }}>Add</button>
        </div>
        {expenses.length === 0 && <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", padding: "4px 0" }}>No expenses logged yet today.</div>}
        {expenses.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Pill label={e.cat} bg={CAT_COLORS[e.cat] || "#F1EFE8"} color={CAT_COLORS[e.cat + "T"] || "#5F5E5A"} />
              <span style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{e.desc}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-primary)" }}>{Math.round(e.amount).toLocaleString()}</span>
              <button onClick={() => removeExp(e.id)} style={{ fontSize: "14px", color: "var(--color-text-tertiary)", border: "none", background: "transparent", cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekTab({ days }) {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayKey = fmtDate(new Date());
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "5px", marginBottom: "1rem" }}>
        {week.map((d, i) => {
          const key = fmtDate(d);
          const dd = days[key] || {};
          const done = dayDone(dd);
          const partial = !!days[key] && !done;
          const isT = key === todayKey;
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{dayNames[i]}</div>
              <div style={{ background: done ? "#E1F5EE" : partial ? "#FAEEDA" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 2px", border: isT ? "1.5px solid #1D9E75" : "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: done ? "#0F6E56" : partial ? "#854F0B" : "var(--color-text-secondary)" }}>{d.getDate()}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[["#E1F5EE", "Complete"], ["#FAEEDA", "Partial"], ["var(--color-background-secondary)", "No data"]].map(([bg, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", background: bg, borderRadius: "2px", border: "0.5px solid var(--color-border-tertiary)" }} />
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{label}</span>
          </div>
        ))}
      </div>
      {week.map((d, i) => {
        const key = fmtDate(d);
        const dd = days[key];
        if (!dd) return null;
        const expTotal = (dd.expenses || []).reduce((s, e) => s + e.amount, 0);
        return (
          <div key={key} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-primary)" }}>{dayNames[i]} {d.getDate()}</span>
              <span style={{ fontSize: "11px", color: dayDone(dd) ? "#0F6E56" : "#854F0B" }}>{dayDone(dd) ? "Complete" : "Incomplete"}</span>
            </div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {dd.wakeTime && <Pill label={`Up ${dd.wakeTime}`} bg="#E6F1FB" color="#185FA5" />}
              {dd.activity && <Pill label={dd.activity} bg="#E1F5EE" color="#0F6E56" />}
              {dd.bible && <Pill label="Bible" bg="#EEEDFE" color="#534AB7" />}
              {dd.book && <Pill label="Book" bg="#FAEEDA" color="#854F0B" />}
              {dd.personalTime && <Pill label={`${dd.personalHours || 2}h personal`} bg="#EAF3DE" color="#3B6D11" />}
              {expTotal > 0 && <Pill label={`${Math.round(expTotal).toLocaleString()} RWF`} bg="#F1EFE8" color="#5F5E5A" />}
            </div>
          </div>
        );
      }).filter(Boolean)}
    </div>
  );
}

function ProgressTab({ days, startDate, dayNum }) {
  const dots = Array.from({ length: 75 }, (_, i) => {
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    const dd = days[key];
    const done = dayDone(dd);
    const partial = !!dd && !done;
    const past = i < dayNum - 1;
    const isT = i === dayNum - 1;
    return { done, partial, past, isT, num: i + 1 };
  });
  const doneCount = dots.filter(d => d.done).length;
  const missedCount = dots.filter(d => d.past && !d.done).length;
  const dayVals = Object.values(days);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "1.5rem" }}>
        <StatCard v={`${doneCount}/75`} l="days complete" />
        <StatCard v={`${dayNum > 0 ? Math.round((doneCount / dayNum) * 100) : 0}%`} l="success rate" />
        <StatCard v={`${missedCount}`} l="days missed" />
        <StatCard v={`${75 - dayNum}`} l="days left" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(15,1fr)", gap: "4px", marginBottom: "1rem" }}>
        {dots.map(({ done, partial, past, isT, num }) => (
          <div key={num} title={`Day ${num}`} style={{ aspectRatio: "1", borderRadius: "3px", background: done ? "#1D9E75" : partial ? "#EF9F27" : isT ? "#B5D4F4" : past ? "#F09595" : "var(--color-background-secondary)", border: isT ? "1.5px solid #378ADD" : "0.5px solid transparent" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[["#1D9E75", "Complete"], ["#EF9F27", "Partial"], ["#F09595", "Missed"], ["#B5D4F4", "Today"], ["var(--color-background-secondary)", "Upcoming"]].map(([bg, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", background: bg, borderRadius: "2px" }} />
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "14px" }}>Habit completion rates</div>
        {[
          { key: "activity", label: "Daily activity", color: "#1D9E75" },
          { key: "bible", label: "Bible reading", color: "#7F77DD" },
          { key: "book", label: "Book reading", color: "#EF9F27" },
          { key: "personalTime", label: "2h+ personal time", color: "#378ADD" },
        ].map(({ key, label, color }) => (
          <BarRow key={key} label={label} count={dayVals.filter(d => d[key]).length} total={Math.max(dayNum, 1)} color={color} />
        ))}
      </div>
    </div>
  );
}

function ExpensesTab({ days, today }) {
  const [filterCat, setFilterCat] = useState("All");
  const all = allExpenses(days);
  const filtered = filterCat === "All" ? all : all.filter(e => e.cat === filterCat);
  const totalAll = all.reduce((s, e) => s + e.amount, 0);
  const todayTotal = (days[today]?.expenses || []).reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const weekTotal = all.filter(e => new Date(e.date + "T12:00:00") >= weekStart).reduce((s, e) => s + e.amount, 0);
  const catTotals = Object.fromEntries(CATEGORIES.map(c => [c, all.filter(e => e.cat === c).reduce((s, e) => s + e.amount, 0)]));
  const topCats = Object.entries(catTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const maxCat = topCats[0]?.[1] || 1;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "1.5rem" }}>
        <StatCard v={`${Math.round(todayTotal).toLocaleString()}`} l="today (RWF)" />
        <StatCard v={`${Math.round(weekTotal).toLocaleString()}`} l="this week (RWF)" />
        <StatCard v={`${Math.round(totalAll).toLocaleString()}`} l="total (RWF)" />
      </div>
      {topCats.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "12px" }}>Spending by category</div>
          {topCats.map(([c, total]) => (
            <div key={c} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <Pill label={c} bg={CAT_COLORS[c] || "#F1EFE8"} color={CAT_COLORS[c + "T"] || "#5F5E5A"} />
                <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)" }}>{Math.round(total).toLocaleString()} RWF</span>
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                <div style={{ background: CAT_COLORS[c + "T"] || "#888", height: "100%", width: `${(total / maxCat) * 100}%`, borderRadius: "3px", opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "5px", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "4px 10px", borderRadius: "12px", border: `0.5px solid ${filterCat === c ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`, background: filterCat === c ? "var(--color-background-secondary)" : "transparent", color: filterCat === c ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontSize: "12px", cursor: "pointer" }}>
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", padding: "1rem 0" }}>{all.length === 0 ? "No expenses logged yet." : "No expenses in this category."}</div>}
      {filtered.map(e => (
        <div key={e.id + e.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{e.desc}</span>
              <Pill label={e.cat} bg={CAT_COLORS[e.cat] || "#F1EFE8"} color={CAT_COLORS[e.cat + "T"] || "#5F5E5A"} />
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{e.date}</div>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-primary)" }}>{Math.round(e.amount).toLocaleString()} RWF</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("today");
  const today = fmtDate(new Date());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("75soft:v1");
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        const init = { startDate: today, days: {} };
        localStorage.setItem("75soft:v1", JSON.stringify(init));
        setData(init);
      }
    } catch {
      setData({ startDate: today, days: {} });
    }
  }, []);

  const save = useCallback((newData) => {
    setData(newData);
    try { localStorage.setItem("75soft:v1", JSON.stringify(newData)); } catch { }
  }, []);

  function update(field, value) {
    const newData = { ...data, days: { ...data.days, [today]: { ...(data.days[today] || {}), [field]: value } } };
    save(newData);
  }

  if (!data) return <div style={{ padding: "2rem", color: "var(--color-text-secondary)", fontSize: "14px" }}>Loading...</div>;

  const dayNum = dayOf(data.startDate, today);
  let streak = 0;
  let cur = new Date();
  for (let i = 0; i < 75; i++) {
    const k = fmtDate(cur);
    if (dayDone(data.days[k])) { streak++; cur.setDate(cur.getDate() - 1); } else break;
  }
  const doneCount = Object.values(data.days).filter(d => dayDone(d)).length;
  const progress = Math.round((dayNum / 75) * 100);
  const todayData = data.days[today] || {};

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "1rem" }}>
        <StatCard v={`Day ${dayNum}`} l="of 75" />
        <StatCard v={streak} l="day streak" />
        <StatCard v={doneCount} l="days complete" />
        <StatCard v={`${Math.round((doneCount / 75) * 100)}%`} l="of challenge" />
      </div>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "4px", height: "6px", marginBottom: "1.5rem", overflow: "hidden" }}>
        <div style={{ background: "#1D9E75", height: "100%", width: `${progress}%`, borderRadius: "4px" }} />
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["today", "week", "progress", "expenses"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: "20px", border: "0.5px solid var(--color-border-secondary)", background: tab === t ? "var(--color-text-primary)" : "transparent", color: tab === t ? "var(--color-background-primary)" : "var(--color-text-secondary)", fontSize: "13px", cursor: "pointer" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "today" && <TodayTab data={todayData} update={update} today={today} />}
      {tab === "week" && <WeekTab days={data.days} />}
      {tab === "progress" && <ProgressTab days={data.days} startDate={data.startDate} dayNum={dayNum} />}
      {tab === "expenses" && <ExpensesTab days={data.days} today={today} update={update} />}
    </div>
  );
}
