const questions = {
  rage_click: [
    "Something seems frustrating — what were you trying to do?",
    "Looks like you hit a wall. What were you expecting to happen?",
    "You clicked that a lot! What's not working for you?",
  ],
  inactivity: [
    "Looks like you paused — are you finding what you need?",
    "Got stuck? What were you looking for?",
    "Taking a moment? Let us know if something's unclear.",
  ],
  hesitation_on_button: [
    "Not sure about clicking? What's holding you back?",
    "Hesitating on this button — what would make you more confident?",
    "Something stopping you? We'd love to know.",
  ],
  hesitation_on_input: [
    "Not sure what to type here? What's confusing?",
    "This field giving you trouble? Tell us what's unclear.",
    "We noticed you paused here — need help?",
  ],
  hesitation_on_a: [
    "Not sure where this link goes? What were you expecting?",
    "Hesitating on this link — what would make it clearer?",
  ],
  default: [
    "How's your experience so far?",
    "Quick question — how are you feeling right now?",
    "Got a moment? Tell us what you think.",
  ],
};

function getSmartQuestion(trigger) {
  const pool = questions[trigger] || questions.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { getSmartQuestion };
