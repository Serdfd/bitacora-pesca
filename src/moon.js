// ─── CÁLCULO DE FASE LUNAR ───────────────────────────────────────────────────

function getMoonPhase(date) {
  const known = new Date('2000-01-06T18:14:00Z');
  const cycle = 29.53058867;
  const diff  = (date - known) / 86400000;
  const phase = ((diff % cycle) + cycle) % cycle;
  return { idx: Math.floor(phase / (cycle / 8)) % 8, raw: phase };
}

// ─── CONSTRUCCIÓN DE VISTA DE DÍA ────────────────────────────────────────────

function buildDayView(date, prefix) {
  const moon = getMoonPhase(date);
  const ph   = MOON_PHASES[moon.idx];
  const m    = date.getMonth();

  // Actualizar barra lunar (solo si es "hoy")
  if (prefix === 'hoy') {
    document.getElementById('moon-sym').textContent    = ph.sym;
    document.getElementById('moon-name').textContent   = ph.name;
    document.getElementById('moon-detail').textContent = ph.diurno;
    const se = document.getElementById('moon-score');
    se.textContent  = ph.score;
    se.style.color  = `var(--${ph.color})`;
  }

  // Clases y etiquetas de estado
  const badgeClass  = { good:'b-hi', warn:'b-mid', danger:'b-lo' }[ph.color];
  const badgeLabel  = { 'A+':'Excelente', A:'Bueno', B:'Bueno', C:'Regular', D:'Difícil' }[ph.score];

  // Nota de temporada
  const goodM   = [0,1,2,11];
  const transM  = [3,4,5];
  const seasonNote = goodM.includes(m)
    ? '✓ Temporada seca (dic–mar): ideal para sierras, barracuda y pelágicos offshore.'
    : transM.includes(m)
    ? '~ Transición (abr–jun): buenos para pargo y jurel. Tarpon activo en Capurganá.'
    : (m >= 4 && m <= 7)
    ? '🌧 Temporada de lluvias: aguas más turbias. Enfócate en pargo (fondo) y tarpon (manglares Capurganá).'
    : '~ Transición sep–nov: mejora gradual. Buenas condiciones para jurel y sierra pintada.';

  // Ventana horaria recomendada
  const ventana = [4,5].includes(moon.idx)
    ? 'Sal muy temprano (5:30am). El período solunar mayor cae en la madrugada — el amanecer es tu única ventana diurna.'
    : [1,2,6].includes(moon.idx)
    ? 'Condiciones diurnas óptimas. Período solunar mayor probable entre 6–9am. Segunda ventana posible a las 2–4pm.'
    : 'Ventana principal 6–10am. Consulta tabla solunar para el período mayor exacto del día.';

  // Cards de actividad por especie
  const especiesHtml = Object.entries(SPECIES).map(([, sp]) => {
    const ms = sp.months[m];
    const ls = sp.lunaScore[moon.idx];
    const c  = (ms === 'hi' && ls >= 4) ? 'hi' : (ms === 'lo' || ls <= 2) ? 'lo' : 'mid';
    const note = c === 'hi'
      ? 'Buen día — prioriza esta especie.'
      : c === 'mid'
      ? 'Resultados variables.'
      : 'Poca actividad esperada.';
    return `
      <div class="card" style="margin-bottom:8px;">
        <div class="card-header">
          <div>
            <div style="font-size:16px;font-weight:600;color:var(--accent);">${sp.icon} ${sp.common}</div>
            <div style="font-size:12px;color:var(--muted);font-style:italic;margin-top:1px;">${sp.sci}</div>
          </div>
          <span class="badge b-${c}">${{ hi:'Muy activo', mid:'Moderado', lo:'Poco activo' }[c]}</span>
        </div>
        <div class="card-body" style="font-size:13px;color:var(--muted);">${sp.bestHour} · ${note}</div>
      </div>`;
  }).join('');

  // Escribir en el DOM según el prefijo
  if (prefix === 'hoy') {
    document.getElementById('hoy-badge').className   = `badge ${badgeClass}`;
    document.getElementById('hoy-badge').textContent = badgeLabel;
    document.getElementById('hoy-body').innerHTML    =
      `<strong style="color:var(--accent)">Luna:</strong> ${ph.name} — ${ph.diurno}<br><br>` +
      `<strong style="color:var(--accent)">Temporada:</strong> ${seasonNote}`;
    document.getElementById('hoy-ventana').textContent  = ventana;
    document.getElementById('hoy-especies').innerHTML   = especiesHtml;
  } else {
    document.getElementById('fut-sym').textContent    = ph.sym;
    document.getElementById('fut-phase').textContent  = ph.name;
    document.getElementById('fut-diurno').textContent = ph.diurno;
    const fse = document.getElementById('fut-score');
    fse.textContent = ph.score;
    fse.style.color = `var(--${ph.color})`;
    document.getElementById('fut-season').innerHTML   =
      `<strong style="color:var(--accent)">Temporada:</strong> ${seasonNote}`;
    document.getElementById('fut-ventana').textContent  = ventana;
    document.getElementById('fut-especies').innerHTML   = especiesHtml;
    document.getElementById('future-result').classList.add('visible');
  }
}