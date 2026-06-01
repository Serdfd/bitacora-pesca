// ─── OPCIONES DE FORMULARIO ──────────────────────────────────────────────────

const CLIMA_OPTS = [
  'Soleado','Parcialmente nublado','Nublado','Bruma / Calima',
  'Lluvia ligera','Lluvia fuerte','Tormenta',
  'Viento moderado','Viento fuerte'
];
const AGUA_OPTS = [
  'Agua clara','Agua turbia','Agua verde','Agua azul profundo',
  'Oleaje leve','Oleaje medio','Oleaje fuerte',
  'Corriente fuerte','Corriente moderada','Sin corriente',
  'Marea baja','Marea alta','Marea en subida','Marea en bajada','Termoclina visible'
];
const SEÑUELO_OPTS = [
  'Popper','Minnow / Plug','Stickbait','Jig pluma','Metal jig',
  'Soft bait','Cuchara','Trolling skirt','Carnada viva','Trolling Lure',
  'Konahead','Feather lure','Rapala','Spoon','Streamer'
];
const TECNICA_OPTS = ['Trolling','Casting spinning','Jigging'];

let editingId     = null;
let currentRating = 0;
let capturasList  = [];
let activeFilters = { zona: '', especie: '', mes: '' };

// ─── INICIALIZACIÓN ───────────────────────────��──────────────────────────────

async function initBitacora() {
  await initDB();
  renderFilterBar();
  await renderBitacoraList();
}

// ─── FILTROS ─────────────────────────────────────────────────────────────────

function renderFilterBar() {

  const regionOptions = REGIONES.map(r => `
    <option value="${r.id}">
      ${r.nombre}
    </option>
  `).join('');

  const speciesOptions = Object.values(SPECIES).map(s => `
    <option value="${s.id}">
      ${s.name || s.nombre}
    </option>
  `).join('');

  document.getElementById('filter-bar').innerHTML = `

    <select id="filter-region">
      <option value="">Todas las regiones</option>
      ${regionOptions}
    </select>

    <select id="filter-species">
      <option value="">Todas las especies</option>
      ${speciesOptions}
    </select>

  `;
}

async function applyFilter(key, value) {
  activeFilters[key] = value;
  renderFilterBar();
  await renderBitacoraList();
}

async function clearFilters() {
  activeFilters = { zona: '', especie: '', mes: '' };
  renderFilterBar();
  await renderBitacoraList();
}

// ─── EXPORTAR / IMPORTAR ─────────────────────────────────────────────────────

async function exportBitacora() {
  const entries = await dbGetAll();
  if (!entries.length) { alert('No hay salidas para exportar.'); return; }
  const json = JSON.stringify({ version: 1, exportDate: new Date().toISOString(), entries }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bitacora_pesca_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBitacora() {
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json';
  input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text    = await file.text();
      const data    = JSON.parse(text);
      const entries = data.entries || (Array.isArray(data) ? data : []);
      if (!entries.length) { alert('El archivo no contiene salidas.'); return; }
      if (!confirm(`¿Importar ${entries.length} salidas? Se añadirán a las existentes.`)) return;
      for (const entry of entries) {
        const { id, ...rest } = entry;
        await dbAdd(rest);
      }
      await renderBitacoraList();
      alert(`✅ ${entries.length} salidas importadas correctamente.`);
    } catch {
      alert('Error al leer el archivo. Verifica que sea un JSON válido de la bitácora.');
    }
  };
  input.click();
}

// ─── MOSTRAR FORMULARIO ──────────────��───────────────────────────────────────

function showBitacoraForm(entry = null) {
  editingId     = entry ? entry.id : null;
  currentRating = entry?.rating || 0;
  capturasList  = entry?.capturas ? JSON.parse(JSON.stringify(entry.capturas)) : [];

  const wrap  = document.getElementById('bit-form-wrap');
  const today = new Date().toISOString().split('T')[0];

  wrap.innerHTML = `
    <div class="bit-form-card">
      <div class="bit-form-title">${entry ? '✏️ Editar salida' : '🎣 Nueva salida'}</div>

      <div class="bf-section-label">Datos de la salida</div>

      <div class="bf-row">
        <label class="bf-label">Fecha</label>
        <input type="date" class="bf-input" id="bf-fecha"
          value="${entry?.fecha || today}" max="${today}"
          onchange="updateMoonFromDate()" />
      </div>
      <div class="bf-row">
        <label class="bf-label">Zona</label>
        <select class="bf-input" id="bf-zona">
          <option value="">— selecciona —</option>
          ${Object.entries(ZONES).map(([id, z]) =>
            `<option value="${id}" ${entry?.zona === id ? 'selected' : ''}>${z.name}</option>`
          ).join('')}
        </select>
      </div>
      <div class="bf-row">
        <label class="bf-label">Fase lunar</label>
        <div class="bf-luna-display" id="bf-luna-display">–</div>
      </div>
      <div class="bf-row-2">
        <div class="bf-col">
          <label class="bf-label">Hora inicio</label>
          <input type="time" class="bf-input" id="bf-hora-ini" value="${entry?.horaIni || '05:30'}" />
        </div>
        <div class="bf-col">
          <label class="bf-label">Hora fin</label>
          <input type="time" class="bf-input" id="bf-hora-fin" value="${entry?.horaFin || '14:00'}" />
        </div>
      </div>
      <div class="bf-row">
        <label class="bf-label">Clima</label>
        <select class="bf-input" id="bf-clima">
          <option value="">— selecciona —</option>
          ${CLIMA_OPTS.map(c =>
            `<option value="${c}" ${entry?.clima === c ? 'selected' : ''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="bf-row">
        <label class="bf-label">Estado del agua / marea
          <span class="bf-hint">(selección múltiple)</span>
        </label>
        <div class="bf-chips" id="bf-agua-chips">
          ${AGUA_OPTS.map(o => {
            const sel = entry?.agua?.includes(o) ? 'active' : '';
            return `<div class="bf-chip ${sel}" onclick="toggleChip(this)">${o}</div>`;
          }).join('')}
        </div>
      </div>
      <div class="bf-row">
        <label class="bf-label">Profundidad aproximada (m)</label>
        <input type="number" class="bf-input" id="bf-prof"
          min="0" step="1" value="${entry?.profundidad ?? ''}" placeholder="ej: 25" />
      </div>

      <div class="bf-section-label" style="margin-top:1.2rem;">
        Capturas
        <span class="bf-hint" style="margin-left:0.4rem;">
          Agrega una fila por cada especie / señuelo diferente
        </span>
      </div>
      <div id="capturas-list"></div>
      <button type="button" class="bf-add-captura" onclick="addCapturaRow()">
        + Agregar captura
      </button>

      <div class="bf-section-label" style="margin-top:1.2rem;">Balance de la salida</div>
      <div class="bf-row">
        <label class="bf-label">Rating</label>
        <div class="bf-rating" id="bf-rating">
          ${[1,2,3,4,5].map(n =>
            `<button type="button" class="bf-star ${currentRating >= n ? 'active' : ''}"
              onclick="setRating(${n})">★</button>`
          ).join('')}
          <span class="bf-rating-label" id="bf-rating-label">${getRatingLabel(currentRating)}</span>
        </div>
      </div>
      <div class="bf-row">
        <label class="bf-label">Comentarios</label>
        <textarea class="bf-input bf-textarea" id="bf-comentarios"
          placeholder="Condiciones especiales, spots trabajados, observaciones..."
          rows="4">${entry?.comentarios || ''}</textarea>
      </div>

      <div class="bf-btns">
        <button class="bf-btn-cancel" onclick="hideBitacoraForm()">Cancelar</button>
        <button class="bf-btn-save"   onclick="saveBitacoraEntry()">
          ${entry ? 'Guardar cambios' : 'Guardar salida'}
        </button>
      </div>
    </div>`;

  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateMoonFromDate();
  renderCapturasList();
}

function hideBitacoraForm() {
  const wrap = document.getElementById('bit-form-wrap');
  wrap.style.display = 'none';
  wrap.innerHTML     = '';
  editingId          = null;
  currentRating      = 0;
  capturasList       = [];
}

// ─── CAPTURAS DINÁMICAS ──────────────────────────────────────────────────────

function addCapturaRow(cap = null) {
  capturasList.push(cap || { especie:'', tecnica:'', señuelo:'', colorSenuelo:'', cantidad:1, talla:'', peso:'', suelta:false });
  renderCapturasList();
}

function removeCapturaRow(idx) {
  capturasList.splice(idx, 1);
  renderCapturasList();
}

function renderCapturasList() {
  const container = document.getElementById('capturas-list');
  if (!container) return;

  if (capturasList.length === 0) {
    container.innerHTML = `<div class="cap-empty">Sin capturas — toca "+ Agregar captura" para añadir.</div>`;
    return;
  }

  container.innerHTML = capturasList.map((cap, i) => `
    <div class="cap-row" id="cap-row-${i}">
      <div class="cap-row-header">
        <span class="cap-row-num">Captura #${i + 1}</span>
        <button type="button" class="cap-remove" onclick="removeCapturaRow(${i})">✕</button>
      </div>
      <div class="bf-row-2">
        <div class="bf-col">
          <label class="bf-label">Especie</label>
          <select class="bf-input" onchange="updateCaptura(${i},'especie',this.value)">
            <option value="">— sin especie —</option>
            ${Object.entries(SPECIES).map(([id, sp]) =>
              `<option value="${id}" ${cap.especie === id ? 'selected' : ''}>
                ${sp.common.split('/')[0].trim()}
              </option>`
            ).join('')}
          </select>
        </div>
        <div class="bf-col">
          <label class="bf-label">Técnica</label>
          <select class="bf-input" onchange="updateCaptura(${i},'tecnica',this.value)">
            <option value="">— selecciona —</option>
            ${TECNICA_OPTS.map(t =>
              `<option value="${t}" ${cap.tecnica === t ? 'selected' : ''}>${t}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="bf-row-2">
        <div class="bf-col">
          <label class="bf-label">Señuelo</label>
          <select class="bf-input" onchange="updateCaptura(${i},'señuelo',this.value)">
            <option value="">— selecciona —</option>
            ${SEÑUELO_OPTS.map(s =>
              `<option value="${s}" ${cap.señuelo === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
        <div class="bf-col">
          <label class="bf-label">Color señuelo</label>
          <input type="text" class="bf-input"
            placeholder="ej: plateado, azul/blanco"
            value="${cap.colorSenuelo || ''}"
            onchange="updateCaptura(${i},'colorSenuelo',this.value)" />
        </div>
      </div>
      <div class="bf-row-3">
        <div class="bf-col">
          <label class="bf-label"># Peces</label>
          <input type="number" class="bf-input" min="1" value="${cap.cantidad || 1}"
            onchange="updateCaptura(${i},'cantidad',+this.value)" />
        </div>
        <div class="bf-col">
          <label class="bf-label">Talla (cm)</label>
          <input type="number" class="bf-input" min="0" step="1"
            value="${cap.talla || ''}" placeholder="0"
            onchange="updateCaptura(${i},'talla',+this.value||null)" />
        </div>
        <div class="bf-col">
          <label class="bf-label">Peso (kg)</label>
          <input type="number" class="bf-input" min="0" step="0.1"
            value="${cap.peso || ''}" placeholder="0.0"
            onchange="updateCaptura(${i},'peso',+this.value||null)" />
        </div>
      </div>
      <div class="bf-row bf-row-check">
        <label class="bf-check-label">
          <input type="checkbox" ${cap.suelta ? 'checked' : ''}
            onchange="updateCaptura(${i},'suelta',this.checked)" />
          <span>Captura y suelta ↩️</span>
        </label>
      </div>
    </div>`
  ).join('');
}

function updateCaptura(idx, field, value) {
  if (capturasList[idx]) capturasList[idx][field] = value;
}

// ─── HELPERS DEL FORM ────────────────────────────────────────────────────────

function updateMoonFromDate() {
  const val = document.getElementById('bf-fecha')?.value;
  if (!val) return;
  const ph = MOON_PHASES[getMoonPhase(new Date(val + 'T12:00:00')).idx];
  const el = document.getElementById('bf-luna-display');
  if (el) { el.textContent = `${ph.sym} ${ph.name}`; el.style.color = `var(--${ph.color})`; }
}

function toggleChip(el) { el.classList.toggle('active'); }

function setRating(n) {
  currentRating = n;
  document.querySelectorAll('.bf-star').forEach((s, i) => s.classList.toggle('active', i < n));
  const lbl = document.getElementById('bf-rating-label');
  if (lbl) lbl.textContent = getRatingLabel(n);
}

function getRatingLabel(n) {
  return ['','Mala','Regular','Buena','Muy buena','Excelente'][n] || '';
}

// ─── GUARDAR ENTRADA ─────────────────────────────────────────────────────────

async function saveBitacoraEntry() {
  const fecha       = document.getElementById('bf-fecha').value;
  const zona        = document.getElementById('bf-zona').value;
  const horaIni     = document.getElementById('bf-hora-ini').value;
  const horaFin     = document.getElementById('bf-hora-fin').value;
  const clima       = document.getElementById('bf-clima').value;
  const prof        = parseFloat(document.getElementById('bf-prof').value) || null;
  const comentarios = document.getElementById('bf-comentarios').value.trim();
  const agua        = [...document.querySelectorAll('.bf-chip.active')].map(c => c.textContent);
  const rating      = currentRating;

  if (!fecha) { alert('Selecciona una fecha.'); return; }
  if (!zona)  { alert('Selecciona una zona.'); return; }
  if (horaFin && horaIni && horaFin < horaIni) {
    alert('La hora fin no puede ser menor a la hora inicio.'); return;
  }

  const ph = MOON_PHASES[getMoonPhase(new Date(fecha + 'T12:00:00')).idx];

  const entry = {
    fecha, zona, horaIni, horaFin, clima, agua,
    profundidad: prof, comentarios, rating,
    faseLunar: ph.name, faseLunarSym: ph.sym, faseLunarScore: ph.score,
    capturas: capturasList.filter(c => c.especie || c.cantidad > 0)
  };

  if (editingId) { entry.id = editingId; await dbPut(entry); }
  else           { await dbAdd(entry); }

  hideBitacoraForm();
  renderBitacoraList();
}

// ─── RENDERIZAR LISTA ────────────────────────────────────────────────────────

async function renderBitacoraList() {
  const container = document.getElementById('bit-list');
  if (!container) return;
  let entries = await dbGetAll();

  // Aplicar filtros
  if (activeFilters.zona)    entries = entries.filter(e => e.zona === activeFilters.zona);
  if (activeFilters.especie) entries = entries.filter(e =>
    (e.capturas || []).some(c => c.especie === activeFilters.especie));
  if (activeFilters.mes)     entries = entries.filter(e =>
    e.fecha && parseInt(e.fecha.split('-')[1]) === parseInt(activeFilters.mes));

  if (entries.length === 0) {
    const hayFiltros = Object.values(activeFilters).some(v => v);
    container.innerHTML = `
      <div class="bit-empty">
        <div style="font-size:2.5rem;margin-bottom:0.5rem;">${hayFiltros ? '🔍' : '🎣'}</div>
        <div>${hayFiltros ? 'Sin salidas con esos filtros.' : 'Aún no tienes salidas registradas.'}</div>
        <div style="font-size:0.85rem;margin-top:0.3rem;color:var(--muted)">
          ${hayFiltros ? 'Prueba cambiando los filtros.' : 'Toca "+ Nueva salida" para comenzar.'}
        </div>
      </div>`;
    return;
  }

  // Estadísticas (sobre entradas filtradas)
  const totalSalidas  = entries.length;
  const totalCapturas = entries.reduce((a, e) =>
    a + (e.capturas?.reduce((b, c) => b + (c.cantidad || 0), 0) || 0), 0);
  const pesoMax = Math.max(...entries.flatMap(e => (e.capturas || []).map(c => c.peso || 0)));
  const cntEsp  = {};
  entries.forEach(e => (e.capturas || []).forEach(c => {
    if (c.especie) cntEsp[c.especie] = (cntEsp[c.especie] || 0) + (c.cantidad || 1);
  }));
  const topEsp = Object.entries(cntEsp).sort((a, b) => b[1] - a[1])[0];
  const especieFrecuente = topEsp ? SPECIES[topEsp[0]]?.common.split('/')[0].trim() : '–';

  container.innerHTML = `
    <div class="bit-stats">
      <div class="bit-stat">
        <div class="bit-stat-val">${totalSalidas}</div>
        <div class="bit-stat-l">Salidas</div>
      </div>
      <div class="bit-stat">
        <div class="bit-stat-val">${totalCapturas}</div>
        <div class="bit-stat-l">Capturas</div>
      </div>
      <div class="bit-stat">
        <div class="bit-stat-val">${pesoMax > 0 ? pesoMax + 'kg' : '–'}</div>
        <div class="bit-stat-l">Mayor pesca</div>
      </div>
      <div class="bit-stat">
        <div class="bit-stat-val" style="font-size:0.75rem">${especieFrecuente}</div>
        <div class="bit-stat-l">Especie top</div>
      </div>
    </div>

    ${entries.map(e => {
      const zoneName   = ZONES[e.zona]?.name || e.zona;
      const duracion   = (e.horaIni && e.horaFin) ? calcDuracion(e.horaIni, e.horaFin) : null;
      const stars      = e.rating ? '★'.repeat(e.rating) + '☆'.repeat(5 - e.rating) : null;
      const caps       = e.capturas || [];
      const totalPeces = caps.reduce((a, c) => a + (c.cantidad || 0), 0);
      const especiesResumen = [...new Set(
        caps.filter(c => c.especie).map(c =>
          SPECIES[c.especie]?.icon + ' ' + SPECIES[c.especie]?.common.split('/')[0].trim()
        )
      )].join(', ') || null;

      return `
        <div class="bit-entry" id="entry-${e.id}">
          <div class="bit-entry-header" onclick="toggleEntry(${e.id})">
            <div class="bit-entry-left">
              <div class="bit-entry-fecha">${formatFecha(e.fecha)}</div>
              <div class="bit-entry-zona">${e.faseLunarSym || ''} ${zoneName}</div>
            </div>
            <div class="bit-entry-right">
              ${especiesResumen
                ? `<div class="bit-entry-especie">${especiesResumen}</div>`
                : `<span class="bit-entry-sin">Sin captura</span>`}
              ${totalPeces > 0
                ? `<div class="bit-entry-total">${totalPeces} ${totalPeces === 1 ? 'pez' : 'peces'}</div>`
                : ''}
              ${stars ? `<div class="bit-entry-stars">${stars}</div>` : ''}
            </div>
            <div class="bit-entry-chevron" id="chev-${e.id}">›</div>
          </div>

          <div class="bit-entry-body" id="body-${e.id}" style="display:none">
            <div class="bit-sub-label">Condiciones</div>
            <div class="bit-detail-grid">
              ${duracion      ? `<div class="bit-det"><span class="bit-det-l">⏱ Duración</span><span>${duracion}</span></div>` : ''}
              ${e.horaIni     ? `<div class="bit-det"><span class="bit-det-l">🕐 Inicio</span><span>${e.horaIni}</span></div>` : ''}
              ${e.horaFin     ? `<div class="bit-det"><span class="bit-det-l">🏁 Fin</span><span>${e.horaFin}</span></div>` : ''}
              ${e.clima       ? `<div class="bit-det"><span class="bit-det-l">☁️ Clima</span><span>${e.clima}</span></div>` : ''}
              ${e.faseLunar   ? `<div class="bit-det"><span class="bit-det-l">🌙 Luna</span><span>${e.faseLunarSym} ${e.faseLunar}</span></div>` : ''}
              ${e.profundidad ? `<div class="bit-det"><span class="bit-det-l">📊 Profundidad</span><span>${e.profundidad} m</span></div>` : ''}
            </div>
            ${e.agua?.length ? `
              <div class="bit-tags-row">
                ${e.agua.map(a => `<span class="bit-tag">${a}</span>`).join('')}
              </div>` : ''}

            ${caps.length > 0 ? `
              <div class="bit-sub-label">
                Capturas (${totalPeces} ${totalPeces === 1 ? 'pez' : 'peces'})
              </div>
              ${caps.map(c => {
                const spName = c.especie ? SPECIES[c.especie]?.common.split('/')[0].trim() : '–';
                const spIcon = c.especie ? SPECIES[c.especie]?.icon : '🐟';
                return `
                  <div class="bit-cap-item">
                    <div class="bit-cap-header">
                      <span class="bit-cap-sp">${spIcon} ${spName}</span>
                      ${c.suelta ? '<span class="bit-cap-suelta">↩️ suelta</span>' : ''}
                    </div>
                    <div class="bit-cap-details">
                      ${c.tecnica  ? `<span>🎣 ${c.tecnica}</span>` : ''}
                      ${c.señuelo  ? `<span>🪝 ${c.señuelo}${c.colorSenuelo ? ' · ' + c.colorSenuelo : ''}</span>` : ''}
                      ${c.cantidad ? `<span>🐟 ${c.cantidad} ${c.cantidad === 1 ? 'pez' : 'peces'}</span>` : ''}
                      ${c.talla    ? `<span>📏 ${c.talla} cm</span>` : ''}
                      ${c.peso     ? `<span>⚖️ ${c.peso} kg</span>` : ''}
                    </div>
                  </div>`;
              }).join('')}
            ` : '<div class="cap-empty" style="margin:0.6rem 0;">Sin capturas registradas.</div>'}

            ${e.comentarios ? `<div class="bit-comentario">"${e.comentarios}"</div>` : ''}

            <div class="bit-entry-actions">
              <button class="bit-act-btn bit-edit" onclick="editBitacoraEntry(${e.id})">✏️ Editar</button>
              <button class="bit-act-btn bit-del"  onclick="confirmDelete(${e.id})">🗑 Eliminar</button>
            </div>
          </div>
        </div>`;
    }).join('')}`;
}

// ─── ACCIONES DE LISTA ────────────────────────────────────────────────────────

function toggleEntry(id) {
  const body = document.getElementById(`body-${id}`);
  const chev = document.getElementById(`chev-${id}`);
  const open = body.style.display === 'block';
  body.style.display   = open ? 'none' : 'block';
  chev.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
}

async function editBitacoraEntry(id) {
  const entry = await dbGet(id);
  if (!entry) return;
  currentRating = entry.rating || 0;
  showBitacoraForm(entry);
}

async function confirmDelete(id) {
  if (!confirm('¿Eliminar esta salida de la bitácora?')) return;
  await dbDelete(id);
  renderBitacoraList();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcDuracion(ini, fin) {
  const [h1, m1] = ini.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ' ' + m + 'min' : ''}` : `${m}min`;
}

function formatFecha(str) {
  if (!str) return '–';
  const [y, m, d] = str.split('-');
  return `${parseInt(d)} ${MONTHS_LONG[parseInt(m) - 1]} ${y}`;
}