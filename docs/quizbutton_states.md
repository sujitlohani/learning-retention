<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Quiz Button States — Memora</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── BRAND TOKENS ── */
  :root {
    --radius-sm: 6px;
    --radius-md: 8px;
    --shadow-resting: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
    --shadow-raised:  0 4px 12px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06);
    --t-fast: 120ms;
    --t-base: 150ms;
  }

  [data-theme="light"] {
    --bg-base:    #F7F7FC;
    --bg-surface: #FFFFFF;
    --bg-raised:  #EFEFF8;
    --accent:     #514DD9;
    --accent-light:#EAE9FF;
    --border:     #E0DFF5;
    --text-primary:#111020;
    --text-muted:  #6B6A85;
    --success:    #16A34A;
    --warning:    #CA8A04;
    --danger:     #DC2626;
  }

  [data-theme="dark"] {
    --bg-base:    #0E0E16;
    --bg-surface: #16161F;
    --bg-raised:  #1E1E2A;
    --accent:     #6860F0;
    --accent-light:#1C1B33;
    --border:     #28283A;
    --text-primary:#EEEDF8;
    --text-muted:  #72728A;
    --success:    #4ADE80;
    --warning:    #FACC15;
    --danger:     #F87171;
  }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: #1a1a24;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 48px 24px;
    min-height: 100vh;
  }

  /* ── MODE TOGGLE ── */
  .toggle-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toggle-btn {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 18px;
    border-radius: var(--radius-md);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all var(--t-base);
  }

  .toggle-btn.active-light {
    background: #FFFFFF;
    color: #111020;
    border-color: #E0DFF5;
  }

  .toggle-btn.active-dark {
    background: #16161F;
    color: #EEEDF8;
    border-color: #28283A;
  }

  .toggle-btn.inactive {
    background: transparent;
    color: #72728A;
    border-color: #28283A;
  }

  /* ── PANEL ── */
  .panel {
    background: var(--bg-base);
    border-radius: 16px;
    padding: 36px 40px;
    width: 100%;
    max-width: 560px;
    box-shadow: var(--shadow-raised);
  }

  .panel-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  .states-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .state-cell {
    background: var(--bg-surface);
    padding: 24px 20px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .state-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  /* ── BUTTON PAIR ── */
  .btn-pair {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 20px; /* room for new-tag */
  }

  /* START */
  .btn-start {
    position: relative;
    background: var(--accent);
    color: #fff;
    border: 1.5px solid transparent;
    border-radius: var(--radius-md);
    padding: 8px 20px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
    box-shadow: var(--shadow-resting);
    white-space: nowrap;
  }

  .btn-start:hover {
    filter: brightness(1.1);
    box-shadow: var(--shadow-raised);
    transform: translateY(-1px);
  }

  .btn-start:active { transform: translateY(0); }

  /* new tag */
  .new-tag {
    position: absolute;
    bottom: -17px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--success);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 200ms;
    pointer-events: none;
  }

  /* rolled state */
  .btn-start.rolled {
    background: var(--bg-raised);
    border-color: var(--accent);
    color: var(--accent);
    box-shadow: none;
  }

  .btn-start.rolled .new-tag { opacity: 1; }

  /* DICE */
  .btn-dice {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    background: var(--bg-raised);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color var(--t-fast), color var(--t-fast), transform var(--t-fast);
  }

  .btn-dice:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn-dice:hover::after {
    content: 'Roll to regen';
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-raised);
    border: 1px solid var(--border);
    color: var(--text-primary);
    font-size: 10px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    box-shadow: var(--shadow-resting);
    pointer-events: none;
    z-index: 10;
  }

  /* rolled state */
  .btn-dice.rolled {
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn-dice.rolling svg {
    animation: spin 0.55s cubic-bezier(0.36,0.07,0.19,0.97);
  }

  @keyframes spin {
    0%   { transform: rotate(0deg) scale(1); }
    25%  { transform: rotate(90deg) scale(1.18); }
    50%  { transform: rotate(180deg) scale(0.88); }
    75%  { transform: rotate(270deg) scale(1.12); }
    100% { transform: rotate(360deg) scale(1); }
  }

  /* ── LIVE DEMO ── */
  .live-demo {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px 20px 28px;
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .live-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  .live-hint {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 8px;
  }

  /* DICE SVG */
  .dice-icon { display: block; }
</style>
</head>
<body>

<!-- Theme toggle -->
<div class="toggle-row">
  <button class="toggle-btn active-dark" id="btnDark" onclick="setTheme('dark')">Dark</button>
  <button class="toggle-btn inactive"    id="btnLight" onclick="setTheme('light')">Light</button>
</div>

<!-- Panel -->
<div class="panel" data-theme="dark" id="mainPanel">

  <div class="panel-title">Quiz Button States</div>

  <div class="states-grid">

    <!-- Default -->
    <div class="state-cell">
      <div class="state-label">Default</div>
      <div class="btn-pair">
        <button class="btn-start" style="pointer-events:none">
          Start
          <span class="new-tag">● new set</span>
        </button>
        <button class="btn-dice" style="pointer-events:none">
          <svg class="dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="4"/>
            <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Hover on dice -->
    <div class="state-cell">
      <div class="state-label">Dice hover</div>
      <div class="btn-pair" style="padding-top:24px;">
        <button class="btn-start" style="pointer-events:none">
          Start
          <span class="new-tag">● new set</span>
        </button>
        <!-- Simulated hover -->
        <div style="position:relative; flex-shrink:0;">
          <button class="btn-dice" style="pointer-events:none; border-color:var(--accent); color:var(--accent);">
            <svg class="dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="4"/>
              <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
              <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
              <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
            </svg>
          </button>
          <div style="position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--bg-raised);border:1px solid var(--border);color:var(--text-primary);font-size:10px;font-weight:500;padding:4px 8px;border-radius:var(--radius-sm);white-space:nowrap;box-shadow:var(--shadow-resting);">Roll to regen</div>
        </div>
      </div>
    </div>

    <!-- Rolling -->
    <div class="state-cell">
      <div class="state-label">Rolling…</div>
      <div class="btn-pair">
        <button class="btn-start" style="pointer-events:none">
          Start
          <span class="new-tag">● new set</span>
        </button>
        <button class="btn-dice rolled" id="staticRolling" style="pointer-events:none;">
          <svg class="dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1.2s cubic-bezier(0.36,0.07,0.19,0.97) infinite;">
            <rect x="2" y="2" width="20" height="20" rx="4"/>
            <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Rolled / New Set Ready -->
    <div class="state-cell">
      <div class="state-label">New set ready</div>
      <div class="btn-pair">
        <button class="btn-start rolled" style="pointer-events:none">
          Start
          <span class="new-tag">● new set</span>
        </button>
        <button class="btn-dice rolled" style="pointer-events:none;">
          <svg class="dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="4"/>
            <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>

  </div>

  <!-- Live interactive demo -->
  <div class="live-demo">
    <div class="live-label">Interactive — try it</div>
    <div class="btn-pair">
      <button class="btn-start" id="liveStart">
        Start
        <span class="new-tag">● new set</span>
      </button>
      <button class="btn-dice" id="liveDice">
        <svg class="dice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="4"/>
          <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
          <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
          <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
          <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </div>
    <div class="live-hint">Click dice → roll animation → Start updates. Click Start to reset.</div>
  </div>

</div>

<script>
  function setTheme(t) {
    document.getElementById('mainPanel').setAttribute('data-theme', t);
    document.getElementById('btnDark').className  = t === 'dark'  ? 'toggle-btn active-dark'  : 'toggle-btn inactive';
    document.getElementById('btnLight').className = t === 'light' ? 'toggle-btn active-light' : 'toggle-btn inactive';
  }

  const liveDice  = document.getElementById('liveDice');
  const liveStart = document.getElementById('liveStart');

  liveDice.addEventListener('click', () => {
    liveDice.classList.remove('rolling');
    void liveDice.offsetWidth;
    liveDice.classList.add('rolling');

    setTimeout(() => {
      liveDice.classList.remove('rolling');
      liveDice.classList.add('rolled');
      liveStart.classList.add('rolled');
    }, 580);
  });

  liveStart.addEventListener('click', () => {
    if (liveStart.classList.contains('rolled')) {
      liveStart.classList.remove('rolled');
      liveDice.classList.remove('rolled');
    }
  });
</script>
</body>
</html>