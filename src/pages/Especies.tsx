import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { getIconoFase } from '@/utils/moon'
import type { Especie } from '@/types'

// ── Datos enriquecidos por especie ────────────────────────────────────────────

interface DatosRicos {
  emoji: string
  peso_promedio: string
  peso_maximo: string
  talla_promedio: string
  talla_maxima: string
  record_colombia: string
  profundidad: string
  habitat: string[]
  temporada_alta: string
  comportamiento: string
  colores_senuelos: string[]
  tecnicas: string[]
  curiosidad: string
}

const DATOS_RICOS: Record<string, DatosRicos> = {
  carite: {
    emoji: '🐟',
    peso_promedio: '3–8 kg', peso_maximo: '45 kg',
    talla_promedio: '60–90 cm', talla_maxima: '185 cm',
    record_colombia: '~20 kg',
    profundidad: '0–100 m (superficie preferida)',
    habitat: ['Pelágico', 'Arrecife'],
    temporada_alta: 'Dic – Mar (época seca, alisios)',
    comportamiento: 'Depredador veloz en cardumen. Ataca carnadas en superficie con saltos. Muy activo al amanecer y atardecer. Sigue corrientes cálidas.',
    colores_senuelos: ['Azul/Blanco', 'Verde/Amarillo', 'Plateado', 'Natural/Transparente'],
    tecnicas: ['Trolling', 'Spinning', 'Curricán'],
    curiosidad: 'Puede alcanzar velocidades de hasta 65 km/h. Excelente para ceviche.',
  },
  sierra: {
    emoji: '🐡',
    peso_promedio: '2–5 kg', peso_maximo: '38 kg',
    talla_promedio: '50–80 cm', talla_maxima: '200 cm',
    record_colombia: '~15 kg',
    profundidad: '0–200 m',
    habitat: ['Pelágico', 'Costero'],
    temporada_alta: 'Nov – Feb',
    comportamiento: 'Solitaria o en parejas. Más lenta que el carite pero con dientes peligrosos. Ataca con movimiento lateral cortando la carnada.',
    colores_senuelos: ['Rojo/Blanco', 'Naranja', 'Plateado', 'Azul/Blanco'],
    tecnicas: ['Trolling', 'Spinning'],
    curiosidad: 'Sus dientes son tan afilados que puede cortar el hilo de pesca. Recomendable usar acero.',
  },
  dorado: {
    emoji: '🐠',
    peso_promedio: '4–10 kg', peso_maximo: '40 kg',
    talla_promedio: '70–100 cm', talla_maxima: '210 cm',
    record_colombia: '~25 kg',
    profundidad: '0–85 m (superficie)',
    habitat: ['Pelágico oceánico'],
    temporada_alta: 'Abr – Jul',
    comportamiento: 'Uno de los peces más rápidos del mar. Vive cerca de objetos flotantes (palos, sargazo). Cambia de color dramáticamente al morir. Excelente saltador.',
    colores_senuelos: ['Amarillo/Dorado', 'Azul/Blanco', 'Verde/Amarillo', 'Multicolor'],
    tecnicas: ['Trolling', 'Spinning', 'Jigging'],
    curiosidad: 'El macho tiene la cabeza muy cuadrada (toro). La hembra la tiene redondeada (vaca). Crecen increíblemente rápido — 1 kg por mes.',
  },
  wahoo: {
    emoji: '🐟',
    peso_promedio: '8–15 kg', peso_maximo: '83 kg',
    talla_promedio: '100–150 cm', talla_maxima: '250 cm',
    record_colombia: '~35 kg',
    profundidad: '0–150 m',
    habitat: ['Pelágico oceánico'],
    temporada_alta: 'Ene – Mar',
    comportamiento: 'Uno de los peces más rápidos del océano (~80 km/h). Solitario o en parejas. Ataca con explosividad brutal. Prefiere aguas cálidas y profundas.',
    colores_senuelos: ['Azul/Blanco', 'Rosa/Blanco', 'Plateado', 'Multicolor'],
    tecnicas: ['Trolling de alta velocidad', 'Spinning'],
    curiosidad: 'Su nombre viene del hawaiano "wahoo". A alta velocidad puede cortar el hilo como una navaja.',
  },
  pargo_rojo: {
    emoji: '🐟',
    peso_promedio: '2–5 kg', peso_maximo: '22 kg',
    talla_promedio: '40–70 cm', talla_maxima: '100 cm',
    record_colombia: '~10 kg',
    profundidad: '10–200 m (fondo preferido)',
    habitat: ['Arrecife', 'Fondo rocoso'],
    temporada_alta: 'Todo el año (mejor en luna nueva)',
    comportamiento: 'Especie de fondo, muy territorial. Vive en arrecifes y estructuras rocosas. Nocturno en alimentación. Muy apetecido por su sabor.',
    colores_senuelos: ['Rojo/Blanco', 'Naranja', 'Amarillo/Dorado', 'Natural/Transparente'],
    tecnicas: ['Fondo', 'Jigging', 'Cuchareo'],
    curiosidad: 'Es la especie más representativa de la pesca artesanal del Caribe colombiano. Altamente cotizado en restaurantes.',
  },
  pargo_lunarejo: {
    emoji: '🐟',
    peso_promedio: '1–3 kg', peso_maximo: '12 kg',
    talla_promedio: '30–55 cm', talla_maxima: '80 cm',
    record_colombia: '~6 kg',
    profundidad: '5–80 m',
    habitat: ['Arrecife', 'Manglar'],
    temporada_alta: 'May – Sep',
    comportamiento: 'Especie gregaria, vive en cardúmenes en arrecifes de coral. Tiene una mancha negra característica en el lomo. Muy activo de noche.',
    colores_senuelos: ['Rojo/Blanco', 'Amarillo/Dorado', 'Rosa/Blanco'],
    tecnicas: ['Fondo', 'Cuchareo', 'Jigging ligero'],
    curiosidad: 'Se reconoce fácilmente por la mancha oscura detrás de la aleta dorsal. Excelente para comer asado.',
  },
  pargo_cubera: {
    emoji: '🐟',
    peso_promedio: '5–15 kg', peso_maximo: '57 kg',
    talla_promedio: '60–100 cm', talla_maxima: '160 cm',
    record_colombia: '~25 kg',
    profundidad: '5–55 m',
    habitat: ['Arrecife', 'Fondo rocoso profundo'],
    temporada_alta: 'Jun – Sep',
    comportamiento: 'El pargo más grande del Atlántico. Solitario y muy territorial. Protege su zona agresivamente. Extremadamente fuerte al picar.',
    colores_senuelos: ['Rojo/Blanco', 'Naranja', 'Natural/Transparente'],
    tecnicas: ['Fondo profundo', 'Jigging pesado'],
    curiosidad: 'Puede vivir más de 55 años. Es tan fuerte que puede romper anzuelos de acero inoxidable.',
  },
  mero: {
    emoji: '🐡',
    peso_promedio: '3–10 kg', peso_maximo: '100 kg',
    talla_promedio: '50–90 cm', talla_maxima: '270 cm',
    record_colombia: '~40 kg',
    profundidad: '5–100 m',
    habitat: ['Arrecife', 'Fondo rocoso', 'Cuevas'],
    temporada_alta: 'Todo el año',
    comportamiento: 'Hermafrodita protogínica — nace hembra y puede cambiar a macho. Depredador de emboscada. Muy sedentario. Atrae a sus presas hacia cuevas.',
    colores_senuelos: ['Naranja', 'Rojo/Blanco', 'Natural/Transparente'],
    tecnicas: ['Fondo', 'Jigging', 'Carnada viva'],
    curiosidad: 'Todos los meros nacen hembras. Los más grandes son machos. Puede pesar más de 200 kg en especies gigantes.',
  },
  mero_negro: {
    emoji: '🐡',
    peso_promedio: '5–20 kg', peso_maximo: '180 kg',
    talla_promedio: '70–120 cm', talla_maxima: '240 cm',
    record_colombia: '~60 kg',
    profundidad: '20–150 m',
    habitat: ['Arrecife profundo', 'Fondo rocoso'],
    temporada_alta: 'Oct – Feb',
    comportamiento: 'Mero de aguas profundas. Oscuro y robusto. Espera en cuevas para emboscar presas. Muy fuerte en el combate.',
    colores_senuelos: ['Negro', 'Rojo/Blanco', 'Natural/Transparente'],
    tecnicas: ['Fondo profundo', 'Jigging pesado'],
    curiosidad: 'Su color oscuro lo camufla perfectamente en arrecifes profundos. Muy apreciado por pescadores deportivos.',
  },
  robalo: {
    emoji: '🐟',
    peso_promedio: '1–4 kg', peso_maximo: '20 kg',
    talla_promedio: '40–70 cm', talla_maxima: '140 cm',
    record_colombia: '~8 kg',
    profundidad: '0–20 m (estuarios y costa)',
    habitat: ['Manglar', 'Estuario', 'Costa rocosa'],
    temporada_alta: 'May – Ago',
    comportamiento: 'Depredador costero y de manglar. Muy popular en pesca deportiva por sus saltos espectaculares. Activo en corrientes y entradas de agua dulce.',
    colores_senuelos: ['Plateado', 'Natural/Transparente', 'Azul/Blanco', 'Verde/Amarillo'],
    tecnicas: ['Spinning', 'Mosca', 'Señuelos de superficie'],
    curiosidad: 'Considerado el "rey del manglar". Sus saltos al picar son espectaculares. Muy combativo para su tamaño.',
  },
  jurel: {
    emoji: '🐟',
    peso_promedio: '2–6 kg', peso_maximo: '35 kg',
    talla_promedio: '40–70 cm', talla_maxima: '170 cm',
    record_colombia: '~15 kg',
    profundidad: '0–80 m',
    habitat: ['Pelágico', 'Arrecife'],
    temporada_alta: 'Dic – Mar',
    comportamiento: 'Especie en cardumen. Muy agresivo y veloz. Excelente para pesca deportiva. Suele rodear cardúmenes de peces pequeños desde abajo.',
    colores_senuelos: ['Plateado', 'Azul/Blanco', 'Verde/Amarillo', 'Amarillo/Dorado'],
    tecnicas: ['Jigging', 'Spinning', 'Trolling'],
    curiosidad: 'Tiene una línea lateral rígida que lo hace muy resistente. Excelente para pesca de jigging vertical.',
  },
  barracuda: {
    emoji: '🦈',
    peso_promedio: '3–8 kg', peso_maximo: '45 kg',
    talla_promedio: '60–100 cm', talla_maxima: '200 cm',
    record_colombia: '~20 kg',
    profundidad: '0–100 m',
    habitat: ['Arrecife', 'Pelágico costero'],
    temporada_alta: 'Todo el año',
    comportamiento: 'Predadora solitaria y curiosa. Se acerca a buzos y nadadores por curiosidad. Ataque relámpago con dientes enormes. Muy agresiva con señuelos brillantes.',
    colores_senuelos: ['Plateado', 'Azul/Blanco', 'Multicolor'],
    tecnicas: ['Trolling', 'Spinning', 'Señuelos metálicos'],
    curiosidad: 'Sus dientes son tan afilados como cuchillas quirúrgicas. Puede causar ciguatera si se come — verificar la zona antes de consumirla.',
  },
  corvina: {
    emoji: '🐟',
    peso_promedio: '1–3 kg', peso_maximo: '15 kg',
    talla_promedio: '35–60 cm', talla_maxima: '100 cm',
    record_colombia: '~7 kg',
    profundidad: '5–50 m (fondos arenosos)',
    habitat: ['Fondo arenoso', 'Estuario', 'Costa'],
    temporada_alta: 'Mar – Jun',
    comportamiento: 'Especie de fondo en zonas arenosas. Nocturna. Se alimenta de crustáceos y peces pequeños. Produce sonidos con la vejiga natatoria.',
    colores_senuelos: ['Natural/Transparente', 'Amarillo/Dorado', 'Rojo/Blanco'],
    tecnicas: ['Fondo', 'Cuchareo', 'Carnada natural'],
    curiosidad: 'Produce sonidos tipo "croack" con la vejiga natatoria. Por eso su nombre en inglés es "drum".',
  },
  sabalo: {
    emoji: '🐟',
    peso_promedio: '10–30 kg', peso_maximo: '161 kg',
    talla_promedio: '100–180 cm', talla_maxima: '250 cm',
    record_colombia: '~80 kg',
    profundidad: '0–30 m (superficie)',
    habitat: ['Estuario', 'Costa', 'Agua salobre'],
    temporada_alta: 'Abr – Jul',
    comportamiento: 'El pez más acrobático del Caribe. Salta repetidamente al picar, puede alcanzar 3 metros de altura. Prácticamente siempre se libera (poca calidad para comer).',
    colores_senuelos: ['Plateado', 'Natural/Transparente', 'Azul/Blanco'],
    tecnicas: ['Spinning', 'Mosca', 'Curricán'],
    curiosidad: 'El rey de la pesca deportiva. Sus escamas plateadas gigantes son icónicas. Puede respirar aire atmosférico directamente.',
  },
}

const EMPTY_FORM: Partial<Especie> = {
  nombre: '', nombre_cientifico: '', descripcion: '',
  luna_optima: 'cualquiera', cebos: '', tecnicas: '',
  profundidad_min: 0, profundidad_max: 100, activo: true,
}

const LUNAS = [
  { value: 'nueva',      label: '🌑 Luna Nueva' },
  { value: 'creciente',  label: '🌒 Creciente' },
  { value: 'llena',      label: '🌕 Luna Llena' },
  { value: 'menguante',  label: '🌘 Menguante' },
  { value: 'cualquiera', label: '🌙 Cualquiera' },
]

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

// ── Imagen de especie ─────────────────────────────────────────────────────────

function EspecieImg({
  id, nombre, size = 'md', imagen, contain = false,
}: {
  id: string; nombre: string; size?: 'sm' | 'md' | 'lg'; imagen?: string; contain?: boolean
}) {
  const [srcFailed, setSrcFailed] = useState(false)
  const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-full h-80' }
  const emoji = DATOS_RICOS[id]?.emoji ?? '🐟'
  const fit = contain ? 'object-contain bg-ocean-950' : 'object-cover'

  useEffect(() => { setSrcFailed(false) }, [id, imagen])

  if (imagen) {
    return <img src={imagen} alt={nombre} className={`${sizes[size]} ${fit} rounded-xl`} />
  }
  if (!srcFailed) {
    return (
      <img src={`./assets/especies/${id}.jpg`} alt={nombre}
        onError={() => setSrcFailed(true)}
        className={`${sizes[size]} ${fit} rounded-xl`} />
    )
  }
  return (
    <div className={`${sizes[size]} flex items-center justify-center bg-ocean-800/50 rounded-xl`}>
      <span className={size === 'lg' ? 'text-6xl' : size === 'md' ? 'text-4xl' : 'text-2xl'}>{emoji}</span>
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
    <div className="space-y-4">

      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-ocean-400 font-medium">Imagen</label>
        <div className="flex items-center gap-3">
          {imagenPreview ? (
            <img src={imagenPreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-white/10" />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center bg-ocean-800/50 rounded-xl border border-dashed border-white/20 text-3xl">🐟</div>
          )}
          <button type="button" onClick={onSeleccionarImagen}
            className="px-4 py-2 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
            📁 {imagenPath ? 'Cambiar imagen' : 'Adjuntar imagen'}
          </button>
        </div>
        {imagenPath && <p className="text-ocean-500 text-xs truncate">{imagenPath}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Nombre común *</label>
        <input value={form.nombre ?? ''} onChange={e => setF('nombre', e.target.value)}
          placeholder="Ej: Pargo rayado"
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Nombre científico</label>
        <input value={form.nombre_cientifico ?? ''} onChange={e => setF('nombre_cientifico', e.target.value)}
          placeholder="Ej: Lutjanus synagris"
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Descripción</label>
        <textarea value={form.descripcion ?? ''} onChange={e => setF('descripcion', e.target.value)}
          rows={3} placeholder="Descripción general de la especie..."
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 resize-none" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Fase lunar óptima</label>
        <select value={form.luna_optima ?? 'cualquiera'} onChange={e => setF('luna_optima', e.target.value)}
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
          {LUNAS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ocean-400 font-medium">Prof. mínima (m)</label>
          <input type="number" value={form.profundidad_min ?? 0} onChange={e => setF('profundidad_min', Number(e.target.value))}
            className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ocean-400 font-medium">Prof. máxima (m)</label>
          <input type="number" value={form.profundidad_max ?? 100} onChange={e => setF('profundidad_max', Number(e.target.value))}
            className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Técnicas</label>
        <input value={form.tecnicas ?? ''} onChange={e => setF('tecnicas', e.target.value)}
          placeholder="Ej: Fondo, Jigging, Spinning"
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ocean-400 font-medium">Cebos / Carnadas</label>
        <input value={form.cebos ?? ''} onChange={e => setF('cebos', e.target.value)}
          placeholder="Ej: Camarón, calamar, plumas"
          className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50" />
      </div>
    </div>
  )
}

// ── Modal nueva especie ───────────────────────────────────────────────────────

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
    const filePath = await window.electronAPI.especies.selectImage()
    if (filePath) { setImagenPath(filePath); setImagenPreview(`file://${filePath}`) }
  }

  async function guardar() {
    if (!form.nombre) { alert('El nombre es obligatorio.'); return }
    setGuardando(true)
    await onGuardar(form, imagenPath)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">🐟 Nueva Especie</h2>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="p-5">
          <FormEspecie form={form} setF={setF} imagenPreview={imagenPreview} imagenPath={imagenPath} onSeleccionarImagen={seleccionarImagen} />
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
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

// ── Modal editar especie ──────────────────────────────────────────────────────

function ModalEditarEspecie({ especie, onClose, onGuardar }: {
  especie: Especie
  onClose: () => void
  onGuardar: (id: string, e: Partial<Especie>, imagenPath: string | null) => Promise<void>
}) {
  const [form, setForm] = useState<Partial<Especie>>({
    nombre:            especie.nombre,
    nombre_cientifico: especie.nombre_cientifico ?? '',
    descripcion:       especie.descripcion ?? '',
    luna_optima:       especie.luna_optima ?? 'cualquiera',
    profundidad_min:   especie.profundidad_min ?? 0,
    profundidad_max:   especie.profundidad_max ?? 100,
    tecnicas:          especie.tecnicas ?? '',
    cebos:             especie.cebos ?? '',
  })
  const [guardando, setGuardando]         = useState(false)
  const [imagenPath, setImagenPath]       = useState<string | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(especie.imagen ?? null)

  function setF(k: keyof Especie, v: any) { setForm(p => ({ ...p, [k]: v })) }

  async function seleccionarImagen() {
    const filePath = await window.electronAPI.especies.selectImage()
    if (filePath) { setImagenPath(filePath); setImagenPreview(`file://${filePath}`) }
  }

  async function guardar() {
    if (!form.nombre) { alert('El nombre es obligatorio.'); return }
    setGuardando(true)
    await onGuardar(especie.id!, form, imagenPath)
    setGuardando(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">✏️ Editar Especie</h2>
          <button onClick={onClose} className="text-ocean-400 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="p-5">
          <FormEspecie form={form} setF={setF} imagenPreview={imagenPreview} imagenPath={imagenPath} onSeleccionarImagen={seleccionarImagen} />
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
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

// ── Modal detalle especie ─────────────────────────────────────────────────────

function ModalDetalle({ especie, onClose }: { especie: Especie; onClose: () => void }) {
  const datos = DATOS_RICOS[especie.id ?? '']
  const lunaIcono = getIconoFase(especie.luna_optima ?? 'cualquiera')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-ocean-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <EspecieImg id={especie.id ?? ''} nombre={especie.nombre} size="lg" imagen={especie.imagen} />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-ocean-900/60 to-transparent rounded-t-2xl" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors">
            ✕
          </button>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-bold text-2xl">{especie.nombre}</h2>
            <p className="text-ocean-300 text-sm italic">{especie.nombre_cientifico}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge text={`${lunaIcono} ${especie.luna_optima ?? 'Cualquier fase'}`} color="amber" />
            {datos?.habitat?.map(h => <Badge key={h} text={h} color="blue" />)}
            {datos?.temporada_alta && <Badge text={`📅 ${datos.temporada_alta}`} color="green" />}
          </div>
          {especie.descripcion && <p className="text-ocean-200 text-sm leading-relaxed">{especie.descripcion}</p>}
          {datos?.comportamiento && (
            <div className="bg-ocean-800/40 rounded-xl p-4">
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-1">🧠 Comportamiento</p>
              <p className="text-ocean-200 text-sm leading-relaxed">{datos.comportamiento}</p>
            </div>
          )}
          {datos && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icono: '⚖️', label: 'Peso promedio',    valor: datos.peso_promedio },
                { icono: '🏆', label: 'Peso máximo',      valor: datos.peso_maximo },
                { icono: '📏', label: 'Talla promedio',   valor: datos.talla_promedio },
                { icono: '📐', label: 'Talla máxima',     valor: datos.talla_maxima },
                { icono: '🇨🇴', label: 'Récord Colombia', valor: datos.record_colombia },
                { icono: '🌊', label: 'Profundidad',      valor: datos.profundidad },
              ].map((s, i) => (
                <div key={i} className="bg-ocean-800/40 rounded-xl p-3 text-center">
                  <p className="text-lg mb-0.5">{s.icono}</p>
                  <p className="text-white font-bold text-sm">{s.valor}</p>
                  <p className="text-ocean-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {datos?.colores_senuelos && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🎨 Colores de señuelos efectivos</p>
              <div className="flex flex-wrap gap-2">
                {datos.colores_senuelos.map(c => <Badge key={c} text={c} color="amber" />)}
              </div>
            </div>
          )}
          {datos?.tecnicas && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🎣 Técnicas recomendadas</p>
              <div className="flex flex-wrap gap-2">
                {datos.tecnicas.map(t => <Badge key={t} text={t} color="green" />)}
              </div>
            </div>
          )}
          {especie.cebos && (
            <div>
              <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">🪝 Cebos / Carnadas</p>
              <p className="text-ocean-200 text-sm">{especie.cebos}</p>
            </div>
          )}
          {datos?.curiosidad && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-semibold uppercase mb-1">💡 Sabías que...</p>
              <p className="text-ocean-200 text-sm leading-relaxed">{datos.curiosidad}</p>
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
  }

  async function eliminarEspecie(especie: Especie) {
    if (!confirm(`¿Eliminar "${especie.nombre}"? Esta acción no se puede deshacer.`)) return
    await window.electronAPI.especies.delete(especie.id!)
    await loadAll()
  }

  const LUNAS_FILTRO = [
    { value: '',           label: '🌙 Todas las fases' },
    { value: 'nueva',      label: '🌑 Luna Nueva' },
    { value: 'creciente',  label: '🌒 Creciente' },
    { value: 'llena',      label: '🌕 Luna Llena' },
    { value: 'menguante',  label: '🌘 Menguante' },
    { value: 'cualquiera', label: '🌙 Cualquiera' },
  ]

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
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar especie..."
            className="w-full bg-ocean-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <select
          value={filtroLuna}
          onChange={e => setFiltroLuna(e.target.value)}
          className="bg-ocean-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          {LUNAS_FILTRO.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button
          onClick={() => setModalNueva(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-sm transition-colors"
        >
          + Nueva Especie
        </button>
      </div>

      {/* Contador */}
      <p className="text-ocean-400 text-xs">
        {especiesFiltradas.length} especie{especiesFiltradas.length !== 1 ? 's' : ''}
        {busqueda || filtroLuna ? ' (filtradas)' : ' en el catálogo'}
      </p>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {especiesFiltradas.map(especie => {
          const lunaIcono = getIconoFase(especie.luna_optima ?? 'cualquiera')
          const datos = DATOS_RICOS[especie.id ?? '']

          return (
            <Card
              key={especie.id}
              className="overflow-hidden hover:border-amber-500/30 hover:bg-ocean-800/60 transition-all duration-200 group"
            >
              {/* Imagen clickeable para detalle */}
              <button className="w-full text-left" onClick={() => setDetalle(especie)}>
                <div className="relative">
                  <EspecieImg id={especie.id ?? ''} nombre={especie.nombre} size="lg" imagen={especie.imagen} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-sm">
                    {lunaIcono}
                  </div>
                </div>
              </button>

              <div className="p-4">
                <button className="w-full text-left" onClick={() => setDetalle(especie)}>
                  <h3 className="text-white font-bold text-base group-hover:text-amber-400 transition-colors">
                    {especie.nombre}
                  </h3>
                  {especie.nombre_cientifico && (
                    <p className="text-ocean-400 text-xs italic mb-2">{especie.nombre_cientifico}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {datos?.habitat?.slice(0, 2).map(h => (
                      <span key={h} className="px-1.5 py-0.5 rounded-md bg-ocean-700/50 text-ocean-300 text-xs border border-white/10">
                        {h}
                      </span>
                    ))}
                  </div>
                  {datos && (
                    <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                      <div className="bg-ocean-800/50 rounded-lg px-2 py-1.5">
                        <p className="text-ocean-500">⚖️ Peso prom.</p>
                        <p className="text-white font-semibold">{datos.peso_promedio}</p>
                      </div>
                      <div className="bg-ocean-800/50 rounded-lg px-2 py-1.5">
                        <p className="text-ocean-500">🌊 Prof.</p>
                        <p className="text-white font-semibold truncate">{datos.profundidad.split(' ')[0]}</p>
                      </div>
                    </div>
                  )}
                </button>

                {/* Botones editar / eliminar */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setEditando(especie)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-ocean-700/50 hover:bg-ocean-600/50 text-ocean-300 hover:text-white text-xs transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarEspecie(especie)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
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
      {detalle && <ModalDetalle especie={detalle} onClose={() => setDetalle(null)} />}
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