
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-based

// ─── CONTROL DE FUENTE ───────────────────────────────────────────────────────

let fontSize = parseInt(localStorage.getItem('fs') || '15');

function applyFont() {
  document.documentElement.style.fontSize = fontSize + 'px';
  document.documentElement.style.setProperty('--fs', fontSize + 'px');
}
function changeFont(d) {
  fontSize = Math.max(13, Math.min(20, fontSize + d));
  localStorage.setItem('fs', fontSize);
  applyFont();
}
applyFont();

// ─── NAVEGACIÓN POR TABS ─────────────────────────────────────────────────────

function switchTab(id, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  el.classList.add('active');
  if (id === 'reportes') initReportes();
  if (id === 'fecha')    buildCalendar();
}

// ─── BUILD DAY VIEW ──────────────────────────────────────────────────────────

function buildDayView(date, ctx) {
  const ph = MOON_PHASES[getMoonPhase(date).idx];
  const m  = date.getMonth();

  if (ctx === 'hoy') {
    document.getElementById('moon-sym').textContent    = ph.sym;
    document.getElementById('moon-name').textContent   = ph.name;
    document.getElementById('moon-detail').textContent = ph.diurno;
    const sc = document.getElementById('moon-score');
    sc.textContent = ph.score;
    sc.style.color = `var(--${ph.color})`;

    const badge = document.getElementById('hoy-badge');
    badge.textContent = ph.score;
    badge.className   = `badge b-${ph.color === 'good' ? 'hi' : ph.color === 'warn' ? 'mid' : 'lo'}`;
    document.getElementById('hoy-body').textContent = ph.diurno;

    document.getElementById('hoy-especies').innerHTML =
    Object.entries(SPECIES).map(([k, sp]) => {
      const act = sp.months[m];
      return `
        <div class="card hoy-sp-card" style="margin-bottom:0.4rem;">
          <div class="hoy-sp-img-wrap">
            <img class="hoy-sp-img" src="${sp.img}" alt="${sp.common}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
            <div class="hoy-sp-img-fallback" style="display:none">${sp.icon}</div>
          </div>
          <div class="hoy-sp-info">
            <div class="hoy-sp-name">${sp.common.split('/')[0].trim()}</div>
            <div class="hoy-sp-sci">${sp.sci}</div>
          </div>
          <span class="badge b-${act==='hi'?'hi':act==='mid'?'mid':'lo'}">
            ${act==='hi'?'Temporada alta':act==='mid'?'Media':'Baja'}
          </span>
        </div>`;
    }).join('');

    document.getElementById('hoy-ventana').innerHTML =
      `🌅 <strong>5:30 – 9:00am</strong> — Ventana principal, todos los depredadores activos<br>
       🌊 <strong>2:00 – 4:00pm</strong> — Segunda ventana, pargo y jurel`;

    buildHoyComparison(ph.name, ph.sym);

  } else {
    document.getElementById('fut-sym').textContent    = ph.sym;
    document.getElementById('fut-phase').textContent  = ph.name;
    document.getElementById('fut-diurno').textContent = ph.diurno;
    const sc = document.getElementById('fut-score');
    sc.textContent = ph.score;
    sc.style.color = `var(--${ph.color})`;

    const goodSp = Object.values(SPECIES)
      .filter(sp => sp.months[m] === 'hi')
      .map(sp => sp.common.split('/')[0].trim());
    document.getElementById('fut-season').textContent = goodSp.length
      ? `Temporada alta: ${goodSp.join(', ')}`
      : 'Temporada baja general — pargo siempre disponible';

    document.getElementById('fut-especies').innerHTML =
    Object.entries(SPECIES).map(([k, sp]) => {
      const act = sp.months[m];
      return `
        <div class="card hoy-sp-card" style="margin-bottom:0.4rem;">
          <div class="hoy-sp-img-wrap">
            <img class="hoy-sp-img" src="${sp.img}" alt="${sp.common}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
            <div class="hoy-sp-img-fallback" style="display:none">${sp.icon}</div>
          </div>
          <div class="hoy-sp-info">
            <div class="hoy-sp-name">${sp.common.split('/')[0].trim()}</div>
            <div class="hoy-sp-sci">${sp.sci}</div>
          </div>
          <span class="badge b-${act==='hi'?'hi':act==='mid'?'mid':'lo'}">
            ${act==='hi'?'Temporada alta':act==='mid'?'Media':'Baja'}
          </span>
        </div>`;
    }).join('');

    document.getElementById('fut-ventana').innerHTML =
      `🌅 <strong>5:30 – 9:00am</strong> — Ventana principal<br>
       🌊 <strong>2:00 – 4:00pm</strong> — Segunda ventana`;
  }
}

// ─── COMPARACIÓN HISTÓRICA (HOY) ─────────────────────────────────────────────

async function buildHoyComparison(faseLunar, faseSym) {
  const container = document.getElementById('hoy-comparacion');
  if (!container) return;

  container.innerHTML = `<div class="card"><div class="card-body" style="color:var(--muted);font-style:italic;">Cargando historial...</div></div>`;

  const entries = await dbGetAll();
  const similar = entries.filter(e => e.faseLunar === faseLunar);

  if (similar.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="card-body" style="color:var(--muted);font-style:italic;">
          Sin salidas previas en ${faseSym} ${faseLunar}. ¡Esta puede ser la primera!
        </div>
      </div>`;
    return;
  }

  const caps       = similar.flatMap(e => e.capturas || []);
  const totalPeces = caps.reduce((a, c) => a + (c.cantidad || 0), 0);
  const avgCaps    = (totalPeces / similar.length).toFixed(1);

  const cntEsp = {};
  caps.forEach(c => { if (c.especie) cntEsp[c.especie] = (cntEsp[c.especie] || 0) + (c.cantidad || 1); });
  const topEsp = Object.entries(cntEsp).sort((a, b) => b[1] - a[1])[0];

  const cntSen = {};
  caps.forEach(c => { if (c.señuelo) cntSen[c.señuelo] = (cntSen[c.señuelo] || 0) + (c.cantidad || 1); });
  const topSen = Object.entries(cntSen).sort((a, b) => b[1] - a[1])[0];

  const bestDay = similar
    .map(e => ({ fecha: e.fecha, total: (e.capturas || []).reduce((a, c) => a + (c.cantidad || 0), 0) }))
    .sort((a, b) => b.total - a.total)[0];

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">📊 ${faseSym} ${faseLunar}</div>
        <span class="badge b-info">${similar.length} salida${similar.length > 1 ? 's' : ''} previas</span>
      </div>
      <div class="card-body">
        <div class="info-2">
          <div class="ib"><div class="ib-l">PROMEDIO</div><div class="ib-v">${avgCaps} capturas/salida</div></div>
          <div class="ib"><div class="ib-l">TOTAL HISTÓRICO</div><div class="ib-v">${totalPeces} ${totalPeces === 1 ? 'pez' : 'peces'}</div></div>
          ${topEsp ? `<div class="ib"><div class="ib-l">ESPECIE TOP</div><div class="ib-v">${SPECIES[topEsp[0]]?.icon} ${SPECIES[topEsp[0]]?.common.split('/')[0].trim()}</div></div>` : ''}
          ${topSen ? `<div class="ib"><div class="ib-l">SEÑUELO TOP</div><div class="ib-v">🪝 ${topSen[0]}</div></div>` : ''}
          ${bestDay?.total > 0 ? `<div class="ib" style="grid-column:span 2"><div class="ib-l">🏆 MEJOR DÍA EN ESTA FASE</div><div class="ib-v">${bestDay.total} ${bestDay.total === 1 ? 'pez' : 'peces'} · ${formatFecha(bestDay.fecha)}</div></div>` : ''}
        </div>
      </div>
    </div>`;
}

// ─── CALENDARIO — PRÓXIMOS 30 DÍAS ───────────────────────────────────────────

function scoreToCalClass(score) {
  if (score === 'A+') return 'cal-aplus';
  if (score === 'A')  return 'cal-a';
  if (score === 'D')  return 'cal-d';
  return 'cal-b';
}

// ─── CALENDARIO POR MES ───────────────────────────────────────────────────────

function buildCalendar() {
  const container = document.getElementById('cal-grid');
  const titleEl   = document.getElementById('cal-month-title');
  if (!container || !titleEl) return;

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Título del mes
  const monthName = MONTHS_LONG[calMonth].charAt(0).toUpperCase() + MONTHS_LONG[calMonth].slice(1);
  titleEl.textContent = `${monthName} ${calYear}`;

  // Habilitar/deshabilitar botón anterior (no ir antes del mes actual)
  const prevBtn = document.getElementById('cal-prev');
  const isPastMonth = calYear < today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth <= today.getMonth());
  if (prevBtn) prevBtn.disabled = isPastMonth;

  // Días del mes
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0=Dom

  // Encabezados días de la semana
  const dayHeaders = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    .map(d => `<div class="cal-dow-header">${d}</div>`).join('');

  // Celdas vacías al inicio
  const emptyCells = Array.from({ length: firstDayOfWeek }, () =>
    `<div class="cal-cell cal-empty"></div>`
  ).join('');

  // Celdas de días
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day     = i + 1;
    const d       = new Date(calYear, calMonth, day, 12, 0, 0);
    const ph      = MOON_PHASES[getMoonPhase(d).idx];
    const cls     = scoreToCalClass(ph.score);
    const isToday = d.toDateString() === today.toDateString();
    const isPast  = d < today && !isToday;

    return `
      <div class="cal-cell ${cls}${isToday ? ' cal-today' : ''}${isPast ? ' cal-past' : ''}">
        <div class="cal-date">${day}</div>
        <div class="cal-moon">${ph.sym}</div>
        <div class="cal-score">${ph.score}</div>
      </div>`;
  }).join('');

  container.innerHTML = dayHeaders + emptyCells + dayCells;
}

function calPrev() {
  const today = new Date();
  if (calYear === today.getFullYear() && calMonth <= today.getMonth()) return;
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  buildCalendar();
}

function calNext() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  buildCalendar();
}

// ─── RÉCORDS POR ESPECIE ──────────────────────────────────────────────────────

async function buildSpRecords(id) {
  const container = document.getElementById('sp-records');
  if (!container) return;

  const entries           = await dbGetAll();
  const salidasConEspecie = entries.filter(e => (e.capturas || []).some(c => c.especie === id));
  const caps              = entries.flatMap(e =>
    (e.capturas || []).filter(c => c.especie === id).map(c => ({ ...c, fecha: e.fecha }))
  );

  if (caps.length === 0) {
    container.innerHTML = `
      <div class="sec-label">🏆 tu historial con esta especie</div>
      <div class="card">
        <div class="card-body" style="color:var(--muted);font-style:italic;">
          Sin capturas registradas en tu bitácora para esta especie.
        </div>
      </div>`;
    return;
  }

  const totalPeces = caps.reduce((a, c) => a + (c.cantidad || 0), 0);
  const mejorPeso  = caps.filter(c => c.peso).sort((a, b) => b.peso - a.peso)[0];
  const mejorTalla = caps.filter(c => c.talla).sort((a, b) => b.talla - a.talla)[0];

  const cntSen = {};
  caps.forEach(c => { if (c.señuelo) cntSen[c.señuelo] = (cntSen[c.señuelo] || 0) + (c.cantidad || 1); });
  const topSen = Object.entries(cntSen).sort((a, b) => b[1] - a[1])[0];

  const cntZona = {};
  salidasConEspecie.forEach(e => { if (e.zona) cntZona[e.zona] = (cntZona[e.zona] || 0) + 1; });
  const topZona = Object.entries(cntZona).sort((a, b) => b[1] - a[1])[0];

  container.innerHTML = `
    <div class="sec-label">🏆 tu historial con esta especie</div>
    <div class="info-2" style="margin-bottom:1rem;">
      <div class="ib">
        <div class="ib-l">TOTAL CAPTURAS</div>
        <div class="ib-v">${totalPeces} ${totalPeces === 1 ? 'pez' : 'peces'} · ${salidasConEspecie.length} salida${salidasConEspecie.length !== 1 ? 's' : ''}</div>
      </div>
      ${topSen ? `<div class="ib"><div class="ib-l">SEÑUELO ESTRELLA</div><div class="ib-v">🪝 ${topSen[0]}</div></div>` : ''}
      ${mejorPeso  ? `<div class="ib"><div class="ib-l">MAYOR PESO</div><div class="ib-v">⚖️ ${mejorPeso.peso} kg · ${formatFecha(mejorPeso.fecha)}</div></div>` : ''}
      ${mejorTalla ? `<div class="ib"><div class="ib-l">MAYOR TALLA</div><div class="ib-v">📏 ${mejorTalla.talla} cm · ${formatFecha(mejorTalla.fecha)}</div></div>` : ''}
      ${topZona    ? `<div class="ib"><div class="ib-l">ZONA FAVORITA</div><div class="ib-v">📍 ${ZONES[topZona[0]]?.name || topZona[0]}</div></div>` : ''}
    </div>`;
}

// ─── TAB: ESPECIES ───────────────────────────────────────────────────────────

function buildSpGrid() {
  return;
}

function showSp() {
  return;
}

// ─── TAB: ZONAS ──────────────────────────────────────────────────────────────

function buildZoneTabs() {
  const container = document.getElementById('zone-tabs');

  container.innerHTML = REGIONES.map((r, i) => `
    <button
      class="zt${i === 0 ? ' active' : ''}"
      onclick="showZona('${r.id}', this)"
    >
      ${r.nombre}
    </button>
  `).join('');

  showZona(
    REGIONES[0].id,
    container.querySelector('.zt')
  );
}

function showZona(id, el) {

  document
    .querySelectorAll('.zt')
    .forEach(z => z.classList.remove('active'));

  el.classList.add('active');

  const region = REGIONES.find(r => r.id === id);

  if (!region) return;

  document.getElementById('zona-content').innerHTML = `

    <div class="card">
      <div class="card-body">
        ${region.descripcion}
      </div>
    </div>

    <div class="sec-label">
      spots conocidos
    </div>

    <div class="spot-grid">

      ${region.spots.map(spot => `

        <div class="spot-card">

          <div class="spot-head">

            <div class="spot-title">
              📍 ${spot.nombre}
            </div>

            <div class="spot-badge">
              ${formatSpotType(spot.tipo)}
            </div>

          </div>

          <div class="spot-section">

            <div class="spot-label">
              estructuras
            </div>

            <div class="spot-tags">

              ${spot.estructuras.map(e => `
                <span class="spot-tag">
                  ${formatLabel(e)}
                </span>
              `).join('')}

            </div>

          </div>

          <div class="spot-section">

            <div class="spot-label">
              especies potenciales
            </div>

            <div class="spot-tags">

              ${spot.especiesPotenciales.map(id => `
                <span class="spot-tag species">
                  ${getSpeciesName(id)}
                </span>
              `).join('')}

            </div>

          </div>

          <div class="spot-section">

            <div class="spot-label">
              recomendaciones
            </div>

            <ul class="spot-recs">

              ${spot.recomendaciones.map(r => `
                <li>${r}</li>
              `).join('')}

            </ul>

          </div>

          <div class="spot-notes">
            ${spot.notas}
          </div>

        </div>

      `).join('')}

    </div>
  `;
}

function formatLabel(str) {
  return str
    .replaceAll('_', ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatSpotType(type) {
  return type
    .replaceAll('_', ' ')
    .toUpperCase();
}

function getSpeciesName(id) {

  if (!SPECIES) return id;

  // SI ES ARRAY
  if (Array.isArray(SPECIES)) {

    const sp = SPECIES.find(s => s.id === id);

    return sp ? sp.name : id;
  }

  // SI ES OBJETO
  const sp = SPECIES[id];

  if (!sp) return id;

  return sp.name || sp.nombre || id;
}

// ─── FECHA FUTURA ────────────────────────────────────────────────────────────

function lookupFuture() {
  const val = document.getElementById('future-date').value;
  if (!val) return;
  const date = new Date(val + 'T12:00:00');
  document.getElementById('fut-date-label').textContent =
    `${DAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
  buildDayView(date, 'future');
  document.getElementById('future-result').classList.add('visible');
  document.getElementById('future-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────

function init() {
  const now      = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  document.getElementById('date-chip').textContent =
    `${DAYS_SHORT[now.getDay()]} ${now.getDate()} ${MONTHS_LONG[now.getMonth()].substring(0, 3)} ${now.getFullYear()}`;

  document.getElementById('future-date').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('future-date').min   = now.toISOString().split('T')[0];

  buildDayView(now, 'hoy');
  buildZoneTabs();
  buildQuickBtns();
  initBitacora();

  const saved = localStorage.getItem('anthr_key');
  if (saved) {
    document.getElementById('api-key-input').value = saved;
    showChatUI();
  }
}

document.addEventListener('DOMContentLoaded', init);