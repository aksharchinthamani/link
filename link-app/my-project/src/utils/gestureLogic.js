/**
 * getFingerStates – converts raw MediaPipe landmarks into open/closed map.
 *
 * Landmarks used:
 *   Thumb : tip=4,  mcp=2   (vertical displacement – works for both hands)
 *   Index : tip=8,  pip=6
 *   Middle: tip=12, pip=10
 *   Ring  : tip=16, pip=14
 *   Pinky : tip=20, pip=18
 *
 * y increases downward → tip.y < base.y means finger is raised.
 */
const getFingerStates = (landmarks) => ({
  // Thumb: tip (4) is above its MCP knuckle (2) → extended
  thumb:  landmarks[4].y < landmarks[2].y,
  index:  landmarks[8].y  < landmarks[6].y,
  middle: landmarks[12].y < landmarks[10].y,
  ring:   landmarks[16].y < landmarks[14].y,
  pinky:  landmarks[20].y < landmarks[18].y,
});

/**
 * classifyGesture – maps a hand landmark array to a spoken phrase.
 * Returns "Analyzing..." when no pattern matches.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  GESTURE QUICK REFERENCE
 * ──────────────────────────────────────────────────────────────────────
 *  Gesture          │ Thumb │ Index │ Middle │ Ring │ Pinky
 * ──────────────────┼───────┼───────┼────────┼──────┼──────
 *  Hi / Hello       │  ✅   │  ✅   │  ✅    │  ✅  │  ✅   ← wave (all open)
 *  How Are You?     │  ❌   │  ✅   │  ✅    │  ✅  │  ❌   ← 3 middle fingers
 *  I Love You       │  ✅   │  ✅   │  ❌    │  ❌  │  ✅
 *  Call Me          │  ✅   │  ❌   │  ❌    │  ❌  │  ✅
 *  Victory / Peace  │  ❌   │  ✅   │  ✅    │  ❌  │  ❌
 *  Thumbs Up (Good) │  ✅   │  ❌   │  ❌    │  ❌  │  ❌
 *  Pointing (What?) │  ❌   │  ✅   │  ❌    │  ❌  │  ❌
 *  Rock On          │  ❌   │  ✅   │  ❌    │  ❌  │  ✅
 *  Fist (Yes)       │  ❌   │  ❌   │  ❌    │  ❌  │  ❌
 *  Nice To Meet You │  ❌   │  ✅   │  ✅    │  ✅  │  ✅   ← 4 fingers, no thumb
 *  Thank You        │  ✅   │  ❌   │  ❌    │  ❌  │  ❌   ← (same as thumbs up – context-diff later)
 *  Sorry / Please   │  ✅   │  ✅   │  ✅    │  ❌  │  ❌
 *  Help Me          │  ✅   │  ❌   │  ✅    │  ❌  │  ❌
 * ──────────────────────────────────────────────────────────────────────
 */
export const classifyGesture = (landmarks) => {
  const f = getFingerStates(landmarks);

  // ── GREETINGS & CONVERSATION ─────────────────────────────────────────

  // 👋 Hi / Hello – all five open (wave)
  if (f.thumb && f.index && f.middle && f.ring && f.pinky) {
    return 'Hi / Hello';
  }

  // 🤚 How Are You? – index + middle + ring up, thumb + pinky closed
  if (!f.thumb && f.index && f.middle && f.ring && !f.pinky) {
    return 'How Are You?';
  }

  // 🤝 Nice To Meet You – index + middle + ring + pinky up, thumb closed
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
    return 'Nice To Meet You';
  }

  // 🙏 Sorry / Please – thumb + index + middle up, ring + pinky closed
  if (f.thumb && f.index && f.middle && !f.ring && !f.pinky) {
    return 'Sorry / Please';
  }

  // 🆘 Help Me – thumb + middle up, index + ring + pinky closed
  if (f.thumb && !f.index && f.middle && !f.ring && !f.pinky) {
    return 'Help Me';
  }

  // ── EMOTIONS & RESPONSES ─────────────────────────────────────────────

  // 🤟 I Love You – thumb + index + pinky open; middle + ring closed
  if (f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
    return 'I Love You';
  }

  // 🤙 Call Me – thumb + pinky open; index + middle + ring closed
  if (f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
    return 'Call Me';
  }

  // ✌️ Victory / Peace – index + middle open; rest closed
  if (!f.thumb && f.index && f.middle && !f.ring && !f.pinky) {
    return 'Victory / Peace';
  }

  // 👍 Thumbs Up – only thumb open (also maps to "Good" / "Thank You" context)
  if (f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) {
    return 'Good / Thank You';
  }

  // ☝️ Pointing – only index open (also "What?" / "One moment")
  if (!f.thumb && f.index && !f.middle && !f.ring && !f.pinky) {
    return 'What? / One Moment';
  }

  // 🤘 Rock On – index + pinky; rest closed
  if (!f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
    return 'Rock On';
  }

  // ✊ Fist – all closed (Yes / Agree)
  if (!f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) {
    return 'Yes / Agree';
  }

  return 'Analyzing...';
};
