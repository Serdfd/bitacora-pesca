import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { getInfoLunar } from '@/utils/moon'
import type { EntradaBitacora, Captura } from '@/types'

// ── Tipos locales del formulario ──────────────────────────────────────────────

interface CapturaForm {
  especie_id: string
  especie_nombre: string
  cantidad: number
  peso_kg: number | ''
  talla_cm: number | ''
  senuelo: string
  color_senuelo: string
  tecnica: string
  liberado: boolean
}

interface FormData {
  fecha: string
  hora_salida: string
  hora_regreso: string
  num_pescadores: number
  region_id: string
  spot_id: string
  clima: string
  viento_dir: string
  viento_fuerza: string
  estado_mar: string
  claridad_agua: string
  temp_agua: number | ''
  marea_salida: string
  fase_lunar: string
  notas: string
  capturas: CapturaForm[]
}

const EMPTY_CAPTURA: CapturaForm = {
  especie_id: '', especie_nombre: '', cantidad: 1,
  peso_kg: '', talla_cm: '', senuelo: '',
  color_senuelo: '', tecnica: 'Spinning', liberado: false,
}

const CLIMAS       = ['Soleado', 'Parcialmente nublado', 'Nublado', 'Lluvioso', 'Ventoso', 'Tormenta']
const VIENTO_DIR   = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
const VIENTO_FUERZA= ['Calma (0-5 km/h)', 'Suave (5-15 km/h)', 'Moderado (15-25 km/h)', 'Fuerte (25-40 km/h)', 'Muy fuerte (+40 km/h)']
const ESTADO_MAR   = ['Calmo (vidrio)', 'Calmo', 'Poco agitado', 'Agitado', 'Muy agitado']
const CLARIDAD     = ['Clara', 'Media', 'Turbia', 'Muy turbia']
const MAREAS       = ['Pleamar', 'Bajamar', 'Subiendo', 'Bajando', 'No observado']
const TECNICAS     = ['Spinning', 'Trolling', 'Jigging', 'Fondo', 'Mosca', 'Curricán', 'Cuchareo', 'Otro']
const FASES_LUNAR  = ['nueva', 'creciente', 'cuarto_creciente', 'gibosa_creciente', 'llena', 'gibosa_menguante', 'cuarto_menguante', 'menguante']
const COLORES      = ['Amarillo/Dorado', 'Azul/Blanco', 'Rojo/Blanco', 'Verde/Amarillo', 'Naranja', 'Rosa/Blanco', 'Negro', 'Plateado', 'Natural/Transparente', 'Multicolor', 'Otro']

// ── Helpers ───────────────────────────────────────────────────────────────────

function hoy() {
  return new Date().toISOString().split('T')[0]
}

function getFaseLunarNombre(fase: string): string {
  const mapa: Record<string, string> = {
    nueva: '🌑 Luna Nueva', creciente: '🌒 Creciente',
    cuarto_creciente: '🌓 Cuarto Creciente', gibosa_creciente: '🌔 Gibosa Creciente',
    llena: '🌕 Luna Llena', gibosa_menguante: '🌖 Gibosa Menguante',
    cuarto_menguante: '🌗 Cuarto Menguante', menguante: '🌘 Menguante',
  }
  return mapa[fase] ?? fase
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icono, titulo, subtitulo }: { icono: string; titulo: string; subtitulo?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{icono}</span>
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{titulo}</h3>
        {subtitulo && <p className="text-ocean-400 text-xs">{subtitulo}</p>}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options, className = '' }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[] | { value: string; label: string }[]; className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-ocean-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
      >
        <option value="">— Seleccionar —</option>
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, placeholder = '', className = '' }: {
  label: string; type?: string; value: string | number; placeholder?: string; className?: string
  onChange: (v: string) => void
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-ocean-400 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Bitacora() {
  const { regiones, especies, bitacora, loadAll, addEntrada, deleteEntrada } = useAppStore()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [expandida, setExpandida]     = useState<number | null>(null)

  // Fase lunar auto-calculada
  const faseAuto = getInfoLunar(new Date()).fase

  const [form, setForm] = useState<FormData>({
    fecha: hoy(), hora_salida: '05:30', hora_regreso: '',
    num_pescadores: 1,
    region_id: '', spot_id: '',
    clima: 'Soleado', viento_dir: 'NE', viento_fuerza: 'Moderado (15-25 km/h)',
    estado_mar: 'Poco agitado', claridad_agua: 'Clara',
    temp_agua: '', marea_salida: 'Subiendo',
    fase_lunar: faseAuto,
    notas: '',
    capturas: [],
  })

  useEffect(() => { if (regiones.length === 0) loadAll() }, [])

  // Spots del región seleccionada
  const spots = regiones.find(r => r.id === form.region_id)?.spots ?? []

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  // ── Capturas ──────────────────────────────────────────────────────────────

  function addCaptura() {
    setF('capturas', [...form.capturas, { ...EMPTY_CAPTURA }])
  }

  function removeCaptura(i: number) {
    setF('capturas', form.capturas.filter((_, idx) => idx !== i))
  }

  function updateCaptura(i: number, key: keyof CapturaForm, val: any) {
    const nuevas = [...form.capturas]
    if (key === 'especie_id') {
      const esp = especies.find(e => e.id === val)
      nuevas[i] = { ...nuevas[i], especie_id: val, especie_nombre: esp?.nombre ?? '' }
    } else {
      nuevas[i] = { ...nuevas[i], [key]: val }
    }
    setF('capturas', nuevas)
  }

  // ── Guardar ───────────────────────────────────────────────────────────────

  async function guardar() {
    if (!form.region_id || !form.spot_id || !form.fecha) {
      alert('Completa fecha, región y spot para continuar.')
      return
    }
    setGuardando(true)
    const region = regiones.find(r => r.id === form.region_id)
    const spot   = region?.spots.find(s => s.id === form.spot_id)

    const entrada: EntradaBitacora = {
      fecha:         form.fecha,
      region_id:     form.region_id,
      spot_id:       form.spot_id,
      region_nombre: region?.nombre,
      spot_nombre:   spot?.nombre,
      clima:         [form.clima, form.viento_dir, form.viento_fuerza].filter(Boolean).join(' · '),
      viento:        `${form.viento_dir} ${form.viento_fuerza}`,
      marea:         form.marea_salida,
      fase_lunar:    form.fase_lunar,
      notas: [
        form.notas,
        `Estado del mar: ${form.estado_mar}`,
        `Claridad: ${form.claridad_agua}`,
        form.temp_agua ? `Temp. agua: ${form.temp_agua}°C` : '',
        form.hora_salida ? `Salida: ${form.hora_salida}` : '',
        form.hora_regreso ? `Regreso: ${form.hora_regreso}` : '',
        form.num_pescadores > 1 ? `Pescadores: ${form.num_pescadores}` : '',
      ].filter(Boolean).join('\n'),
      capturas: form.capturas.map(c => ({
        especie_id:    c.especie_id,
        especie_nombre:c.especie_nombre,
        cantidad:      c.cantidad,
        peso_kg:       c.peso_kg !== '' ? Number(c.peso_kg) : undefined,
        talla_cm:      c.talla_cm !== '' ? Number(c.talla_cm) : undefined,
        senuelo:       [c.senuelo, c.color_senuelo].filter(Boolean).join(' — '),
        tecnica:       c.tecnica,
        liberado:      c.liberado,
      } as Captura)),
    }

    await addEntrada(entrada)
    setGuardando(false)
    setMostrarForm(false)
    setForm({
      fecha: hoy(), hora_salida: '05:30', hora_regreso: '',
      num_pescadores: 1, region_id: '', spot_id: '',
      clima: 'Soleado', viento_dir: 'NE', viento_fuerza: 'Moderado (15-25 km/h)',
      estado_mar: 'Poco agitado', claridad_agua: 'Clara',
      temp_agua: '', marea_salida: 'Subiendo', fase_lunar: faseAuto,
      notas: '', capturas: [],
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-ocean-400 text-sm">{bitacora.length} salida{bitacora.length !== 1 ? 's' : ''} registrada{bitacora.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-sm transition-colors"
        >
          <span>{mostrarForm ? '✕ Cancelar' : '+ Nueva Salida'}</span>
        </button>
      </div>

      {/* ── FORMULARIO ── */}
      {mostrarForm && (
        <div className="space-y-5">

          {/* Bloque 1: Salida */}
          <Card>
            <SectionTitle icono="🚢" titulo="Información de la Salida" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Fecha" type="date" value={form.fecha} onChange={v => setF('fecha', v)} />
              <Input label="Hora de salida" type="time" value={form.hora_salida} onChange={v => setF('hora_salida', v)} />
              <Input label="Hora de regreso" type="time" value={form.hora_regreso} onChange={v => setF('hora_regreso', v)} />
              <Input label="Nº pescadores" type="number" value={form.num_pescadores} onChange={v => setF('num_pescadores', Number(v))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Región"
                value={form.region_id}
                onChange={v => { setF('region_id', v); setF('spot_id', '') }}
                options={regiones.map(r => ({ value: r.id, label: r.nombre }))}
              />
              <Select
                label="Spot"
                value={form.spot_id}
                onChange={v => setF('spot_id', v)}
                options={spots.map(s => ({ value: s.id, label: s.nombre }))}
              />
            </div>
          </Card>

          {/* Bloque 2: Condiciones */}
          <Card>
            <SectionTitle icono="🌤️" titulo="Condiciones del Día" subtitulo="Registra las condiciones ambientales al momento de la salida" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Select label="Clima" value={form.clima} onChange={v => setF('clima', v)} options={CLIMAS} />
              <Select label="Dirección del viento" value={form.viento_dir} onChange={v => setF('viento_dir', v)} options={VIENTO_DIR} />
              <Select label="Fuerza del viento" value={form.viento_fuerza} onChange={v => setF('viento_fuerza', v)} options={VIENTO_FUERZA} />
              <Select label="Estado del mar" value={form.estado_mar} onChange={v => setF('estado_mar', v)} options={ESTADO_MAR} />
              <Select label="Claridad del agua" value={form.claridad_agua} onChange={v => setF('claridad_agua', v)} options={CLARIDAD} />
              <Input label="Temperatura del agua (°C)" type="number" value={form.temp_agua} onChange={v => setF('temp_agua', v === '' ? '' : Number(v))} placeholder="28" />
              <Select label="Marea al salir" value={form.marea_salida} onChange={v => setF('marea_salida', v)} options={MAREAS} />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-ocean-400 font-medium">Fase Lunar</label>
                <select
                  value={form.fase_lunar}
                  onChange={e => setF('fase_lunar', e.target.value)}
                  className="bg-ocean-800/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                >
                  {FASES_LUNAR.map(f => (
                    <option key={f} value={f}>{getFaseLunarNombre(f)}</option>
                  ))}
                </select>
                <p className="text-ocean-500 text-xs">Auto: {getFaseLunarNombre(faseAuto)}</p>
              </div>
            </div>
          </Card>

          {/* Bloque 3: Capturas */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle icono="🎣" titulo="Capturas" subtitulo={`${form.capturas.length} especie(s) registrada(s)`} />
              <button
                onClick={addCaptura}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-ocean-700/60 hover:bg-ocean-600/60 border border-white/10 text-white text-sm transition-colors"
              >
                <span>+</span> Agregar especie
              </button>
            </div>

            {form.capturas.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                <p className="text-4xl mb-2">🐟</p>
                <p className="text-ocean-400 text-sm">Sin capturas aún</p>
                <p className="text-ocean-600 text-xs mt-1">Haz clic en "Agregar especie" para registrar capturas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.capturas.map((cap, i) => (
                  <div key={i} className="bg-ocean-800/40 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold text-sm">
                        {cap.especie_nombre || `Captura #${i + 1}`}
                      </span>
                      <button
                        onClick={() => removeCaptura(i)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        ✕ Quitar
                      </button>
                    </div>

                    {/* Fila 1: especie, cantidad, peso, talla */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex flex-col gap-1 md:col-span-1">
                        <label className="text-xs text-ocean-400 font-medium">Especie</label>
                        <select
                          value={cap.especie_id}
                          onChange={e => updateCaptura(i, 'especie_id', e.target.value)}
                          className="bg-ocean-700/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="">— Especie —</option>
                          {especies.map(e => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <Input label="Cantidad" type="number" value={cap.cantidad}
                        onChange={v => updateCaptura(i, 'cantidad', Number(v))} />
                      <Input label="Peso prom. (kg)" type="number" value={cap.peso_kg}
                        onChange={v => updateCaptura(i, 'peso_kg', v === '' ? '' : Number(v))}
                        placeholder="2.5" />
                      <Input label="Talla prom. (cm)" type="number" value={cap.talla_cm}
                        onChange={v => updateCaptura(i, 'talla_cm', v === '' ? '' : Number(v))}
                        placeholder="45" />
                    </div>

                    {/* Fila 2: señuelo, color, técnica, liberado */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Input label="Señuelo / Carnada" value={cap.senuelo}
                        onChange={v => updateCaptura(i, 'senuelo', v)}
                        placeholder="Pluma, cuchara, vivo..." />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-ocean-400 font-medium">Color del señuelo</label>
                        <select
                          value={cap.color_senuelo}
                          onChange={e => updateCaptura(i, 'color_senuelo', e.target.value)}
                          className="bg-ocean-700/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="">— Color —</option>
                          {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-ocean-400 font-medium">Técnica</label>
                        <select
                          value={cap.tecnica}
                          onChange={e => updateCaptura(i, 'tecnica', e.target.value)}
                          className="bg-ocean-700/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        >
                          {TECNICAS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 justify-end">
                        <label className="text-xs text-ocean-400 font-medium">¿Liberado?</label>
                        <label className="flex items-center gap-2 cursor-pointer bg-ocean-700/60 border border-white/10 rounded-xl px-3 py-2">
                          <input
                            type="checkbox"
                            checked={cap.liberado}
                            onChange={e => updateCaptura(i, 'liberado', e.target.checked)}
                            className="w-4 h-4 accent-amber-500"
                          />
                          <span className="text-sm text-white">Sí, liberado</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bloque 4: Notas */}
          <Card>
            <SectionTitle icono="📝" titulo="Notas Generales" subtitulo="Observaciones adicionales, comportamiento del cardumen, puntos de interés..." />
            <textarea
              value={form.notas}
              onChange={e => setF('notas', e.target.value)}
              rows={4}
              placeholder="Ej: El cardumen estaba cerca de la boya norte, mucha actividad de aves..."
              className="w-full bg-ocean-800/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-ocean-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
            />
          </Card>

          {/* Botón guardar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMostrarForm(false)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-ocean-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ocean-950 font-bold text-sm transition-colors flex items-center gap-2"
            >
              {guardando ? '⏳ Guardando...' : '💾 Guardar Salida'}
            </button>
          </div>
        </div>
      )}

      {/* ── LISTA DE ENTRADAS ── */}
      {bitacora.length === 0 && !mostrarForm ? (
        <Card className="text-center py-16">
          <p className="text-5xl mb-4">📖</p>
          <p className="text-white font-bold text-lg mb-1">Tu bitácora está vacía</p>
          <p className="text-ocean-400 text-sm">Registra tu primera salida de pesca para comenzar.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...bitacora].reverse().map((entrada) => {
            const totalCapturas = entrada.capturas?.reduce((s, c) => s + c.cantidad, 0) ?? 0
            const especiesUnicas = [...new Set(entrada.capturas?.map(c => c.especie_nombre ?? c.especie_id) ?? [])]
            const isOpen = expandida === entrada.id

            return (
              <Card key={entrada.id} className="p-0 overflow-hidden">
                {/* Header de la entrada */}
                <button
                  onClick={() => setExpandida(isOpen ? null : (entrada.id ?? null))}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
                >
                  {/* Fecha */}
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-2.5 text-center min-w-[52px]">
                    <p className="text-amber-400 font-bold text-lg leading-none">
                      {new Date(entrada.fecha + 'T12:00:00').getDate()}
                    </p>
                    <p className="text-amber-400/70 text-xs uppercase">
                      {new Date(entrada.fecha + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short' })}
                    </p>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-semibold text-sm">{entrada.spot_nombre ?? entrada.spot_id}</p>
                      <span className="text-ocean-500 text-xs">·</span>
                      <p className="text-ocean-300 text-xs">{entrada.region_nombre ?? entrada.region_id}</p>
                    </div>
                    {/* Chips de condiciones */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {entrada.clima && (
                        <span className="px-2 py-0.5 rounded-full bg-ocean-700/50 text-ocean-300 text-xs border border-white/10">
                          🌤️ {entrada.clima.split(' · ')[0]}
                        </span>
                      )}
                      {entrada.marea && (
                        <span className="px-2 py-0.5 rounded-full bg-ocean-700/50 text-ocean-300 text-xs border border-white/10">
                          🌊 {entrada.marea}
                        </span>
                      )}
                      {entrada.fase_lunar && (
                        <span className="px-2 py-0.5 rounded-full bg-ocean-700/50 text-ocean-300 text-xs border border-white/10">
                          {getFaseLunarNombre(entrada.fase_lunar).split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capturas */}
                  <div className="text-right flex-shrink-0">
                    {totalCapturas > 0 ? (
                      <>
                        <p className="text-white font-bold text-xl">{totalCapturas}</p>
                        <p className="text-ocean-400 text-xs">captura{totalCapturas !== 1 ? 's' : ''}</p>
                      </>
                    ) : (
                      <p className="text-ocean-500 text-xs">Sin capturas</p>
                    )}
                  </div>

                  <span className="text-ocean-400 text-sm ml-2">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Detalle expandido */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">

                    {/* Capturas detalle */}
                    {(entrada.capturas?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-ocean-400 text-xs font-semibold uppercase mb-2">Capturas</p>
                        <div className="space-y-2">
                          {entrada.capturas!.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 bg-ocean-800/40 rounded-xl px-3 py-2.5">
                              <span className="text-lg">🐟</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold">{c.especie_nombre ?? c.especie_id}</p>
                                <div className="flex items-center gap-3 flex-wrap text-xs text-ocean-400 mt-0.5">
                                  {c.cantidad > 0 && <span>×{c.cantidad}</span>}
                                  {c.peso_kg && <span>{c.peso_kg} kg prom.</span>}
                                  {c.talla_cm && <span>{c.talla_cm} cm</span>}
                                  {c.tecnica && <span>🎣 {c.tecnica}</span>}
                                  {c.senuelo && <span>🪝 {c.senuelo}</span>}
                                  {c.liberado && <span className="text-green-400">♻️ Liberado</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {especiesUnicas.length > 0 && (
                          <p className="text-ocean-500 text-xs mt-2">
                            Especies: {especiesUnicas.join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notas */}
                    {entrada.notas && (
                      <div>
                        <p className="text-ocean-400 text-xs font-semibold uppercase mb-1">Notas</p>
                        <p className="text-ocean-200 text-sm whitespace-pre-line leading-relaxed bg-ocean-800/30 rounded-xl px-3 py-2">
                          {entrada.notas}
                        </p>
                      </div>
                    )}

                    {/* Eliminar */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta entrada?')) {
                            deleteEntrada(entrada.id!)
                            setExpandida(null)
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-red-500/20 transition-colors"
                      >
                        🗑️ Eliminar entrada
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}