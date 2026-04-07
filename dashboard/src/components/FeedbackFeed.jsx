const EMOJI_MAP = { '1': '😤', '2': '😕', '3': '😐', '4': '🙂', '5': '😄' }
const TRIGGER_COLOR = {
  rage_click: '#ef4444',
  inactivity: '#f59e0b',
  hesitation_on_button: '#3b82f6',
  hesitation_on_input: '#3b82f6',
  hesitation_on_a: '#3b82f6',
}

export default function FeedbackFeed({ feedback }) {
  if (feedback.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        No feedback yet.<br />
        <span style={{ fontSize: 13 }}>Trigger the widget to collect responses.</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
      {feedback.map((fb, i) => (
        <div key={i} style={{
          background: '#f8f7ff', borderRadius: 10, padding: '12px 14px',
          border: '1.5px solid #ede9fe', display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <span style={{ fontSize: 22 }}>{EMOJI_MAP[fb.emoji] || '❓'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                background: TRIGGER_COLOR[fb.trigger] || '#7c3aed',
                color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600
              }}>
                {fb.trigger || 'manual'}
              </span>
              <span style={{ fontSize: 11, color: '#999' }}>
                Score: {fb.frustrationScore || 0}%
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#444' }}>
              {fb.text || <em style={{ color: '#bbb' }}>No comment</em>}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}