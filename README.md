# ⚡ PulsePoint — AI-Powered Real-Time UX Feedback Tool

> *"Feel what your users feel — before they leave."*

![PulsePoint Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v24-green) ![React](https://img.shields.io/badge/React-v19-blue) ![Groq](https://img.shields.io/badge/AI-Groq%20%2B%20Llama%203-purple) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 What is PulsePoint?

PulsePoint is an AI-powered emotional UX layer that detects user frustration in real-time, triggers intelligent feedback moments, and auto-generates actionable insights — so product teams fix pain points before users churn.

**One script tag on your website. That's it.**

---

## 🚀 The Problem We Solve

Imagine you just launched your product. A user hits your pricing page, clicks the buy button 6 times in frustration, then leaves forever. You find out 3 weeks later in a retrospective.

**PulsePoint catches that in 3 seconds.**

---

## ✨ Features

### 🧠 FrustrationIQ™ — Behavioral Emotion Engine
- **Rage Click Detection** — detects rapid repeated clicks as frustration signals
- **Inactivity Detection** — identifies when users go idle and disengage
- **Hesitation Detection** — tracks users hovering on buttons/inputs without acting
- **Composite Frustration Score** — weighted scoring across all signals

### 💬 ContextSnap™ — Smart Feedback Triggers
- Feedback appears **only when frustration score crosses a threshold**
- Context-aware questions based on what triggered the frustration
- Beautiful emoji slider + text input widget
- Live sentiment analysis as user types

### 🤖 InsightGPT™ — AI Pain Point Analysis
- Powered by **Groq + Llama 3** (fastest AI API)
- Auto-generates plain English pain point summaries
- Provides **prioritized fix recommendations** (High/Medium/Low)
- No analyst needed — instant sprint backlog from user behavior

### 🔴 Live Alert System
- Real-time alert banner on dashboard when frustration detected
- Instant notification of critical UX issues
- Session tracking and URL context

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend SDK | Vanilla JavaScript |
| Dashboard | React + Vite + Recharts |
| Backend | Node.js + Express |
| AI | Groq API + Llama 3.1 |
| NLP | Sentiment.js |
| Storage | In-memory (demo) / Firebase |
| Fonts | DM Sans + Space Grotesk |

---

## 📦 Project Structure

```
pulsepoint/
├── sdk/
│   ├── pulsepoint.js          ← Core tracking SDK
│   └── test.html              ← Demo checkout page (NovaPay)
├── backend/
│   ├── index.js               ← Express server
│   ├── routes/
│   │   ├── events.js          ← Behavioral event tracking
│   │   ├── feedback.js        ← Feedback storage + sentiment
│   │   ├── insights.js        ← Groq AI insights
│   │   └── ai.js              ← Smart questions + sentiment API
│   ├── ai/
│   │   ├── sentiment.js       ← Local NLP sentiment analysis
│   │   └── questionGenerator.js ← Context-aware question engine
│   └── firebase.js            ← Firebase configuration
└── dashboard/
    └── src/
        ├── App.jsx             ← Main dashboard
        └── components/
            ├── FrustrationChart.jsx
            ├── FeedbackFeed.jsx
            └── InsightPanel.jsx
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/kapseabhijeet20-stack/PulsePoint.git
cd PulsePoint
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=4000
GROQ_API_KEY=your_groq_api_key_here
```

Start backend:
```bash
node index.js
```

### 3. Setup Dashboard
```bash
cd ../dashboard
npm install
npm run dev
```

### 4. Run SDK Test Page
```bash
cd ../sdk
npx serve . -p 3000
```

### 5. Open in browser
- **Test Page:** `http://localhost:3000/test.html`
- **Dashboard:** `http://localhost:5173`
- **Backend:** `http://localhost:4000/health`

---

## 🎬 How to Demo

### Trigger Rage Click
1. Open `http://localhost:3000/test.html`
2. Click **"Pay ₹17,695"** button **3 times fast**
3. Watch the purple feedback widget appear
4. Notice the **contextual smart question** — not generic!
5. Type feedback — see **live sentiment analysis**
6. Submit and switch to dashboard

### See Live Dashboard
1. Open `http://localhost:5173`
2. Watch **stat cards** update in real time
3. See **FrustrationIQ™ chart** spike
4. Watch **live alert banner** slide down

### Generate AI Insights
1. Click **Insights** tab
2. Click **✨ Generate Insight**
3. See **Llama 3 analysis** + **prioritized fix recommendations**

---

## 🔌 SDK Integration

Add PulsePoint to any website with one line:

```html
<script src="https://your-cdn/pulsepoint.js"></script>
```

Or self-hosted:
```html
<script src="/path/to/pulsepoint.js"></script>
```

Configure:
```js
// Inside pulsepoint.js
const CONFIG = {
  apiUrl: 'https://your-backend.com',
  rageclickThreshold: 3,    // clicks to trigger rage click
  rageclickWindow: 1000,    // ms window for rage clicks
  inactivityTimeout: 8000,  // ms before inactivity fires
  hesitationTimeout: 4000,  // ms hover before hesitation fires
}
```

---

## 📊 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/events` | POST | Store behavioral event |
| `/events` | GET | Fetch all events |
| `/events/alert` | POST | Store live alert |
| `/events/alerts` | GET | Fetch alerts |
| `/feedback` | POST | Store feedback + sentiment |
| `/feedback` | GET | Fetch all feedback |
| `/insights` | GET | Generate AI insights |
| `/ai/question` | GET | Get smart question by trigger |
| `/ai/sentiment` | POST | Analyze text sentiment |

---

## 🧠 How FrustrationIQ™ Works

```
User Action          →  Signal          →  Score
─────────────────────────────────────────────────
3+ clicks in 1s      →  Rage Click      →  +40 pts
8s no movement       →  Inactivity      →  +20 pts
4s hover on button   →  Hesitation      →  +15 pts

Score ≥ 30           →  Trigger feedback widget
Score = 100          →  Maximum frustration
```

---

## 🤖 AI Features

### Smart Question Generator
Instead of asking "How are you feeling?", PulsePoint asks:
- **Rage click:** *"Looks like you hit a wall. What were you expecting?"*
- **Hesitation:** *"Not sure about clicking? What's holding you back?"*
- **Inactivity:** *"Got stuck? What were you looking for?"*

### Sentiment Analysis
Real-time NLP analysis of feedback text:
- Positive / Slightly Positive / Neutral / Slightly Negative / Negative
- Shows live as user types in feedback widget

### Groq AI Insights
Powered by Llama 3.1 via Groq API:
- Plain English pain point summary
- 3 prioritized fix recommendations
- Based on actual session data

---

## 🏆 Differentiation vs Competitors

| Feature | Hotjar | Mixpanel | **PulsePoint** |
|---------|--------|----------|----------------|
| Session Recording | ✅ | ❌ | 🔜 |
| Funnel Analysis | ❌ | ✅ | ❌ |
| Rage Click Detection | ✅ | ❌ | ✅ |
| Real-time Alerts | ❌ | ❌ | ✅ |
| Smart Feedback Triggers | ❌ | ❌ | ✅ |
| Sentiment Analysis | ❌ | ❌ | ✅ |
| AI Pain Point Summary | ❌ | ❌ | ✅ |
| Auto Fix Suggestions | ❌ | ❌ | ✅ |
| Setup Time | Hours | Days | **1 script tag** |

---

## 💰 Business Model

| Plan | Price | Sessions |
|------|-------|----------|
| Free | $0/mo | 1,000/mo |
| Pro | $49/mo | Unlimited |
| Enterprise | $299/mo | Unlimited + Custom AI |

---

## 🗺️ Roadmap

- [ ] Session replay
- [ ] Predictive churn scoring
- [ ] Jira/Linear integration (auto-create tickets)
- [ ] Slack/Teams alerts
- [ ] Custom AI model training
- [ ] Mobile SDK (iOS/Android)

---

## 👨‍💻 Authors

**Abhijeet Kapse**
- GitHub: [@kapseabhijeet20-stack](https://github.com/kapseabhijeet20-stack)

**Paramjyot Singh Kalha**
- GitHub: [@ParamJyot01](https://github.com/ParamJyot01)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
  <strong>Built with ❤️ for the hackathon</strong><br>
  <em>"Feel what your users feel — before they leave."</em>
</div>
