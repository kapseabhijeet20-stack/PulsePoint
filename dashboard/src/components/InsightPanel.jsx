const PRIORITY_COLOR = {
  high:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', dot: '#ef4444' },
  medium: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', dot: '#f59e0b' },
  low:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', dot: '#10b981' },
}

export default function InsightPanel({ insight, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
        <p style={{ margin: 0, fontWeight: 600, color: '#a855f7' }}>Analyzing with Llama 3...</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Groq AI is reading your data</p>
      </div>
    )
  }

  if (!insight) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
        <p style={{ margin: 0, color: '#475569' }}>Click "Generate Insight" to get AI analysis</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#334155' }}>Powered by Groq + Llama 3</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stats row */}
      {insight.stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Rage Clicks', val: insight.stats.rageclicks, color: '#ef4444' },
            { label: 'Inactivity',  val: insight.stats.inactivity,  color: '#f59e0b' },
            { label: 'Hesitations', val: insight.stats.hesitation,  color: '#3b82f6' },
            { label: 'Feedback',    val: insight.stats.totalFeedback, color: '#a855f7' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#0f172a', borderRadius: 10, padding: '10px 16px',
              border: `1px solid ${s.color}30`, textAlign: 'center', flex: 1
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {(insight.summary || insight.insight) && (
        <div style={{
          background: '#1e1033', borderRadius: 12, padding: '16px 20px',
          borderLeft: '4px solid #a855f7', marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <span style={{ fontWeight: 600, color: '#c084fc', fontSize: 13 }}>Llama 3 Analysis</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700,
              background: '#a855f7', color: '#fff',
              borderRadius: 4, padding: '2px 8px'
            }}>GROQ</span>
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7, fontSize: 14 }}>
            {insight.summary || insight.insight}
          </p>
        </div>
      )}

      {/* Auto-suggested Fixes */}
      {insight.fixes && insight.fixes.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
            🔧 Auto-suggested Fixes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insight.fixes.map((fix, i) => {
              const p = PRIORITY_COLOR[fix.priority] || PRIORITY_COLOR.medium
              return (
                <div key={i} style={{
                  background: '#0f172a', borderRadius: 10, padding: '14px 16px',
                  border: '1px solid #1e293b',
                  display: 'flex', gap: 12, alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: p.dot, flexShrink: 0, marginTop: 5
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                        {fix.problem}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: p.text,
                        background: p.bg, border: `1px solid ${p.border}`,
                        borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase'
                      }}>
                        {fix.priority}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                      ✅ {fix.fix}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
