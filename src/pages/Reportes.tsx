import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { useAppStore } from '@/store'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-900/60 backdrop-blur-sm border border-white/10 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-ocean-300 uppercase tracking-wider mb-5">
      <span>{icono}</span>{titulo}
    </h2>
  )
}

function renderEstrellas(n: number) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= n ? 'text-amber-400' : 'text-ocean-700'}>★</span>
      ))}
    </span>
  )
}

const CHART_THEME = {
  background: 'transparent',
  toolbar: { show: false },
}
const CHART_GRID   = { borderColor: '#0c4a6e' }
const LABEL_STYLE  = { colors: '#7dd3fc' }
const LEGEND_STYLE = { legend: { labels: { colors: '#bae6fd' } } }

const FASE_NOMBRES: Record<string, string> = {
  nueva: '🌑 Nueva', creciente: '🌒 Creciente',
  cuarto_creciente: '🌓 C. Creciente', gibosa_creciente: '🌔 G. Creciente',
  llena: '🌕 Llena', gibosa_menguante: '🌖 G. Menguante',
  cuarto_menguante: '🌗 C. Menguante', menguante: '🌘 Menguante',
}

const CAL_LABEL: Record<number, string> = {
  1: 'Mala', 2: 'Regular', 3: 'Buena', 4: 'Muy buena', 5: 'Excelente',
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Reportes() {
  const { bitacora } = useAppStore()

  // ── Cálculos ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalSalidas   = bitacora.length
    const totalCapturas  = bitacora.reduce((s, e) =>
      s + (e.capturas ?? []).reduce((ss, c) => ss + c.cantidad, 0), 0)
    const promCapturas   = totalSalidas > 0
      ? Math.round((totalCapturas / totalSalidas) * 10) / 10 : 0

    const calificadas = bitacora.filter(e => (e.calificacion ?? 0) > 0)
    const promCal = calificadas.length > 0
      ? Math.round((calificadas.reduce((s, e) => s + (e.calificacion ?? 0), 0) / calificadas.length) * 10) / 10
      : 0

    // Zona más visitada
    const zonaMap: Record<string, number> = {}
    for (const e of bitacora) {
      const z = e.region_nombre ?? e.region_id ?? 'Sin zona'
      zonaMap[z] = (zonaMap[z] ?? 0) + 1
    }
    const zonaMasVisitada = Object.entries(zonaMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    // Especie más capturada
    const especieMap: Record<string, number> = {}
    for (const e of bitacora) {
      for (const c of e.capturas ?? []) {
        const n = c.especie_nombre ?? c.especie_id ?? 'Sin especie'
        especieMap[n] = (especieMap[n] ?? 0) + c.cantidad
      }
    }
    const especieMasCapturada = Object.entries(especieMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    return { totalSalidas, totalCapturas, promCapturas, promCal, zonaMasVisitada, especieMasCapturada }
  }, [bitacora])

  // Top especies
  const porEspecie = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora)
      for (const c of e.capturas ?? []) {
        const n = c.especie_nombre ?? c.especie_id ?? 'Sin especie'
        mapa[n] = (mapa[n] ?? 0) + c.cantidad
      }
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [bitacora])

  // Salidas por mes
  const porMes = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora) {
      const mes = e.fecha?.slice(0, 7) ?? ''
      if (mes) mapa[mes] = (mapa[mes] ?? 0) + 1
    }
    return Object.entries(mapa).sort()
  }, [bitacora])

  // Capturas por fase lunar
  const porFase = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora) {
      const fase = e.fase_lunar
      if (!fase) continue
      const label = FASE_NOMBRES[fase] ?? fase
      const total = (e.capturas ?? []).reduce((s, c) => s + c.cantidad, 0)
      mapa[label] = (mapa[label] ?? 0) + total
    }
    const entradas = Object.entries(mapa).filter(([, v]) => v > 0)
    return { labels: entradas.map(([k]) => k), values: entradas.map(([, v]) => v) }
  }, [bitacora])

  // Top zonas
  const porZona = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora) {
      const z = e.region_nombre ?? e.region_id ?? 'Sin zona'
      const total = (e.capturas ?? []).reduce((s, c) => s + c.cantidad, 0)
      mapa[z] = (mapa[z] ?? 0) + total
    }
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [bitacora])

  // Señuelos más efectivos
  const porSenuelo = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora)
      for (const c of e.capturas ?? []) {
        if (!c.senuelo) continue
        const s = c.senuelo.split(' — ')[0] // quitar color
        mapa[s] = (mapa[s] ?? 0) + c.cantidad
      }
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [bitacora])

  // Técnicas más usadas
  const porTecnica = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const e of bitacora)
      for (const c of e.capturas ?? []) {
        if (!c.tecnica) continue
        mapa[c.tecnica] = (mapa[c.tecnica] ?? 0) + c.cantidad
      }
    const entradas = Object.entries(mapa).filter(([, v]) => v > 0)
    return { labels: entradas.map(([k]) => k), values: entradas.map(([, v]) => v) }
  }, [bitacora])

  // Mejores salidas (top 5 por capturas)
  const mejoresSalidas = useMemo(() => {
    return [...bitacora]
      .map(e => ({
        ...e,
        totalCap: (e.capturas ?? []).reduce((s, c) => s + c.cantidad, 0),
      }))
      .sort((a, b) => b.totalCap - a.totalCap)
      .slice(0, 5)
  }, [bitacora])

  // Récords por especie
  const records = useMemo(() => {
    const mapa: Record<string, { peso: number; talla: number }> = {}
    for (const e of bitacora)
      for (const c of e.capturas ?? []) {
        const n = c.especie_nombre ?? c.especie_id ?? 'Sin especie'
        if (!mapa[n]) mapa[n] = { peso: 0, talla: 0 }
        if (c.peso_kg  && Number(c.peso_kg)  > mapa[n].peso)  mapa[n].peso  = Number(c.peso_kg)
        if (c.talla_cm && Number(c.talla_cm) > mapa[n].talla) mapa[n].talla = Number(c.talla_cm)
      }
    return Object.entries(mapa)
      .filter(([, v]) => v.peso > 0 || v.talla > 0)
      .sort((a, b) => b[1].peso - a[1].peso)
  }, [bitacora])

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (bitacora.length === 0) {
    return (
      <Card className="p-16 text-center">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-white font-bold text-lg mb-1">Sin datos aún</p>
        <p className="text-ocean-400 text-sm">Registra salidas en la bitácora para ver reportes.</p>
      </Card>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Tarjetas resumen ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icono: '🚢', label: 'Salidas',       valor: stats.totalSalidas,       color: 'text-white'      },
          { icono: '🐟', label: 'Capturas',       valor: stats.totalCapturas,      color: 'text-cyan-400'   },
          { icono: '📈', label: 'Prom. / salida', valor: stats.promCapturas,       color: 'text-blue-400'   },
          { icono: '⭐', label: 'Cal. promedio',  valor: stats.promCal > 0 ? stats.promCal : '—', color: 'text-amber-400' },
          { icono: '📍', label: 'Zona favorita',  valor: stats.zonaMasVisitada,    color: 'text-green-400'  },
          { icono: '🏆', label: 'Top especie',    valor: stats.especieMasCapturada,color: 'text-amber-300'  },
        ].map((s, i) => (
          <Card key={i} className="p-4 text-center">
            <p className="text-2xl mb-1">{s.icono}</p>
            <p className={`font-bold text-lg leading-tight truncate ${s.color}`}>{s.valor}</p>
            <p className="text-ocean-400 text-xs mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ── Gráficas fila 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top especies */}
        {porEspecie.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="🐟" titulo="Top Especies Capturadas" />
            <ReactApexChart
              type="bar" height={240}
              series={[{ name: 'Capturas', data: porEspecie.map(([, v]) => v) }]}
              options={{
                chart: CHART_THEME, theme: { mode: 'dark' },
                xaxis: { categories: porEspecie.map(([k]) => k), labels: { style: LABEL_STYLE } },
                yaxis: { labels: { style: LABEL_STYLE } },
                colors: ['#f59e0b'],
                plotOptions: { bar: { borderRadius: 5 } },
                grid: CHART_GRID,
              }}
            />
          </Card>
        )}

        {/* Salidas por mes */}
        {porMes.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="📅" titulo="Salidas por Mes" />
            <ReactApexChart
              type="area" height={240}
              series={[{ name: 'Salidas', data: porMes.map(([, v]) => v) }]}
              options={{
                chart: CHART_THEME, theme: { mode: 'dark' },
                xaxis: { categories: porMes.map(([k]) => k), labels: { style: LABEL_STYLE } },
                yaxis: { labels: { style: LABEL_STYLE }, min: 0, tickAmount: 3 },
                colors: ['#38bdf8'],
                stroke: { curve: 'smooth', width: 3 },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
                grid: CHART_GRID,
              }}
            />
          </Card>
        )}
      </div>

      {/* ── Gráficas fila 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Capturas por fase lunar */}
        {porFase.values.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="🌙" titulo="Capturas por Fase Lunar" />
            <ReactApexChart
              type="donut" height={240}
              series={porFase.values}
              options={{
                chart: { background: 'transparent' }, theme: { mode: 'dark' },
                labels: porFase.labels,
                colors: ['#1e3a5f','#0369a1','#0284c7','#0ea5e9','#38bdf8','#7dd3fc','#bae6fd','#e0f2fe'],
                ...LEGEND_STYLE,
                plotOptions: { pie: { donut: { size: '60%' } } },
              }}
            />
          </Card>
        )}

        {/* Técnicas más usadas */}
        {porTecnica.values.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="🎣" titulo="Técnicas Más Usadas" />
            <ReactApexChart
              type="donut" height={240}
              series={porTecnica.values}
              options={{
                chart: { background: 'transparent' }, theme: { mode: 'dark' },
                labels: porTecnica.labels,
                colors: ['#f59e0b','#f97316','#ef4444','#a855f7','#06b6d4','#10b981','#64748b','#84cc16'],
                ...LEGEND_STYLE,
                plotOptions: { pie: { donut: { size: '60%' } } },
              }}
            />
          </Card>
        )}

        {/* Top zonas */}
        {porZona.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="🗺️" titulo="Capturas por Zona" />
            <ReactApexChart
              type="bar" height={240}
              series={[{ name: 'Capturas', data: porZona.map(([, v]) => v) }]}
              options={{
                chart: CHART_THEME, theme: { mode: 'dark' },
                xaxis: { categories: porZona.map(([k]) => k), labels: { style: LABEL_STYLE } },
                yaxis: { labels: { style: LABEL_STYLE } },
                colors: ['#10b981'],
                plotOptions: { bar: { borderRadius: 5 } },
                grid: CHART_GRID,
              }}
            />
          </Card>
        )}
      </div>

      {/* ── Señuelos efectivos ── */}
      {porSenuelo.length > 0 && (
        <Card className="p-5">
          <SectionTitle icono="🪝" titulo="Señuelos / Carnadas Más Efectivos" />
          <ReactApexChart
            type="bar" height={220}
            series={[{ name: 'Capturas', data: porSenuelo.map(([, v]) => v) }]}
            options={{
              chart: CHART_THEME, theme: { mode: 'dark' },
              xaxis: { categories: porSenuelo.map(([k]) => k), labels: { style: LABEL_STYLE } },
              yaxis: { labels: { style: LABEL_STYLE } },
              colors: ['#a78bfa'],
              plotOptions: { bar: { borderRadius: 5 } },
              grid: CHART_GRID,
            }}
          />
        </Card>
      )}

      {/* ── Tablas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Mejores salidas */}
        <Card className="p-5">
          <SectionTitle icono="🏅" titulo="Mejores Salidas" />
          <div className="space-y-2">
            {mejoresSalidas.map((e, i) => (
              <div key={e.id ?? i} className="flex items-center gap-3 bg-ocean-800/40 rounded-xl px-3 py-2.5">
                <span className="text-lg font-bold text-ocean-500 min-w-[24px]">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {e.spot_nombre ?? e.spot_id ?? '—'}
                    <span className="text-ocean-500 font-normal text-xs ml-1">· {e.region_nombre ?? ''}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-ocean-400 text-xs">{e.fecha}</p>
                    {(e.calificacion ?? 0) > 0 && (
                      <span className="text-xs">{renderEstrellas(e.calificacion!)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 font-bold">{e.totalCap}</p>
                  <p className="text-ocean-500 text-xs">capturas</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Récords por especie */}
        {records.length > 0 && (
          <Card className="p-5">
            <SectionTitle icono="🏆" titulo="Récords por Especie" />
            <div className="space-y-2">
              {records.map(([nombre, rec]) => (
                <div key={nombre} className="flex items-center gap-3 bg-ocean-800/40 rounded-xl px-3 py-2.5">
                  <span className="text-lg">🐟</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{nombre}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {rec.peso > 0 && (
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold text-sm">{rec.peso} kg</p>
                        <p className="text-ocean-500 text-xs">peso máx.</p>
                      </div>
                    )}
                    {rec.talla > 0 && (
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-sm">{rec.talla} cm</p>
                        <p className="text-ocean-500 text-xs">talla máx.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

    </div>
  )
}