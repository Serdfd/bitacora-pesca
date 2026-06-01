// ─── GESTIÓN DE API KEY ──────────────────────────────────────────────────────

function saveKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key.startsWith('sk-')) { alert('La clave debe comenzar con sk-'); return; }
  localStorage.setItem('anthr_key', key);
  showChatUI();
}

function clearKey() {
  localStorage.removeItem('anthr_key');
  document.getElementById('chat-interface').style.display = 'none';
  document.getElementById('api-setup').style.display      = 'block';
  document.getElementById('api-key-input').value          = '';
}

function showChatUI() {
  document.getElementById('api-setup').style.display      = 'none';
  document.getElementById('chat-interface').style.display = 'block';
}

// ─── CONTEXTO PARA CLAUDE ────────────────────────────────────────────────────

function buildContext() {
  const now = new Date();
  const ph  = MOON_PHASES[getMoonPhase(now).idx];
  return `Eres un experto en pesca deportiva del Caribe colombiano.
Zonas del usuario: Capurganá/Sapzurro (arrecifes de coral, único spot de tarpon en bocas de ríos),
Puerto Escondido con Tortuguilla y bajos offshore hasta 18km (acceso a blue-water para wahoo y dorado),
Isla Fuerte con el Bajo Bushnell (bajo extenso para pargo rojo y sierras),
Santa Marta (arrecifes de Taganga, pargo rojo y sierras en temporada seca),
Barranquilla (bocas del Magdalena para tarpon, offshore para pelágicos).
Especies objetivo: Carite/Sierra brasileña (Scomberomorus brasiliensis),
Sierra común/Carite real (S. cavalla), Sierra pintada (S. regalis),
Jurel aleta amarilla (Caranx hippos), Barracuda (Sphyraena barracuda),
Pargo (Lutjanus spp.), Tarpon/Sábalo (Megalops atlanticus),
Wahoo (Acanthocybium solandri), Dorado/Mahi-Mahi (Coryphaena hippurus).
Técnicas usadas: Trolling, Casting spinning, Jigging.
Pesca solo de día, amanecer hasta 2–4pm.
Hoy: ${now.getDate()} de ${MONTHS_LONG[now.getMonth()]} ${now.getFullYear()}.
Fase lunar: ${ph.name} — ${ph.diurno}.
Para pesca diurna: cuarto creciente y menguante son los mejores; luna llena exacta es mala de día.
Responde en español, conciso, máximo 220 palabras.`;
}

// ─── PREGUNTAS RÁPIDAS ───────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  { label:'¿Hoy vale la pena el Bajo Bushnell?',           msg:'¿Es hoy un buen día para ir al Bajo Bushnell? Considera luna y temporada.' },
  { label:'¿Qué especie priorizar hoy en Puerto Escondido?', msg:'Dado el ciclo lunar y la temporada, ¿qué especie priorizar hoy en Puerto Escondido?' },
  { label:'Checklist para el bajo lejano (18km)',           msg:'Dame el checklist para salir al bajo lejano de 18km hoy. Incluye hora de salida, señuelos y qué buscar.' },
  { label:'Mejores días del mes para sierra cavalla',       msg:'¿Cuáles son los mejores días del próximo mes para sierra cavalla en Puerto Escondido?' },
  { label:'¿Cuándo aparecen wahoo y dorado?',               msg:'¿En qué época y zona hay más probabilidad de encontrar wahoo y dorado en mis zonas?' }
];

function buildQuickBtns() {
  document.getElementById('quick-btns').innerHTML = QUICK_QUESTIONS.map(q =>
    `<button class="q-btn" onclick="quickAsk('${q.msg.replace(/'/g,"\\'")}')">
      ${q.label}
    </button>`
  ).join('');
}

// ─── ENVÍO DE MENSAJES ───────────────────────────────────────────────────────

const chatHistory = [];

async function sendMsg() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';
  await callClaude(msg);
}

async function quickAsk(msg) {
  // Cambiar al tab de Consultar
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-claude').classList.add('active');
  document.querySelector('.nav-btn:last-child').classList.add('active');
  await callClaude(msg);
}

async function callClaude(userMsg) {
  const key = localStorage.getItem('anthr_key');
  if (!key) { alert('Primero guarda tu API key'); return; }

  const area = document.getElementById('chat-area');
  area.innerHTML += `<div class="msg msg-user">${userMsg}</div>`;

  const tid = 'th-' + Date.now();
  area.innerHTML += `<div class="msg msg-ai thinking" id="${tid}">
    Pensando<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
  </div>`;
  area.scrollTop = area.scrollHeight;

  chatHistory.push({ role:'user', content:userMsg });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':                          'application/json',
        'x-api-key':                             key,
        'anthropic-version':                     '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 450,
        system:     buildContext(),
        messages:   chatHistory
      })
    });

    const data  = await res.json();
    const reply = data.content?.[0]?.text || 'Sin respuesta.';
    chatHistory.push({ role:'assistant', content:reply });

    const el = document.getElementById(tid);
    if (el) el.outerHTML = `<div class="msg msg-ai">
      ${reply
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')}
    </div>`;
  } catch (e) {
    const el = document.getElementById(tid);
    if (el) el.outerHTML = `<div class="msg msg-ai" style="color:var(--danger)">
      Error de conexión. Verifica tu API key e internet.
    </div>`;
  }

  area.scrollTop = area.scrollHeight;
}