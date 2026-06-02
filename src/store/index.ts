import { create } from 'zustand'
import type { EntradaBitacora, Especie, Region, Spot } from '@/types'

interface AppState {
  // Data
  bitacora:  EntradaBitacora[]
  especies:  Especie[]
  regiones:  Region[]

  // Actions — carga
  loadAll:   () => Promise<void>

  // Actions — bitácora
  addEntrada:    (e: EntradaBitacora)                      => Promise<void>
  updateEntrada: (id: number, e: Partial<EntradaBitacora>) => Promise<void>
  deleteEntrada: (id: number)                              => Promise<void>

  // Actions — zonas
  addZona:       (data: { nombre: string; descripcion?: string; estado?: string }) => Promise<void>
  updateZona:    (id: string, estado: string)              => Promise<void>
  addSpot:       (spot: Omit<Spot, 'activo'>)              => Promise<void>

  // Actions — especies
  addEspecie:    (e: Especie)                              => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  bitacora: [],
  especies: [],
  regiones: [],

  // ── Carga inicial ───────────────────────────────────────────────────────────

  loadAll: async () => {
    try {
      const [bitacora, especies, regiones] = await Promise.all([
        window.electronAPI.bitacora.getAll(),
        window.electronAPI.especies.getAll(),
        window.electronAPI.regiones.getAll(),
      ])
      set({ bitacora, especies, regiones })
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  },

  // ── Bitácora ────────────────────────────────────────────────────────────────

  addEntrada: async (entrada) => {
    try {
      const id = await window.electronAPI.bitacora.create(entrada)
      const nueva = { ...entrada, id }
      set(s => ({ bitacora: [...s.bitacora, nueva] }))
    } catch (err) {
      console.error('Error guardando entrada:', err)
      throw err
    }
  },

  updateEntrada: async (id, datos) => {
    try {
      await window.electronAPI.bitacora.update(id, datos)
      set(s => ({
        bitacora: s.bitacora.map(e =>
          e.id === id ? { ...e, ...datos } : e
        ),
      }))
    } catch (err) {
      console.error('Error actualizando entrada:', err)
      throw err
    }
  },

  deleteEntrada: async (id) => {
    try {
      await window.electronAPI.bitacora.delete(id)
      set(s => ({ bitacora: s.bitacora.filter(e => e.id !== id) }))
    } catch (err) {
      console.error('Error eliminando entrada:', err)
      throw err
    }
  },

  // ── Zonas ───────────────────────────────────────────────────────────────────

  addZona: async (data) => {
    try {
      await window.electronAPI.regiones.create(data)
      const regiones = await window.electronAPI.regiones.getAll()
      set({ regiones })
    } catch (err) {
      console.error('Error creando zona:', err)
      throw err
    }
  },

  updateZona: async (id, estado) => {
    try {
      await window.electronAPI.regiones.updateEstado(id, estado)
      set(s => ({
        regiones: s.regiones.map(r =>
          r.id === id ? { ...r, estado: estado as Region['estado'] } : r
        ),
      }))
    } catch (err) {
      console.error('Error actualizando zona:', err)
      throw err
    }
  },

  addSpot: async (spot) => {
    try {
      await window.electronAPI.regiones.createSpot(spot)
      const regiones = await window.electronAPI.regiones.getAll()
      set({ regiones })
    } catch (err) {
      console.error('Error creando spot:', err)
      throw err
    }
  },

  // ── Especies ────────────────────────────────────────────────────────────────

  addEspecie: async (especie) => {
    try {
      await window.electronAPI.especies.create(especie)
      const especies = await window.electronAPI.especies.getAll()
      set({ especies })
    } catch (err) {
      console.error('Error creando especie:', err)
      throw err
    }
  },
}))