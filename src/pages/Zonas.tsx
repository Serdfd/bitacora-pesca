import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import type { Region, Spot } from '@/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FormZona {
  nombre: string
  descripcion: string
  estado: 'explorado' | 'recomendado'
  lat: string
  lon: string
}

interface FormSpot {
  nombre: string
  tipo: string
  recomendaciones: string
}

const EMPTY_ZONA: FormZona = { nombre: '', descripcion: '', estado: 'recomendado', lat: '', lon: '' }
const EMPTY_SPOT: FormSpot = { nombre: '', tipo: '', recomendaciones: '' }

const TIPOS_SPOT = [
  'Arrecife de coral', 'Fondo rocoso', 'Fondo arenoso',
  'Estructura submarina', 'Boya / FAD', 'Corriente oceánica',
  'Bajo / Montículo', 'Costa / Acantilado', 'Manglar',
  'Estuario', 'Pelágico abierto', 'Otro',
]

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-900/60 backdrop-blur-sm border border-white/10 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const esExplorado = estado === 'explorado'
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
      esExplorado
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }`}>
      {esExplorado ? '✅ Explorado' : '🔍 Por explorar'}
    </span>
  )
}

function Input({ label, value, onChange, placeholder = '', className = '', hint = '' }: {
  label: string; value: string; placeholder?: string; className?: string; hint?: string
  onChange: (v: string) => void
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-ocean-400 font-medium">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
      {hint && <p className="text-ocean-600 text-xs">{hint}</p>}
    </div>
  )
}

// ── Modal Nueva Zona ──────────────────────────────────────────────────────────

function ModalNuevaZona({ onClose, onGuardar }: {
  onClose: () => void
  onGuardar: (f: FormZona) => Promise<void>
}) {
  const [form, setForm]     = useState<FormZona>({ ...EMPTY_ZONA })
  const [guardando, setGuardando] = useState(false)

  function setF(k: keyof FormZona, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function guardar() {
    if (!form.nombre.trim()) { alert('El nombre de la zona es obligatorio.'); return }
    if (form.lat && isNaN(parseFloat(form.lat))) { alert('Latitud inválida. Ej: 9.50'); return }
    if (form.lon && isNaN(parseFloat(form.lon))) { alert('Longitud inválida. Ej: -75.90'); return }
    setGuardando(true)
    await onGuardar(form)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-ocean-900 z-10">
          <h2 className="text-white font-bold text-lg">🗺️ Nueva Zona</h2>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">

          <Input
            label="Nombre de la zona *"
            value={form.nombre}
            onChange={v => setF('nombre', v)}
            placeholder="Ej: Banco de los Salmones"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setF('descripcion', e.target.value)}
              rows={3}
              placeholder="Características, profundidad aproximada, cómo llegar..."
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
            />
          </div>

          {/* Coordenadas */}
          <div className="space-y-2">
            <label className="text-xs text-ocean-400 font-medium">
              Coordenadas GPS
              <span className="text-ocean-600 font-normal ml-1">(necesarias para clima y mareas)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitud"
                value={form.lat}
                onChange={v => setF('lat', v)}
                placeholder="Ej: 9.50"
              />
              <Input
                label="Longitud"
                value={form.lon}
                onChange={v => setF('lon', v)}
                placeholder="Ej: -75.90"
              />
            </div>
            <div className="flex items-start gap-2 bg-ocean-800/40 rounded-xl p-3 border border-white/10">
              <span className="text-base flex-shrink-0">💡</span>
              <p className="text-ocean-400 text-xs leading-relaxed">
                En Google Maps haz clic derecho sobre el punto → copia las coordenadas.
                Latitud es el primer número, longitud el segundo (negativo en Colombia).
              </p>
            </div>
          </div>

          {/* Estado inicial */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Estado inicial</label>
            <div className="grid grid-cols-2 gap-3">
              {(['recomendado', 'explorado'] as const).map(est => (
                <button
                  key={est}
                  onClick={() => setF('estado', est)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.estado === est
                      ? est === 'explorado'
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-ocean-800/40 border-white/10 text-ocean-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {est === 'explorado' ? '✅ Explorado' : '🔍 Por explorar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-ocean-900">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ocean-950 font-bold text-sm transition-colors">
            {guardando ? '⏳ Guardando...' : '💾 Crear Zona'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Nuevo Spot ──────────────────────────────────────────────────────────

function ModalNuevoSpot({ zona, onClose, onGuardar }: {
  zona: Region
  onClose: () => void
  onGuardar: (regionId: string, spot: FormSpot) => Promise<void>
}) {
  const [form, setForm]     = useState<FormSpot>({ ...EMPTY_SPOT })
  const [guardando, setGuardando] = useState(false)

  function setF(k: keyof FormSpot, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function guardar() {
    if (!form.nombre.trim()) { alert('El nombre del spot es obligatorio.'); return }
    setGuardando(true)
    await onGuardar(zona.id, form)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">📍 Nuevo Spot</h2>
            <p className="text-ocean-400 text-xs mt-0.5">en {zona.nombre}</p>
          </div>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <Input
            label="Nombre del spot *"
            value={form.nombre}
            onChange={v => setF('nombre', v)}
            placeholder="Ej: La Piedra del Faro"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Tipo de fondo / zona</label>
            <select value={form.tipo} onChange={e => setF('tipo', e.target.value)}
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
              <option value="">— Seleccionar tipo —</option>
              {TIPOS_SPOT.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Recomendaciones / Notas</label>
            <textarea value={form.recomendaciones} onChange={e => setF('recomendaciones', e.target.value)}
              rows={3} placeholder="Técnicas que funcionan, horarios, precauciones..."
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors" />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ocean-950 font-bold text-sm transition-colors">
            {guardando ? '⏳ Guardando...' : '💾 Crear Spot'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card de Spot ──────────────────────────────────────────────────────────────

function SpotCard({ spot }: { spot: Spot }) {
  return (
    <div className="flex items-start gap-3 bg-ocean-800/40 rounded-xl p-3 border border-white/10">
      <span className="text-xl mt-0.5">📍</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{spot.nombre}</p>
        {spot.tipo && <p className="text-ocean-400 text-xs mt-0.5">{spot.tipo}</p>}
        {spot.recomendaciones && (
          <p className="text-ocean-300 text-xs mt-1 leading-relaxed">{spot.recomendaciones}</p>
        )}
      </div>
    </div>
  )
}

// ── Card de Zona ──────────────────────────────────────────────────────────────

function ZonaCard({ zona, onCambiarEstado, onNuevoSpot }: {
  zona: Region
  onCambiarEstado: (zona: Region) => void
  onNuevoSpot: (zona: Region) => void
}) {
  const [expandida, setExpandida] = useState(false)
  const totalSpots  = zona.spots?.length ?? 0
  const tieneCoordenadas = zona.lat && zona.lat !== 0 && zona.lon && zona.lon !== 0

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">{zona.nombre}</h3>
            {zona.descripcion && (
              <p className="text-ocean-300 text-sm mt-1 leading-relaxed">{zona.descripcion}</p>
            )}
          </div>
          <EstadoBadge estado={zona.estado ?? 'recomendado'} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-ocean-400 mb-4 flex-wrap">
          <span>📍 {totalSpots} spot{totalSpots !== 1 ? 's' : ''}</span>
          {tieneCoordenadas ? (
            <span className="text-ocean-500">
              🌐 {zona.lat!.toFixed(2)}°N, {Math.abs(zona.lon!).toFixed(2)}°W
            </span>
          ) : (
            <span className="text-red-400/60">⚠️ Sin coordenadas — no aparecerá en selector de clima</span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onCambiarEstado(zona)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              zona.estado === 'explorado'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
            }`}
          >
            {zona.estado === 'explorado' ? '🔍 Marcar por explorar' : '✅ Marcar como explorado'}
          </button>

          <button
            onClick={() => onNuevoSpot(zona)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-ocean-700/60 border border-white/10 text-ocean-300 hover:text-white hover:bg-ocean-600/60 transition-colors"
          >
            + Nuevo Spot
          </button>

          {totalSpots > 0 && (
            <button
              onClick={() => setExpandida(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-ocean-400 hover:text-white transition-colors ml-auto"
            >
              {expandida ? '▲ Ocultar spots' : `▼ Ver ${totalSpots} spot${totalSpots !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {expandida && totalSpots > 0 && (
        <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-2">
          {zona.spots!.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Zonas() {
  const { regiones, loadAll, addSpot, updateZona } = useAppStore()
  const [modalNuevaZona, setModalNuevaZona] = useState(false)
  const [zonaParaSpot, setZonaParaSpot]     = useState<Region | null>(null)
  const [filtroEstado, setFiltroEstado]     = useState<'' | 'explorado' | 'recomendado'>('')
  const [busqueda, setBusqueda]             = useState('')

  useEffect(() => { if (regiones.length === 0) loadAll() }, [])

  const regionesFiltradas = regiones.filter(r => {
    const matchEstado = !filtroEstado || r.estado === filtroEstado
    const matchBusq   = !busqueda || r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusq
  })

  const totalExploradas   = regiones.filter(r => r.estado === 'explorado').length
  const totalRecomendadas = regiones.filter(r => r.estado === 'recomendado').length
  const totalConCoords    = regiones.filter(r => r.lat && r.lat !== 0).length

  async function guardarNuevaZona(form: FormZona) {
    await window.electronAPI.regiones.create({
      nombre:      form.nombre,
      descripcion: form.descripcion,
      estado:      form.estado,
      lat:         form.lat ? parseFloat(form.lat) : undefined,
      lon:         form.lon ? parseFloat(form.lon) : undefined,
    })
    await loadAll()
  }

  async function guardarNuevoSpot(regionId: string, form: FormSpot) {
    await addSpot({
      id:              `spot_${Date.now()}`,
      region_id:       regionId,
      nombre:          form.nombre,
      tipo:            form.tipo || undefined,
      recomendaciones: form.recomendaciones || undefined,
    })
  }

  async function cambiarEstado(zona: Region) {
    const nuevoEstado = zona.estado === 'explorado' ? 'recomendado' : 'explorado'
    await window.electronAPI.regiones.updateEstado(zona.id, nuevoEstado)
    await loadAll()
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{regiones.length}</p>
          <p className="text-ocean-400 text-xs mt-0.5">Zonas totales</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{totalExploradas}</p>
          <p className="text-ocean-400 text-xs mt-0.5">Exploradas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{totalRecomendadas}</p>
          <p className="text-ocean-400 text-xs mt-0.5">Por explorar</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{totalConCoords}</p>
          <p className="text-ocean-400 text-xs mt-0.5">Con GPS 🌐</p>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-500">🔍</span>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar zona..."
            className="w-full bg-ocean-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
        </div>
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {([
            { value: '',            label: 'Todas'          },
            { value: 'explorado',   label: '✅ Exploradas'  },
            { value: 'recomendado', label: '🔍 Por explorar'},
          ] as const).map(f => (
            <button key={f.value} onClick={() => setFiltroEstado(f.value)}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                filtroEstado === f.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-ocean-400 hover:text-white hover:bg-white/5'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModalNuevaZona(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-sm transition-colors whitespace-nowrap">
          + Nueva Zona
        </button>
      </div>

      {/* Lista */}
      {regionesFiltradas.length === 0 ? (
        <Card className="p-16 text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-white font-bold text-lg mb-1">
            {regiones.length === 0 ? 'Sin zonas registradas' : 'Sin resultados'}
          </p>
          <p className="text-ocean-400 text-sm">
            {regiones.length === 0 ? 'Crea tu primera zona de pesca para comenzar.' : 'Prueba con otro término o filtro.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {regionesFiltradas.map(zona => (
            <ZonaCard key={zona.id} zona={zona}
              onCambiarEstado={cambiarEstado}
              onNuevoSpot={z => setZonaParaSpot(z)} />
          ))}
        </div>
      )}

      {modalNuevaZona && (
        <ModalNuevaZona onClose={() => setModalNuevaZona(false)} onGuardar={guardarNuevaZona} />
      )}
      {zonaParaSpot && (
        <ModalNuevoSpot zona={zonaParaSpot} onClose={() => setZonaParaSpot(null)} onGuardar={guardarNuevoSpot} />
      )}
    </div>
  )
}