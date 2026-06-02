import { useState } from 'react'
import { getInfoLunar, getVentanasPesca, edadLunaEnDias, getFaseLunar, type Calificacion } from '@/utils/moon'
import { getEstadoMarea, getMareasDia } from '@/utils/tides'
import GraficaMareas from '@/components/GraficaMareas'

let SunCalc: any = null
try { SunCalc = require('suncalc') } catch { /* fallback */ }

const LAT = 9.5
const LON = -75.9

function getSolTiempos(fecha: Date): { amanecer: Date; atardecer: Date } {
  if (SunCalc) {
    const t = SunCalc.getTimes(fecha, LAT, LON)
    return { amanecer: t.sunrise, atardecer: t.sunset }
  }
  const am = new Date(fecha); am.setHours(5, 50, 0, 0)
  const pm = new Date(fecha); pm.setHours(18, 10, 0, 0)
  return { amanecer: am, atardecer: pm }
}

const BADGE_CAL: Record<Calificacion, { bg: string; text: string; celda: string }> = {
  'A+': { bg: 'bg-green-500/20',  text: 'text-green-400',  celda: 'bg-green-500/15 border-green-500/30 hover:bg-green-500/25' },
  'A':  { bg: 'bg-emerald-500/20',text: 'text-emerald-400',celda: 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20' },
  'B':  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', celda: 'bg-yellow-500/10 border-yellow-500/25 hover:bg-yellow-500/20' },
  'D':  { bg: 'bg-red-500/20',    text: 'text-red-400',    celda: 'bg-red-500/10 border-red-500/25 hover:bg-red-500/20' },
}

const NOMBRES_MES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

interface DiaMes {
  fecha: Date
  esHoy: boolean
  esMesActual: boolean
  lunar: ReturnType<typeof getInfoLunar>
}

function getDiasMes(anio: number, mes: number): DiaMes[] {
  const hoy = new Date()
  const primer = new Date(anio, mes, 1)
  const ultimo = new Date(anio, mes + 1, 0)
  const dias: DiaMes[] = []

  // Relleno inicio (días del mes anterior)
  for (let i = 0; i < primer.getDay(); i++) {
    const fecha = new Date(anio, mes, -primer.getDay() + i + 1)
    dias.push({ fecha, esHoy: false, esMesActual: false, lunar: getInfoLunar(fecha) })
  }

  // Días del mes
  for (let d = 1; d <= ultimo.getDate(); d++) {
    const fecha = new Date(anio, mes, d)
    const esHoy = fecha.toDateString() === hoy.toDateString()
    dias.push({ fecha, esHoy, esMesActual: true, lunar: getInfoLunar(fecha) })
  }

  // Relleno fin (días del mes siguiente) hasta completar 6 semanas
  const restantes = 42 - dias.length
  for (let i = 1; i <= restantes; i++) {
    const fecha = new Date(anio, mes + 1, i)
    dias.push({ fecha, esHoy: false, esMesActual: false, lunar: getInfoLunar(fecha) })
  }

  return dias
}

function fmt(d: Date) {
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-ocean-300 uppercase tracking-wider mb-4">
      <span>{icono}</span>{titulo}
    </h2>
  )
}

export default function Fecha() {
  const hoy = new Date()
  const [anio, setAnio]       = useState(hoy.getFullYear())
  const [mes, setMes]         = useState(hoy.getMonth())
  const [diaSelec, setDiaSelec] = useState<DiaMes | null>(null)

  const dias = getDiasMes(anio, mes)

  function navMes(delta: number) {
    const d = new Date(anio, mes + delta, 1)
    setAnio(d.getFullYear())
    setMes(d.getMonth())
    setDiaSelec(null)
  }

  function irHoy() {
    setAnio(hoy.getFullYear())
    setMes(hoy.getMonth())
    setDiaSelec(null)
  }

  // Estadísticas del mes
  const diasMes = dias.filter(d => d.esMesActual)
  const conteo: Record<Calificacion, number> = { 'A+': 0, 'A': 0, 'B': 0, 'D': 0 }
  diasMes.forEach(d => conteo[d.lunar.calificacion]++)

  return (
    <div className="space-y-5">

      {/* ── Header del calendario ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navMes(-1)}
            className="w-9 h-9 rounded-xl bg-ocean-800/60 border border-white/10 text-white hover:bg-ocean-700/60 transition-colors flex items-center justify-center"
          >‹</button>
          <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
            {NOMBRES_MES[mes]} {anio}
          </h2>
          <button
            onClick={() => navMes(1)}
            className="w-9 h-9 rounded-xl bg-ocean-800/60 border border-white/10 text-white hover:bg-ocean-700/60 transition-colors flex items-center justify-center"
          >›</button>
        </div>
        <div className="flex items-center gap-2">          
          <button
            onClick={irHoy}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold hover:bg-amber-500/30 transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Calendario ── */}
        <div className="xl:col-span-2">
          <Card className="p-4">
            {/* Resumen del mes */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 justify-center">
              {(['A+', 'A', 'B', 'D'] as Calificacion[]).map(c => (
                <div key={c} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${BADGE_CAL[c].bg} ${BADGE_CAL[c].text} ${BADGE_CAL[c].celda}`}>
                  <span>{c}</span>
                  <span className="opacity-60">×{conteo[c]}</span>
                  <span className="opacity-40 font-normal">{{ 'A+': 'Excelente', 'A': 'Buena', 'B': 'Moderada', 'D': 'Difícil' }[c]}</span>
                </div>
              ))}
            </div>
            {/* Leyenda */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3 justify-center">
              {/* ... leyenda igual que antes ... */}
            </div>
            {/* Cabecera días semana */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-ocean-400 py-1">{d}</div>
              ))}
            </div>

            {/* Grilla */}
            <div className="grid grid-cols-7 gap-1">
              {dias.map((dia, i) => {
                const { lunar, esHoy, esMesActual } = dia
                const cal = lunar.calificacion
                const seleccionado = diaSelec?.fecha.toDateString() === dia.fecha.toDateString()

                return (
                  <button
                    key={i}
                    onClick={() => setDiaSelec(dia)}
                    className={`
                      relative flex flex-col items-center justify-start
                      rounded-xl border p-1.5 min-h-[64px]
                      transition-all duration-150 text-left
                      ${!esMesActual ? 'opacity-25 border-transparent bg-transparent hover:opacity-40' :
                        seleccionado ? `${BADGE_CAL[cal].celda} ring-2 ring-amber-400` :
                        BADGE_CAL[cal].celda
                      }
                    `}
                  >
                    {/* Número del día */}
                    <span className={`
                      text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-0.5
                      ${esHoy ? 'bg-amber-500 text-ocean-950' :
                        seleccionado ? 'text-white' :
                        esMesActual ? 'text-white' : 'text-ocean-600'}
                    `}>
                      {dia.fecha.getDate()}
                    </span>

                    {/* Ícono lunar */}
                    <span className="text-base leading-none">{lunar.icono}</span>

                    {/* Calificación */}
                    {esMesActual && (
                      <span className={`text-[10px] font-bold leading-none mt-0.5 ${BADGE_CAL[cal].text}`}>
                        {cal}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-3 justify-center">
              {(['A+', 'A', 'B', 'D'] as Calificacion[]).map(c => (
                <div key={c} className="flex items-center gap-1.5 text-xs text-ocean-400">
                  <div className={`w-3 h-3 rounded-sm ${BADGE_CAL[c].bg} border ${BADGE_CAL[c].celda.split(' ')[2]}`} />
                  <span className={BADGE_CAL[c].text}>{c}</span>
                  <span>—</span>
                  <span>{{ 'A+': 'Excelente', 'A': 'Buena', 'B': 'Moderada', 'D': 'Difícil' }[c]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Panel detalle día ── */}
        <div className="xl:col-span-1">
          {diaSelec ? (
            <DetalleDia dia={diaSelec} />
          ) : (
            <Card className="flex flex-col items-center justify-center text-center py-16">
              <span className="text-5xl mb-4">📅</span>
              <p className="text-ocean-300 font-semibold mb-1">Selecciona un día</p>
              <p className="text-ocean-500 text-sm">Haz clic en cualquier día del calendario para ver el detalle completo.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function DetalleDia({ dia }: { dia: DiaMes }) {
  const { fecha, lunar, esHoy } = dia
  const [expandRecom, setExpandRecom] = useState(false)
  const { amanecer, atardecer } = getSolTiempos(fecha)
  const ventanas = getVentanasPesca(fecha, amanecer, atardecer)
  const marea = getEstadoMarea(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0))
  const mareasDia = getMareasDia(fecha)

  return (
    <div className="space-y-4">
      {/* Header día */}
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-ocean-400 text-xs uppercase tracking-wider">
              {fecha.toLocaleDateString('es-CO', { weekday: 'long' })}
            </p>
            <p className="text-white font-bold text-xl">
              {fecha.getDate()} de {NOMBRES_MES[fecha.getMonth()]} {fecha.getFullYear()}
            </p>
            {esHoy && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                HOY
              </span>
            )}
          </div>
          <span className="text-5xl">{lunar.icono}</span>
        </div>

        {/* Fase + calificación */}
        <div className={`rounded-xl p-3 border mb-3 ${BADGE_CAL[lunar.calificacion].celda}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">{lunar.nombre}</span>
            <span className={`text-sm font-bold ${BADGE_CAL[lunar.calificacion].text}`}>
              {lunar.calificacion}
            </span>
          </div>
          <p className="text-ocean-300 text-xs">{lunar.porcentaje}% iluminación</p>
        </div>

        <p className="text-ocean-200 text-xs leading-relaxed">{lunar.descripcion}</p>

        {/* Recomendaciones */}
        <div className="mt-3 border-t border-white/10 pt-3">
          <button
            onClick={() => setExpandRecom(v => !v)}
            className="flex items-center gap-2 text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors"
          >
            <span>💡 Recomendaciones</span>
            <span>{expandRecom ? '▲' : '▼'}</span>
          </button>
          {expandRecom && (
            <ul className="mt-2 space-y-1.5">
              {lunar.recomendaciones.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ocean-200">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Ventanas */}
      <Card>
        <SectionTitle icono="⏰" titulo="Ventanas de Pesca" />
        <div className="space-y-2">
          {ventanas.map((v, i) => (
            <div key={i} className={`rounded-xl p-2.5 border ${
              v.calidad === 'excelente' ? 'bg-green-500/10 border-green-500/30' :
              v.calidad === 'buena' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-ocean-800/40 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white font-bold text-sm">{v.inicio} – {v.fin}</span>
                <span className={`text-xs font-semibold ${
                  v.calidad === 'excelente' ? 'text-green-400' :
                  v.calidad === 'buena' ? 'text-amber-400' : 'text-ocean-400'
                }`}>{v.etiqueta}</span>
              </div>
              <p className="text-ocean-400 text-xs">{v.motivo}</p>
            </div>
          ))}
        </div>

        {/* Sol */}
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-around text-center">
          <div>
            <p className="text-xl">🌅</p>
            <p className="text-white font-bold text-sm">{fmt(amanecer)}</p>
            <p className="text-ocean-400 text-xs">Amanecer</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xl">🌇</p>
            <p className="text-white font-bold text-sm">{fmt(atardecer)}</p>
            <p className="text-ocean-400 text-xs">Atardecer</p>
          </div>
        </div>
      </Card>

    {/* Mareas */}
      <Card>
        <SectionTitle icono="🌊" titulo="Mareas del Día" />
        <GraficaMareas fecha={fecha} />
      </Card>
    </div>
  )
}