(function () {
  const CONFIG = {
    apiUrl: 'http://127.0.0.1:4000',
    sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    rageclickThreshold: 3,
    rageclickWindow: 1000,
    inactivityTimeout: 8000,
    hesitationTimeout: 4000,
  };

  let clickBuffer = [];
  let inactivityTimer = null;
  let hesitationTimer = null;
  let frustrationScore = 0;
  let feedbackShown = false;

  // ─── FRUSTRATION SCORE ───────────────────────────────────────
  function addFrustration(amount, reason) {
    frustrationScore = Math.min(100, frustrationScore + amount);
    console.log('[PulsePoint] Frustration score:', frustrationScore, '| Reason:', reason);
    sendEvent({ type: 'frustration', reason, score: frustrationScore });
    if (frustrationScore >= 30 && !feedbackShown) triggerFeedbackSmart(reason);
  }

  // ─── RAGE CLICK DETECTION ────────────────────────────────────
  document.addEventListener('click', function (e) {
    const now = Date.now();
    clickBuffer.push({ time: now, x: e.clientX, y: e.clientY, target: e.target.tagName });
    clickBuffer = clickBuffer.filter(c => now - c.time < CONFIG.rageclickWindow);
    if (clickBuffer.length >= CONFIG.rageclickThreshold) {
      clickBuffer = [];
      addFrustration(40, 'rage_click');
      sendAlert('Rage click detected on ' + window.location.pathname);
    }
  });

  // ─── INACTIVITY DETECTION ────────────────────────────────────
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function () {
      addFrustration(20, 'inactivity');
    }, CONFIG.inactivityTimeout);
  }
  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('keypress', resetInactivityTimer);
  document.addEventListener('scroll', resetInactivityTimer);
  resetInactivityTimer();

  // ─── HESITATION DETECTION ────────────────────────────────────
  document.addEventListener('mouseover', function (e) {
    const tag = e.target.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') {
      clearTimeout(hesitationTimer);
      hesitationTimer = setTimeout(function () {
        addFrustration(15, 'hesitation_on_' + tag.toLowerCase());
      }, CONFIG.hesitationTimeout);
    }
  });
  document.addEventListener('mouseout', function (e) {
    const tag = e.target.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') {
      clearTimeout(hesitationTimer);
    }
  });

  // ─── SMART QUESTION FETCHER ──────────────────────────────────
  async function triggerFeedbackSmart(reason) {
    feedbackShown = true;
    let question = 'How are you feeling right now?';
    try {
      const res = await fetch(CONFIG.apiUrl + '/ai/question?trigger=' + reason);
      const data = await res.json();
      if (data.question) question = data.question;
    } catch (e) {}
    showFeedbackWidget(question, reason);
  }

  // ─── FEEDBACK UI ─────────────────────────────────────────────
  function showFeedbackWidget(question, reason) {
    const overlay = document.createElement('div');
    overlay.id = 'pp-feedback';
    overlay.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      background: #ffffff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      padding: 24px 28px; width: 320px; font-family: sans-serif;
      animation: ppSlideIn 0.4s cubic-bezier(.21,1.02,.73,1) forwards;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes ppSlideIn {
          from { opacity: 0; transform: translateY(40px);}
          to   { opacity: 1; transform: translateY(0);}
        }
        #pp-feedback * { box-sizing: border-box; }
        #pp-feedback h3 { margin: 0 0 6px; font-size: 15px; color: #1a1a2e; font-weight: 700; }
        #pp-feedback p  { margin: 0 0 16px; font-size: 13px; color: #666; }
        .pp-emojis { display: flex; justify-content: space-between; margin-bottom: 14px; }
        .pp-emoji  { font-size: 26px; cursor: pointer; padding: 6px; border-radius: 8px;
                     transition: transform 0.2s, background 0.2s; }
        .pp-emoji:hover { transform: scale(1.3); background: #f0f0f0; }
        .pp-emoji.selected { background: #ede9fe; transform: scale(1.3); }
        #pp-text  { width: 100%; border: 1.5px solid #e0e0e0; border-radius: 8px;
                    padding: 8px 12px; font-size: 13px; resize: none; outline: none;
                    transition: border 0.2s; }
        #pp-text:focus { border-color: #7c3aed; }
        #pp-submit { margin-top: 10px; width: 100%; background: #7c3aed; color: #fff;
                     border: none; border-radius: 8px; padding: 10px; font-size: 14px;
                     font-weight: 600; cursor: pointer; transition: background 0.2s; }
        #pp-submit:hover { background: #6d28d9; }
        #pp-close  { position: absolute; top: 12px; right: 16px; background: none;
                     border: none; font-size: 18px; cursor: pointer; color: #999; }
        #pp-thanks { text-align: center; padding: 12px 0; font-size: 15px; color: #7c3aed; font-weight: 600; }
        #pp-sentiment { margin-top: 6px; font-size: 11px; color: #999; text-align: right; }
      </style>

      <button id="pp-close">×</button>
      <h3>Quick question for you 👋</h3>
      <p id="pp-question">${question}</p>

      <div class="pp-emojis">
        <span class="pp-emoji" data-val="1" title="Very frustrated">😤</span>
        <span class="pp-emoji" data-val="2" title="Confused">😕</span>
        <span class="pp-emoji" data-val="3" title="Neutral">😐</span>
        <span class="pp-emoji" data-val="4" title="Good">🙂</span>
        <span class="pp-emoji" data-val="5" title="Great">😄</span>
      </div>

      <textarea id="pp-text" rows="2" placeholder="What's going wrong? (optional)"></textarea>
      <div id="pp-sentiment"></div>
      <button id="pp-submit">Send Feedback</button>
    `;

    document.body.appendChild(overlay);

    let selectedEmoji = null;

    // Emoji selection
    overlay.querySelectorAll('.pp-emoji').forEach(function (el) {
      el.addEventListener('click', function () {
        overlay.querySelectorAll('.pp-emoji').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedEmoji = el.dataset.val;
      });
    });

    // Live sentiment as user types
    let sentimentTimer = null;
    document.getElementById('pp-text').addEventListener('input', function () {
      clearTimeout(sentimentTimer);
      const text = this.value;
      if (text.length < 3) {
        document.getElementById('pp-sentiment').textContent = '';
        return;
      }
      sentimentTimer = setTimeout(async function () {
        try {
          const res = await fetch(CONFIG.apiUrl + '/ai/sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          const data = await res.json();
          const el = document.getElementById('pp-sentiment');
          if (el) el.textContent = 'Sentiment: ' + data.emoji + ' ' + data.label;
        } catch (e) {}
      }, 500);
    });

    document.getElementById('pp-close').addEventListener('click', function () {
      overlay.remove();
    });

    document.getElementById('pp-submit').addEventListener('click', function () {
      const text = document.getElementById('pp-text').value;
      submitFeedback(selectedEmoji, text, reason);
      overlay.innerHTML = '<div id="pp-thanks">Thanks for your feedback! 💜</div>';
      setTimeout(function () { overlay.remove(); }, 2000);
    });
  }

  // ─── SUBMIT FEEDBACK ─────────────────────────────────────────
  function submitFeedback(emoji, text, trigger) {
    fetch(CONFIG.apiUrl + '/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: CONFIG.sessionId,
        userId: CONFIG.userId,
        url: window.location.href,
        emoji,
        text,
        trigger,
        frustrationScore,
        timestamp: new Date().toISOString(),
      }),
    }).catch(function () {});
  }

  // ─── SEND EVENT ──────────────────────────────────────────────
  function sendEvent(data) {
    fetch(CONFIG.apiUrl + '/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: CONFIG.sessionId,
        userId: CONFIG.userId,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    }).catch(function () {});
  }

  // ─── SEND ALERT ──────────────────────────────────────────────
  function sendAlert(message) {
    fetch(CONFIG.apiUrl + '/events/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: CONFIG.sessionId, url: window.location.href }),
    }).catch(function () {});
  }

  // ─── INIT ────────────────────────────────────────────────────
  sendEvent({ type: 'session_start', userAgent: navigator.userAgent });
  console.log('[PulsePoint] SDK loaded. Session:', CONFIG.sessionId);
})();
