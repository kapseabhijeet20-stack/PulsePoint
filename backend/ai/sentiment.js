const Sentiment = require('sentiment');
const analyzer = new Sentiment();

function analyzeSentiment(text) {
  if (!text || text.trim() === '') {
    return { score: 0, label: 'neutral', emoji: '😐', comparative: 0 };
  }

  const result = analyzer.analyze(text);
  const score = result.comparative;

  let label, emoji;
  if (score > 0.5)       { label = 'positive';  emoji = '😊'; }
  else if (score > 0)    { label = 'slightly_positive'; emoji = '🙂'; }
  else if (score === 0)  { label = 'neutral';   emoji = '😐'; }
  else if (score > -0.5) { label = 'slightly_negative'; emoji = '😕'; }
  else                   { label = 'negative';  emoji = '😤'; }

  return {
    score: parseFloat(score.toFixed(2)),
    label,
    emoji,
    positive: result.positive,
    negative: result.negative,
  };
}

module.exports = { analyzeSentiment };
