import { create } from 'zustand'
import type { EntradaBitacora, Especie, Region, Spot } from '@/types'

interface AppState {
  bitacora:  EntradaBitacora[]
  especies:  Especie[]
  regiones:  Region[]

  loadAll:   () => Promise<void>

  addEntrada:    (e: EntradaBitacora)                      => Promise<void>
  updateEntrada: (id: number, e: Partial<EntradaBitacora>) => Promise<void>
  deleteEntrada: (id: number)                              => Promise<void>

  addZona:            (data: { nombre: string; descripcion?: string; estado?: string }) => Promise<void>
  updateZona:         (id: string, estado: string)         => Promise<void>
  addSpot:            (spot: Omit<Spot, 'activo'>)         => Promise<void>
  updateZonaCompleta: (id: string, data: { nombre?: string; descripcion?: string; estado?: string; lat?: number; lon?: number }) => Promise<void>
  deleteZona:         (id: string)                         => Promise<void>

  addEspecie: (e: Especie) => Promise<void>

  zonaSeleccionadaId:  string
  setZonaSeleccionada: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  bitacora: [],
  especies: [],
  regiones: [],

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

  addEntrada: async (entrada) => {
    try {
      const id = await window.electronAPI.bitacora.create(entrada)
      set(s => ({ bitacora: [...s.bitacora, { ...entrada, id }] }))
    } catch (err) {
      console.error('Error guardando entrada:', err)
      throw err
    }
  },

  updateEntrada: async (id, datos) => {
    try {
      await window.electronAPI.bitacora.update(id, datos)
      // Recargar desde BD para tener capturas actualizadas correctamente
      const bitacora = await window.electronAPI.bitacora.getAll()
      set({ bitacora })
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

  addZona: async (data) => {
    try {
      await window.electronAPI.regiones.create(data)
      set({ regiones: await window.electronAPI.regiones.getAll() })
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

  updateZonaCompleta: async (id, data) => {
    try {
      await window.electronAPI.regiones.update(id, data)
      set({ regiones: await window.electronAPI.regiones.getAll() })
    } catch (err) {
      console.error('Error actualizando zona:', err)
      throw err
    }
  },

  deleteZona: async (id) => {
    try {
      await window.electronAPI.regiones.delete(id)
      set(s => ({ regiones: s.regiones.filter(r => r.id !== id) }))
    } catch (err) {
      console.error('Error eliminando zona:', err)
      throw err
    }
  },

  addSpot: async (spot) => {
    try {
      await window.electronAPI.regiones.createSpot(spot)
      set({ regiones: await window.electronAPI.regiones.getAll() })
    } catch (err) {
      console.error('Error creando spot:', err)
      throw err
    }
  },

  zonaSeleccionadaId: localStorage.getItem('hoy_zona_seleccionada') ?? '',
  setZonaSeleccionada: (id) => {
    localStorage.setItem('hoy_zona_seleccionada', id)
    set({ zonaSeleccionadaId: id })
  },

  addEspecie: async (especie) => {
    try {
      await window.electronAPI.especies.create(especie)
      set({ especies: await window.electronAPI.especies.getAll() })
    } catch (err) {
      console.error('Error creando especie:', err)
      throw err
    }
  },
}))