/* ═══════════════════════════════════════════════════════════════
   MIDNIGHT BILLIARDS — script.js
   Full physics billiards engine with 9 game modes
═══════════════════════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────────
const BALL_RADIUS = 11;
const FRICTION = 0.986;
const SPIN_FRICTION = 0.94;
const MIN_SPEED = 0.08;
const POCKET_RADIUS = 17;
const CUSHION_BOUNCE = 0.72;
const BALL_BOUNCE = 0.88;
const MAX_POWER = 22;

// Ball colors
const BALL_COLORS = {
  1:  { color: '#f5c518', stripe: false, name: 'Yellow' },
  2:  { color: '#1a55c0', stripe: false, name: 'Blue' },
  3:  { color: '#cc2200', stripe: false, name: 'Red' },
  4:  { color: '#6a1fc2', stripe: false, name: 'Purple' },
  5:  { color: '#e87a10', stripe: false, name: 'Orange' },
  6:  { color: '#1a8c2a', stripe: false, name: 'Green' },
  7:  { color: '#7a1515', stripe: false, name: 'Maroon' },
  8:  { color: '#111111', stripe: false, name: 'Black' },
  9:  { color: '#f5c518', stripe: true,  name: 'Yellow Stripe' },
  10: { color: '#1a55c0', stripe: true,  name: 'Blue Stripe' },
  11: { color: '#cc2200', stripe: true,  name: 'Red Stripe' },
  12: { color: '#6a1fc2', stripe: true,  name: 'Purple Stripe' },
  13: { color: '#e87a10', stripe: true,  name: 'Orange Stripe' },
  14: { color: '#1a8c2a', stripe: true,  name: 'Green Stripe' },
  15: { color: '#7a1515', stripe: true,  name: 'Maroon Stripe' },
  // Snooker
  16: { color: '#ff2020', stripe: false, name: 'Red (Snooker)' },
  17: { color: '#f0f0e8', stripe: false, name: 'White (Snooker)' }, // yellow in snooker
  18: { color: '#1a8c2a', stripe: false, name: 'Green (Snooker)' },
  19: { color: '#8B4513', stripe: false, name: 'Brown (Snooker)' },
  20: { color: '#1a55c0', stripe: false, name: 'Blue (Snooker)' },
  21: { color: '#ff69b4', stripe: false, name: 'Pink (Snooker)' },
  22: { color: '#111111', stripe: false, name: 'Black (Snooker)' },
};

// ── Rules Database ─────────────────────────────────────────────
const RULES_DB = {
  eightball: {
    title: '8-Ball Pool', icon: '8', sub: 'Standard Rules',
    rules: [
      { h: 'Objective', p: 'Pocket all your group (solids or stripes) then legally pocket the 8-ball to win.' },
      { h: 'Break', p: 'The breaking player must hit the rack and either pocket a ball or drive 4 balls to the cushions. If no balls are pocketed, the opponent may accept the table or re-rack.' },
      { h: 'Group Assignment', p: 'Groups are assigned on the first legal pocket after the break. Pocketing a solid assigns solids to that player; stripes to the opponent.' },
      { h: '8-Ball', p: 'The 8-ball can only be shot after all your group balls are pocketed. Pocketing the 8-ball early, or scratching while shooting it, is an immediate loss.' },
      { h: 'Ball in Hand', p: 'On a foul, the opponent gets ball-in-hand anywhere on the table (or behind the head string on the break).' },
    ],
    tips: [
      { icon: '🎯', title: 'Break Power', text: 'Hit the lead ball dead-center with maximum power for the best spread.' },
      { icon: '🔵', title: 'Play Safe', text: 'If you have no clear shot, play a safety — leave the cue ball in a difficult position for your opponent.' },
      { icon: '🧮', title: 'Plan Ahead', text: 'Always think two shots ahead. Position the cue ball for your next shot, not just the current one.' },
      { icon: '8️⃣', title: '8-Ball Timing', text: "Don't rush the 8-ball. Ensure you have a clear shot and know where the cue ball will land." },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball falls in a pocket → Ball in hand for opponent.' },
      { title: 'No Rail', text: 'After contact, no ball touches a cushion → Ball in hand.' },
      { title: 'Wrong Ball First', text: 'Hitting opponent\'s ball or the 8-ball first (before clearing your group) → Ball in hand.' },
      { title: 'Jump/Masse Scratch', text: 'Intentional jump shots that scratch → Ball in hand.' },
      { title: '8-Ball Foul', text: 'Pocketing the 8-ball before clearing your group, or scratching on the 8-ball → Immediate loss.' },
    ],
  },
  nineball: {
    title: '9-Ball Pool', icon: '9', sub: 'Standard Rules',
    rules: [
      { h: 'Objective', p: 'Legally pocket the 9-ball to win. Balls must be hit in numerical order (lowest ball first), but any ball can be pocketed on the same shot.' },
      { h: 'Break', p: 'The 1-ball must be at the front of the diamond rack. The breaker must hit the 1-ball first. If the 9-ball is pocketed on the break, the breaker wins immediately.' },
      { h: 'Combo Wins', p: 'You can win at any point by legally pocketing the 9-ball — even on a combination shot, as long as the lowest ball on the table is struck first.' },
      { h: 'Push Out', p: 'After the break, the shooter may call "push out" and play the cue ball to any position. The opponent may accept or pass the shot back.' },
    ],
    tips: [
      { icon: '🎯', title: 'Lowest Ball First', text: 'Always ensure you hit the lowest-numbered ball first — even if going for a combo on the 9.' },
      { icon: '🔢', title: 'Look for 9-Ball Combos', text: 'Constantly scan for opportunities to pocket the 9-ball off another ball.' },
      { icon: '💨', title: 'Aggressive Break', text: 'A powerful break increases your chance of pocketing the 9-ball immediately.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball falls in a pocket → Ball in hand anywhere.' },
      { title: 'Wrong Ball First', text: 'Not hitting the lowest ball first → Ball in hand.' },
      { title: 'No Rail Contact', text: 'No ball hits a rail after contact → Ball in hand.' },
      { title: '3 Consecutive Fouls', text: 'Three fouls in a row → Opponent wins the game.' },
    ],
  },
  tenball: {
    title: '10-Ball Pool', icon: '10', sub: 'Call Shot Rules',
    rules: [
      { h: 'Objective', p: 'Pocket the 10-ball legally to win. Like 9-Ball but with call-shot rules.' },
      { h: 'Call Shot', p: 'Unlike 9-Ball, you must call the ball and pocket for every shot. Balls pocketed on un-called combinations do not count.' },
      { h: 'Break', p: 'The 1-ball goes on the spot. At least 2 balls must hit cushions on the break, or it is a re-rack. No "winning on the break" unless the 10-ball is called and pocketed.' },
      { h: 'Lowest Ball First', p: 'The cue ball must strike the lowest-numbered ball first on every shot.' },
    ],
    tips: [
      { icon: '📢', title: 'Always Call Your Shot', text: 'Announce ball and pocket before every shot. Slop pockets do not count in 10-Ball.' },
      { icon: '🔟', title: 'Patience Wins', text: '10-Ball rewards patience and precision over aggressive play.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball pocketed → Ball in hand anywhere.' },
      { title: 'Wrong Ball First', text: 'Not striking the lowest ball first → Ball in hand.' },
      { title: 'Uncalled Pocket', text: 'Ball goes in wrong pocket → Spotted, no point.' },
    ],
  },
  sevenball: {
    title: '7-Ball Pool', icon: '7', sub: 'Speed Rules',
    rules: [
      { h: 'Objective', p: 'Pocket the 7-ball to win. Balls 1–6 are used, with the 7-ball as the money ball.' },
      { h: 'Rack', p: 'Balls 1–7 racked in a circle with the 7 in the center. Any ball can be pocketed without order — just hit the lowest ball first.' },
      { h: 'Win Condition', p: 'Legally pocket the 7-ball at any time (after hitting a legal ball first) to win immediately.' },
      { h: 'Speed Game', p: '7-Ball is a fast, aggressive game. Combos and carom shots are heavily rewarded.' },
    ],
    tips: [
      { icon: '⚡', title: 'Fast Paced', text: 'Always look for 7-ball combos. The sooner you pocket it, the sooner you win.' },
      { icon: '🔵', title: 'Break and Run', text: 'A well-placed break can set up an immediate combo on the 7.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball pocketed → Opponent places ball in hand behind head string.' },
      { title: 'Wrong Ball First', text: 'Not hitting the lowest ball first → Ball in hand.' },
    ],
  },
  blackball: {
    title: 'Blackball', icon: '●', sub: 'British Pool Rules',
    rules: [
      { h: 'Objective', p: 'Pocket all your group (reds or yellows) then legally pocket the black ball.' },
      { h: 'Groups', p: 'Uses red and yellow balls (spots and stripes in some sets). Groups assigned on first legal pocket after break.' },
      { h: 'Black Ball', p: 'The black must be pocketed in a called pocket after clearing your group. Potting black in wrong pocket = loss.' },
      { h: 'Two Shots', p: 'After a foul, the opponent receives two visits (not two shots). They retain the extra visit even if they pocket a ball on the first.' },
      { h: 'Re-spotted Black', p: 'If the black is accidentally pocketed during play, it is re-spotted on the black spot.' },
    ],
    tips: [
      { icon: '🎯', title: 'Call Your Black', text: "Always declare which pocket you're targeting for the black ball to avoid losing." },
      { icon: '🔴', title: 'Use Two Visits', text: 'When you get two visits, use the first to get position for the second.' },
    ],
    fouls: [
      { title: 'Foul', text: 'Opponent gets two visits to the table.' },
      { title: 'Wrong Ball First', text: 'Hitting opponent\'s ball or black before clearing your group → Two visits.' },
      { title: 'Scratch', text: 'Cue ball pocketed → Two visits, cue ball replaced behind head string.' },
      { title: 'Black in Wrong Pocket', text: 'Black pocketed in uncalled pocket → Immediate loss.' },
    ],
  },
  straightpool: {
    title: 'Straight Pool (14.1)', icon: '15', sub: 'Continuous Pool',
    rules: [
      { h: 'Objective', p: 'First player to reach the agreed point total (typically 100) wins. Each pocketed ball scores 1 point.' },
      { h: 'Call Shot', p: 'Every shot requires calling ball and pocket. Only the called ball scores. Other pocketed balls are re-spotted.' },
      { h: 'Continuous Play', p: 'When only 1 ball remains, the other 14 are re-racked around it. Play continues seamlessly.' },
      { h: 'Safety Play', p: 'A player may play a safety (announce before shooting). No point scored, but no foul if one ball hits a cushion.' },
    ],
    tips: [
      { icon: '🎯', title: 'Cluster Busting', text: 'Plan shots to break clusters while maintaining cue ball position.' },
      { icon: '📋', title: 'Call Every Shot', text: 'Always announce ball and pocket. Slop shots score nothing in Straight Pool.' },
      { icon: '🔄', title: 'Re-rack Strategy', text: 'Position the last ball near the rack before re-racking for an easy continuation shot.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball pocketed → -1 point, ball in hand behind head string.' },
      { title: 'No Contact', text: 'Failure to hit called ball first → -1 point, ball in hand.' },
      { title: 'No Rail After Contact', text: 'No ball hits cushion → -1 point.' },
      { title: 'Three Consecutive Fouls', text: '-16 points total, balls re-racked.' },
    ],
  },
  onepocket: {
    title: 'One Pocket', icon: '◎', sub: 'Strategic Pool',
    rules: [
      { h: 'Objective', p: 'Each player is assigned one of the two corner pockets at the foot of the table. First to pocket 8 balls in their designated pocket wins.' },
      { h: 'Designated Pockets', p: 'Player 1 owns the bottom-left pocket; Player 2 owns the bottom-right pocket. Balls pocketed in any other pocket are spotted.' },
      { h: 'Scoring', p: 'Only balls pocketed in your own pocket count. Balls pocketed in the opponent\'s pocket score for the opponent.' },
      { h: 'Strategy', p: 'One Pocket is considered one of the most strategic pool games. Safeties and defensive play are critical.' },
    ],
    tips: [
      { icon: '🛡️', title: 'Defense First', text: 'One Pocket rewards defensive play. Denying your opponent access to their pocket is as valuable as scoring.' },
      { icon: '📐', title: 'Bank Shots', text: 'Master bank shots to direct balls to your pocket from distance.' },
      { icon: '⚖️', title: 'Ball Control', text: 'Position balls near your pocket for easy future scoring opportunities.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball pocketed → One spotted ball (from shooter\'s count) returned to table.' },
      { title: 'No Rail', text: 'No ball hits cushion after contact (unless ball is pocketed) → Foul, one ball spotted.' },
      { title: 'No Contact', text: 'Failure to contact any ball → Foul, one ball spotted.' },
    ],
  },
  bankpool: {
    title: 'Bank Pool', icon: '↗', sub: 'Bank Shot Rules',
    rules: [
      { h: 'Objective', p: 'First player to bank and pocket 5 balls wins (in a 9-ball set). All shots must be banks — balls must contact at least one cushion before entering a pocket.' },
      { h: 'Bank Shots Only', p: 'Every scoring shot must be a bank shot. Balls pocketed without banking are spotted and do not score.' },
      { h: 'Call Shot', p: 'The bank path must be called before each shot (which rail and which pocket).' },
      { h: 'No Order Required', p: 'Balls may be pocketed in any order, as long as each is a legal bank.' },
    ],
    tips: [
      { icon: '📐', title: 'Angle is Everything', text: 'The angle of incidence equals the angle of reflection — learn to read the diamonds on the rail.' },
      { icon: '💨', title: 'Speed Matters', text: 'Speed dramatically affects bank angles due to throw and compression. Practice at consistent speed.' },
      { icon: '🎯', title: 'Use the Diamonds', text: 'The table diamonds (dots on the rails) are a geometric guide for calculating bank angles.' },
    ],
    fouls: [
      { title: 'Scratch', text: 'Cue ball pocketed → Ball in hand behind head string.' },
      { title: 'No Bank', text: 'Ball pocketed without a cushion contact → Ball spotted, no score.' },
      { title: 'Wrong Bank Path', text: 'Pocketed via uncalled rail → Ball spotted, no score.' },
    ],
  },
  snooker: {
    title: 'Snooker', icon: 'S', sub: 'Full Snooker Rules',
    rules: [
      { h: 'Objective', p: 'Score more points than your opponent by potting balls in the correct sequence. A frame ends when all balls are potted or one player concedes.' },
      { h: 'Ball Values', p: 'Red = 1pt, Yellow = 2pts, Green = 3pts, Brown = 4pts, Blue = 5pts, Pink = 6pts, Black = 7pts.' },
      { h: 'Sequence', p: 'Players must alternate between potting a red (1pt) and a colour. After a red is potted, any colour may be chosen. Reds stay down; colours are re-spotted until all reds are gone.' },
      { h: 'Colours Only Phase', p: 'After all reds are potted, colours must be potted in ascending value order: Yellow, Green, Brown, Blue, Pink, Black.' },
      { h: 'Snooker', p: 'A snooker is when the cue ball cannot directly hit the ball on (on a straight line). The opponent must hit the ball on or incur a foul.' },
    ],
    tips: [
      { icon: '🎯', title: 'Cue Ball Control', text: 'Snooker is 90% cue ball position. Always think about where the white will end up.' },
      { icon: '🔴', title: 'Pink and Black', text: 'Consistently potting the black (7pts) after each red gives a massive scoring advantage.' },
      { icon: '🛡️', title: 'Play Snookers', text: 'When ahead, play safe and leave the cue ball snookered. Fouls award penalty points.' },
    ],
    fouls: [
      { title: 'Foul', text: 'Minimum 4 points awarded to opponent. Always at least the value of the ball on.' },
      { title: 'Miss', text: 'Failing to hit the ball on when not snookered → 4pt foul + possible replay.' },
      { title: 'In-Off', text: 'Cue ball potted → Minimum 4pt penalty.' },
      { title: 'Wrong Ball', text: 'Hitting a ball other than the ball on → Penalty of the higher value ball.' },
    ],
  },
};

// ── Tips for tip panel ─────────────────────────────────────────
const GAME_TIPS = [
  "Click and drag away from the cue ball to aim.",
  "Hold longer while dragging for maximum power.",
  "Use top spin (aim high) for forward roll after contact.",
  "Use back spin (aim low) to pull the cue ball back.",
  "Side spin (english) changes the angle off cushions.",
  "Plan your next shot before taking the current one.",
  "A safety is sometimes smarter than a low-percentage pot.",
  "Speed control is just as important as direction.",
  "When unsure, aim for the center of the pocket.",
  "Break clusters early — don't leave them for later.",
];

// ── State ──────────────────────────────────────────────────────
let state = {
  mode: 'eightball',
  gameMode: null, // '2player' or 'ai'
  aiDifficulty: 'medium',
  currentPlayer: 0,
  balls: [],
  cueBall: null,
  pockets: [],
  shooting: false,
  ballsMoving: false,
  aimAngle: 0,
  power: 0,
  isCharging: false,
  mousePos: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  tableW: 0,
  tableH: 0,
  tableX: 0,
  tableY: 0,
  scores: [0, 0],
  playerGroups: [null, null], // 'solids', 'stripes'
  breakTaken: false,
  firstHitBall: null,
  ballsPocketed: [],
  consecutiveFouls: [0, 0],
  gameOver: false,
  foulActive: false,
  ballInHand: false,
  placingBall: false,
  snookerPhase: 'reds', // 'reds' or 'colors'
  snookerNextColor: null,
  snookerRedPotted: false,
  onePocketScores: [0, 0],
  straightPoolTarget: 50,
  straightPoolScores: [0, 0],
  soundOn: true,
  animFrame: null,
  tipRotateInterval: null,
};

// ── Canvas & context ───────────────────────────────────────────
// FIX: Assign canvas immediately at parse time so the mousedown/mousemove/mouseup
// event listeners that follow can bind correctly. The original code assigned canvas
// only inside DOMContentLoaded, but the listener registrations were outside that
// callback — so they ran before the assignment, binding to `undefined`.
// We defer the actual getContext() call until DOMContentLoaded since the element
// must exist in the DOM first.
let canvas = null;
let ctx = null;
let W, H; // canvas dimensions
const CUSHION = 34;

// ── Audio ──────────────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playSound(type) {
  if (!state.soundOn) return;
  try {
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    if (type === 'hit') {
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    } else if (type === 'pocket') {
      osc.frequency.setValueAtTime(520, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    } else if (type === 'cushion') {
      osc.frequency.setValueAtTime(140, ac.currentTime);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
    } else if (type === 'cue') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120 + state.power * 8, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    } else if (type === 'win') {
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        const o2 = ac.createOscillator();
        const g2 = ac.createGain();
        o2.connect(g2); g2.connect(ac.destination);
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0, ac.currentTime + i * 0.1);
        g2.gain.linearRampToValueAtTime(0.3, ac.currentTime + i * 0.1 + 0.05);
        g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.1 + 0.3);
        o2.start(ac.currentTime + i * 0.1);
        o2.stop(ac.currentTime + i * 0.1 + 0.35);
      });
      return;
    }
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.4);
  } catch(e) {}
}

// ── Utility Math ──────────────────────────────────────────────
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function norm(v) { const m = Math.hypot(v.x, v.y); return m ? { x: v.x/m, y: v.y/m } : { x:0, y:0 }; }
function dot(a, b) { return a.x * b.x + a.y * b.y; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Table Setup ────────────────────────────────────────────────
function setupTable() {
  const wrap = document.getElementById('tableWrap');
  const wrW = wrap.clientWidth;
  const wrH = wrap.clientHeight;

  // 2:1 aspect ratio table
  let tW = Math.min(wrW * 0.92, wrH * 1.9 * 0.92);
  let tH = tW / 1.9;
  if (tH > wrH * 0.92) { tH = wrH * 0.92; tW = tH * 1.9; }

  canvas.width = Math.floor(tW);
  canvas.height = Math.floor(tH);
  W = canvas.width;
  H = canvas.height;

  // FIX: Pocket positions — align to cushion inner edge exactly.
  // The old px = CUSHION-2 caused corner pockets to sit 2px inside the cushion
  // border, making them visually misaligned. Side pockets had an arbitrary ±4
  // vertical nudge that caused asymmetry after resize.
  const px = CUSHION;
  const py = CUSHION;
  state.pockets = [
    { x: px,     y: py },
    { x: W / 2,  y: py },
    { x: W - px, y: py },
    { x: px,     y: H - py },
    { x: W / 2,  y: H - py },
    { x: W - px, y: H - py },
  ];
}

// ── Ball Factory ───────────────────────────────────────────────
function makeBall(num, x, y) {
  const info = BALL_COLORS[num] || { color: '#888', stripe: false };
  return {
    num, x, y,
    vx: 0, vy: 0,
    active: true,
    pocketed: false,
    color: info.color,
    stripe: info.stripe,
    radius: BALL_RADIUS,
  };
}

// ── Rack Positions ─────────────────────────────────────────────
function getRackPos(mode) {
  const rackX = W * 0.72;
  const rackY = H / 2;
  const r = BALL_RADIUS * 2.04;
  const positions = [];

  if (mode === 'eightball' || mode === 'blackball') {
    // Triangle rack 5 rows
    const nums = mode === 'blackball'
      ? [2,1,14,4,8,3,5,12,6,7,11,9,13,10,15] // reds/yellows for blackball
      : [1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = rackX + row * r * Math.cos(Math.PI/6);
        const by = rackY + (col - row/2) * r;
        positions.push({ x: bx, y: by, num: nums[i++] });
      }
    }
  } else if (mode === 'nineball') {
    const nums = [1,2,3,4,9,5,6,7,8];
    const diamond = [[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[0,-2],[0,2],[-2,0],[2,0]];
    diamond.forEach(([dx,dy], i) => {
      positions.push({ x: rackX + dx * r * 0.87, y: rackY + dy * r * 0.87, num: nums[i] });
    });
  } else if (mode === 'tenball') {
    const nums = [1,2,3,4,5,10,6,7,8,9];
    // Triangle 4 rows + 10 in center
    let i = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = rackX + row * r * Math.cos(Math.PI/6);
        const by = rackY + (col - row/2) * r;
        positions.push({ x: bx, y: by, num: nums[i++] });
      }
    }
    positions.push({ x: rackX + r * Math.cos(Math.PI/6) * 2, y: rackY, num: 10 });
  } else if (mode === 'sevenball') {
    const nums = [1,2,3,4,5,6,7];
    const hex = [[0,0],[0,-1],[1,-0.5],[1,0.5],[0,1],[-1,0.5],[-1,-0.5]];
    hex.forEach(([dx,dy], i) => {
      positions.push({ x: rackX + dx * r, y: rackY + dy * r, num: nums[i] });
    });
  } else if (mode === 'straightpool') {
    const nums = [1,9,2,10,3,11,4,12,5,13,6,14,7,15,8];
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = rackX + row * r * Math.cos(Math.PI/6);
        const by = rackY + (col - row/2) * r;
        positions.push({ x: bx, y: by, num: nums[i++] });
      }
    }
  } else if (mode === 'onepocket' || mode === 'bankpool') {
    const nums = [1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = rackX + row * r * Math.cos(Math.PI/6);
        const by = rackY + (col - row/2) * r;
        positions.push({ x: bx, y: by, num: nums[i++] });
      }
    }
  } else if (mode === 'snooker') {
    // 15 reds in a triangle
    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const bx = rackX + row * r * Math.cos(Math.PI/6);
        const by = rackY + (col - row/2) * r;
        positions.push({ x: bx, y: by, num: 16 }); // red
        i++;
      }
    }
    // Colored balls on spots (standard snooker spots)
    // FIX: Removed duplicate blue (num 20). W*0.72-r*3 was a leftover debug entry.
    // Now uses proper relative spots: yellow/green/brown on baulk line (W*0.25),
    // blue on centre spot, pink between reds and black, black near foot cushion.
    const snookerColors = [
      { x: W * 0.25, y: H / 2 - r * 1.5, num: 17 },  // yellow
      { x: W * 0.25, y: H / 2,            num: 18 },  // green
      { x: W * 0.25, y: H / 2 + r * 1.5, num: 19 },  // brown
      { x: W * 0.5,  y: H / 2,            num: 20 },  // blue (centre spot)
      { x: W * 0.66, y: H / 2,            num: 21 },  // pink (between reds & black)
      { x: W * 0.86, y: H / 2,            num: 22 },  // black
    ];
    positions.push(...snookerColors);
  }

  return positions;
}

// ── Init Game ──────────────────────────────────────────────────
function initGame(mode, gameMode) {
  state.mode = mode;
  state.gameMode = gameMode;
  state.aiDifficulty = document.getElementById('aiDifficulty').value;
  state.currentPlayer = 0;
  state.scores = [0, 0];
  state.playerGroups = [null, null];
  state.breakTaken = false;
  state.firstHitBall = null;
  state.ballsPocketed = [];
  state.consecutiveFouls = [0, 0];
  state.gameOver = false;
  state.foulActive = false;
  state.ballInHand = false;
  state.placingBall = false;
  state.shooting = false;
  state.ballsMoving = false;
  state.isCharging = false;
  state.power = 0;
  state.snookerPhase = 'reds';
  state.snookerRedPotted = false;
  state.snookerNextColor = null;
  state.onePocketScores = [0, 0];
  state.straightPoolScores = [0, 0];
  state.straightPoolTarget = 50;

  setupTable();

  // Create cue ball
  const cueBallX = W * 0.27;
  state.cueBall = makeBall(0, cueBallX, H / 2);
  state.cueBall.color = '#f0ece0';
  state.cueBall.stripe = false;

  // Create object balls
  const rackPositions = getRackPos(mode);
  state.balls = [state.cueBall, ...rackPositions.map(p => makeBall(p.num, p.x, p.y))];

  updateHUD();
  updateBallRacks();
  showScreen('gameScreen');
  rotateTips();
  if (!state.animFrame) gameLoop();
}

// ── Physics ────────────────────────────────────────────────────
function physicsStep() {
  let anyMoving = false;

  state.balls.forEach(b => {
    if (!b.active || b.pocketed) return;
    // FIX: Check speed BEFORE moving — avoids processing balls at rest
    const speed = Math.hypot(b.vx, b.vy);
    if (speed <= MIN_SPEED) {
      b.vx = 0;
      b.vy = 0;
      return;
    }

    anyMoving = true;
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= FRICTION;
    b.vy *= FRICTION;

    // Cushion collisions
    const minX = CUSHION + b.radius;
    const maxX = W - CUSHION - b.radius;
    const minY = CUSHION + b.radius;
    const maxY = H - CUSHION - b.radius;

    // FIX: Use separate flags to avoid playing cushion sound multiple times
    // per frame when a ball is wedged in a corner
    let hitCushion = false;
    if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx) * CUSHION_BOUNCE; hitCushion = true; }
    if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx) * CUSHION_BOUNCE; hitCushion = true; }
    if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy) * CUSHION_BOUNCE; hitCushion = true; }
    if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy) * CUSHION_BOUNCE; hitCushion = true; }
    if (hitCushion) playSound('cushion');

    // Stop near-zero
    if (Math.abs(b.vx) < MIN_SPEED) b.vx = 0;
    if (Math.abs(b.vy) < MIN_SPEED) b.vy = 0;
  });

  // Ball-ball collisions
  for (let i = 0; i < state.balls.length; i++) {
    const a = state.balls[i];
    if (!a.active || a.pocketed) continue;
    for (let j = i + 1; j < state.balls.length; j++) {
      const b = state.balls[j];
      if (!b.active || b.pocketed) continue;
      const d = dist(a, b);
      const minDist = a.radius + b.radius;
      if (d < minDist && d > 0.01) {
        playSound('hit');
        // Track first hit
        if (!state.firstHitBall) {
          if (a === state.cueBall) state.firstHitBall = b;
          else if (b === state.cueBall) state.firstHitBall = a;
        }
        // Resolve overlap
        const nx = (b.x - a.x) / d;
        const ny = (b.y - a.y) / d;
        const overlap = minDist - d;
        a.x -= nx * overlap / 2;
        a.y -= ny * overlap / 2;
        b.x += nx * overlap / 2;
        b.y += ny * overlap / 2;
        // Elastic collision — equal mass balls
        // FIX: Correct restitution formula: impulse = dv * (1 + e) / 2
        // Old code multiplied by BALL_BOUNCE (0.88) directly which caused
        // energy GAIN when both balls are moving toward each other.
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dv = dvx * nx + dvy * ny;
        if (dv > 0) {
          const impulse = dv * (1 + BALL_BOUNCE) / 2;
          a.vx -= impulse * nx;
          a.vy -= impulse * ny;
          b.vx += impulse * nx;
          b.vy += impulse * ny;
        }
      }
    }
  }

  // Pocket detection
  state.pockets.forEach(pocket => {
    state.balls.forEach(b => {
      if (!b.active || b.pocketed) return;
      if (dist(b, pocket) < POCKET_RADIUS) {
        b.pocketed = true;
        b.active = false;
        b.vx = 0; b.vy = 0;
        playSound('pocket');
        state.ballsPocketed.push({ ball: b, pocket });
      }
    });
  });

  return anyMoving;
}

// ── Shot Result Processing ─────────────────────────────────────
function processShotResult() {
  const mode = state.mode;
  const pocketed = state.ballsPocketed;
  const fh = state.firstHitBall;
  let foul = false;
  let foulMsg = '';
  let scored = false;
  let switchTurn = true;
  let winner = null;

  const cueScratch = pocketed.some(p => p.ball.num === 0);
  const activeBalls = state.balls.filter(b => b.active && !b.pocketed && b.num !== 0);

  if (mode === 'eightball' || mode === 'blackball') {
    // Assign groups
    const solids = pocketed.filter(p => p.ball.num >= 1 && p.ball.num <= 7);
    const stripes = pocketed.filter(p => p.ball.num >= 9 && p.ball.num <= 15);
    const eightBall = pocketed.find(p => p.ball.num === 8);

    if (!state.breakTaken) {
      state.breakTaken = true;
      if (!fh && pocketed.length === 0) { foul = true; foulMsg = 'No ball hit on break!'; }
    } else {
      if (!fh) { foul = true; foulMsg = 'No contact!'; }
      else if (state.playerGroups[0] === null && state.playerGroups[1] === null) {
        if (fh.num === 8) { foul = true; foulMsg = 'Hit 8-ball first!'; }
      } else {
        const myGroup = state.playerGroups[state.currentPlayer];
        if (myGroup === 'solids' && fh.num >= 9 && fh.num <= 15) {
          foul = true; foulMsg = 'Wrong ball first!';
        } else if (myGroup === 'stripes' && fh.num >= 1 && fh.num <= 7) {
          foul = true; foulMsg = 'Wrong ball first!';
        } else if (myGroup !== null && fh.num === 8) {
          // Check if cleared
          const myBalls = myGroup === 'solids'
            ? state.balls.filter(b => b.num >= 1 && b.num <= 7 && !b.pocketed && b.active)
            : state.balls.filter(b => b.num >= 9 && b.num <= 15 && !b.pocketed && b.active);
          if (myBalls.length > 0) { foul = true; foulMsg = 'Hit 8-ball before clearing!'; }
        }
      }
    }

    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }

    if (!foul) {
      // Assign groups after first pocket
      if (state.playerGroups[0] === null && (solids.length > 0 || stripes.length > 0)) {
        if (solids.length > 0 && stripes.length === 0) {
          state.playerGroups[state.currentPlayer] = 'solids';
          state.playerGroups[1 - state.currentPlayer] = 'stripes';
        } else if (stripes.length > 0 && solids.length === 0) {
          state.playerGroups[state.currentPlayer] = 'stripes';
          state.playerGroups[1 - state.currentPlayer] = 'solids';
        } else if (solids.length > 0 && stripes.length > 0) {
          state.playerGroups[state.currentPlayer] = 'solids';
          state.playerGroups[1 - state.currentPlayer] = 'stripes';
        }
      }

      const myGroup = state.playerGroups[state.currentPlayer];
      const myPocketed = pocketed.filter(p => {
        if (myGroup === 'solids') return p.ball.num >= 1 && p.ball.num <= 7;
        if (myGroup === 'stripes') return p.ball.num >= 9 && p.ball.num <= 15;
        return false;
      });

      if (myPocketed.length > 0) { scored = true; switchTurn = false; }

      if (eightBall) {
        const myGroupBalls = myGroup === 'solids'
          ? state.balls.filter(b => b.num >= 1 && b.num <= 7 && !b.pocketed && b.active)
          : state.balls.filter(b => b.num >= 9 && b.num <= 15 && !b.pocketed && b.active);
        if (myGroup && myGroupBalls.length === 0) {
          if (cueScratch) { winner = 1 - state.currentPlayer; }
          else { winner = state.currentPlayer; }
        } else {
          winner = 1 - state.currentPlayer;
          foulMsg = '8-Ball too early!';
        }
      }
    }

  } else if (mode === 'nineball' || mode === 'tenball') {
    const lowestBall = state.balls.filter(b => b.num >= 1 && b.active && !b.pocketed).sort((a,b) => a.num - b.num)[0];
    const ninePocketed = pocketed.find(p => p.ball.num === 9) || (mode === 'tenball' && pocketed.find(p => p.ball.num === 10));

    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    else if (lowestBall && fh.num !== lowestBall.num) { foul = true; foulMsg = `Must hit ${lowestBall.num} first!`; }
    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }

    if (!foul && ninePocketed) {
      winner = state.currentPlayer;
    }
    if (!foul && pocketed.filter(p => p.ball.num !== 0).length > 0) {
      scored = true; switchTurn = false;
    }

  } else if (mode === 'sevenball') {
    const lowestBall = state.balls.filter(b => b.num >= 1 && b.num <= 7 && b.active && !b.pocketed).sort((a,b) => a.num - b.num)[0];
    const sevenPocketed = pocketed.find(p => p.ball.num === 7);

    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    else if (lowestBall && fh.num !== lowestBall.num) { foul = true; foulMsg = `Must hit ${lowestBall.num} first!`; }
    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }

    if (!foul && sevenPocketed) winner = state.currentPlayer;
    if (!foul && pocketed.filter(p => p.ball.num !== 0).length > 0) { scored = true; switchTurn = false; }

  } else if (mode === 'straightpool') {
    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }

    if (!foul) {
      const pts = pocketed.filter(p => p.ball.num !== 0).length;
      if (pts > 0) {
        state.straightPoolScores[state.currentPlayer] += pts;
        scored = true; switchTurn = false;
        if (state.straightPoolScores[state.currentPlayer] >= state.straightPoolTarget) {
          winner = state.currentPlayer;
        }
        // Re-rack if only cue ball left
        const remaining = state.balls.filter(b => b.active && !b.pocketed && b.num !== 0);
        if (remaining.length === 0) rerackStraightPool();
      }
    } else {
      state.straightPoolScores[state.currentPlayer] = Math.max(0, state.straightPoolScores[state.currentPlayer] - 1);
    }

  } else if (mode === 'onepocket') {
    // Player 0 = pocket 3 (bottom-left), Player 1 = pocket 5 (bottom-right)
    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }

    if (!foul) {
      pocketed.forEach(p => {
        if (p.ball.num === 0) return;
        const pocketIdx = state.pockets.indexOf(p.pocket);
        if (pocketIdx === 3) { state.onePocketScores[0]++; if (state.currentPlayer === 0) { scored = true; } }
        else if (pocketIdx === 5) { state.onePocketScores[1]++; if (state.currentPlayer === 1) { scored = true; } }
        else {
          // Wrong pocket — re-spot
          p.ball.active = true; p.ball.pocketed = false;
          p.ball.x = W * 0.5; p.ball.y = H * 0.5;
          p.ball.vx = 0; p.ball.vy = 0;
        }
      });
      if (scored) switchTurn = false;
      if (state.onePocketScores[0] >= 8) winner = 0;
      else if (state.onePocketScores[1] >= 8) winner = 1;
    }

  } else if (mode === 'bankpool') {
    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    if (cueScratch) { foul = true; foulMsg = 'Scratch!'; }
    // Simplified: count pockets
    if (!foul) {
      const pts = pocketed.filter(p => p.ball.num !== 0).length;
      if (pts > 0) {
        state.scores[state.currentPlayer] += pts;
        scored = true; switchTurn = false;
        if (state.scores[state.currentPlayer] >= 5) winner = state.currentPlayer;
      }
    }

  } else if (mode === 'snooker') {
    if (!fh) { foul = true; foulMsg = 'No contact!'; }
    if (cueScratch) { foul = true; foulMsg = 'In-off!'; }

    const snookerPocketedBalls = pocketed.filter(p => p.ball.num !== 0);

    if (!foul) {
      snookerPocketedBalls.forEach(p => {
        const num = p.ball.num;
        let pts = 0;
        if (num === 16) pts = 1; // red
        else if (num === 17) pts = 2; // yellow
        else if (num === 18) pts = 3; // green
        else if (num === 19) pts = 4; // brown
        else if (num === 20) pts = 5; // blue
        else if (num === 21) pts = 6; // pink
        else if (num === 22) pts = 7; // black

        state.scores[state.currentPlayer] += pts;

        if (num === 16) {
          state.snookerRedPotted = true;
        } else if (num !== 16) {
          // Re-spot colors while reds remain
          const redsLeft = state.balls.filter(b => b.num === 16 && b.active && !b.pocketed);
          if (redsLeft.length > 0) {
            p.ball.active = true; p.ball.pocketed = false;
            p.ball.x = W * 0.7; p.ball.y = H / 2;
            p.ball.vx = 0; p.ball.vy = 0;
          }
          state.snookerRedPotted = false;
        }
        scored = true; switchTurn = false;
      });

      // Check if all balls potted
      const remainingBalls = state.balls.filter(b => b.num !== 0 && b.active && !b.pocketed);
      if (remainingBalls.length === 0) {
        winner = state.scores[0] > state.scores[1] ? 0 : 1;
      }
    } else {
      // Foul points to opponent
      state.scores[1 - state.currentPlayer] += 4;
    }
  }

  // Handle foul
  if (foul) {
    state.consecutiveFouls[state.currentPlayer]++;
    state.foulActive = true;
    showFoulMsg(foulMsg);
    if (cueScratch || foul) {
      state.ballInHand = true;
      state.placingBall = true;
      if (cueScratch) {
        state.cueBall.active = true;
        state.cueBall.pocketed = false;
        state.cueBall.x = W * 0.27;
        state.cueBall.y = H / 2;
        state.cueBall.vx = 0; state.cueBall.vy = 0;
      }
    }
    switchTurn = true;
  } else {
    state.consecutiveFouls[state.currentPlayer] = 0;
    state.foulActive = false;
  }

  // Three consecutive fouls (9-ball)
  if (state.mode === 'nineball' && state.consecutiveFouls[state.currentPlayer] >= 3) {
    winner = 1 - state.currentPlayer;
  }

  if (winner !== null && winner !== undefined) {
    setTimeout(() => endGame(winner), 600);
    return;
  }

  if (switchTurn) {
    state.currentPlayer = 1 - state.currentPlayer;
  }

  state.ballsPocketed = [];
  state.firstHitBall = null;
  updateHUD();
  updateBallRacks();

  if (state.gameMode === 'ai' && state.currentPlayer === 1 && !state.gameOver) {
    setTimeout(doAIShot, 1200);
  }
}

function rerackStraightPool() {
  const rackX = W * 0.72;
  const rackY = H / 2;
  const r = BALL_RADIUS * 2.04;
  const nums = [1,9,2,10,3,11,4,12,5,13,6,14,7,15,8];
  let i = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const bx = rackX + row * r * Math.cos(Math.PI/6);
      const by = rackY + (col - row/2) * r;
      const ball = makeBall(nums[i++], bx, by);
      state.balls.push(ball);
    }
  }
}

// ── Shooting ───────────────────────────────────────────────────
function shoot(angle, power) {
  if (state.gameOver) return;
  const speed = power * MAX_POWER;
  state.cueBall.vx = Math.cos(angle) * speed;
  state.cueBall.vy = Math.sin(angle) * speed;
  state.ballsMoving = true;
  state.shooting = false;
  state.firstHitBall = null;
  state.ballsPocketed = [];
  playSound('cue');
}

// ── AI ─────────────────────────────────────────────────────────
function doAIShot() {
  if (state.gameOver || state.ballsMoving) return;
  const diff = state.aiDifficulty;

  // Find best target ball
  const targetBalls = getAITargetBalls();
  if (targetBalls.length === 0) {
    // Just hit the cue ball in a random direction
    shoot(Math.random() * Math.PI * 2, 0.4);
    return;
  }

  let bestShot = null;
  let bestScore = -Infinity;

  targetBalls.forEach(target => {
    state.pockets.forEach(pocket => {
      // Direction from target to pocket
      const toPocket = { x: pocket.x - target.x, y: pocket.y - target.y };
      const toPocketLen = Math.hypot(toPocket.x, toPocket.y);
      const toPocketN = { x: toPocket.x / toPocketLen, y: toPocket.y / toPocketLen };
      // Ghost ball position
      const ghostX = target.x - toPocketN.x * BALL_RADIUS * 2;
      const ghostY = target.y - toPocketN.y * BALL_RADIUS * 2;
      // Direction from cue ball to ghost
      const toCue = { x: ghostX - state.cueBall.x, y: ghostY - state.cueBall.y };
      const toCueLen = Math.hypot(toCue.x, toCue.y);
      if (toCueLen < 1) return;
      const angle = Math.atan2(toCue.y, toCue.x);

      // Score based on proximity
      const distScore = 1 / (1 + toPocketLen / 100);
      const cueDistScore = 1 / (1 + toCueLen / 100);
      const score = distScore + cueDistScore * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestShot = { angle, target, pocket, ghostX, ghostY };
      }
    });
  });

  if (!bestShot) {
    shoot(Math.random() * Math.PI * 2, 0.3);
    return;
  }

  // Add noise based on difficulty
  let noise = 0;
  if (diff === 'easy') noise = (Math.random() - 0.5) * 0.6;
  else if (diff === 'medium') noise = (Math.random() - 0.5) * 0.2;
  else noise = (Math.random() - 0.5) * 0.06;

  const finalAngle = bestShot.angle + noise;
  const power = diff === 'easy' ? 0.35 + Math.random() * 0.3
    : diff === 'medium' ? 0.45 + Math.random() * 0.25
    : 0.55 + Math.random() * 0.2;

  shoot(finalAngle, power);
}

function getAITargetBalls() {
  const mode = state.mode;
  const player = 1; // AI is always player 2 (index 1)
  let balls = [];

  if (mode === 'eightball' || mode === 'blackball') {
    const myGroup = state.playerGroups[player];
    if (!myGroup) {
      balls = state.balls.filter(b => b.num >= 1 && b.num <= 15 && b.num !== 8 && b.active && !b.pocketed);
    } else if (myGroup === 'solids') {
      balls = state.balls.filter(b => b.num >= 1 && b.num <= 7 && b.active && !b.pocketed);
      if (balls.length === 0) balls = state.balls.filter(b => b.num === 8 && b.active && !b.pocketed);
    } else {
      balls = state.balls.filter(b => b.num >= 9 && b.num <= 15 && b.active && !b.pocketed);
      if (balls.length === 0) balls = state.balls.filter(b => b.num === 8 && b.active && !b.pocketed);
    }
  } else if (mode === 'nineball' || mode === 'tenball' || mode === 'sevenball') {
    const maxNum = mode === 'nineball' ? 9 : mode === 'tenball' ? 10 : 7;
    const lowestBall = state.balls.filter(b => b.num >= 1 && b.num <= maxNum && b.active && !b.pocketed).sort((a,b) => a.num - b.num)[0];
    if (lowestBall) balls = [lowestBall];
  } else if (mode === 'snooker') {
    balls = state.balls.filter(b => b.num === 16 && b.active && !b.pocketed);
    if (balls.length === 0) balls = state.balls.filter(b => b.num >= 17 && b.active && !b.pocketed);
  } else {
    balls = state.balls.filter(b => b.num !== 0 && b.active && !b.pocketed);
  }

  return balls;
}

// ── Drawing ────────────────────────────────────────────────────
function drawTable() {
  // Table bed (felt)
  const grd = ctx.createLinearGradient(CUSHION, CUSHION, W - CUSHION, H - CUSHION);
  grd.addColorStop(0, '#1e5a34');
  grd.addColorStop(0.5, '#1a4a2e');
  grd.addColorStop(1, '#163d24');
  ctx.fillStyle = grd;
  ctx.fillRect(CUSHION, CUSHION, W - CUSHION*2, H - CUSHION*2);

  // Felt texture lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let y = CUSHION; y < H - CUSHION; y += 8) {
    ctx.beginPath(); ctx.moveTo(CUSHION, y); ctx.lineTo(W - CUSHION, y); ctx.stroke();
  }
  ctx.restore();

  // Center line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(W/2, CUSHION); ctx.lineTo(W/2, H - CUSHION); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Head string (baulk line)
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.25, CUSHION); ctx.lineTo(W * 0.25, H - CUSHION); ctx.stroke();
  ctx.restore();

  // Spots
  drawSpot(W * 0.25, H/2); // head spot
  drawSpot(W * 0.5,  H/2);  // center spot
  drawSpot(W * 0.75, H/2);  // foot spot

  // Cushions
  drawCushions();

  // Pockets
  state.pockets.forEach(p => drawPocket(p));

  // One Pocket — highlight target pockets
  if (state.mode === 'onepocket') {
    const colors = ['rgba(100,180,255,0.4)', 'rgba(255,120,80,0.4)'];
    [3, 5].forEach((pi, i) => {
      const p = state.pockets[pi];
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_RADIUS + 5, 0, Math.PI * 2);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });
  }
}

function drawSpot(x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCushions() {
  ctx.save();
  const cColor = '#3d1f0a';
  const cLight = '#5a3010';
  // Top
  const tg = ctx.createLinearGradient(0, 0, 0, CUSHION);
  tg.addColorStop(0, '#2a1206'); tg.addColorStop(1, cLight);
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, CUSHION);
  // Bottom
  const bg = ctx.createLinearGradient(0, H - CUSHION, 0, H);
  bg.addColorStop(0, cLight); bg.addColorStop(1, '#2a1206');
  ctx.fillStyle = bg; ctx.fillRect(0, H - CUSHION, W, CUSHION);
  // Left
  const lg = ctx.createLinearGradient(0, 0, CUSHION, 0);
  lg.addColorStop(0, '#2a1206'); lg.addColorStop(1, cLight);
  ctx.fillStyle = lg; ctx.fillRect(0, 0, CUSHION, H);
  // Right
  const rg = ctx.createLinearGradient(W - CUSHION, 0, W, 0);
  rg.addColorStop(0, cLight); rg.addColorStop(1, '#2a1206');
  ctx.fillStyle = rg; ctx.fillRect(W - CUSHION, 0, CUSHION, H);

  // Gold border
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2;
  ctx.strokeRect(CUSHION, CUSHION, W - CUSHION*2, H - CUSHION*2);

  // Outer border
  ctx.strokeStyle = '#7a6030';
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Diamonds (dots on rails)
  ctx.fillStyle = 'rgba(201,168,76,0.5)';
  const dSpacingX = (W - CUSHION*2) / 8;
  const dSpacingY = (H - CUSHION*2) / 4;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath(); ctx.arc(CUSHION + i*dSpacingX, CUSHION/2, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(CUSHION + i*dSpacingX, H - CUSHION/2, 3, 0, Math.PI*2); ctx.fill();
  }
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.arc(CUSHION/2, CUSHION + i*dSpacingY, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - CUSHION/2, CUSHION + i*dSpacingY, 3, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawPocket(p) {
  ctx.save();
  const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, POCKET_RADIUS);
  grd.addColorStop(0, '#000');
  grd.addColorStop(0.7, '#0a0a0a');
  grd.addColorStop(1, '#111');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawBall(b) {
  if (!b.active || b.pocketed) return;
  ctx.save();
  const r = b.radius;

  // Shadow
  ctx.beginPath();
  ctx.arc(b.x + 2, b.y + 3, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  if (b.stripe) {
    // White base
    const bg = ctx.createRadialGradient(b.x - r*0.3, b.y - r*0.3, 0, b.x, b.y, r);
    bg.addColorStop(0, '#f8f4ec');
    bg.addColorStop(0.6, '#e8e0cc');
    bg.addColorStop(1, '#c8c0b0');
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();

    // Stripe band
    ctx.save();
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - r, b.y - r * 0.4, r * 2, r * 0.8);
    ctx.restore();
  } else if (b.num === 0) {
    // Cue ball
    const grd = ctx.createRadialGradient(b.x - r*0.35, b.y - r*0.35, r*0.1, b.x, b.y, r);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.4, '#f4f0e8');
    grd.addColorStop(0.8, '#ddd8cc');
    grd.addColorStop(1, '#b8b0a0');
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();
  } else {
    // Solid
    const grd = ctx.createRadialGradient(b.x - r*0.3, b.y - r*0.3, r*0.05, b.x, b.y, r);
    const lighterColor = lightenColor(b.color, 40);
    grd.addColorStop(0, lighterColor);
    grd.addColorStop(0.5, b.color);
    grd.addColorStop(1, darkenColor(b.color, 40));
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();
  }

  // Ball outline
  ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.7; ctx.stroke();

  // Number circle (white dot for solids/stripes)
  if (b.num > 0) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `bold ${r * 0.55}px Rajdhani,sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.num <= 22 ? b.num : '', b.x, b.y + 0.5);
  }

  // Specular highlight
  ctx.beginPath();
  ctx.arc(b.x - r*0.28, b.y - r*0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.restore();
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function drawAimLine() {
  if (state.ballsMoving || state.placingBall) return;
  if (state.gameMode === 'ai' && state.currentPlayer === 1) return;

  const cue = state.cueBall;
  if (!cue || !cue.active) return;

  const mx = state.mousePos.x;
  const my = state.mousePos.y;
  const angle = Math.atan2(my - cue.y, mx - cue.x);
  state.aimAngle = angle;

  // Aim line
  const lineLen = 300;
  const endX = cue.x + Math.cos(angle) * lineLen;
  const endY = cue.y + Math.sin(angle) * lineLen;

  ctx.save();
  ctx.strokeStyle = 'rgba(201,168,76,0.55)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(cue.x, cue.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ghost ball
  const ghostX = cue.x + Math.cos(angle) * (BALL_RADIUS * 2 + 2);
  const ghostY = cue.y + Math.sin(angle) * (BALL_RADIUS * 2 + 2);
  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(ghostX, ghostY, BALL_RADIUS, 0, Math.PI * 2); ctx.stroke();

  // Cue stick
  if (state.isCharging) {
    const cueLen = 160;
    const pullback = state.power * 30;
    const cueStart = { x: cue.x - Math.cos(angle) * (BALL_RADIUS + pullback), y: cue.y - Math.sin(angle) * (BALL_RADIUS + pullback) };
    const cueEnd = { x: cueStart.x - Math.cos(angle) * cueLen, y: cueStart.y - Math.sin(angle) * cueLen };

    const cueGrd = ctx.createLinearGradient(cueStart.x, cueStart.y, cueEnd.x, cueEnd.y);
    cueGrd.addColorStop(0, '#c9a84c');
    cueGrd.addColorStop(0.2, '#d4b060');
    cueGrd.addColorStop(0.7, '#8B5E1A');
    cueGrd.addColorStop(1, '#5a3010');

    ctx.strokeStyle = cueGrd;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cueStart.x, cueStart.y);
    ctx.lineTo(cueEnd.x, cueEnd.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPlacingIndicator() {
  if (!state.placingBall) return;
  const mx = state.mousePos.x;
  const my = state.mousePos.y;
  ctx.save();
  ctx.strokeStyle = 'rgba(100,200,255,0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.arc(mx, my, BALL_RADIUS, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ── Game Loop ──────────────────────────────────────────────────
function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawTable();

  if (state.ballsMoving) {
    const stillMoving = physicsStep();
    if (!stillMoving) {
      // FIX: Re-check with a stricter zero-velocity test before declaring stopped.
      // physicsStep returns false when no ball exceeded MIN_SPEED this frame,
      // but we must confirm ALL balls are truly at rest to avoid premature
      // processShotResult calls on the same frame a ball just stopped.
      const anyStillMoving = state.balls.some(
        b => b.active && !b.pocketed && (Math.abs(b.vx) > 0 || Math.abs(b.vy) > 0)
      );
      if (!anyStillMoving) {
        state.ballsMoving = false;
        if (!state.gameOver) {
          processShotResult();
        }
      }
    }
  }

  state.balls.forEach(b => drawBall(b));
  drawAimLine();
  drawPlacingIndicator();

  // Update power meter
  if (state.isCharging) {
    document.getElementById('powerFill').style.width = (state.power * 100) + '%';
  }

  state.animFrame = requestAnimationFrame(gameLoop);
}

// ── HUD Updates ────────────────────────────────────────────────
function updateHUD() {
  const mode = state.mode;
  const names = ['Player 1', state.gameMode === 'ai' ? 'AI' : 'Player 2'];

  document.getElementById('modeBadge').textContent = RULES_DB[mode]?.title || mode;
  document.getElementById('turnIndicator').textContent = names[state.currentPlayer] + "'s Turn";
  document.getElementById('p2Name').textContent = names[1];

  // Score display
  let scoreText = '';
  if (mode === 'straightpool') {
    scoreText = `P1: ${state.straightPoolScores[0]}  ·  P2: ${state.straightPoolScores[1]}  (Target: ${state.straightPoolTarget})`;
  } else if (mode === 'onepocket') {
    scoreText = `P1: ${state.onePocketScores[0]}/8  ·  P2: ${state.onePocketScores[1]}/8`;
  } else if (mode === 'snooker') {
    scoreText = `P1: ${state.scores[0]}  ·  P2: ${state.scores[1]}`;
  } else if (mode === 'bankpool') {
    scoreText = `P1: ${state.scores[0]}/5  ·  P2: ${state.scores[1]}/5`;
  }
  document.getElementById('scoreDisplay').textContent = scoreText;

  // Player group labels
  const groups = state.playerGroups;
  const p1Type = groups[0] ? (groups[0] === 'solids' ? '● Solids' : '◑ Stripes') : '—';
  const p2Type = groups[1] ? (groups[1] === 'solids' ? '● Solids' : '◑ Stripes') : '—';
  document.getElementById('p1Type').textContent = p1Type;
  document.getElementById('p2Type').textContent = p2Type;

  // Active player highlight
  document.getElementById('p1Panel').classList.toggle('active', state.currentPlayer === 0);
  document.getElementById('p2Panel').classList.toggle('active', state.currentPlayer === 1);

  document.getElementById('statusMsg').textContent = state.placingBall
    ? 'Click to place cue ball'
    : (state.ballsMoving ? 'Balls in motion...' : 'Aim and shoot!');
}

function updateBallRacks() {
  const p1Rack = document.getElementById('p1Balls');
  const p2Rack = document.getElementById('p2BallsRight');
  p1Rack.innerHTML = '';
  p2Rack.innerHTML = '';

  const mode = state.mode;
  if (mode === 'eightball' || mode === 'blackball') {
    const g1 = state.playerGroups[0];
    const g2 = state.playerGroups[1];
    if (g1) {
      const remaining = state.balls.filter(b => {
        if (g1 === 'solids') return b.num >= 1 && b.num <= 7 && b.active && !b.pocketed;
        return b.num >= 9 && b.num <= 15 && b.active && !b.pocketed;
      });
      remaining.forEach(b => {
        const el = document.createElement('div');
        el.className = 'mini-ball';
        el.style.background = b.color;
        p1Rack.appendChild(el);
      });
    }
    if (g2) {
      const remaining = state.balls.filter(b => {
        if (g2 === 'solids') return b.num >= 1 && b.num <= 7 && b.active && !b.pocketed;
        return b.num >= 9 && b.num <= 15 && b.active && !b.pocketed;
      });
      remaining.forEach(b => {
        const el = document.createElement('div');
        el.className = 'mini-ball';
        el.style.background = b.color;
        p2Rack.appendChild(el);
      });
    }
  }
}

function showFoulMsg(msg) {
  const el = document.getElementById('foulMsg');
  el.textContent = msg;
  setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000);
}

// ── Game Over ──────────────────────────────────────────────────
function endGame(winner) {
  state.gameOver = true;
  if (state.animFrame) { cancelAnimationFrame(state.animFrame); state.animFrame = null; }
  playSound('win');

  const names = ['Player 1', state.gameMode === 'ai' ? 'AI' : 'Player 2'];
  document.getElementById('winnerText').textContent = names[winner] + ' Wins!';

  let sub = '';
  const mode = state.mode;
  if (mode === 'eightball') sub = 'Pocketed the 8-ball correctly.';
  else if (mode === 'nineball') sub = 'Pocketed the 9-ball legally.';
  else if (mode === 'tenball') sub = 'Pocketed the 10-ball legally.';
  else if (mode === 'sevenball') sub = 'Pocketed the 7-ball to win.';
  else if (mode === 'blackball') sub = 'Pocketed the black ball to win.';
  else if (mode === 'straightpool') sub = `Reached ${state.straightPoolTarget} points first.`;
  else if (mode === 'onepocket') sub = 'Pocketed 8 balls in their pocket.';
  else if (mode === 'bankpool') sub = 'Banked 5 balls to win.';
  else if (mode === 'snooker') sub = `Won the frame. Score: ${state.scores[0]} – ${state.scores[1]}`;
  document.getElementById('gameOverSub').textContent = sub;

  let scoreText = '';
  if (mode === 'snooker') scoreText = `${state.scores[0]} – ${state.scores[1]}`;
  else if (mode === 'straightpool') scoreText = `${state.straightPoolScores[0]} – ${state.straightPoolScores[1]}`;
  document.getElementById('gameOverScore').textContent = scoreText;

  showScreen('gameOverScreen');
}

// ── Screen Management ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Rules Modal ────────────────────────────────────────────────
let currentModalTab = 'rules';

function openRules(mode) {
  const data = RULES_DB[mode] || RULES_DB.eightball;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalSub').textContent = data.sub;
  document.getElementById('modalTitleIcon').textContent = data.icon;
  currentModalTab = 'rules';
  renderModalTab(data, 'rules');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'rules'));
  document.getElementById('rulesModal').classList.add('active');
}

function renderModalTab(data, tab) {
  const body = document.getElementById('modalBody');
  body.innerHTML = '';
  if (tab === 'rules') {
    data.rules.forEach(r => {
      const sec = document.createElement('div');
      sec.className = 'rules-section';
      sec.innerHTML = `<h3>${r.h}</h3><p>${r.p}</p>`;
      body.appendChild(sec);
    });
  } else if (tab === 'tips') {
    const tips = data.tips || [];
    if (tips.length === 0) {
      body.innerHTML = '<p style="color:var(--text-dim);font-size:13px">No specific tips available for this mode.</p>';
      return;
    }
    tips.forEach(t => {
      const el = document.createElement('div');
      el.className = 'tip-item';
      el.innerHTML = `<div class="tip-item-icon">${t.icon}</div><div class="tip-item-text"><strong>${t.title}</strong>${t.text}</div>`;
      body.appendChild(el);
    });
  } else if (tab === 'fouls') {
    const fouls = data.fouls || [];
    if (fouls.length === 0) {
      body.innerHTML = '<p style="color:var(--text-dim);font-size:13px">No foul information available.</p>';
      return;
    }
    fouls.forEach(f => {
      const el = document.createElement('div');
      el.className = 'foul-item';
      el.innerHTML = `<strong>${f.title}</strong>${f.text}`;
      body.appendChild(el);
    });
  }
}

// ── Tip Panel ──────────────────────────────────────────────────
let tipIndex = 0;
function rotateTips() {
  if (state.tipRotateInterval) clearInterval(state.tipRotateInterval);
  const el = document.getElementById('tipText');
  const showTip = () => {
    el.classList.add('fade');
    setTimeout(() => {
      tipIndex = (tipIndex + 1) % GAME_TIPS.length;
      el.textContent = GAME_TIPS[tipIndex];
      el.classList.remove('fade');
    }, 500);
  };
  state.tipRotateInterval = setInterval(showTip, 6000);
}

// ── Input helpers ──────────────────────────────────────────────
// All canvas event listeners are registered in DOMContentLoaded below.

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  // getBoundingClientRect returns the visual (CSS-transformed) rect.
  // Divide by visual size, multiply by actual canvas pixel size to get
  // correct canvas-space coordinates regardless of CSS scaling/rotation.
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.changedTouches ? e.changedTouches[0].clientX
                : e.touches       ? e.touches[0].clientX
                : e.clientX;
  const clientY = e.changedTouches ? e.changedTouches[0].clientY
                : e.touches       ? e.touches[0].clientY
                : e.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top)  * scaleY,
  };
}

function canShoot() {
  return !state.ballsMoving && !state.gameOver && !state.placingBall
    && !(state.gameMode === 'ai' && state.currentPlayer === 1);
}

function isValidPlacement(pos) {
  const minX = CUSHION + BALL_RADIUS + 2;
  const maxX = W - CUSHION - BALL_RADIUS - 2;
  const minY = CUSHION + BALL_RADIUS + 2;
  const maxY = H - CUSHION - BALL_RADIUS - 2;
  if (pos.x < minX || pos.x > maxX || pos.y < minY || pos.y > maxY) return false;
  for (const b of state.balls) {
    if (b === state.cueBall || !b.active || b.pocketed) continue;
    if (dist(pos, b) < BALL_RADIUS * 2 + 2) return false;
  }
  return true;
}

// ── Button Bindings ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Assign canvas FIRST so all listeners below have a valid reference
  canvas = document.getElementById('poolCanvas');
  ctx = canvas.getContext('2d');

  // ── Canvas input listeners ──────────────────────────────────
  canvas.addEventListener('mousemove', e => {
    const pos = getCanvasPos(e);
    state.mousePos = pos;
    if (state.isCharging && state.cueBall) {
      const d = dist(pos, { x: state.cueBall.x, y: state.cueBall.y });
      state.power = clamp(d / 180, 0, 1);
      document.getElementById('powerFill').style.width = (state.power * 100) + '%';
    }
  });

  canvas.addEventListener('mousedown', e => {
    const pos = getCanvasPos(e);
    state.mousePos = pos;
    // Handle ball-in-hand placement immediately on mousedown
    if (state.placingBall) {
      if (isValidPlacement(pos)) {
        state.cueBall.x = pos.x;
        state.cueBall.y = pos.y;
        state.cueBall.vx = 0;
        state.cueBall.vy = 0;
        state.cueBall.active = true;
        state.cueBall.pocketed = false;
        state.placingBall = false;
        state.ballInHand = false;
        updateHUD();
      }
      return;
    }
    if (!canShoot()) return;
    const cue = state.cueBall;
    if (!cue || !cue.active) return;
    state.isCharging = true;
    state.dragStart = pos;
    canvas.classList.add('aiming');
  });

  canvas.addEventListener('mouseup', e => {
    const pos = getCanvasPos(e);
    if (state.placingBall) return;
    if (!state.isCharging) return;
    state.isCharging = false;
    canvas.classList.remove('aiming');
    if (!canShoot()) return;
    const cue = state.cueBall;
    if (!cue || !cue.active) return;
    const angle = Math.atan2(pos.y - cue.y, pos.x - cue.x);
    const power  = clamp(state.power, 0.05, 1);
    shoot(angle, power);
    state.power = 0;
    document.getElementById('powerFill').style.width = '0%';
  });

  // Touch → mouse event mapping
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }));
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }));
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY }));
  }, { passive: false });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
    });
  });

  // Start buttons
  document.getElementById('btn2Player').addEventListener('click', () => {
    initGame(state.mode, '2player');
  });
  document.getElementById('btnVsAI').addEventListener('click', () => {
    initGame(state.mode, 'ai');
  });

  // Rules from start screen
  document.getElementById('btnRules').addEventListener('click', () => {
    openRules(state.mode);
  });

  // Rules from game screen
  document.getElementById('btnRulesGame').addEventListener('click', () => {
    openRules(state.mode);
  });

  // Menu button
  document.getElementById('btnMenu').addEventListener('click', () => {
    if (state.animFrame) { cancelAnimationFrame(state.animFrame); state.animFrame = null; }
    if (state.tipRotateInterval) { clearInterval(state.tipRotateInterval); }
    showScreen('startScreen');
  });

  // Play again
  document.getElementById('btnPlayAgain').addEventListener('click', () => {
    initGame(state.mode, state.gameMode);
  });
  document.getElementById('btnMainMenu').addEventListener('click', () => {
    if (state.animFrame) { cancelAnimationFrame(state.animFrame); state.animFrame = null; }
    showScreen('startScreen');
  });

  // Rules modal close
  document.getElementById('rulesClose').addEventListener('click', () => {
    document.getElementById('rulesModal').classList.remove('active');
  });
  document.getElementById('rulesModal').addEventListener('click', e => {
    if (e.target === document.getElementById('rulesModal')) {
      document.getElementById('rulesModal').classList.remove('active');
    }
  });

  // Modal tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const data = RULES_DB[state.mode] || RULES_DB.eightball;
      renderModalTab(data, btn.dataset.tab);
    });
  });

  // Sound toggle (start screen)
  const soundBtn = document.getElementById('soundToggle');
  soundBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    soundBtn.textContent = state.soundOn ? '🔊 Sound ON' : '🔇 Sound OFF';
  });

  // Sound toggle (game screen)
  const soundGameBtn = document.getElementById('btnSoundGame');
  soundGameBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    soundGameBtn.textContent = state.soundOn ? '🔊' : '🔇';
  });

  // Window resize — FIX: capture old dimensions BEFORE setupTable() overwrites W/H
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    // Debounce resize to avoid thrashing during drag-resize
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (document.getElementById('gameScreen').classList.contains('active') && !state.gameOver) {
        // Capture BEFORE setupTable changes W/H
        const oldW = W;
        const oldH = H;
        const savedBalls = state.balls.map(b => ({ ...b }));
        setupTable();
        const scaleX = W / oldW;
        const scaleY = H / oldH;
        // FIX: scale pocket positions too — they're recalculated by setupTable so this
        // is handled, but ball positions need explicit rescaling
        state.balls = savedBalls.map(b => ({
          ...b,
          x: b.x * scaleX,
          y: b.y * scaleY,
        }));
        state.cueBall = state.balls.find(b => b.num === 0);
      }
    }, 80);
  });
});