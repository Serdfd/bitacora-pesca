// ─── COLORES BASE ────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#c8a96e','#7ec8c8','#5dba8a','#d4a843','#e06060',
  '#8ab4d4','#c87eb0','#7eb08a','#d4a87e','#7e8ac8'
];

const CHART_DEFAULTS = {
  color: '#e8dfc8',
  font: { family: "'DM Mono', monospace", size: 11 }
};

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

// ─── INICIALIZAR REPORTES ────────────────────────────────────────────────────

async function initReportes() {
  const entries = await dbGetAll();
  renderEstadisticasTexto(entries);
  renderCharts(entries);
}

// ─── ESTADÍSTICAS DE TEXTO ───────────────────────────────────────────────────

function renderEstadisticasTexto(entries) {
  const container = document.getElementById('rep-stats-text');
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = `<div class="rep-empty">Sin datos — registra salidas en la Bitácora primero.</div>`;
    return;
  }

  const caps = entries.flatMap(e => (e.capturas || []).map(c => ({ ...c, fecha: e.fecha, zona: e.zona, faseLunar: e.faseLunar, horaIni: e.horaIni, clima: e.clima })));

  // Récord por especie (mayor peso)
  const recordPorEsp = {};
  caps.forEach(c => {
    if (c.especie && c.peso) {
      if (!recordPorEsp[c.especie] || c.peso > recordPorEsp[c.especie].peso)
        recordPorEsp[c.especie] = c;
    }
  });
  const topRecord = Object.values(recordPorEsp).sort((a,b) => b.peso - a.peso)[0];

  // Hora más productiva
  const horaBuckets = {};
  entries.forEach(e => {
    if (!e.horaIni) return;
    const h = parseInt(e.horaIni.split(':')[0]);
    const bucket = `${h}:00–${h+1}:00`;
    const c = (e.capturas||[]).reduce((a,c) => a+(c.cantidad||0), 0);
    horaBuckets[bucket] = (horaBuckets[bucket]||0) + c;
  });
  const topHora = Object.entries(horaBuckets).sort((a,b)=>b[1]-a[1])[0];

  // Mejor fase lunar personal
  const lunaBuckets = {};
  entries.forEach(e => {
    if (!e.faseLunar) return;
    const c = (e.capturas||[]).reduce((a,c) => a+(c.cantidad||0), 0);
    if (!lunaBuckets[e.faseLunar]) lunaBuckets[e.faseLunar] = { total:0, salidas:0, sym: e.faseLunarSym };
    lunaBuckets[e.faseLunar].total   += c;
    lunaBuckets[e.faseLunar].salidas += 1;
  });
  const topLuna = Object.entries(lunaBuckets)
    .map(([k,v]) => ({ fase:k, sym:v.sym, avg: v.salidas > 0 ? v.total/v.salidas : 0 }))
    .sort((a,b) => b.avg - a.avg)[0];

  // Clima más productivo
  const climaBuckets = {};
  entries.forEach(e => {
    if (!e.clima) return;
    const c = (e.capturas||[]).reduce((a,c) => a+(c.cantidad||0), 0);
    if (!climaBuckets[e.clima]) climaBuckets[e.clima] = { total:0, salidas:0 };
    climaBuckets[e.clima].total   += c;
    climaBuckets[e.clima].salidas += 1;
  });
  const topClima = Object.entries(climaBuckets)
    .map(([k,v]) => ({ clima:k, avg: v.salidas > 0 ? v.total/v.salidas : 0 }))
    .sort((a,b) => b.avg - a.avg)[0];

  // Racha / conteos
  const thisMonth = new Date().toISOString().slice(0,7);
  const thisYear  = new Date().getFullYear().toString();
  const salidasMes = entries.filter(e => e.fecha?.startsWith(thisMonth)).length;
  const salidasAño = entries.filter(e => e.fecha?.startsWith(thisYear)).length;
  const totalPeces = caps.reduce((a,c) => a+(c.cantidad||0), 0);

  container.innerHTML = `
    <div class="rep-kpi-grid">
      <div class="rep-kpi">
        <div class="rep-kpi-val">${entries.length}</div>
        <div class="rep-kpi-l">Total salidas</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi-val">${totalPeces}</div>
        <div class="rep-kpi-l">Total capturas</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi-val">${salidasMes}</div>
        <div class="rep-kpi-l">Este mes</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi-val">${salidasAño}</div>
        <div class="rep-kpi-l">Este año</div>
      </div>
    </div>

    <div class="rep-insights">
      ${topRecord ? `
        <div class="rep-insight">
          <div class="rep-insight-icon">🏆</div>
          <div class="rep-insight-body">
            <div class="rep-insight-title">Récord personal</div>
            <div class="rep-insight-val">
              ${SPECIES[topRecord.especie]?.icon}
              ${SPECIES[topRecord.especie]?.common.split('/')[0].trim()}
              — <strong>${topRecord.peso} kg</strong>
              · ${formatFecha(topRecord.fecha)}
            </div>
          </div>
        </div>` : ''}

      ${topHora ? `
        <div class="rep-insight">
          <div class="rep-insight-icon">⏱</div>
          <div class="rep-insight-body">
            <div class="rep-insight-title">Hora más productiva</div>
            <div class="rep-insight-val"><strong>${topHora[0]}</strong> · ${topHora[1]} capturas</div>
          </div>
        </div>` : ''}

      ${topLuna ? `
        <div class="rep-insight">
          <div class="rep-insight-icon">${topLuna.sym || '🌙'}</div>
          <div class="rep-insight-body">
            <div class="rep-insight-title">Tu mejor fase lunar</div>
            <div class="rep-insight-val"><strong>${topLuna.fase}</strong> · ${topLuna.avg.toFixed(1)} capturas/salida</div>
          </div>
        </div>` : ''}

      ${topClima ? `
        <div class="rep-insight">
          <div class="rep-insight-icon">☁️</div>
          <div class="rep-insight-body">
            <div class="rep-insight-title">Clima más productivo</div>
            <div class="rep-insight-val"><strong>${topClima.clima}</strong> · ${topClima.avg.toFixed(1)} capturas/salida</div>
          </div>
        </div>` : ''}
    </div>`;
}

// ─── GRÁFICOS ────────────────────────────────────────────────────────────────

function renderCharts(entries) {
  if (entries.length === 0) return;

  const caps = entries.flatMap(e =>
    (e.capturas || []).map(c => ({ ...c, fecha: e.fecha, zona: e.zona, faseLunar: e.faseLunar }))
  );

  renderChartEspecies(caps);
  renderChartMeses(caps);
  renderChartZonas(caps);
  renderChartLuna(entries);
  renderChartSenuelo(caps);
  renderChartTecnica(caps);
}

// 1. DONA — Capturas por especie
function renderChartEspecies(caps) {
  destroyChart('chart-especies');
  const cnt = {};
  caps.forEach(c => {
    if (!c.especie) return;
    const name = SPECIES[c.especie]?.common.split('/')[0].trim() || c.especie;
    cnt[name] = (cnt[name] || 0) + (c.cantidad || 1);
  });
  if (!Object.keys(cnt).length) return hideChart('rep-chart-especies');

  const sorted = Object.entries(cnt).sort((a,b) => b[1]-a[1]);
  chartInstances['chart-especies'] = new Chart(
    document.getElementById('chart-especies'),
    {
      type: 'doughnut',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{ data: sorted.map(([,v]) => v), backgroundColor: CHART_COLORS, borderColor: '#0f2040', borderWidth: 2 }]
      },
      options: {
        ...donutOpts(),
        plugins: {
          ...donutOpts().plugins,
          title: { ...titleStyle(), text: 'Capturas por especie' }
        }
      }
    }
  );
}

// 2. BARRAS — Capturas por mes
function renderChartMeses(caps) {
  destroyChart('chart-meses');
  const cnt = Array(12).fill(0);
  caps.forEach(c => {
    if (!c.fecha) return;
    const m = parseInt(c.fecha.split('-')[1]) - 1;
    cnt[m] += (c.cantidad || 1);
  });
  if (cnt.every(v => v === 0)) return hideChart('rep-chart-meses');

  chartInstances['chart-meses'] = new Chart(
    document.getElementById('chart-meses'),
    {
      type: 'bar',
      data: {
        labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
        datasets: [{
          label: 'Capturas',
          data: cnt,
          backgroundColor: cnt.map((v,i) => i === new Date().getMonth() ? '#c8a96e' : 'rgba(126,200,200,0.5)'),
          borderColor:      cnt.map((v,i) => i === new Date().getMonth() ? '#c8a96e' : '#7ec8c8'),
          borderWidth: 1, borderRadius: 4
        }]
      },
      options: {
        ...barOpts(),
        plugins: {
          ...barOpts().plugins,
          title: { ...titleStyle(), text: 'Capturas por mes' }
        }
      }
    }
  );
}

// 3. BARRAS — Capturas por zona
function renderChartZonas(caps) {
  destroyChart('chart-zonas');
  const cnt = {};
  caps.forEach(c => {
    if (!c.zona) return;
    const name = ZONES[c.zona]?.name || c.zona;
    cnt[name] = (cnt[name] || 0) + (c.cantidad || 1);
  });
  if (!Object.keys(cnt).length) return hideChart('rep-chart-zonas');

  const sorted = Object.entries(cnt).sort((a,b) => b[1]-a[1]);
  chartInstances['chart-zonas'] = new Chart(
    document.getElementById('chart-zonas'),
    {
      type: 'bar',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{
          label: 'Capturas',
          data: sorted.map(([,v]) => v),
          backgroundColor: CHART_COLORS.map(c => c + 'aa'),
          borderColor: CHART_COLORS,
          borderWidth: 1, borderRadius: 4
        }]
      },
      options: {
        ...barOpts(),
        plugins: {
          ...barOpts().plugins,
          title: { ...titleStyle(), text: 'Capturas por zona' }
        }
      }
    }
  );
}

// 4. BARRAS — Fase lunar vs capturas (promedio por salida)
function renderChartLuna(entries) {
  destroyChart('chart-luna');
  const order = ['Luna nueva','Creciente joven','Cuarto creciente','Gibosa creciente','Luna llena','Gibosa menguante','Cuarto menguante','Menguante vieja'];
  const syms  = {'Luna nueva':'🌑','Creciente joven':'🌒','Cuarto creciente':'🌓','Gibosa creciente':'🌔','Luna llena':'🌕','Gibosa menguante':'🌖','Cuarto menguante':'🌗','Menguante vieja':'🌘'};
  const cnt   = {};
  entries.forEach(e => {
    if (!e.faseLunar) return;
    if (!cnt[e.faseLunar]) cnt[e.faseLunar] = { total:0, salidas:0 };
    cnt[e.faseLunar].total   += (e.capturas||[]).reduce((a,c)=>a+(c.cantidad||0),0);
    cnt[e.faseLunar].salidas += 1;
  });
  const labels = order.filter(k => cnt[k]);
  if (!labels.length) return hideChart('rep-chart-luna');

  const data  = labels.map(k => +(cnt[k].total / cnt[k].salidas).toFixed(1));
  const max   = Math.max(...data);
  chartInstances['chart-luna'] = new Chart(
    document.getElementById('chart-luna'),
    {
      type: 'bar',
      data: {
        labels: labels.map(k => syms[k] + ' ' + k),
        datasets: [{
          label: 'Prom. capturas/salida',
          data,
          backgroundColor: data.map(v => v === max ? '#c8a96e' : 'rgba(200,169,110,0.35)'),
          borderColor:     data.map(v => v === max ? '#c8a96e' : 'rgba(200,169,110,0.6)'),
          borderWidth: 1, borderRadius: 4
        }]
      },
      options: {
        ...barOpts(),
        plugins: {
          ...barOpts().plugins,
          title: { ...titleStyle(), text: 'Fase lunar vs capturas (promedio/salida)' }
        }
      }
    }
  );
}

// 5. DONA — Señuelo más efectivo
function renderChartSenuelo(caps) {
  destroyChart('chart-senuelo');
  const cnt = {};
  caps.forEach(c => {
    if (!c.señuelo) return;
    cnt[c.señuelo] = (cnt[c.señuelo] || 0) + (c.cantidad || 1);
  });
  if (!Object.keys(cnt).length) return hideChart('rep-chart-senuelo');

  const sorted = Object.entries(cnt).sort((a,b) => b[1]-a[1]).slice(0,8);
  chartInstances['chart-senuelo'] = new Chart(
    document.getElementById('chart-senuelo'),
    {
      type: 'doughnut',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{ data: sorted.map(([,v]) => v), backgroundColor: CHART_COLORS, borderColor: '#0f2040', borderWidth: 2 }]
      },
      options: {
        ...donutOpts(),
        plugins: {
          ...donutOpts().plugins,
          title: { ...titleStyle(), text: 'Señuelo más efectivo' }
        }
      }
    }
  );
}

// 6. BARRAS — Técnica más efectiva
function renderChartTecnica(caps) {
  destroyChart('chart-tecnica');
  const cnt = {};
  caps.forEach(c => {
    if (!c.tecnica) return;
    cnt[c.tecnica] = (cnt[c.tecnica] || 0) + (c.cantidad || 1);
  });
  if (!Object.keys(cnt).length) return hideChart('rep-chart-tecnica');

  const sorted = Object.entries(cnt).sort((a,b) => b[1]-a[1]);
  chartInstances['chart-tecnica'] = new Chart(
    document.getElementById('chart-tecnica'),
    {
      type: 'bar',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{
          label: 'Capturas',
          data: sorted.map(([,v]) => v),
          backgroundColor: ['rgba(93,186,138,0.6)','rgba(200,169,110,0.6)','rgba(126,200,200,0.6)'],
          borderColor:     ['#5dba8a','#c8a96e','#7ec8c8'],
          borderWidth: 1, borderRadius: 4
        }]
      },
      options: {
        ...barOpts(),
        plugins: {
          ...barOpts().plugins,
          title: { ...titleStyle(), text: 'Técnica más efectiva' }
        }
      }
    }
  );
}

// ─── HELPERS CHART.JS ────────────────────────────────────────────────────────

function titleStyle() {
  return {
    display: true,
    color: '#c8a96e',
    font: { family: "'DM Mono', monospace", size: 11, weight: '500' },
    padding: { bottom: 12 }
  };
}

function donutOpts() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#7a8fa8', font: CHART_DEFAULTS.font, padding: 10, boxWidth: 12 }
      }
    }
  };
}

function barOpts() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.8,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: '#7a8fa8', font: CHART_DEFAULTS.font },
        grid:  { color: 'rgba(255,255,255,0.04)' }
      },
      y: {
        ticks: { color: '#7a8fa8', font: CHART_DEFAULTS.font },
        grid:  { color: 'rgba(255,255,255,0.06)' },
        beginAtZero: true
      }
    }
  };
}

function hideChart(wrapperId) {
  const el = document.getElementById(wrapperId);
  if (el) el.style.display = 'none';
}