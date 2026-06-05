import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { getInfoLunar, getVentanasPesca, type VentanaPesca } from '@/utils/moon'
import { getEstadoMarea, getMareasDia } from '@/utils/tides'
import { getDatosClimaticos, getSenalesAgua, type DatosClimaticos, type SenalAgua } from '@/utils/weather'
import type { Especie } from '@/types'
import GraficaMareas from '@/components/GraficaMareas'

let SunCalc: any = null
try { SunCalc = require('suncalc') } catch {}

const ZONA_DEFAULT = 'puerto_escondido'
const STORAGE_KEY  = 'hoy_zona_seleccionada'

function getSolTiempos(fecha: Date, lat: number, lon: number): { amanecer: Date; atardecer: Date } {
  if (SunCalc) {
    const t = SunCalc.getTimes(fecha, lat, lon)
    return { amanecer: t.sunrise, atardecer: t.sunset }
  }
  const am = new Date(fecha); am.setHours(5, 50, 0, 0)
  const pm = new Date(fecha); pm.setHours(18, 10, 0, 0)
  return { amanecer: am, atardecer: pm }
}

type CalificacionActividad = 'A+' | 'A' | 'B' | 'D'

function getCalificacionEspecie(especie: Especie, faseLunar: string): CalificacionActividad {
  const luna = especie.luna_optima?.toLowerCase() ?? 'cualquiera'
  const fase = faseLunar.toLowerCase()
  if (luna === 'cualquiera') return 'A'
  const esNueva     = fase.includes('nueva')
  const esCreciente = fase.includes('creciente')
  const esLlena     = fase.includes('llena')
  const esMenguante = fase.includes('menguante')
  if (luna === 'nueva'     && esNueva)     return 'A+'
  if (luna === 'llena'     && esLlena)     return 'A+'
  if (luna === 'creciente' && esCreciente) return 'A+'
  if (luna === 'menguante' && esMenguante) return 'A+'
  if (luna === 'nueva'     && esLlena)     return 'D'
  if (luna === 'llena'     && esNueva)     return 'D'
  if (luna === 'nueva'     && esCreciente) return 'A'
  if (luna === 'nueva'     && esMenguante) return 'A'
  if (luna === 'creciente' && esNueva)     return 'A'
  if (luna === 'menguante' && esNueva)     return 'A'
  if (luna === 'llena'     && esCreciente) return 'B'
  if (luna === 'llena'     && esMenguante) return 'B'
  return 'B'
}

const BADGE: Record<CalificacionActividad, { bg: string; text: string; bar: string }> = {
  'A+': { bg: 'bg-green-500/20',   text: 'text-green-400',   bar: 'bg-green-500'   },
  'A':  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-400' },
  'B':  { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  bar: 'bg-yellow-400'  },
  'D':  { bg: 'bg-red-500/20',     text: 'text-red-400',     bar: 'bg-red-500'     },
}

const BAR_WIDTH: Record<CalificacionActividad, string> = {
  'A+': 'w-full', 'A': 'w-3/4', 'B': 'w-2/4', 'D': 'w-1/4',
}

function CalBadge({ cal }: { cal: CalificacionActividad }) {
  const s = BADGE[cal]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.text} border border-current/30`}>
      {cal}
    </span>
  )
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

export default function Hoy() {
  const { especies, regiones, loadAll } = useAppStore()

  // Zona seleccionada — persiste en localStorage
  const [zonaId, setZonaId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? ZONA_DEFAULT
  )

  const [clima, setClima]       = useState<DatosClimaticos | null>(null)
  const [senales, setSenales]   = useState<SenalAgua[]>([])
  const [ventanas, setVentanas] = useState<VentanaPesca[]>([])
  const [cargando, setCargando] = useState(true)
  const [expandRecom, setExpandRecom] = useState(false)

  const hoy   = new Date()
  const lunar = getInfoLunar(hoy)
  const marea = getEstadoMarea(hoy)

  // Coordenadas desde la región en BD
  const zonaActual = regiones.find(r => r.id === zonaId)
  const coords = {
    lat: zonaActual?.lat && zonaActual.lat !== 0 ? zonaActual.lat : 9.5,
    lon: zonaActual?.lon && zonaActual.lon !== 0 ? zonaActual.lon : -75.9,
  }
  const nombreZona = zonaActual?.nombre ?? zonaId

  const { amanecer, atardecer } = getSolTiempos(hoy, coords.lat, coords.lon)
  const fmt = (d: Date) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Zonas que tienen coordenadas registradas
  const zonasConCoordenadas = regiones.filter(r => r.lat && r.lat !== 0 && r.lon && r.lon !== 0)

  useEffect(() => {
    if (especies.length === 0 || regiones.length === 0) loadAll()
  }, [])

  useEffect(() => {
    // Si la zona seleccionada no tiene coords aún (regiones no cargadas), esperar
    if (regiones.length === 0) return

    setCargando(true)
    localStorage.setItem(STORAGE_KEY, zonaId)

    getDatosClimaticos(hoy, coords.lat, coords.lon).then(d => {
      setClima(d)
      setSenales(getSenalesAgua(d, lunar.fase))
      setVentanas(getVentanasPesca(hoy, amanecer, atardecer))
      setCargando(false)
    })
  }, [zonaId, regiones.length])

  const especiesCalificadas = [...especies]
    .map(e => ({ especie: e, cal: getCalificacionEspecie(e, lunar.fase) }))
    .sort((a, b) => {
      const orden: Record<CalificacionActividad, number> = { 'A+': 0, 'A': 1, 'B': 2, 'D': 3 }
      return orden[a.cal] - orden[b.cal]
    })

  return (
    <div className="space-y-6">

      {/* ── Selector de zona ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-ocean-400 text-sm flex-shrink-0">📍 Zona:</span>
        {zonasConCoordenadas.length === 0 ? (
          <span className="text-ocean-600 text-sm">Cargando zonas...</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {zonasConCoordenadas.map(z => (
              <button
                key={z.id}
                onClick={() => setZonaId(z.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  zonaId === z.id
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-ocean-800/40 border-white/10 text-ocean-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {z.nombre}
              </button>
            ))}
          </div>
        )}
        {coords.lat !== 0 && (
          <span className="text-ocean-600 text-xs ml-auto">
            {coords.lat.toFixed(2)}°N, {Math.abs(coords.lon).toFixed(2)}°W
          </span>
        )}
      </div>

      {/* ── Fila 1: Fase lunar + Ventanas + Marea ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Fase Lunar */}
        <Card className="lg:col-span-1">
          <SectionTitle icono="🌙" titulo="Condiciones del Día" />
          <div className="flex items-start gap-4">
            <div className="text-6xl leading-none">{lunar.icono}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-white font-bold text-lg">{lunar.nombre}</span>
                <CalBadge cal={lunar.calificacion} />
              </div>
              <div className="flex items-center gap-4 text-xs text-ocean-400 mb-3">
                <span>💡 {lunar.porcentaje}% iluminación</span>
                <span>🌕 Llena en {lunar.diasHastaLlena}d</span>
              </div>
              <p className="text-ocean-200 text-sm leading-relaxed">{lunar.descripcion}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              onClick={() => setExpandRecom(v => !v)}
              className="flex items-center gap-2 text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors"
            >
              <span>💡 Recomendaciones para hoy</span>
              <span>{expandRecom ? '▲' : '▼'}</span>
            </button>
            {expandRecom && (
              <ul className="mt-3 space-y-2">
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

        {/* Ventanas de Pesca */}
        <Card className="lg:col-span-1">
          <SectionTitle icono="⏰" titulo="Ventanas de Pesca" />
          <div className="space-y-3">
            {ventanas.map((v, i) => (
              <div key={i} className={`rounded-xl p-3 border ${
                v.calidad === 'excelente' ? 'bg-green-500/10 border-green-500/30' :
                v.calidad === 'buena'     ? 'bg-amber-500/10 border-amber-500/30' :
                                            'bg-ocean-800/50 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-base">{v.inicio} – {v.fin}</span>
                  <span className={`text-xs font-semibold ${
                    v.calidad === 'excelente' ? 'text-green-400' :
                    v.calidad === 'buena'     ? 'text-amber-400' : 'text-ocean-400'
                  }`}>{v.etiqueta}</span>
                </div>
                <p className="text-ocean-300 text-xs">{v.motivo}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-around text-center">
            <div>
              <p className="text-2xl">🌅</p>
              <p className="text-white font-bold text-sm">{fmt(amanecer)}</p>
              <p className="text-ocean-400 text-xs">Amanecer</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl">🌇</p>
              <p className="text-white font-bold text-sm">{fmt(atardecer)}</p>
              <p className="text-ocean-400 text-xs">Atardecer</p>
            </div>
          </div>
        </Card>

        {/* Mareas */}
        <Card className="lg:col-span-1">
          <SectionTitle icono="🌊" titulo="Mareas" />
          <div className={`rounded-xl p-4 mb-4 border ${
            marea.tipo === 'Pleamar' || marea.tipo === 'Subiendo'
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-cyan-500/10 border-cyan-500/30'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-bold text-lg">{marea.tipo}</span>
              <span className="text-ocean-300 text-sm">{marea.altura}m</span>
            </div>
            <p className="text-ocean-300 text-xs">{marea.descripcion}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-ocean-800/50 rounded-xl p-3 text-center">
              <p className="text-xl">⬆️</p>
              <p className="text-white font-bold">{marea.proximaPleamar}</p>
              <p className="text-ocean-400 text-xs">Pleamar</p>
              <p className="text-ocean-500 text-xs">en {marea.horasPleamar}h</p>
            </div>
            <div className="bg-ocean-800/50 rounded-xl p-3 text-center">
              <p className="text-xl">⬇️</p>
              <p className="text-white font-bold">{marea.proximaBasjamar}</p>
              <p className="text-ocean-400 text-xs">Bajamar</p>
              <p className="text-ocean-500 text-xs">en {marea.horasBasjamar}h</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 mt-2">
            <p className="text-ocean-400 text-xs font-semibold mb-2">MAREAS DEL DÍA</p>
            <GraficaMareas fecha={hoy} />
          </div>
        </Card>
      </div>

      {/* ── Fila 2: Clima + Señales del agua ── */}
      {cargando ? (
        <Card>
          <div className="flex items-center justify-center py-8 gap-3 text-ocean-400">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando condiciones de {nombreZona}...</span>
          </div>
        </Card>
      ) : clima && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Clima */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle icono="🌤️" titulo={`Clima — ${nombreZona}`} />
              <span className={`text-xs px-2 py-1 rounded-full ${
                clima.fuenteDatos === 'api'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {clima.fuenteDatos === 'api' ? `🛰 API · ${clima.ultimaActualizacion}` : '📊 Estimado'}
              </span>
            </div>
            <div className="bg-ocean-800/50 rounded-xl p-4 mb-4">
              <p className="text-ocean-300 text-sm mb-1">{clima.condicionGeneral}</p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white">{clima.temperaturaAire}°C</span>
                <span className="text-ocean-400 text-sm pb-1">aire</span>
                <span className="text-2xl font-bold text-cyan-400 ml-2">{clima.temperaturaAgua}°C</span>
                <span className="text-ocean-400 text-sm pb-1">agua</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icono: '💨', label: 'Viento',  valor: `${clima.vientoVelocidad} km/h`, sub: clima.vientoDireccionTexto },
                { icono: '🌊', label: 'Olas',     valor: `${clima.alturaOlas}m`,          sub: clima.estadoMar },
                { icono: '💧', label: 'Claridad', valor: clima.claridad,                  sub: '' },
                { icono: '☁️', label: 'Nubes',    valor: `${clima.coberturaNubes}%`,      sub: '' },
                { icono: '💦', label: 'Humedad',  valor: `${clima.humedadRelativa}%`,     sub: '' },
                { icono: '📊', label: 'Presión',  valor: `${clima.presionAtmosferica}`,   sub: 'hPa' },
                { icono: '🌧️', label: 'Precip.',  valor: `${clima.precipitacion}mm`,      sub: '/h' },
                { icono: '👁️', label: 'Visib.',   valor: `${clima.visibilidad}km`,        sub: '' },
              ].map((d, i) => (
                <div key={i} className="bg-ocean-800/40 rounded-xl p-2.5 text-center">
                  <p className="text-base mb-0.5">{d.icono}</p>
                  <p className="text-white text-sm font-semibold leading-tight">
                    {d.valor}<span className="text-ocean-400 text-xs">{d.sub}</span>
                  </p>
                  <p className="text-ocean-400 text-xs">{d.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Señales del Agua */}
          <Card>
            <SectionTitle icono="🔍" titulo="Señales del Agua" />
            <div className="space-y-3">
              {senales.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-3 border ${
                  s.impacto === 'positivo' ? 'bg-green-500/10 border-green-500/20' :
                  s.impacto === 'negativo' ? 'bg-red-500/10 border-red-500/20' :
                                             'bg-ocean-800/40 border-white/10'
                }`}>
                  <span className="text-xl flex-shrink-0">{s.icono}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-semibold">{s.titulo}</p>
                      <span className={`text-xs ${
                        s.impacto === 'positivo' ? 'text-green-400' :
                        s.impacto === 'negativo' ? 'text-red-400' : 'text-ocean-400'
                      }`}>
                        {s.impacto === 'positivo' ? '▲ Favorable' :
                         s.impacto === 'negativo' ? '▼ Desfavorable' : '● Neutro'}
                      </span>
                    </div>
                    <p className="text-ocean-300 text-xs leading-relaxed">{s.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Fila 3: Actividad de Especies ── */}
      <Card>
        <SectionTitle icono="🐟" titulo={`Actividad de Especies — ${new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`} />
        {especiesCalificadas.length === 0 ? (
          <p className="text-ocean-400 text-sm text-center py-8">Cargando especies...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {especiesCalificadas.map(({ especie, cal }) => {
              const s = BADGE[cal]
              return (
                <div key={especie.id} className={`flex items-center gap-3 rounded-xl p-3 border ${s.bg} border-current/20`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-white text-sm font-semibold truncate">{especie.nombre}</p>
                      <CalBadge cal={cal} />
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar} ${BAR_WIDTH[cal]} transition-all`} />
                    </div>
                    <p className="text-ocean-400 text-xs mt-1 truncate">{especie.luna_optima}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-ocean-400">
          {(['A+', 'A', 'B', 'D'] as CalificacionActividad[]).map(c => (
            <div key={c} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${BADGE[c].bar}`} />
              <span className={BADGE[c].text}>{c}</span>
              <span>—</span>
              <span>{{ 'A+': 'Excelente', 'A': 'Buena', 'B': 'Moderada', 'D': 'Difícil' }[c]}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}