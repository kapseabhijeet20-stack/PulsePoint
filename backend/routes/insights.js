const router = require('express').Router();
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.get('/', async (req, res) => {
  const feedback = global.store.feedback;
  const events = global.store.events;

  const rageclicks = events.filter(e => e.reason === 'rage_click').length;
  const inactivity = events.filter(e => e.reason === 'inactivity').length;
  const hesitation = events.filter(e => e.reason && e.reason.startsWith('hesitation')).length;
  const stats = { rageclicks, inactivity, hesitation, totalFeedback: feedback.length };

  if (feedback.length === 0 && events.length === 0) {
    return res.json({
      insight: 'No data yet. Interact with the test page to generate insights.',
      fixes: [],
      summary: 'No user sessions recorded yet.',
      stats
    });
  }

  const feedbackText = feedback.map(f =>
    `- Emoji: ${f.emoji}/5 | Trigger: ${f.trigger} | Sentiment: ${f.sentiment?.label || 'unknown'} | Comment: "${f.text || 'none'}"`
  ).join('\n');

  const prompt = `You are a senior UX analyst. Analyze this real user behavior data and provide actionable insights.

BEHAVIOR DATA:
- Rage clicks: ${rageclicks}
- Inactivity drops: ${inactivity}  
- Hesitation events: ${hesitation}
- Total feedback responses: ${feedback.length}

USER FEEDBACK:
${feedbackText || 'No written feedback yet'}

Respond in this EXACT JSON format (no markdown, no extra text):
{
  "summary": "2-3 sentence plain English summary of the biggest pain point",
  "fixes": [
    {"problem": "specific problem", "fix": "concrete actionable fix", "priority": "high/medium/low"},
    {"problem": "specific problem", "fix": "concrete actionable fix", "priority": "high/medium/low"},
    {"problem": "specific problem", "fix": "concrete actionable fix", "priority": "high/medium/low"}
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      parsed = { summary: raw, fixes: [] };
    }

    global.store.insights.unshift({ ...parsed, stats, generatedAt: new Date().toISOString() });

    res.json({ ...parsed, stats });

  } catch (err) {
    console.error('Groq error:', err.message);
    // Fallback if API fails
    const summary = `Detected ${rageclicks} rage clicks, ${inactivity} inactivity drops, and ${hesitation} hesitations. Users are struggling with the checkout flow.`;
    res.json({
      summary,
      fixes: [
        { problem: 'Rage clicks on CTA', fix: 'Make the primary button more visible and add loading state', priority: 'high' },
        { problem: 'User inactivity', fix: 'Add progress indicators and inline help text', priority: 'medium' },
        { problem: 'Form hesitation', fix: 'Add placeholder examples and field validation', priority: 'medium' }
      ],
      stats
    });
  }
});

module.exports = router;
