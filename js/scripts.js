/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — Understanding Helen
   scripts.js
══════════════════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ────────────────────────────────── */

const visited = new Set([1]);
const TOTAL_PAGES = 7;

function updateProgressBar(num) {
  const pct = Math.round(((num - 1) / (TOTAL_PAGES - 1)) * 100);
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
}

function goToPage(num) {
  visited.add(num);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${num}`);
  if (page) page.classList.add('active');

  // Update nav steps 1–5
  for (let i = 1; i <= TOTAL_PAGES; i++) {
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

  updateProgressBar(num);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Show floating notes button only on page 7
  document.body.classList.toggle('acp-notes-visible', num === 7);

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

// Answer definitions — shuffled on each render
const answerPool = [
  {
    quality: 'best',
    label: '✅ Best Response',
    message: 'By acknowledging Simon\'s exhaustion first, you build trust and open the door to a deeper conversation — making it far more likely that Simon will disclose the real pressures the family are under. This is person-centred care in action.',
    text: '"Simon, you look exhausted. Let\'s sit for a moment and talk about how you are managing."',
    ariaLabel: 'Acknowledge Simon\'s exhaustion'
  },
  {
    quality: 'neutral',
    label: '⚠️ Acceptable — but incomplete',
    message: 'Attending to Helen\'s immediate health need is reasonable, but it misses the opportunity to acknowledge Simon\'s visible distress. A holistic approach means attending to the whole family — not just the clinical task.',
    text: '"Helen, your breathing looks heavy. Let\'s check your oxygen levels first."',
    ariaLabel: 'Check Helen\'s oxygen levels first'
  },
  {
    quality: 'poor',
    label: '❌ Missed Opportunity',
    message: 'Rushing through the visit sends a clear message that their lives are simply a task to complete. This damages trust and makes it far less likely that the family will open up about the real pressures they are facing — including Simon\'s financial crisis and Sophie\'s withdrawal.',
    text: '"I have a lot of patients today, so let\'s just get through the vitals quickly."',
    ariaLabel: 'Get through the vitals quickly'
  }
];

// Module-level store for the current shuffled answers — avoids any HTML escaping issues
let currentAnswers = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderChoicesPanel() {
  const labels = ['A', 'B', 'C'];
  currentAnswers = shuffleArray(answerPool);

  const buttonsHTML = currentAnswers.map((ans, i) => `
    <button class="choice-card" data-index="${i}"
      onclick="makeChoice(this)"
      aria-label="Option ${labels[i]}: ${ans.ariaLabel}">
      <div class="choice-marker" aria-hidden="true">${labels[i]}</div>
      <div class="choice-card-text">${ans.text}</div>
    </button>`).join('');

  document.getElementById('choices-panel-1').innerHTML = `
    <h2 style="font-family:'Merriweather',serif; font-size:1.1rem; margin-bottom:4px; color:var(--white);">How do you respond?</h2>
    <p class="choices-hint">Select the response you feel is most appropriate. You'll receive immediate feedback on your choice.</p>
    ${buttonsHTML}
    <div class="scenario-feedback" id="scenario-feedback" role="alert" aria-live="polite"></div>
    <button class="btn-next" id="btn-watch-next" hidden onclick="openVideoModal()" aria-label="Watch what happens next">
      ▶ Watch What Happens Next
    </button>
    <button class="btn-reset" id="btn-retry" hidden onclick="retryQuestion()" aria-label="Reset and try again">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      Reset &amp; Try Again
    </button>
    <div style="margin-top:16px;">
      <button class="btn btn-secondary" onclick="goToPage(2)" style="font-size:0.82rem; padding:10px 18px;" aria-label="Back to Helen's profile">
        <span aria-hidden="true">←</span> Back to Profile
      </button>
    </div>
  `;
}

function makeChoice(btn) {
  const ans = currentAnswers[parseInt(btn.dataset.index, 10)];
  if (!ans) return;

  // Lock all choices
  document.querySelectorAll('#choices-panel-1 .choice-card').forEach(c => {
    c.setAttribute('aria-disabled', 'true');
    c.onclick = null;
    c.style.cursor = 'default';
    c.style.transform = 'none';
  });

  btn.classList.add(ans.quality);

  // Show feedback
  const fb = document.getElementById('scenario-feedback');
  fb.className = 'scenario-feedback show ' + ans.quality;
  fb.innerHTML = '<div class="feedback-badge">' + ans.label + '</div><p>' + ans.message + '</p>';

  // Show watch next on best answer; always show reset
  if (ans.quality === 'best') {
    document.getElementById('btn-watch-next').hidden = false;
  }
  document.getElementById('btn-retry').hidden = false;
}

function retryQuestion() {
  renderChoicesPanel();
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

const HS_TOTAL = 4;
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
    btn.setAttribute('aria-label', 'Explored');
    // Replace info icon with checkmark
    const tooltip = btn.querySelector('.hs-tooltip');
    if (tooltip) tooltip.textContent = '✓ Explored';
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = '<polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
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
    lockMsg.innerHTML = '<span aria-hidden="true">✅</span><span>All 4 hotspots explored — you may now continue.</span>';
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


/* ── FOUR PILLARS MODAL ──────────────────────────────── */

const PILLARS_TOTAL = 4;
const pillarsOpened = new Set();

const pillarData = {
  1: {
    icon: '🫁', tag: 'Pillar One', name: 'Physical',
    stripe: '#0197de', iconBg: 'rgba(1,151,222,0.14)', tagColor: '#7dd3fc',
    definition: 'Physical wellbeing encompasses a person\'s bodily health — their symptoms, comfort, functional ability, and medical needs. In palliative care, the physical pillar is not about cure, but about maintaining quality of life: managing pain, breathlessness, fatigue, and other symptoms so a person can live as fully as possible for as long as possible.',
    complexNeeds: ['Intractable symptoms', 'Pain management', 'Metastatic cord compression', 'Bleed at end of life', 'Diabetes management at EOL', 'Seizure management at EOL', 'Frailty'],
    interventions: ['Physiotherapy', 'Occupational Therapy', 'Medical Management', 'Specialist Nursing Care', 'Complementary therapies', 'Volunteer support & coordination', 'Coordinator (PCCC and SpMDT)'],
    outcomes: ['Symptom optimisation', 'Reablement and adaption of function', 'Goal planning to support self/care and self management', 'Advance Care Planning', 'Anticipatory Prescribing', 'ReSPECT conversations and planning', 'Lasting Power of Attorney for Health and Welfare']
  },
  2: {
    icon: '🕊️', tag: 'Pillar Two', name: 'Psychological & Spiritual',
    stripe: '#7c6ef5', iconBg: 'rgba(124,110,245,0.14)', tagColor: '#c4b5fd',
    definition: 'This pillar recognises that a person\'s emotional and inner life is inseparable from their health. Psychological wellbeing includes how someone copes with fear, grief, identity, and loss of independence. Spiritual wellbeing — which may or may not be religious — relates to meaning, purpose, peace, and what sustains a person\'s sense of self in the face of serious illness.',
    complexNeeds: ['Loss of sense of self, depression/anxiety', 'Unwilling/unable to come to terms with diagnosis', 'Sensory or cognitive impairment', 'Psycho-sexual complexity', 'Relationship/family breakdown', 'Complex palliative rehab'],
    interventions: ['Spiritual Care', 'Occupational Therapy', 'Physiotherapy', 'Wellbeing Team and specialist counselling', 'Specialist Nurses', 'Complementary therapies', 'Volunteers'],
    outcomes: ['Person\'s focus of care', 'Clarity regarding preferences and wishes', 'Opportunity to make plans to achieve key milestones', 'A sense of peace and purpose', 'Acceptance']
  },
  3: {
    icon: '💷', tag: 'Pillar Three', name: 'Financial',
    stripe: '#fdca0f', iconBg: 'rgba(253,202,15,0.1)', tagColor: '#fde68a',
    definition: 'Financial wellbeing is often an overlooked but critical dimension of holistic care. Serious illness frequently reduces income while increasing costs. Unresolved financial pressures create significant stress for both patients and carers, can lead to fuel poverty and poor nutrition, and can erode the quality and sustainability of home-based care.',
    complexNeeds: ['Risk of harms associated with poverty including funeral poverty', 'Need for package of care', 'Eligibility for benefits for person and carer', 'Optimising home adaptations', 'Future planning'],
    interventions: ['Wellbeing Team and specialist welfare and benefit advisors', 'Social work expertise', 'Continuing Health Care', 'Occupational Therapy', 'Case management and care coordination', 'PCCC'],
    outcomes: ['Access to eligible benefits e.g. SR1', 'Access to CHC Funded Health Care', 'Rehoming/home adaptations', 'Access to funeral and care after death', 'Will writing', 'Lasting Power of Attorney for Finance']
  },
  4: {
    icon: '👨‍👩‍👧', tag: 'Pillar Four', name: 'Family & Carer',
    stripe: '#2ecc8e', iconBg: 'rgba(46,204,142,0.12)', tagColor: '#6ee7b7',
    definition: 'No one lives in isolation. This pillar addresses the relational world of the patient: their connections to family, friends, and community, as well as the wellbeing of those who provide care. Social isolation is a significant health risk. Carers carry enormous physical and emotional burdens. In family systems, the illness of one person affects everyone around them.',
    complexNeeds: ['History of family trauma', 'Psycho-social distress', 'Suicidal ideation', 'Anxiety re unplanned care needs', 'Risk of carer burnout', 'Risk of care break down', 'Complex communication needs', 'Pre and post bereavement needs'],
    interventions: ['Physiotherapy', 'Occupational Therapy', 'Medical Management', 'Wellbeing and counselling services', 'Specialist Nursing Care', 'Volunteers', 'Case management and care coordination'],
    outcomes: ['Family and carers feel able to manage and know who and where to escalate concerns to', 'Emergency care plans in place', 'Safe guarding concerns managed']
  }
};

function openPillarModal(id) {
  const p = pillarData[id];

  // Track which pillars have been opened
  pillarsOpened.add(id);

  document.getElementById('pm-stripe').style.background = p.stripe;
  const icon = document.getElementById('pm-icon');
  icon.style.background = p.iconBg;
  icon.textContent = p.icon;
  const tag = document.getElementById('pm-tag');
  tag.style.color = p.tagColor;
  tag.textContent = p.tag;
  document.getElementById('pm-name').textContent       = p.name;
  document.getElementById('pm-definition').textContent = p.definition;

  document.getElementById('pm-key-grid').innerHTML = `
    <div class="pillar-section-row">
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Complex Needs</div>
        ${p.complexNeeds.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Specialist Interventions</div>
        ${p.interventions.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Person-Centred Outcomes</div>
        ${p.outcomes.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
    </div>
  `;

  // Mark pillar as visited
  document.querySelectorAll('.pillar-col').forEach(el => el.classList.remove('active'));
  const col = document.getElementById('pc-' + id);
  if (col) {
    col.classList.add('active');
    col.classList.add('visited-pillar');
  }

  const modal = document.getElementById('pillar-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();

  // Update footer hint in modal
  const remaining = PILLARS_TOTAL - pillarsOpened.size;
  const hint = document.getElementById('pm-hint');
  if (hint) {
    hint.textContent = remaining > 0
      ? remaining + ' pillar' + (remaining !== 1 ? 's' : '') + ' remaining — explore all before continuing.'
      : 'All pillars explored — you may now continue.';
  }
}

function closePillarModal() {
  document.getElementById('pillar-modal').classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.pillar-col').forEach(el => el.classList.remove('active'));

  // Unlock continue if all pillars opened
  if (pillarsOpened.size === PILLARS_TOTAL) {
    unlockPillarsContinue();
  }
}

function unlockPillarsContinue() {
  const lockMsg = document.getElementById('pillars-locked-msg');
  if (lockMsg) {
    lockMsg.innerHTML = '<span aria-hidden="true">✅</span><span>All four pillars explored — you may now continue.</span>';
    lockMsg.style.color = '#6ee7b7';
  }
  const btn = document.getElementById('pillars-continue-btn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-label', 'Continue to Advance Care Planning');
    btn.focus();
  }
}


/* ── ACP VALIDATION ──────────────────────────────────── */

function initAcpValidation() {
  // Text inputs / textareas
  document.querySelectorAll('.acp-validate').forEach(el => {
    el.addEventListener('input', () => validateAcpField(el));
    el.addEventListener('blur',  () => validateAcpField(el));
  });
  // Selects
  document.querySelectorAll('.acp-validate-select').forEach(el => {
    el.addEventListener('change', () => validateAcpSelect(el));
  });
  // Pre-check known confirmed items
  const dnr  = document.getElementById('chk-dnr');
  const meds = document.getElementById('chk-meds');
  if (dnr)  { dnr.checked  = true; }
  if (meds) { meds.checked = true; }
}

function validateAcpField(el) {
  const raw    = el.value.trim().toLowerCase();
  const answer = (el.dataset.answer || '').toLowerCase();
  const mode   = el.dataset.match || 'contains';
  if (!raw) { el.classList.remove('acp-correct', 'acp-incorrect'); return; }
  let correct = false;
  if (mode === 'contains') {
    correct = raw.includes(answer);
  } else if (mode === 'contains-any') {
    correct = answer.split('|').some(a => raw.includes(a.trim()));
  }
  el.classList.toggle('acp-correct',   correct);
  el.classList.toggle('acp-incorrect', !correct);
}

function validateAcpSelect(el) {
  const val    = el.value.toLowerCase();
  const answer = (el.dataset.answer || '').toLowerCase();
  if (!val) { el.classList.remove('acp-correct', 'acp-incorrect'); return; }
  el.classList.toggle('acp-correct',   val === answer);
  el.classList.toggle('acp-incorrect', val !== answer);
}


/* ── PRINT ACP ───────────────────────────────────────── */

function printAcp() {
  window.print();
}


/* ── ACP NOTES MODAL ─────────────────────────────────── */

function openAcpModal() {
  const modal = document.getElementById('acp-notes-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeAcpModal() {
  document.getElementById('acp-notes-modal').classList.remove('open');
  document.body.style.overflow = '';
}


/* ── GLOBAL EVENT LISTENERS ─────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Initialise progress bar and shuffle choices on load
  updateProgressBar(1);
  renderChoicesPanel();
  initAcpValidation();

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        if (backdrop.id === 'video-modal')    closeVideoModal();
        if (backdrop.id === 'hs-modal')       closeHotspotModal();
        if (backdrop.id === 'pillar-modal')   closePillarModal();
        if (backdrop.id === 'acp-notes-modal') closeAcpModal();
      }
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('video-modal')?.classList.contains('open'))     closeVideoModal();
    if (document.getElementById('hs-modal')?.classList.contains('open'))        closeHotspotModal();
    if (document.getElementById('pillar-modal')?.classList.contains('open'))    closePillarModal();
    if (document.getElementById('acp-notes-modal')?.classList.contains('open')) closeAcpModal();
  });

});
