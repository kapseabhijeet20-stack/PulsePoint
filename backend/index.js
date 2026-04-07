const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

global.store = {
  events: [],
  feedback: [],
  alerts: [],
  insights: []
};

app.use('/events',   require('./routes/events'));
app.use('/feedback', require('./routes/feedback'));
app.use('/insights', require('./routes/insights'));
app.use('/ai',       require('./routes/ai'));

app.get('/health', (req, res) => res.json({ status: 'PulsePoint is live' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('PulsePoint backend running on port ' + PORT));
