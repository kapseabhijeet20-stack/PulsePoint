const router = require('express').Router();

router.post('/', (req, res) => {
  const event = { ...req.body, receivedAt: new Date().toISOString(), id: Date.now().toString() };
  global.store.events.unshift(event);
  if (global.store.events.length > 200) global.store.events.pop();
  console.log('[Event]', event.type, '| Score:', event.score || 0);
  res.json({ ok: true });
});

router.post('/alert', (req, res) => {
  const { message, sessionId, url } = req.body;
  const alert = { message, sessionId, url, timestamp: new Date().toISOString(), id: Date.now().toString() };
  global.store.alerts.unshift(alert);
  if (global.store.alerts.length > 50) global.store.alerts.pop();
  console.log('[Alert]', message);
  res.json({ ok: true });
});

router.get('/alerts', (req, res) => {
  res.json(global.store.alerts.slice(0, 20));
});

router.get('/', (req, res) => {
  res.json(global.store.events.slice(0, 100));
});

module.exports = router;
