const router = require('express').Router();
const { getSmartQuestion } = require('../ai/questionGenerator');
const { analyzeSentiment } = require('../ai/sentiment');

// GET /ai/question?trigger=rage_click
router.get('/question', (req, res) => {
  const trigger = req.query.trigger || 'default';
  const question = getSmartQuestion(trigger);
  res.json({ question });
});

// POST /ai/sentiment
router.post('/sentiment', (req, res) => {
  const { text } = req.body;
  const result = analyzeSentiment(text || '');
  res.json(result);
});

module.exports = router;
