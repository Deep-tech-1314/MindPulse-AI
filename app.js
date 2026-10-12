/**
 * MindPulse AI - Real-time Mental Wellness & Screening Companion
 * Aligned with UN SDG 3: Good Health & Well-being
 */

// --- Global State & Configuration ---
const STATE = {
  activeTab: 'chat-tab',
  currentScreener: 'phq9',
  screenerAnswers: {},
  breathingActive: false,
  breathingInterval: null,
  breathingPattern: '478', // '478' or 'box'
  moodHistory: JSON.parse(localStorage.getItem('mindpulse_moods') || '[]'),
  selectedTriggers: [],
  ttsEnabled: true,
  currentSoundscape: null,
  soundscapeGain: null,
  soundscapeNodes: []
};

// --- Screener Question Sets (Validated Clinical Tools) ---
const SCREENERS = {
  phq9: {
    title: 'PHQ-9 (Patient Health Questionnaire-9)',
    desc: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    options: [
      { text: 'Not at all', score: 0 },
      { text: 'Several days', score: 1 },
      { text: 'More than half the days', score: 2 },
      { text: 'Nearly every day', score: 3 },
    ],
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure or have let yourself or family down',
      'Trouble concentrating on things, such as reading or academic tasks',
      'Moving or speaking slowly, or being unusually restless and fidgety',
      'Thoughts that you would be better off dead, or of hurting yourself'
    ],
    interpret: (score) => {
      if (score <= 4) return { level: 'Minimal Depression', color: '#10b981', advice: 'Your score suggests minimal to no depressive symptoms. Continue maintaining healthy sleep hygiene, physical exercise, and social connections.' };
      if (score <= 9) return { level: 'Mild Depression', color: '#3b82f6', advice: 'Mild depressive symptoms detected. Incorporating active mindfulness, regular exercise, stress management, and talking to a peer or counselor can be highly beneficial.' };
      if (score <= 14) return { level: 'Moderate Depression', color: '#f59e0b', advice: 'Moderate depressive symptoms identified. We recommend consulting with a certified mental healthcare professional or university counseling cell for supportive counseling.' };
      if (score <= 19) return { level: 'Moderately Severe Depression', color: '#f97316', advice: 'Moderately severe depressive symptoms noted. Professional therapeutic intervention (such as CBT) and psychological evaluation are strongly advised.' };
      return { level: 'Severe Depression', color: '#ef4444', advice: 'Significant distress detected. Please reach out to a licensed psychiatrist or a mental health helpline (such as Tele-MANAS or KIRAN) immediately.' };
    }
  },
  gad7: {
    title: 'GAD-7 (Generalized Anxiety Disorder-7)',
    desc: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    options: [
      { text: 'Not at all', score: 0 },
      { text: 'Several days', score: 1 },
      { text: 'More than half the days', score: 2 },
      { text: 'Nearly every day', score: 3 },
    ],
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen'
    ],
    interpret: (score) => {
      if (score <= 4) return { level: 'Minimal Anxiety', color: '#10b981', advice: 'Normal emotional variance. Your anxiety level is in the healthy minimal range.' };
      if (score <= 9) return { level: 'Mild Anxiety', color: '#3b82f6', advice: 'Mild anxiety symptoms detected. Daily diaphragmatic breathing, journaling, and reducing caffeine intake can help stabilize worries.' };
      if (score <= 14) return { level: 'Moderate Anxiety', color: '#f59e0b', advice: 'Moderate anxiety symptoms detected. Targeted stress-reduction routines and consultation with a counselor or psychologist are recommended.' };
      return { level: 'Severe Anxiety', color: '#ef4444', advice: 'Severe anxiety identified. Paced breathing can offer acute relief, but formal assessment by a clinical psychologist or psychiatrist is recommended.' };
    }
  }
};

// --- Empathetic AI Response Engine ("Aura") ---
const AI_ENGINE = {
  crisisKeywords: ['kill myself', 'suicide', 'die', 'end my life', 'hurt myself', 'hang myself', 'no point living', 'slit', 'overdose'],
  
  respond: (text) => {
    const lower = text.toLowerCase();

    // Check crisis alert first
    if (AI_ENGINE.crisisKeywords.some(w => lower.includes(w))) {
      return {
        isCrisis: true,
        text: `I can hear how much pain you're in, and I want you to know you don't have to carry this alone. Your life matters deeply. 
        \nPlease reach out to compassionate professionals right now who can support you 24/7 for free:
        \n• **Tele-MANAS:** Call **14416** or **1800-891-4416** (National 24/7 Helpline)
        \n• **KIRAN Mental Health:** Call **1800-599-0019**
        \n• **Vandrevala Foundation:** Call **+91 9999 666 555**
        \nPlease switch to the **Emergency Support & SOS** tab or talk to someone you trust right now.`
      };
    }

    if (lower.includes('panic') || lower.includes('heart racing') || lower.includes('cannot breathe') || lower.includes('anxiety attack')) {
      return {
        text: `I'm right here with you. A panic response is your nervous system's false alarm — you are physically safe, and this feeling **will pass**.
        \nLet's take control together:
        1. **Drop your shoulders** and unclench your jaw.
        2. Put your hand on your belly. Inhale slowly for 4 seconds, and exhale like you're blowing out a candle for 7 seconds.
        3. Switch to our **Calm Zone tab** for the interactive guided visualizer or 5-4-3-2-1 grounding exercise whenever you're ready.`
      };
    }

    if (lower.includes('exam') || lower.includes('study') || lower.includes('overwhelm') || lower.includes('stress') || lower.includes('college')) {
      return {
        text: `Academic and performance pressure can feel like a heavy mountain on your chest. It's completely normal to feel stretched thin.
        \nLet's break the weight into manageable pieces:
        • **The 2-Minute Rule:** What is one tiny task you can do right now that takes under 2 minutes?
        • **Cognitive Reframe:** Your productivity or grades do not define your human worth.
        • Try working for 25 minutes, then taking a deliberate 5-minute break away from screens. Have you had a glass of water recently?`
      };
    }

    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody cares') || lower.includes('friend')) {
      return {
        text: `Loneliness is a deeply aching feeling, but feeling isolated doesn't mean you are unworthy of connection. Many people around us feel the exact same disconnect behind their public smiles.
        \n• You don't have to navigate today completely alone — I'm here to listen without judgment.
        • Is there a friend, sibling, or mentor you could send even a simple meme or *"thinking of you"* message to?
        • What is one comfort activity (a warm drink, favorite music, a walk) you could offer yourself tonight?`
      };
    }

    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('exhaust')) {
      return {
        text: `Sleep disruption and mental fatigue feed into each other in a loop. When your mind is racing in bed, lying there frustrated can amplify it.
        \nHere are evidence-backed tips:
        • If you've been awake in bed for over 20 minutes, get up and sit in dim light with a book until sleepiness returns.
        • Avoid blue light screens 45 minutes before sleep.
        • Try our **4-7-8 Breathing** in the Calm Zone; it activates the vagus nerve to slow your resting heart rate.`
      };
    }

    if (lower.includes('technique') || lower.includes('exercise') || lower.includes('calm down') || lower.includes('breathe')) {
      return {
        text: `Here is a fast somatic technique called the **Physiological Sigh**:
        1. Take a deep breath in through your nose.
        2. At the very top, take a second sharp 'top-up' inhale.
        3. Release everything out through your mouth with a long, slow sigh.
        \nDoing this just two or three times rapidly recalibrates oxygen-carbon dioxide balance and downregulates neural arousal!`
      };
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return {
        text: `Hello there! I'm **Aura**, your MindPulse AI companion. I'm here to provide a safe, non-judgmental space for your thoughts, guide you through clinical self-screenings, or practice grounding exercises whenever you need. How is your day treating you?`
      };
    }

    // Default reflective empathy response
    return {
      text: `Thank you for sharing that with me. Acknowledging and putting words to what you feel is often the first courageous step toward healing.
      \nTell me a little more: Has this been weighing on you for a while, or is this related to something that happened today? I'm listening.`
    };
  }
};

// --- Web Audio Synthesizer & Soundscape Engine ---
const SoundFX = {
  ctx: null,
  init: () => {
    if (!SoundFX.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) SoundFX.ctx = new AudioCtx();
    }
  },
  playTone: (freq = 440, type = 'sine', duration = 0.25) => {
    try {
      SoundFX.init();
      if (!SoundFX.ctx) return;
      if (SoundFX.ctx.state === 'suspended') SoundFX.ctx.resume();
      const osc = SoundFX.ctx.createOscillator();
      const gain = SoundFX.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, SoundFX.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, SoundFX.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, SoundFX.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(SoundFX.ctx.destination);
      osc.start();
      osc.stop(SoundFX.ctx.currentTime + duration);
    } catch (e) {
      // Audio context policy fallback
    }
  },
  stopSoundscape: () => {
    STATE.soundscapeNodes.forEach(n => {
      try { n.stop(); } catch(e) {}
      try { n.disconnect(); } catch(e) {}
    });
    STATE.soundscapeNodes = [];
    STATE.currentSoundscape = null;
    document.querySelectorAll('.sound-chip').forEach(c => c.classList.remove('active'));
  },
  playSoundscape: (type, volume = 0.5) => {
    try {
      SoundFX.init();
      if (!SoundFX.ctx) return;
      if (SoundFX.ctx.state === 'suspended') SoundFX.ctx.resume();

      SoundFX.stopSoundscape();
      STATE.currentSoundscape = type;

      const masterGain = SoundFX.ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.15, SoundFX.ctx.currentTime);
      masterGain.connect(SoundFX.ctx.destination);
      STATE.soundscapeGain = masterGain;

      if (type === 'alpha') {
        // Dual Binaural / Harmonic Solfeggio 432Hz & 440Hz Sine waves
        const osc1 = SoundFX.ctx.createOscillator();
        const osc2 = SoundFX.ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, SoundFX.ctx.currentTime);
        osc2.frequency.setValueAtTime(436, SoundFX.ctx.currentTime);
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();
        STATE.soundscapeNodes.push(osc1, osc2);
      } else {
        // Pink / Rain / Ocean Noise Synthesizer via AudioBuffer
        const bufferSize = SoundFX.ctx.sampleRate * 2;
        const noiseBuffer = SoundFX.ctx.createBuffer(1, bufferSize, SoundFX.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = SoundFX.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = SoundFX.ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, SoundFX.ctx.currentTime);
        } else if (type === 'ocean') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, SoundFX.ctx.currentTime);
          // Modulate filter frequency with an LFO for rhythmic waves
          const lfo = SoundFX.ctx.createOscillator();
          const lfoGain = SoundFX.ctx.createGain();
          lfo.frequency.setValueAtTime(0.12, SoundFX.ctx.currentTime); // ~8 sec ocean swell
          lfoGain.gain.setValueAtTime(250, SoundFX.ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          lfo.start();
          STATE.soundscapeNodes.push(lfo);
        }

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        STATE.soundscapeNodes.push(whiteNoise);
      }
    } catch(e) {
      console.warn("Audio soundscape failed:", e);
    }
  }
};

// --- DOM Initialization & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initChat();
  initScreener();
  initBreathing();
  initGrounding();
  initMoodTracker();
  initThemeToggle();
  initQuickSos();
  initEnhancements();
});

// --- Tab Navigation ---
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');
      STATE.activeTab = targetId;
    });
  });
}

// --- Quick SOS Button ---
function initQuickSos() {
  const sosBtn = document.getElementById('quickSosBtn');
  if (sosBtn) {
    sosBtn.addEventListener('click', () => {
      document.querySelector('[data-tab="sos-tab"]').click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- Theme Toggle ---
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      toggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '🌓';
    });
  }
}

// --- AI Chat Logic & Voice Interaction ---
function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('userInput');
  const msgList = document.getElementById('chatMessages');
  const clearBtn = document.getElementById('clearChatBtn');
  const voiceBtn = document.getElementById('voiceInputBtn');
  const ttsToggle = document.getElementById('ttsToggleBtn');
  const chips = document.querySelectorAll('.chip');

  // Initial welcome message
  appendBotMessage(
    "👋 Welcome to **MindPulse AI**. I'm **Aura**, your private mental wellness companion. " +
    "Whether you're stressed about deadlines, dealing with social pressure, or just need someone to vent to — I'm here. " +
    "Everything stays confidential on your device. How are you feeling right now?"
  );

  // Text-to-Speech Toggle
  if (ttsToggle) {
    ttsToggle.addEventListener('click', () => {
      STATE.ttsEnabled = !STATE.ttsEnabled;
      ttsToggle.textContent = STATE.ttsEnabled ? '🔊 Voice Audio: On' : '🔇 Voice Audio: Off';
      ttsToggle.style.borderColor = STATE.ttsEnabled ? 'var(--accent-teal)' : 'var(--border-subtle)';
    });
  }

  // Voice Input (Web Speech Recognition)
  if (voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        voiceBtn.classList.add('recording');
        input.placeholder = "Listening... Speak clearly into your mic";
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        voiceBtn.classList.remove('recording');
        input.placeholder = "Share how you're feeling today in confidence...";
        form.dispatchEvent(new Event('submit'));
      };

      recognition.onerror = () => {
        voiceBtn.classList.remove('recording');
        input.placeholder = "Mic access error or paused. Type your message...";
      };

      recognition.onend = () => {
        voiceBtn.classList.remove('recording');
      };

      voiceBtn.addEventListener('click', () => {
        try {
          recognition.start();
        } catch(e) {
          recognition.stop();
        }
      });
    } else {
      voiceBtn.title = "Speech recognition not supported in this browser";
      voiceBtn.style.opacity = '0.5';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';

    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const reply = AI_ENGINE.respond(text);
      appendBotMessage(reply.text, reply.isCrisis);
      SoundFX.playTone(520, 'sine', 0.2);

      // Trigger Text to Speech if enabled
      if (STATE.ttsEnabled && window.speechSynthesis) {
        speakText(reply.text.replace(/[*#•]/g, ''));
      }
    }, 750);
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.getAttribute('data-prompt');
      form.dispatchEvent(new Event('submit'));
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      msgList.innerHTML = '';
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      appendBotMessage("Conversation reset. Take your time, what's on your mind?");
    });
  }

  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'message-row user-msg';
    row.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-bubble">${escapeHtml(text)}</div>
    `;
    msgList.appendChild(row);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function appendBotMessage(text, isCrisis = false) {
    const row = document.createElement('div');
    row.className = `message-row bot-msg ${isCrisis ? 'crisis-highlight' : ''}`;
    const formatted = formatText(text);

    row.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble">
        ${formatted}
        <button type="button" class="speech-read-btn" title="Read this response aloud">🔊</button>
      </div>
    `;

    // Attach speak button listener
    const speakBtn = row.querySelector('.speech-read-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        speakText(text.replace(/[*#•]/g, ''));
      });
    }

    msgList.appendChild(row);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function showTypingIndicator() {
    const row = document.createElement('div');
    row.id = 'typingRow';
    row.className = 'message-row bot-msg';
    row.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    msgList.appendChild(row);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingRow');
    if (el) el.remove();
  }
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1.05;
  window.speechSynthesis.speak(utter);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n• /g, '<br>• ')
    .replace(/\n\d+\. /g, match => `<br>${match.trim()} `)
    .replace(/\n/g, '<br>');
}

// --- Clinical Screener (PHQ-9 & GAD-7) & Report Modal ---
function initScreener() {
  const btnPhq = document.getElementById('btnPhq9');
  const btnGad = document.getElementById('btnGad7');
  const form = document.getElementById('screenerForm');
  const resultCard = document.getElementById('assessmentResultCard');
  const retakeBtn = document.getElementById('retakeAssessmentBtn');
  const printBtn = document.getElementById('printReportBtn');

  btnPhq.addEventListener('click', () => switchScreener('phq9'));
  btnGad.addEventListener('click', () => switchScreener('gad7'));

  function switchScreener(type) {
    STATE.currentScreener = type;
    STATE.screenerAnswers = {};
    if (type === 'phq9') {
      btnPhq.classList.add('active');
      btnGad.classList.remove('active');
    } else {
      btnGad.classList.add('active');
      btnPhq.classList.remove('active');
    }
    renderScreenerQuestions();
    resultCard.classList.add('hidden');
    form.classList.remove('hidden');
  }

  renderScreenerQuestions();

  function renderScreenerQuestions() {
    const data = SCREENERS[STATE.currentScreener];
    document.getElementById('screenerTitle').textContent = data.title;
    document.getElementById('screenerDesc').innerHTML = data.desc;

    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    data.questions.forEach((q, idx) => {
      const qItem = document.createElement('div');
      qItem.className = 'question-item';

      let optionsHtml = '';
      data.options.forEach(opt => {
        const isSelected = STATE.screenerAnswers[idx] === opt.score ? 'selected' : '';
        optionsHtml += `
          <button type="button" class="option-btn ${isSelected}" data-q="${idx}" data-score="${opt.score}">
            ${opt.text} (+${opt.score})
          </button>
        `;
      });

      qItem.innerHTML = `
        <label class="q-label">${idx + 1}. ${q}</label>
        <div class="options-group">${optionsHtml}</div>
      `;
      container.appendChild(qItem);
    });

    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.getAttribute('data-q'), 10);
        const score = parseInt(btn.getAttribute('data-score'), 10);
        STATE.screenerAnswers[qIdx] = score;

        const group = btn.closest('.options-group');
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        SoundFX.playTone(480 + (score * 50), 'sine', 0.1);
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = SCREENERS[STATE.currentScreener];
    const totalQuestions = data.questions.length;
    const answeredCount = Object.keys(STATE.screenerAnswers).length;

    if (answeredCount < totalQuestions) {
      alert(`Please answer all ${totalQuestions} questions to compute a reliable clinical score (Answered ${answeredCount}/${totalQuestions}).`);
      return;
    }

    let totalScore = 0;
    for (let i = 0; i < totalQuestions; i++) {
      totalScore += (STATE.screenerAnswers[i] || 0);
    }

    const maxScore = totalQuestions * 3;
    const interpretation = data.interpret(totalScore);

    document.getElementById('resultScore').textContent = `${totalScore} / ${maxScore}`;
    document.getElementById('resultScore').style.backgroundColor = interpretation.color;
    document.getElementById('resultSeverity').textContent = interpretation.level;
    document.getElementById('resultRecommendation').textContent = interpretation.advice;

    let detailsHtml = `
      <p><strong>Clinical Summary:</strong> Your response pattern indicates <em>${interpretation.level}</em> under the standardized ${data.title} framework.</p>
      <ul style="margin: 0.75rem 0 0.75rem 1.25rem;">
        <li>Assessment Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</li>
        <li>Instrument: ${data.title}</li>
        <li>Raw Score: ${totalScore} out of ${maxScore}</li>
      </ul>
      <p><small>Note: This instrument is an evidence-based screening aid for early identification, not a standalone clinical diagnosis. If symptoms persist or cause functional impairment, consultation with a registered clinician is recommended.</small></p>
    `;

    if (STATE.currentScreener === 'phq9' && STATE.screenerAnswers[8] > 0) {
      detailsHtml += `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin-top: 1rem; color: #fee2e2;">
          <strong>⚠️ Immediate Support Notice:</strong> You indicated thoughts regarding self-harm or hopelessness on question 9. Please remember you are not alone and free, confidential support is available right now. Please call Tele-MANAS at <strong>14416</strong> or KIRAN at <strong>1800-599-0019</strong>.
        </div>
      `;
    }

    document.getElementById('resultDetails').innerHTML = detailsHtml;

    form.classList.add('hidden');
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth' });
    SoundFX.playTone(600, 'sine', 0.3);
  });

  retakeBtn.addEventListener('click', () => {
    STATE.screenerAnswers = {};
    renderScreenerQuestions();
    resultCard.classList.add('hidden');
    form.classList.remove('hidden');
  });

  printBtn.addEventListener('click', () => {
    openClinicalReportModal();
  });
}

function openClinicalReportModal() {
  const modal = document.getElementById('clinicalReportModal');
  const content = document.getElementById('clinicalReportContent');
  const stamp = document.getElementById('reportMetaStamp');
  const data = SCREENERS[STATE.currentScreener];

  let totalScore = 0;
  for (let i = 0; i < data.questions.length; i++) {
    totalScore += (STATE.screenerAnswers[i] || 0);
  }
  const maxScore = data.questions.length * 3;
  const interp = data.interpret(totalScore);

  stamp.textContent = `Anonymous ID: #MP-${Math.floor(1000 + Math.random() * 9000)} • Generated: ${new Date().toLocaleDateString()}`;

  content.innerHTML = `
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:14px; margin-bottom:14px;">
      <h4 style="font-size:1.15rem; color:#1e293b; margin-bottom:4px;">${data.title}</h4>
      <p style="color:#64748b; font-size:0.85rem;">Standardized Psychometric Triage Evaluation • Aligned with UN SDG 3</p>
    </div>
    <div style="display:flex; justify-content:space-between; background:#f8fafc; padding:12px 16px; border-radius:8px; margin-bottom:16px;">
      <div><strong>Severity Classification:</strong> <span style="color:${interp.color}; font-weight:700;">${interp.level}</span></div>
      <div><strong>Total Score:</strong> ${totalScore} / ${maxScore}</div>
    </div>
    <h5 style="margin:12px 0 6px; font-weight:700;">Clinical Protocol Guidance:</h5>
    <p style="margin-bottom:12px;">${interp.advice}</p>
    <h5 style="margin:12px 0 6px; font-weight:700;">24/7 Verified Emergency Contacts:</h5>
    <ul style="padding-left:18px; margin-bottom:14px;">
      <li>Tele-MANAS National Toll-Free: <strong>14416</strong></li>
      <li>KIRAN Mental Health Line: <strong>1800-599-0019</strong></li>
      <li>Vandrevala Crisis Counseling: <strong>+91 9999 666 555</strong></li>
    </ul>
    <p style="font-size:0.75rem; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:8px;">
      Disclaimer: This evaluation is generated by MindPulse AI as an educational screening tool and self-management aid. It does not replace clinical consultation by a psychiatrist or licensed clinical psychologist.
    </p>
  `;

  modal.classList.remove('hidden');
}

// --- Calm Zone & Breathing Engine ---
function initBreathing() {
  const circle = document.getElementById('breathCircle');
  const stateText = document.getElementById('breathStateText');
  const countText = document.getElementById('breathCountText');
  const toggleBtn = document.getElementById('breathToggleBtn');
  const patternBtn = document.getElementById('switchBreathingPattern');

  const patterns = {
    '478': { name: '4-7-8 Relax', steps: [{ label: 'Inhale', sec: 4, cls: 'inhale', freq: 440 }, { label: 'Hold', sec: 7, cls: 'hold', freq: 520 }, { label: 'Exhale', sec: 8, cls: 'exhale', freq: 360 }] },
    'box': { name: 'Box (4-4-4-4)', steps: [{ label: 'Inhale', sec: 4, cls: 'inhale', freq: 440 }, { label: 'Hold', sec: 4, cls: 'hold', freq: 520 }, { label: 'Exhale', sec: 4, cls: 'exhale', freq: 360 }, { label: 'Hold', sec: 4, cls: 'hold', freq: 480 }] }
  };

  patternBtn.addEventListener('click', () => {
    if (STATE.breathingActive) stopBreathing();
    STATE.breathingPattern = STATE.breathingPattern === '478' ? 'box' : '478';
    patternBtn.textContent = `Pattern: ${patterns[STATE.breathingPattern].name}`;
  });

  toggleBtn.addEventListener('click', () => {
    if (STATE.breathingActive) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  let currentStepIdx = 0;
  let remainingSec = 0;

  function startBreathing() {
    STATE.breathingActive = true;
    toggleBtn.textContent = 'Pause Breathing Cycle';
    currentStepIdx = 0;
    executeStep();
  }

  function stopBreathing() {
    STATE.breathingActive = false;
    clearTimeout(STATE.breathingInterval);
    toggleBtn.textContent = 'Start Breathing Cycle';
    circle.className = 'breathing-circle';
    stateText.textContent = 'Ready';
    countText.textContent = 'Click Start';
  }

  function executeStep() {
    if (!STATE.breathingActive) return;

    const currentPattern = patterns[STATE.breathingPattern];
    const step = currentPattern.steps[currentStepIdx];
    remainingSec = step.sec;

    circle.className = `breathing-circle ${step.cls}`;
    stateText.textContent = step.label;
    countText.textContent = `${remainingSec}s`;
    SoundFX.playTone(step.freq, 'sine', 0.3);

    const stepTimer = setInterval(() => {
      if (!STATE.breathingActive) {
        clearInterval(stepTimer);
        return;
      }
      remainingSec--;
      if (remainingSec > 0) {
        countText.textContent = `${remainingSec}s`;
      } else {
        clearInterval(stepTimer);
        currentStepIdx = (currentStepIdx + 1) % currentPattern.steps.length;
        executeStep();
      }
    }, 1000);
  }
}

// --- 5-4-3-2-1 Grounding Tool ---
function initGrounding() {
  const steps = document.querySelectorAll('.ground-step');
  const completeBtn = document.getElementById('completeGroundingBtn');

  steps.forEach((step, idx) => {
    const input = step.querySelector('input');
    if (input) {
      input.addEventListener('focus', () => {
        steps.forEach(s => s.classList.remove('active'));
        step.classList.add('active');
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && idx < steps.length - 1) {
          steps[idx + 1].querySelector('input').focus();
        }
      });
    }
  });

  completeBtn.addEventListener('click', () => {
    steps.forEach(s => {
      const inp = s.querySelector('input');
      if (inp) inp.value = '';
      s.classList.remove('active');
    });
    steps[0].classList.add('active');
    alert('✨ Grounding complete! Notice your breathing, feet on the ground, and feeling of calm stability.');
    SoundFX.playTone(660, 'sine', 0.4);
  });
}

// --- Mood Tracker, Triggers & 14-Day Heatmap ---
function initMoodTracker() {
  const moodOpts = document.querySelectorAll('.mood-opt');
  const energyRange = document.getElementById('energyRange');
  const energyVal = document.getElementById('energyVal');
  const moodForm = document.getElementById('moodForm');
  const journalNote = document.getElementById('journalNote');
  const triggerTags = document.querySelectorAll('.trigger-tag');

  let selectedMood = 'Good';
  let selectedScore = 4;

  energyRange.addEventListener('input', (e) => {
    energyVal.textContent = e.target.value;
  });

  moodOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      moodOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedMood = opt.getAttribute('data-mood');
      selectedScore = parseInt(opt.getAttribute('data-score'), 10);
    });
  });

  triggerTags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
      const val = tag.getAttribute('data-tag');
      if (tag.classList.contains('selected')) {
        if (!STATE.selectedTriggers.includes(val)) STATE.selectedTriggers.push(val);
      } else {
        STATE.selectedTriggers = STATE.selectedTriggers.filter(t => t !== val);
      }
    });
  });

  moodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      score: selectedScore,
      energy: parseInt(energyRange.value, 10),
      triggers: [...STATE.selectedTriggers],
      note: journalNote.value.trim()
    };

    STATE.moodHistory.unshift(entry);
    if (STATE.moodHistory.length > 30) STATE.moodHistory.pop();
    localStorage.setItem('mindpulse_moods', JSON.stringify(STATE.moodHistory));

    journalNote.value = '';
    STATE.selectedTriggers = [];
    triggerTags.forEach(t => t.classList.remove('selected'));

    renderMoodHistory();
    SoundFX.playTone(550, 'sine', 0.2);
    alert('✅ Check-in logged successfully!');
  });

  renderMoodHistory();

  function renderMoodHistory() {
    const list = document.getElementById('moodHistoryList');
    const chart = document.getElementById('moodChartMini');
    const streakBadge = document.getElementById('streakBadge');
    const heatmapGrid = document.getElementById('heatmapGrid');

    renderHeatmap(heatmapGrid);

    if (!STATE.moodHistory || STATE.moodHistory.length === 0) {
      list.innerHTML = '<p class="empty-state">No check-ins yet. Log your first check-in above!</p>';
      chart.innerHTML = '';
      if (streakBadge) streakBadge.textContent = '🔥 0 Days';
      return;
    }

    if (streakBadge) {
      streakBadge.textContent = `🔥 ${STATE.moodHistory.length} Check-in${STATE.moodHistory.length > 1 ? 's' : ''}`;
    }

    // Mini Trend Bars
    const recent = STATE.moodHistory.slice(0, 7).reverse();
    chart.innerHTML = '';
    recent.forEach(item => {
      const bar = document.createElement('div');
      bar.className = 'bar-item';
      const heightPercent = (item.score / 5) * 100;
      bar.innerHTML = `
        <div class="bar-fill" style="height: ${heightPercent}%;"></div>
        <span class="bar-label">${item.date}</span>
      `;
      chart.appendChild(bar);
    });

    // History List
    list.innerHTML = '';
    STATE.moodHistory.slice(0, 10).forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-entry';
      const triggersHtml = item.triggers && item.triggers.length > 0 
        ? `<div style="margin-top:4px;">${item.triggers.map(t => `<span class="badge" style="font-size:0.65rem; margin-right:4px;">${t}</span>`).join('')}</div>`
        : '';

      row.innerHTML = `
        <div style="flex:1;">
          <strong>${item.mood}</strong> <small style="color:var(--text-dim);">(${item.date} ${item.time})</small>
          ${item.note ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">"${escapeHtml(item.note)}"</p>` : ''}
          ${triggersHtml}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge">Energy: ${item.energy}/10</span>
          <button type="button" class="delete-record-btn" data-id="${item.id}" title="Remove this record">🗑️</button>
        </div>
      `;
      list.appendChild(row);
    });

    // Attach individual delete event listeners
    list.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToRemove = parseInt(btn.getAttribute('data-id'), 10);
        STATE.moodHistory = STATE.moodHistory.filter(entry => entry.id !== idToRemove);
        localStorage.setItem('mindpulse_moods', JSON.stringify(STATE.moodHistory));
        renderMoodHistory();
        SoundFX.playTone(380, 'sine', 0.15);
      });
    });
  }

  // Clear All Records Button
  const clearAllBtn = document.getElementById('clearAllMoodsBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (STATE.moodHistory.length === 0) return;
      if (confirm('Are you sure you want to delete all check-in records? This action cannot be undone.')) {
        STATE.moodHistory = [];
        localStorage.removeItem('mindpulse_moods');
        renderMoodHistory();
        SoundFX.playTone(320, 'sine', 0.2);
      }
    });
  }

  function renderHeatmap(container) {
    if (!container) return;
    container.innerHTML = '';
    // Show 14 days block
    for (let i = 13; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'heat-cell';
      const entry = STATE.moodHistory[i];
      if (entry) {
        cell.classList.add(`level-${entry.score}`);
        cell.title = `Day -${i}: ${entry.mood} (${entry.date})`;
      } else {
        cell.title = `Day -${i}: No entry`;
      }
      container.appendChild(cell);
    }
  }
}

// --- Professional Enhancements Initialization ---
function initEnhancements() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('clinicalReportModal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    }
  });

  // 2. Soundscape Controls
  const soundChips = document.querySelectorAll('.sound-chip');
  const stopSoundBtn = document.getElementById('stopSoundBtn');
  const volSlider = document.getElementById('soundVolSlider');
  const volLabel = document.getElementById('soundVolLabel');

  soundChips.forEach(chip => {
    chip.addEventListener('click', () => {
      soundChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const soundType = chip.getAttribute('data-sound');
      const vol = parseInt(volSlider.value, 10) / 100;
      SoundFX.playSoundscape(soundType, vol);
    });
  });

  if (stopSoundBtn) {
    stopSoundBtn.addEventListener('click', () => {
      SoundFX.stopSoundscape();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      if (volLabel) volLabel.textContent = `${val}%`;
      if (STATE.soundscapeGain && SoundFX.ctx) {
        STATE.soundscapeGain.gain.setValueAtTime((val / 100) * 0.15, SoundFX.ctx.currentTime);
      }
    });
  }

  // 3. Close Report Modal Listeners
  const closeBtn1 = document.getElementById('closeReportModalBtn');
  const closeBtn2 = document.getElementById('closeReportModalBtn2');
  const modal = document.getElementById('clinicalReportModal');
  if (closeBtn1) closeBtn1.addEventListener('click', () => modal.classList.add('hidden'));
  if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.add('hidden'));
}
