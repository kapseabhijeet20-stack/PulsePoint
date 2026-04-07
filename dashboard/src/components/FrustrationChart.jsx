import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function FrustrationChart({ events }) {
  const data = events
    .filter(e => e.score && e.timestamp)
    .slice(0, 20)
    .reverse()
    .map((e, i) => ({
      name: i + 1,
      score: e.score,
      reason: e.reason || 'unknown',
    }))

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        No frustration events yet.<br />
        <span style={{ fontSize: 13 }}>Add the SDK to your site to start tracking.</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(val, name) => [val + '%', 'Frustration Score']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#7c3aed"
          strokeWidth={2.5}
          dot={{ fill: '#7c3aed', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
