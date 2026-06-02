import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { useAppStore } from '@/store'

export default function Reportes() {
  const { bitacora, especies, regiones } = useAppStore()

  // Capturas por especie
  const porEspecie = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const entrada of bitacora) {
      for (const cap of entrada.capturas ?? []) {
        const nombre = cap.especie_nombre ?? cap.especie_id
        mapa[nombre] = (mapa[nombre] ?? 0) + cap.cantidad
      }
    }
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [bitacora])

  // Salidas por mes
  const porMes = useMemo(() => {
    const mapa: Record<string, number> = {}
    for (const entrada of bitacora) {
      const mes = entrada.fecha?.slice(0, 7) ?? ''
      mapa[mes] = (mapa[mes] ?? 0) + 1
    }
    return Object.entries(mapa).sort()
  }, [bitacora])

  // Capturas por fase lunar
  const porFase = useMemo(() => {
    const mapa: Record<string, number> = { nueva: 0, creciente: 0, llena: 0, menguante: 0 }
    for (const entrada of bitacora) {
      if (entrada.fase_lunar && entrada.fase_lunar in mapa) {
        const total = (entrada.capturas ?? []).reduce((sum, c) => sum + c.cantidad, 0)
        mapa[entrada.fase_lunar] += total
      }
    }
    return mapa
  }, [bitacora])

  if (bitacora.length === 0) {
    return (
      <div className="p-6 text-center py-20 text-ocean-500">
        <p className="text-4xl mb-3">📊</p>
        <p>Registra salidas en la bitácora para ver reportes</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Reportes</h1>

      {/* Top especies */}
      {porEspecie.length > 0 && (
        <div className="bg-ocean-900 rounded-2xl p-6 border border-ocean-800">
          <h3 className="font-semibold mb-4 text-ocean-300">Top especies capturadas</h3>
          <ReactApexChart
            type="bar"
            height={250}
            series={[{ name: 'Capturas', data: porEspecie.map(([, v]) => v) }]}
            options={{
              chart: { background: 'transparent', toolbar: { show: false } },
              theme: { mode: 'dark' },
              xaxis: { categories: porEspecie.map(([k]) => k), labels: { style: { colors: '#7dd3fc' } } },
              yaxis: { labels: { style: { colors: '#7dd3fc' } } },
              colors: ['#0ea5e9'],
              plotOptions: { bar: { borderRadius: 6 } },
              grid: { borderColor: '#075985' },
            }}
          />
        </div>
      )}

      {/* Salidas por mes */}
      {porMes.length > 0 && (
        <div className="bg-ocean-900 rounded-2xl p-6 border border-ocean-800">
          <h3 className="font-semibold mb-4 text-ocean-300">Salidas por mes</h3>
          <ReactApexChart
            type="line"
            height={200}
            series={[{ name: 'Salidas', data: porMes.map(([, v]) => v) }]}
            options={{
              chart: { background: 'transparent', toolbar: { show: false } },
              theme: { mode: 'dark' },
              xaxis: { categories: porMes.map(([k]) => k), labels: { style: { colors: '#7dd3fc' } } },
              yaxis: { labels: { style: { colors: '#7dd3fc' } } },
              colors: ['#38bdf8'],
              stroke: { curve: 'smooth', width: 3 },
              grid: { borderColor: '#075985' },
            }}
          />
        </div>
      )}

      {/* Capturas por fase lunar */}
      <div className="bg-ocean-900 rounded-2xl p-6 border border-ocean-800">
        <h3 className="font-semibold mb-4 text-ocean-300">Capturas por fase lunar</h3>
        <ReactApexChart
          type="donut"
          height={250}
          series={Object.values(porFase)}
          options={{
            chart: { background: 'transparent' },
            theme: { mode: 'dark' },
            labels: ['🌑 Nueva', '🌒 Creciente', '🌕 Llena', '🌘 Menguante'],
            colors: ['#1e3a5f', '#0369a1', '#0ea5e9', '#38bdf8'],
            legend: { labels: { colors: '#bae6fd' } },
            plotOptions: { pie: { donut: { size: '65%' } } },
          }}
        />
      </div>
    </div>
  )
}