/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — Understanding Helen
   scripts.js
══════════════════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ────────────────────────────────── */

const visited = new Set([1]);

function goToPage(num) {
  visited.add(num);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${num}`);
  if (page) page.classList.add('active');

  // Update nav steps 1–4
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`nav-${i}`);
    if (!step) continue;
    step.classList.remove('current', 'done');
    step.removeAttribute('aria-current');

    if (i === num) {
      step.classList.add('current');
      step.setAttribute('aria-current', 'step');
      step.disabled = false;
    } else if (visited.has(i)) {
      step.classList.add('done');
      step.disabled = false;
    } else {
      step.disabled = true;
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Move focus to heading for screen readers
  const heading = page && page.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

// Only navigate to pages already visited
function navClick(num) {
  if (visited.has(num)) goToPage(num);
}


/* ── BRANCHING SCENARIO ─────────────────────────────── */

function makeChoice(btn, quality, label, message) {
  // Lock all choices
  const cards = btn.closest('[role="region"]').querySelectorAll('.choice-card');
  cards.forEach(c => {
    c.setAttribute('aria-disabled', 'true');
    c.onclick = null;
    c.style.cursor = 'default';
    c.style.transform = 'none';
  });

  btn.classList.add(quality);

  // Show feedback
  const fb = document.getElementById('scenario-feedback');
  fb.className = `scenario-feedback show ${quality}`;
  fb.innerHTML = `<div class="feedback-badge">${label}</div><p>${message}</p>`;

  // Best answer → reward with video; anything else → offer retry
  if (quality === 'best') {
    document.getElementById('btn-watch-next').hidden = false;
    document.getElementById('btn-retry').hidden = true;
  } else {
    document.getElementById('btn-watch-next').hidden = true;
    document.getElementById('btn-retry').hidden = false;
  }
}

function retryQuestion() {
  // Re-render the choices panel completely to restore onclick handlers
  document.getElementById('choices-panel-1').innerHTML = `
    <h2 style="font-family:'Merriweather',serif; font-size:1.1rem; margin-bottom:4px; color:var(--white);">How do you respond?</h2>
    <p class="choices-hint">Select the response you feel is most appropriate. You'll receive immediate feedback on your choice.</p>

    <button class="choice-card"
      onclick="makeChoice(this,'best','✅ Best Response','By acknowledging Simon\\'s exhaustion first, you build trust and open the door to a deeper conversation — making it far more likely that Simon will disclose the real pressures the family are under. This is person-centred care in action.')"
      aria-label="Option A: Acknowledge Simon's exhaustion">
      <div class="choice-marker" aria-hidden="true">A</div>
      <div class="choice-card-text">"Simon, you look exhausted. Let's sit for a moment and talk about how you are managing."</div>
    </button>

    <button class="choice-card"
      onclick="makeChoice(this,'neutral','⚠️ Acceptable — but incomplete','Attending to Helen\\'s immediate health need is reasonable, but it misses the opportunity to acknowledge Simon\\'s visible distress. A holistic approach means attending to the whole family — not just the clinical task.')"
      aria-label="Option B: Check Helen's oxygen levels first">
      <div class="choice-marker" aria-hidden="true">B</div>
      <div class="choice-card-text">"Helen, your breathing looks heavy. Let's check your oxygen levels first."</div>
    </button>

    <button class="choice-card"
      onclick="makeChoice(this,'poor','❌ Missed Opportunity','Rushing through the visit sends a clear message that their lives are simply a task to complete. This damages trust and makes it far less likely that the family will open up about the real pressures they are facing — including Simon\\'s financial crisis and Sophie\\'s withdrawal.')"
      aria-label="Option C: Get through the vitals quickly">
      <div class="choice-marker" aria-hidden="true">C</div>
      <div class="choice-card-text">"I have a lot of patients today, so let's just get through the vitals quickly."</div>
    </button>

    <div class="scenario-feedback" id="scenario-feedback" role="alert" aria-live="polite"></div>

    <button class="btn-next" id="btn-watch-next" hidden onclick="openVideoModal()" aria-label="Watch what happens next">
      ▶ Watch What Happens Next
    </button>

    <button class="btn-next" id="btn-retry" hidden
      style="background:transparent; border:2px solid rgba(255,255,255,0.25); color:var(--white);"
      onclick="retryQuestion()" aria-label="Try again">
      ↺ Try Again
    </button>

    <div style="margin-top:16px;">
      <button class="btn btn-secondary" onclick="goToPage(2)" style="font-size:0.82rem; padding:10px 18px;" aria-label="Back to Helen's profile">
        <span aria-hidden="true">←</span> Back to Profile
      </button>
    </div>
  `;
}


/* ── VIDEO MODAL ────────────────────────────────────── */

function openVideoModal() {
  const modal = document.getElementById('video-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const vid = document.getElementById('modal-video');
  if (vid) vid.play().catch(() => {});
  // Focus the close button
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  const vid = document.getElementById('modal-video');
  if (vid) { vid.pause(); vid.currentTime = 0; }
}


/* ── HOTSPOT ACTIVITY ───────────────────────────────── */

const HS_TOTAL = 6;
const hsFound  = new Set();

const hsData = {
  1: {
    eyebrow: 'High Risk',
    eyebrowClass: 'tag-risk',
    title: '💊 Medication Storage',
    body: 'Multiple prescription bottles are visible on a low table within easy reach and without clear organisation. This raises immediate concerns around accidental overdose, confusion between medications, and missed doses. Unsecured medication is also a safeguarding concern if vulnerable visitors are present.',
    action: '<strong>Action:</strong> Discuss with GP or pharmacist. Consider a dosette/blister pack system and review secure storage options.'
  },
  2: {
    eyebrow: 'High Risk',
    eyebrowClass: 'tag-risk',
    title: '⚠️ Trip Hazard',
    body: 'Papers, envelopes and loose items are scattered across the table and floor area. Falls are the leading cause of injury in older adults, and a cluttered environment significantly increases risk — particularly for someone with reduced mobility or poor vision.',
    action: '<strong>Action:</strong> Clear walkways. Arrange a falls risk assessment and consider referral to occupational therapy.'
  },
  3: {
    eyebrow: 'Concern',
    eyebrowClass: 'tag-concern',
    title: '📺 Electrical Safety',
    body: 'An older CRT television is present. Older electrical appliances may not meet modern safety standards and can present fire risks, particularly if they overheat or have worn wiring.',
    action: '<strong>Action:</strong> Check for a working smoke alarm. Consider requesting a home fire safety visit from the local fire service.'
  },
  4: {
    eyebrow: 'Concern',
    eyebrowClass: 'tag-concern',
    title: '🌡️ Heating & Warmth',
    body: 'A wall-mounted radiator is visible. Adequate heating is essential — older adults are at significantly greater risk of hypothermia. However, very high surface temperatures can also cause burns if contacted directly.',
    action: '<strong>Action:</strong> Ensure the home is heated to at least 18°C. Explore eligibility for Warm Home Discount or Winter Fuel Payment.'
  },
  5: {
    eyebrow: 'Positive — monitor',
    eyebrowClass: 'tag-positive',
    title: '☕ Hydration',
    body: 'A cup of tea is present — a positive indicator that Helen is managing some self-care. However, older adults may not recognise thirst, and a single cup is unlikely to represent adequate daily fluid intake.',
    action: '<strong>Action:</strong> Encourage regular fluid intake of 6–8 cups per day. Monitor for signs of dehydration or poor nutrition.'
  },
  6: {
    eyebrow: 'Concern',
    eyebrowClass: 'tag-concern',
    title: '🧍 Social Isolation',
    body: 'The room has a dim, enclosed atmosphere and the television appears to be Helen\'s primary source of stimulation and company. Loneliness is a significant and often underrecognised health risk in older adults, linked to depression, cognitive decline, and poorer health outcomes.',
    action: '<strong>Action:</strong> Explore connections to community groups, befriending services, or regular welfare checks. Note in care plan.'
  }
};

function clickHotspot(id) {
  hsFound.add(id);

  // Mark the hotspot button as visited
  const btn = document.getElementById(`hs-${id}`);
  if (btn) {
    btn.classList.add('visited');
    btn.setAttribute('aria-label', `Hotspot ${id} — explored`);
    const tooltip = btn.querySelector('.hs-tooltip');
    if (tooltip) tooltip.textContent = '✓ Explored';
  }

  // Light up the pill tracker
  const pill = document.getElementById(`pill-${id}`);
  if (pill) pill.classList.add('found');

  // Open the modal for this hotspot
  openHotspotModal(id);

  // Update lock message
  if (hsFound.size < HS_TOTAL) {
    const remaining = HS_TOTAL - hsFound.size;
    const lockText = document.getElementById('hs-lock-text');
    if (lockText) lockText.textContent = `${remaining} hotspot${remaining !== 1 ? 's' : ''} remaining`;
  }
}

function openHotspotModal(id) {
  const data = hsData[id];
  if (!data) return;

  // Populate modal content
  document.getElementById('hs-modal-eyebrow').textContent  = data.eyebrow;
  document.getElementById('hs-modal-eyebrow').className    = `hs-modal-tag ${data.eyebrowClass}`;
  document.getElementById('hs-modal-title').textContent    = data.title;
  document.getElementById('hs-modal-body').textContent     = data.body;
  document.getElementById('hs-modal-action').innerHTML     = data.action;

  // Open backdrop
  const modal = document.getElementById('hs-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus close button
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeHotspotModal() {
  const modal = document.getElementById('hs-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';

  // If all found, unlock continue after modal closes
  if (hsFound.size === HS_TOTAL) {
    unlockHotspotContinue();
  }
}

function unlockHotspotContinue() {
  const lockMsg = document.getElementById('hs-locked-msg');
  if (lockMsg) {
    lockMsg.innerHTML = '<span aria-hidden="true">✅</span><span>All 6 hotspots explored — you may now continue.</span>';
    lockMsg.style.color = '#6ee7b7';
  }
  const continueBtn = document.getElementById('hs-continue-btn');
  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
    continueBtn.setAttribute('aria-label', 'Continue to next section');
    continueBtn.focus();
  }
}


/* ── GLOBAL EVENT LISTENERS ─────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        if (backdrop.id === 'video-modal') closeVideoModal();
        if (backdrop.id === 'hs-modal')    closeHotspotModal();
      }
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('video-modal').classList.contains('open')) closeVideoModal();
    if (document.getElementById('hs-modal').classList.contains('open'))    closeHotspotModal();
  });

});
