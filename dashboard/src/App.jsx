import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API = 'http://127.0.0.1:4000'
const EMOJI_MAP = { '1': '😤', '2': '😕', '3': '😐', '4': '🙂', '5': '😄' }
const SENTIMENT_COLOR = {
  positive: '#10b981', slightly_positive: '#34d399',
  neutral: '#94a3b8', slightly_negative: '#f59e0b', negative: '#ef4444'
}
const TRIGGER_LABEL = {
  rage_click: '🖱 Rage Click', inactivity: '💤 Inactivity',
  hesitation_on_button: '🤔 Hesitation', hesitation_on_input: '🤔 Hesitation',
  hesitation_on_a: '🤔 Hesitation',
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    if (start === end) return
    const step = Math.ceil(end / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#94a3b8'
      }}>
        <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 14 }}>{payload[0].value}%</div>
        <div>Frustration Score</div>
      </div>
    )
  }
  return null
}

export default function App() {
  const [events, setEvents] = useState([])
  const [feedback, setFeedback] = useState([])
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [insightLoading, setInsightLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [latestAlert, setLatestAlert] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const lastAlertRef = useRef(null)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(API + '/events/alerts')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          if (!lastAlertRef.current || data[0].timestamp !== lastAlertRef.current) {
            lastAlertRef.current = data[0].timestamp
            setLatestAlert(data[0])
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 6000)
          }
        }
      } catch (e) {}
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    try {
      const [evRes, fbRes] = await Promise.all([
        fetch(API + '/events'), fetch(API + '/feedback'),
      ])
      const evData = await evRes.json()
      const fbData = await fbRes.json()
      setEvents(Array.isArray(evData) ? evData : [])
      setFeedback(Array.isArray(fbData) ? fbData : [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function generateInsight() {
    setInsightLoading(true)
    try {
      const res = await fetch(API + '/insights')
      const data = await res.json()
      setInsight(data)
    } catch (e) {}
    finally { setInsightLoading(false) }
  }

  const rageClicks = events.filter(e => e.reason === 'rage_click').length
  const inactivity = events.filter(e => e.reason === 'inactivity').length
  const hesitation = events.filter(e => e.reason && e.reason.startsWith('hesitation')).length
  const avgScore = events.length
    ? Math.round(events.filter(e => e.score).reduce((a, b) => a + (b.score || 0), 0) / events.length)
    : 0

  const chartData = events
    .filter(e => e.score && e.timestamp)
    .slice(0, 20).reverse()
    .map((e, i) => ({ name: i + 1, score: e.score, reason: e.reason || 'unknown' }))

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: '#e2e8f0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        @keyframes slideDown {
          from { transform: translateY(-110%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .stat-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease forwards;
          position: relative;
          overflow: hidden;
          cursor: default;
        }
        .stat-card:hover {
          border-color: #334155;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .tab-btn {
          background: none; border: none; color: #475569;
          font-size: 12px; font-weight: 600; padding: 7px 16px;
          border-radius: 8px; cursor: pointer; transition: all 0.2s;
          font-family: inherit; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .tab-btn.active { background: #1e293b; color: #f1f5f9; }
        .tab-btn:hover:not(.active) { color: #94a3b8; }
        .insight-btn {
          background: linear-gradient(135deg, #ec4899, #a855f7);
          border: none; border-radius: 10px; color: #fff;
          font-size: 13px; font-weight: 600; padding: 10px 20px;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .insight-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(168,85,247,0.4); }
        .insight-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .feed-item {
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 12px; padding: 14px 16px;
          transition: border 0.2s; animation: fadeIn 0.4s ease forwards;
        }
        .feed-item:hover { border-color: #334155; }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at 15% 15%, rgba(168,85,247,0.07) 0%, transparent 50%),
                     radial-gradient(circle at 85% 85%, rgba(236,72,153,0.07) 0%, transparent 50%)`
      }} />

      {/* Live Alert Banner */}
      {showAlert && latestAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(90deg, #7f1d1d, #991b1b)',
          borderBottom: '1px solid #ef4444',
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'slideDown 0.4s cubic-bezier(.21,1.02,.73,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
              animation: 'pulseDot 1s infinite'
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Alert</span>
            <span style={{ fontSize: 13, color: '#fecaca' }}>{latestAlert.message}</span>
            <span style={{ fontSize: 11, color: '#f87171', opacity: 0.7 }}>· {latestAlert.url}</span>
          </div>
          <button onClick={() => setShowAlert(false)} style={{
            background: 'none', border: 'none', color: '#f87171', fontSize: 20, cursor: 'pointer'
          }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10,
        borderBottom: '1px solid #1e293b',
        background: 'rgba(3,7,18,0.85)',
        backdropFilter: 'blur(20px)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 62,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
            }}>⚡</div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(90deg, #f9a8d4, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>PulsePoint</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['overview', 'feedback', 'insights'].map(tab => (
              <button key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#10b981',
              animation: 'pulseDot 2s infinite'
            }} />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Live</span>
          </div>
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#475569'
          }}>
            {events.length} events · {feedback.length} responses
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Rage Clicks', value: rageClicks, color: '#ef4444', glow: 'rgba(239,68,68,0.15)', icon: '🖱', sub: 'Detected this session' },
                { label: 'Inactivity Drops', value: inactivity, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)', icon: '💤', sub: 'Users went idle' },
                { label: 'Hesitations', value: hesitation, color: '#3b82f6', glow: 'rgba(59,130,246,0.15)', icon: '🤔', sub: 'On buttons & inputs' },
                { label: 'Avg Frustration', value: avgScore + '%', color: '#a855f7', glow: 'rgba(168,85,247,0.15)', icon: '📊', sub: 'Composite score' },
              ].map((card, i) => (
                <div key={card.label} className="stat-card"
                  style={{ animationDelay: `${i * 0.08}s`, boxShadow: `0 0 0 1px #1e293b, 0 4px 24px ${card.glow}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{card.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: card.color,
                      background: `${card.color}18`, borderRadius: 4,
                      padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>LIVE</span>
                  </div>
                  <div style={{
                    fontSize: 38, fontWeight: 700, color: card.color,
                    lineHeight: 1, marginBottom: 6,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}>
                    {typeof card.value === 'number'
                      ? <AnimatedNumber value={card.value} />
                      : card.value}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: '#334155' }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: '24px 24px 12px',
              marginBottom: 20, animation: 'fadeIn 0.5s ease 0.2s both'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
                    FrustrationIQ™ Timeline
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>Behavioral frustration scoring in real time</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: '#64748b' }}>
                  Last 20 events
                </div>
              </div>
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#334155' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                  <div style={{ fontSize: 14 }}>Waiting for events...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={{ fill: '#ec4899', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#f9a8d4' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Rage Clicks */}
            <div style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: 24, animation: 'fadeIn 0.5s ease 0.3s both'
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                Recent Alerts
              </div>
              {events.filter(e => e.reason === 'rage_click').slice(0, 5).length === 0 ? (
                <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  No alerts yet — trigger a rage click on the test page
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.filter(e => e.reason === 'rage_click').slice(0, 5).map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', background: '#0a0f1e',
                      border: '1px solid #1e293b', borderRadius: 10,
                      borderLeft: '3px solid #ef4444'
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>Rage click</span>
                      <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{e.url || 'unknown page'}</span>
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>{e.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FEEDBACK TAB ── */}
        {activeTab === 'feedback' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                Feedback Feed
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {feedback.length} responses collected · Sentiment analyzed automatically
              </div>
            </div>

            {feedback.length === 0 ? (
              <div style={{
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
                padding: '64px 32px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 16, color: '#334155' }}>No feedback yet</div>
                <div style={{ fontSize: 13, color: '#1e293b', marginTop: 6 }}>Trigger the widget on the test page</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feedback.map((fb, i) => (
                  <div key={i} className="feed-item" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{EMOJI_MAP[fb.emoji] || '❓'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: '#ef4444',
                            background: 'rgba(239,68,68,0.1)', borderRadius: 6,
                            padding: '3px 8px', border: '1px solid rgba(239,68,68,0.2)'
                          }}>
                            {TRIGGER_LABEL[fb.trigger] || fb.trigger || 'manual'}
                          </span>
                          {fb.sentiment && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: SENTIMENT_COLOR[fb.sentiment.label] || '#94a3b8',
                              background: `${SENTIMENT_COLOR[fb.sentiment.label] || '#94a3b8'}18`,
                              borderRadius: 6, padding: '3px 8px',
                              border: `1px solid ${SENTIMENT_COLOR[fb.sentiment.label] || '#94a3b8'}30`
                            }}>
                              {fb.sentiment.emoji} {fb.sentiment.label?.replace('_', ' ')}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#334155', marginLeft: 'auto' }}>
                            Score: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{fb.frustrationScore || 0}%</span>
                          </span>
                        </div>
                        <p style={{
                          fontSize: 14, color: fb.text ? '#cbd5e1' : '#334155',
                          lineHeight: 1.6, fontStyle: fb.text ? 'normal' : 'italic'
                        }}>
                          {fb.text || 'No comment provided'}
                        </p>
                        <div style={{ fontSize: 11, color: '#1e293b', marginTop: 6 }}>{fb.url}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === 'insights' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                  InsightGPT™
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>AI-powered pain point analysis · No analyst needed</div>
              </div>
              <button className="insight-btn" onClick={generateInsight} disabled={insightLoading}>
                {insightLoading ? '⏳ Analyzing...' : '✨ Generate Insight'}
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Rage Clicks', val: rageClicks, color: '#ef4444' },
                { label: 'Inactivity', val: inactivity, color: '#f59e0b' },
                { label: 'Hesitations', val: hesitation, color: '#3b82f6' },
                { label: 'Responses', val: feedback.length, color: '#a855f7' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#0f172a', border: `1px solid ${s.color}22`,
                  borderRadius: 12, padding: 16, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimatedNumber value={s.val} />
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Insight card */}
            {insightLoading && (
              <div style={{
                background: '#0f172a', border: '1px solid #1e293b',
                borderRadius: 16, padding: '48px 32px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 15, color: '#a855f7', fontWeight: 600, marginBottom: 4 }}>Analyzing behavior patterns...</div>
                <div style={{ fontSize: 12, color: '#334155' }}>Reading all sessions and feedback</div>
              </div>
            )}

            {!insightLoading && !insight && (
              <div style={{
                background: '#0f172a', border: '1px solid #1e293b',
                borderRadius: 16, padding: '64px 32px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
                <div style={{ fontSize: 16, color: '#334155', marginBottom: 8 }}>Ready to analyze</div>
                <div style={{ fontSize: 13, color: '#1e293b' }}>Click "Generate Insight" to get your AI report</div>
              </div>
            )}

            {!insightLoading && insight && (
              <div style={{
                background: '#0f172a', border: '1px solid #1e293b',
                borderRadius: 16, padding: 28, animation: 'fadeIn 0.5s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>🤖</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>AI Analysis Report</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>Generated just now</div>
                  </div>
                </div>
                <div style={{
                  borderLeft: '3px solid #a855f7', paddingLeft: 20,
                  color: '#cbd5e1', lineHeight: 1.8, fontSize: 14
                }}>
                  {insight.summary || insight.insight}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
