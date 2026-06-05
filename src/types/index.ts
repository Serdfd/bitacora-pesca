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
  lat?: number
  lon?: number
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
  imagen?: string
  // Campos ricos
  peso_promedio?: string
  peso_maximo?: string
  talla_promedio?: string
  talla_maxima?: string
  record_colombia?: string
  profundidad_detalle?: string
  habitat?: string
  temporada_alta?: string
  comportamiento?: string
  colores_senuelos?: string
  curiosidad?: string
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

declare global {
  interface Window {
    electronAPI: {
      app: {
        getUserDataPath: () => Promise<string>
      }
      bitacora: {
        getAll:    ()                                             => Promise<EntradaBitacora[]>
        create:    (entry: EntradaBitacora)                      => Promise<number>
        update:    (id: number, entry: Partial<EntradaBitacora>) => Promise<void>
        delete:    (id: number)                                  => Promise<void>
      }
      regiones: {
        getAll:       ()                                                        => Promise<Region[]>
        create:       (data: {
          nombre: string
          descripcion?: string
          estado?: string
          lat?: number
          lon?: number
        }) => Promise<void>
        updateEstado: (id: string, estado: string)                              => Promise<void>
        createSpot:   (spot: {
          id: string; region_id: string; nombre: string
          tipo?: string; recomendaciones?: string
        }) => Promise<void>
      }
      especies: {
        getAll:      ()                               => Promise<Especie[]>
        create:      (e: Especie)                     => Promise<string>
        update:      (id: string, e: Partial<Especie>) => Promise<void>
        delete:      (id: string)                     => Promise<void>
        selectImage: ()                               => Promise<string | null>
        saveImage:   (id: string, src: string)        => Promise<string>
      }
    }
  }
}