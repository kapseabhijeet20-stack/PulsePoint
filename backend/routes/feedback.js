const router = require('express').Router();
const { analyzeSentiment } = require('../ai/sentiment');

router.post('/', (req, res) => {
  const sentiment = analyzeSentiment(req.body.text || '');
  const feedback = { ...req.body, sentiment, receivedAt: new Date().toISOString(), id: Date.now().toString() };
  global.store.feedback.unshift(feedback);
  if (global.store.feedback.length > 100) global.store.feedback.pop();
  console.log('[Feedback] Emoji:', feedback.emoji, '| Sentiment:', sentiment.label);
  res.json({ ok: true, sentiment });
});

router.get('/', (req, res) => {
  res.json(global.store.feedback.slice(0, 100));
});

module.exports = router;
