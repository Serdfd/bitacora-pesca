import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { getIconoFase } from '@/utils/moon'
import type { Especie } from '@/types'

const LUNAS = [
  { value: 'nueva',               label: '🌑 Luna Nueva' },
  { value: 'creciente_creciente', label: '🌒 Creciente' },
  { value: 'cuarto_creciente',    label: '🌓 Cuarto Creciente' },
  { value: 'gibosa_creciente',    label: '🌔 Gibosa Creciente' },
  { value: 'llena',               label: '🌕 Luna Llena' },
  { value: 'gibosa_menguante',    label: '🌖 Gibosa Menguante' },
  { value: 'cuarto_menguante',    label: '🌗 Cuarto Menguante' },
  { value: 'creciente_menguante', label: '🌘 Menguante' },
  { value: 'cualquiera',          label: '🌙 Cualquiera' },
]

const LUNAS_FILTRO = [
  { value: '',                    label: '🌙 Todas las fases' },
  { value: 'nueva',               label: '🌑 Luna Nueva' },
  { value: 'creciente_creciente', label: '🌒 Creciente' },
  { value: 'llena',               label: '🌕 Luna Llena' },
  { value: 'creciente_menguante', label: '🌘 Menguante' },
  { value: 'cualquiera',          label: '🌙 Cualquiera' },
]

const EMPTY_FORM: Partial<Especie> = {
  nombre: '', nombre_cientifico: '', descripcion: '',
  luna_optima: 'cualquiera',
  profundidad_min: 0, profundidad_max: 100,
  tecnicas: '', cebos: '',
  peso_promedio: '', peso_maximo: '',
  talla_promedio: '', talla_maxima: '',
  record_colombia: '', profundidad_detalle: '',
  habitat: '', temporada_alta: '',
  comportamiento: '', colores_senuelos: '', curiosidad: '',
  activo: true,
}

// ── Componentes UI reutilizables ──────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-900/60 backdrop-blur-sm border border-white/10 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

function Badge({ text, color = 'ocean' }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    ocean: 'bg-ocean-700/50 text-ocean-300 border-white/10',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[color] ?? colors.ocean}`}>
      {text}
    </span>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-ocean-400 font-medium">{children}</label>
}

function TextInput({ label, value, onChange, placeholder = '' }: {
  label: string; value: string; placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder = '', rows = 3 }: {
  label: string; value: string; placeholder?: string; rows?: number
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors" />
    </div>
  )
}

// ── Imagen de especie ─────────────────────────────────────────────────────────
function EspecieImg({ id, nombre, size = 'md', imagen }: {
  id: string; nombre: string; size?: 'sm' | 'md' | 'lg'; imagen?: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => { setFailed(false) }, [id, imagen])

  const src = imagen || (!failed ? `./assets/especies/${id}.jpg` : null)
  const emojiSize = size === 'lg' ? 'text-7xl' : size === 'md' ? 'text-5xl' : 'text-2xl'

  if (src) {
    return (
      <img
        src={src}
        alt={nombre}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-center"
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-ocean-800/60">
      <span className={emojiSize}>🐟</span>
    </div>
  )
}

// ── Formulario compartido (crear / editar) ────────────────────────────────────

function FormEspecie({ form, setF, imagenPreview, imagenPath, onSeleccionarImagen }: {
  form: Partial<Especie>
  setF: (k: keyof Especie, v: any) => void
  imagenPreview: string | null
  imagenPath: string | null
  onSeleccionarImagen: () => void
}) {
  return (
    <div className="space-y-5">

      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Imagen</FieldLabel>
        <div className="flex items-center gap-3">
          {imagenPreview
            ? <img src={imagenPreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-white/10" />
            : <div className="w-20 h-20 flex items-center justify-center bg-ocean-800/50 rounded-xl border border-dashed border-white/20 text-3xl">🐟</div>
          }
          <button type="button" onClick={onSeleccionarImagen}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            📁 {imagenPath ? 'Cambiar imagen' : 'Adjuntar imagen'}
          </button>
        </div>
        {imagenPath && <p className="text-ocean-500 text-xs truncate">{imagenPath}</p>}
      </div>

      {/* Identificación */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Identificación</p>
        <div className="space-y-3">
          <TextInput label="Nombre común *" value={form.nombre ?? ''} onChange={v => setF('nombre', v)} placeholder="Ej: Pargo rayado" />
          <TextInput label="Nombre científico" value={form.nombre_cientifico ?? ''} onChange={v => setF('nombre_cientifico', v)} placeholder="Ej: Lutjanus synagris" />
          <TextArea label="Descripción general" value={form.descripcion ?? ''} onChange={v => setF('descripcion', v)} placeholder="Descripción general de la especie..." />
        </div>
      </div>

      {/* Comportamiento */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Comportamiento y Hábitat</p>
        <div className="space-y-3">
          <TextArea label="Comportamiento" value={form.comportamiento ?? ''} onChange={v => setF('comportamiento', v)}
            placeholder="Cómo caza, dónde vive, hábitos de alimentación..." rows={3} />
          <TextInput label="Hábitat (separado por comas)" value={form.habitat ?? ''} onChange={v => setF('habitat', v)}
            placeholder="Ej: Arrecife, Pelágico, Manglar" />
          <TextInput label="Temporada alta" value={form.temporada_alta ?? ''} onChange={v => setF('temporada_alta', v)}
            placeholder="Ej: Dic – Mar (época seca)" />
        </div>
      </div>

      {/* Datos biométricos */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Datos Biométricos</p>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Peso promedio" value={form.peso_promedio ?? ''} onChange={v => setF('peso_promedio', v)} placeholder="Ej: 3–8 kg" />
          <TextInput label="Peso máximo" value={form.peso_maximo ?? ''} onChange={v => setF('peso_maximo', v)} placeholder="Ej: 45 kg" />
          <TextInput label="Talla promedio" value={form.talla_promedio ?? ''} onChange={v => setF('talla_promedio', v)} placeholder="Ej: 60–90 cm" />
          <TextInput label="Talla máxima" value={form.talla_maxima ?? ''} onChange={v => setF('talla_maxima', v)} placeholder="Ej: 185 cm" />
          <TextInput label="Récord Colombia" value={form.record_colombia ?? ''} onChange={v => setF('record_colombia', v)} placeholder="Ej: ~20 kg" />
          <TextInput label="Profundidad (detalle)" value={form.profundidad_detalle ?? ''} onChange={v => setF('profundidad_detalle', v)} placeholder="Ej: 0–100 m" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1">
            <FieldLabel>Prof. mínima (m)</FieldLabel>
            <input type="number" value={form.profundidad_min ?? 0} onChange={e => setF('profundidad_min', Number(e.target.value))}
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Prof. máxima (m)</FieldLabel>
            <input type="number" value={form.profundidad_max ?? 100} onChange={e => setF('profundidad_max', Number(e.target.value))}
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      {/* Pesca */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Pesca</p>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <FieldLabel>Fase lunar óptima</FieldLabel>
            <select value={form.luna_optima ?? 'cualquiera'} onChange={e => setF('luna_optima', e.target.value)}
              className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
              {LUNAS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <TextInput label="Técnicas (separadas por comas)" value={form.tecnicas ?? ''} onChange={v => setF('tecnicas', v)}
            placeholder="Ej: Fondo, Jigging, Spinning" />
          <TextInput label="Cebos / Carnadas (separados por comas)" value={form.cebos ?? ''} onChange={v => setF('cebos', v)}
            placeholder="Ej: Camarón, calamar, plumas" />
          <TextInput label="Colores de señuelos efectivos (separados por comas)" value={form.colores_senuelos ?? ''} onChange={v => setF('colores_senuelos', v)}
            placeholder="Ej: Azul/Blanco, Plateado, Rojo/Blanco" />
        </div>
      </div>

      {/* Curiosidad */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Dato Curioso</p>
        <TextArea label="Sabías que..." value={form.curiosidad ?? ''} onChange={v => setF('curiosidad', v)}
          placeholder="Un dato interesante sobre esta especie..." rows={2} />
      </div>
    </div>
  )
}

// ── Modal Nueva Especie ───────────────────────────────────────────────────────

function ModalNuevaEspecie({ onClose, onGuardar }: {
  onClose: () => void
  onGuardar: (e: Partial<Especie>, imagenPath: string | null) => Promise<void>
}) {
  const [form, setForm]                   = useState<Partial<Especie>>({ ...EMPTY_FORM })
  const [guardando, setGuardando]         = useState(false)
  const [imagenPath, setImagenPath]       = useState<string | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)

  function setF(k: keyof Especie, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function seleccionarImagen() {
    const fp = await window.electronAPI.especies.selectImage()
    if (fp) { setImagenPath(fp); setImagenPreview(`file://${fp}`) }
  }

  async function guardar() {
    if (!form.nombre?.trim()) { alert('El nombre es obligatorio.'); return }
    setGuardando(true)
    await onGuardar(form, imagenPath)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-ocean-900 z-10">
          <h2 className="text-white font-bold text-lg">🐟 Nueva Especie</h2>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="p-5">
          <FormEspecie form={form} setF={setF} imagenPreview={imagenPreview} imagenPath={imagenPath} onSeleccionarImagen={seleccionarImagen} />
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-ocean-900">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ocean-950 font-bold text-sm transition-colors">
            {guardando ? '⏳ Guardando...' : '💾 Guardar Especie'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Editar Especie ──────────────────────────────────────────────────────

function ModalEditarEspecie({ especie, onClose, onGuardar }: {
  especie: Especie
  onClose: () => void
  onGuardar: (id: string, e: Partial<Especie>, imagenPath: string | null) => Promise<void>
}) {
  const [form, setForm] = useState<Partial<Especie>>({
    nombre:              especie.nombre,
    nombre_cientifico:   especie.nombre_cientifico ?? '',
    descripcion:         especie.descripcion ?? '',
    luna_optima:         especie.luna_optima ?? 'cualquiera',
    profundidad_min:     especie.profundidad_min ?? 0,
    profundidad_max:     especie.profundidad_max ?? 100,
    tecnicas:            especie.tecnicas ?? '',
    cebos:               especie.cebos ?? '',
    peso_promedio:       especie.peso_promedio ?? '',
    peso_maximo:         especie.peso_maximo ?? '',
    talla_promedio:      especie.talla_promedio ?? '',
    talla_maxima:        especie.talla_maxima ?? '',
    record_colombia:     especie.record_colombia ?? '',
    profundidad_detalle: especie.profundidad_detalle ?? '',
    habitat:             especie.habitat ?? '',
    temporada_alta:      especie.temporada_alta ?? '',
    comportamiento:      especie.comportamiento ?? '',
    colores_senuelos:    especie.colores_senuelos ?? '',
    curiosidad:          especie.curiosidad ?? '',
  })
  const [guardando, setGuardando]         = useState(false)
  const [imagenPath, setImagenPath]       = useState<string | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(especie.imagen ?? null)

  function setF(k: keyof Especie, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function seleccionarImagen() {
    const fp = await window.electronAPI.especies.selectImage()
    if (fp) { setImagenPath(fp); setImagenPreview(`file://${fp}`) }
  }

  async function guardar() {
    if (!form.nombre?.trim()) { alert('El nombre es obligatorio.'); return }
    setGuardando(true)
    await onGuardar(especie.id!, form, imagenPath)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-ocean-900 z-10">
          <div>
            <h2 className="text-white font-bold text-lg">✏️ Editar Especie</h2>
            <p className="text-ocean-400 text-xs mt-0.5">{especie.nombre}</p>
          </div>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="p-5">
          <FormEspecie form={form} setF={setF} imagenPreview={imagenPreview} imagenPath={imagenPath} onSeleccionarImagen={seleccionarImagen} />
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-ocean-900">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ocean-950 font-bold text-sm transition-colors">
            {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Detalle ─────────────────────────────────────────────────────────────

function ModalDetalle({ especie, onClose, onEditar }: {
  especie: Especie
  onClose: () => void
  onEditar: () => void
}) {
  const lunaIcono  = getIconoFase(especie.luna_optima ?? 'cualquiera')
  const habitat    = especie.habitat?.split(',').map(h => h.trim()).filter(Boolean) ?? []
  const tecnicas   = especie.tecnicas?.split(',').map(t => t.trim()).filter(Boolean) ?? []
  const colores    = especie.colores_senuelos?.split(',').map(c => c.trim()).filter(Boolean) ?? []
  const cebos      = especie.cebos?.split(',').map(c => c.trim()).filter(Boolean) ?? []

  const stats = [
    { icono: '⚖️', label: 'Peso promedio',    valor: especie.peso_promedio },
    { icono: '🏆', label: 'Peso máximo',      valor: especie.peso_maximo },
    { icono: '📏', label: 'Talla promedio',   valor: especie.talla_promedio },
    { icono: '📐', label: 'Talla máxima',     valor: especie.talla_maxima },
    { icono: '🇨🇴', label: 'Récord Colombia',  valor: especie.record_colombia },
    { icono: '🌊', label: 'Profundidad',      valor: especie.profundidad_detalle },
  ].filter(s => s.valor)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Imagen header */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl">
          <EspecieImg id={especie.id ?? ''} nombre={especie.nombre} size="lg" imagen={especie.imagen} />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-ocean-900/40 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={onEditar}
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/80 text-white text-xs font-semibold transition-colors">
              ✏️ Editar
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors">
              ✕
            </button>
          </div>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-bold text-2xl drop-shadow">{especie.nombre}</h2>
            {especie.nombre_cientifico && (
              <p className="text-ocean-300 text-sm italic">{especie.nombre_cientifico}</p>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge text={`${lunaIcono} ${LUNAS.find(l => l.value === especie.luna_optima)?.label?.replace(/^.{2}/, '') ?? especie.luna_optima ?? 'Cualquier fase'}`} color="amber" />
            {habitat.map(h => <Badge key={h} text={h} color="blue" />)}
            {especie.temporada_alta && <Badge text={`📅 ${especie.temporada_alta}`} color="green" />}
          </div>

          {/* Descripción */}
          {especie.descripcion && (
            <p className="text-ocean-200 text-sm leading-relaxed">{especie.descripcion}</p>
          )}

          {/* Comportamiento */}
          {especie.comportamiento && (
            <div className="bg-ocean-800/40 rounded-xl p-4">
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🧠 Comportamiento</p>
              <p className="text-ocean-200 text-sm leading-relaxed">{especie.comportamiento}</p>
            </div>
          )}

          {/* Stats biométricos */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="bg-ocean-800/40 rounded-xl p-3 text-center">
                  <p className="text-lg mb-0.5">{s.icono}</p>
                  <p className="text-white font-bold text-sm">{s.valor}</p>
                  <p className="text-ocean-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Colores de señuelos */}
          {colores.length > 0 && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🎨 Colores de señuelos efectivos</p>
              <div className="flex flex-wrap gap-2">
                {colores.map(c => <Badge key={c} text={c} color="amber" />)}
              </div>
            </div>
          )}

          {/* Técnicas */}
          {tecnicas.length > 0 && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🎣 Técnicas recomendadas</p>
              <div className="flex flex-wrap gap-2">
                {tecnicas.map(t => <Badge key={t} text={t} color="green" />)}
              </div>
            </div>
          )}

          {/* Cebos */}
          {cebos.length > 0 && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🪝 Cebos / Carnadas</p>
              <div className="flex flex-wrap gap-2">
                {cebos.map(c => <Badge key={c} text={c} color="ocean" />)}
              </div>
            </div>
          )}

          {/* Curiosidad */}
          {especie.curiosidad && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-semibold uppercase mb-1">💡 Sabías que...</p>
              <p className="text-ocean-200 text-sm leading-relaxed">{especie.curiosidad}</p>
            </div>
          )}

          {/* Sin datos */}
          {!especie.descripcion && !especie.comportamiento && stats.length === 0 && tecnicas.length === 0 && (
            <div className="text-center py-6 text-ocean-500">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm">Sin información adicional.</p>
              <button onClick={onEditar} className="mt-2 text-amber-400 text-xs hover:underline">
                Editar para agregar información →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Especies() {
  const { especies, loadAll } = useAppStore()
  const [busqueda, setBusqueda]     = useState('')
  const [filtroLuna, setFiltroLuna] = useState('')
  const [detalle, setDetalle]       = useState<Especie | null>(null)
  const [editando, setEditando]     = useState<Especie | null>(null)
  const [modalNueva, setModalNueva] = useState(false)

  useEffect(() => { if (especies.length === 0) loadAll() }, [])

  async function guardarNuevaEspecie(nueva: Partial<Especie>, imagenPath: string | null) {
    const id = await window.electronAPI.especies.create(nueva as Especie)
    if (imagenPath && id) await window.electronAPI.especies.saveImage(id, imagenPath)
    await loadAll()
  }

  async function guardarEdicion(id: string, datos: Partial<Especie>, imagenPath: string | null) {
    await window.electronAPI.especies.update(id, datos)
    if (imagenPath) await window.electronAPI.especies.saveImage(id, imagenPath)
    await loadAll()
    // Refrescar el detalle si está abierto
    if (detalle?.id === id) {
      setDetalle(prev => prev ? { ...prev, ...datos } : prev)
    }
  }

  async function eliminarEspecie(especie: Especie) {
    if (!confirm(`¿Eliminar "${especie.nombre}"? Esta acción no se puede deshacer.`)) return
    await window.electronAPI.especies.delete(especie.id!)
    await loadAll()
    if (detalle?.id === especie.id) setDetalle(null)
  }

  const especiesFiltradas = especies.filter(e => {
    const matchBusq = !busqueda ||
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.nombre_cientifico ?? '').toLowerCase().includes(busqueda.toLowerCase())
    const matchLuna = !filtroLuna || e.luna_optima === filtroLuna
    return matchBusq && matchLuna
  })

  return (
    <div className="space-y-5">

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean-500">🔍</span>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar especie..."
            className="w-full bg-ocean-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
        </div>
        <select value={filtroLuna} onChange={e => setFiltroLuna(e.target.value)}
          className="bg-ocean-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50">
          {LUNAS_FILTRO.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button onClick={() => setModalNueva(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-sm transition-colors whitespace-nowrap">
          + Nueva Especie
        </button>
      </div>

      <p className="text-ocean-400 text-xs">
        {especiesFiltradas.length} especie{especiesFiltradas.length !== 1 ? 's' : ''}
        {busqueda || filtroLuna ? ' (filtradas)' : ' en el catálogo'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {especiesFiltradas.map(especie => {
          const lunaIcono = getIconoFase(especie.luna_optima ?? 'cualquiera')
          const habitat   = especie.habitat?.split(',').map(h => h.trim()).filter(Boolean) ?? []

          return (
            <Card key={especie.id} className="overflow-hidden hover:border-amber-500/30 transition-all duration-200 group">

              {/* Imagen */}
              <button className="w-full text-left block" onClick={() => setDetalle(especie)}>
                <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl">
                  <EspecieImg id={especie.id ?? ''} nombre={especie.nombre} size="md" imagen={especie.imagen} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/80 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-sm">
                    {lunaIcono}
                  </div>
                </div>
              </button>

              <div className="p-4">
                <button className="w-full text-left" onClick={() => setDetalle(especie)}>
                  <h3 className="text-white font-bold text-base group-hover:text-amber-400 transition-colors leading-tight">
                    {especie.nombre}
                  </h3>
                  {especie.nombre_cientifico && (
                    <p className="text-ocean-400 text-xs italic mb-2">{especie.nombre_cientifico}</p>
                  )}

                  {/* Habitat badges */}
                  {habitat.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {habitat.slice(0, 2).map(h => (
                        <span key={h} className="px-1.5 py-0.5 rounded-md bg-ocean-700/50 text-ocean-300 text-xs border border-white/10">{h}</span>
                      ))}
                    </div>
                  )}

                  {/* Stats rápidos */}
                  {(especie.peso_promedio || especie.profundidad_detalle) && (
                    <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                      {especie.peso_promedio && (
                        <div className="bg-ocean-800/50 rounded-lg px-2 py-1.5">
                          <p className="text-ocean-500">⚖️ Peso prom.</p>
                          <p className="text-white font-semibold">{especie.peso_promedio}</p>
                        </div>
                      )}
                      {especie.profundidad_detalle && (
                        <div className="bg-ocean-800/50 rounded-lg px-2 py-1.5">
                          <p className="text-ocean-500">🌊 Prof.</p>
                          <p className="text-white font-semibold truncate">{especie.profundidad_detalle.split(' ')[0]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button onClick={() => setEditando(especie)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-ocean-700/50 hover:bg-ocean-600/50 text-ocean-300 hover:text-white text-xs transition-colors">
                    ✏️ Editar
                  </button>
                  <button onClick={() => eliminarEspecie(especie)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition-colors">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {especiesFiltradas.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-ocean-300 font-semibold">Sin resultados</p>
          <p className="text-ocean-500 text-sm mt-1">Prueba con otro término o fase lunar</p>
        </div>
      )}

      {/* Modales */}
      {detalle && (
        <ModalDetalle
          especie={detalle}
          onClose={() => setDetalle(null)}
          onEditar={() => { setEditando(detalle); setDetalle(null) }}
        />
      )}
      {editando && (
        <ModalEditarEspecie
          especie={editando}
          onClose={() => setEditando(null)}
          onGuardar={guardarEdicion}
        />
      )}
      {modalNueva && (
        <ModalNuevaEspecie
          onClose={() => setModalNueva(false)}
          onGuardar={guardarNuevaEspecie}
        />
      )}
    </div>
  )
}