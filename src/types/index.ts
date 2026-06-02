// ── Entidades principales ─────────────────────────────────────────────────────

export interface Spot {
  id: string
  region_id: string
  nombre: string
  tipo?: string
  recomendaciones?: string
  activo?: boolean
}

export interface Region {
  id: string
  nombre: string
  descripcion?: string
  estado?: 'explorado' | 'recomendado'
  spots: Spot[]
}

export interface Especie {
  id?: string
  nombre: string
  nombre_cientifico?: string
  descripcion?: string
  luna_optima?: string
  profundidad_min?: number
  profundidad_max?: number
  tecnicas?: string
  cebos?: string
  activo?: boolean
}

export interface Captura {
  especie_id: string
  especie_nombre?: string
  cantidad: number
  peso_kg?: number
  talla_cm?: number
  senuelo?: string
  tecnica?: string
  liberado?: boolean
}

export interface EntradaBitacora {
  id?: number
  fecha: string
  region_id: string
  spot_id: string
  region_nombre?: string
  spot_nombre?: string
  clima?: string
  viento?: string
  marea?: string
  fase_lunar?: string
  notas?: string
  capturas?: Captura[]
}

// ── electronAPI ───────────────────────────────────────────────────────────────

declare global {
  interface Window {
    electronAPI: {
      bitacora: {
        getAll:    ()                                      => Promise<EntradaBitacora[]>
        create:    (entry: EntradaBitacora)               => Promise<number>
        update:    (id: number, entry: Partial<EntradaBitacora>) => Promise<void>
        delete:    (id: number)                           => Promise<void>
      }
      regiones: {
        getAll:        ()                                            => Promise<Region[]>
        create:        (data: { nombre: string; descripcion?: string; estado?: string }) => Promise<void>
        updateEstado:  (id: string, estado: string)                  => Promise<void>
        createSpot:    (spot: {
          id: string
          region_id: string
          nombre: string
          tipo?: string
          recomendaciones?: string
        })                                                           => Promise<void>
      }
      especies: {
        getAll:  ()               => Promise<Especie[]>
        create:  (e: Especie)     => Promise<void>
      }
    }
  }
}