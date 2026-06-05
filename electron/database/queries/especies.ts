import type { Database } from 'better-sqlite3'

export function getEspecies(db: Database) {
  return db.prepare(`
    SELECT id, nombre, nombre_cientifico, descripcion,
           luna_optima, profundidad_min, profundidad_max,
           tecnicas, cebos, activo, imagen,
           peso_promedio, peso_maximo, talla_promedio, talla_maxima,
           record_colombia, profundidad_detalle, habitat,
           temporada_alta, comportamiento, colores_senuelos, curiosidad
    FROM especies
    WHERE activo = 1
    ORDER BY nombre
  `).all()
}

export function createEspecie(db: Database, e: {
  nombre: string
  nombre_cientifico?: string
  descripcion?: string
  luna_optima?: string
  profundidad_min?: number
  profundidad_max?: number
  tecnicas?: string
  cebos?: string
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
}) {
  const id = e.nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  db.prepare(`
    INSERT OR REPLACE INTO especies (
      id, nombre, nombre_cientifico, descripcion,
      luna_optima, profundidad_min, profundidad_max,
      tecnicas, cebos, activo, imagen,
      peso_promedio, peso_maximo, talla_promedio, talla_maxima,
      record_colombia, profundidad_detalle, habitat,
      temporada_alta, comportamiento, colores_senuelos, curiosidad
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, 1, '',
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?
    )
  `).run(
    id, e.nombre, e.nombre_cientifico ?? '', e.descripcion ?? '',
    e.luna_optima ?? 'cualquiera', e.profundidad_min ?? 0, e.profundidad_max ?? 100,
    e.tecnicas ?? '', e.cebos ?? '',
    e.peso_promedio ?? '', e.peso_maximo ?? '', e.talla_promedio ?? '', e.talla_maxima ?? '',
    e.record_colombia ?? '', e.profundidad_detalle ?? '', e.habitat ?? '',
    e.temporada_alta ?? '', e.comportamiento ?? '', e.colores_senuelos ?? '', e.curiosidad ?? '',
  )
  return id
}

export function updateEspecie(db: Database, id: string, e: {
  nombre?: string
  nombre_cientifico?: string
  descripcion?: string
  luna_optima?: string
  profundidad_min?: number
  profundidad_max?: number
  tecnicas?: string
  cebos?: string
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
}) {
  db.prepare(`
    UPDATE especies SET
      nombre              = ?,
      nombre_cientifico   = ?,
      descripcion         = ?,
      luna_optima         = ?,
      profundidad_min     = ?,
      profundidad_max     = ?,
      tecnicas            = ?,
      cebos               = ?,
      peso_promedio       = ?,
      peso_maximo         = ?,
      talla_promedio      = ?,
      talla_maxima        = ?,
      record_colombia     = ?,
      profundidad_detalle = ?,
      habitat             = ?,
      temporada_alta      = ?,
      comportamiento      = ?,
      colores_senuelos    = ?,
      curiosidad          = ?
    WHERE id = ?
  `).run(
    e.nombre ?? '', e.nombre_cientifico ?? '', e.descripcion ?? '',
    e.luna_optima ?? 'cualquiera', e.profundidad_min ?? 0, e.profundidad_max ?? 100,
    e.tecnicas ?? '', e.cebos ?? '',
    e.peso_promedio ?? '', e.peso_maximo ?? '', e.talla_promedio ?? '', e.talla_maxima ?? '',
    e.record_colombia ?? '', e.profundidad_detalle ?? '', e.habitat ?? '',
    e.temporada_alta ?? '', e.comportamiento ?? '', e.colores_senuelos ?? '', e.curiosidad ?? '',
    id,
  )
}

export function deleteEspecie(db: Database, id: string) {
  db.prepare(`UPDATE especies SET activo = 0 WHERE id = ?`).run(id)
}

export function saveImagenEspecie(db: Database, id: string, base64: string) {
  db.prepare(`UPDATE especies SET imagen = ? WHERE id = ?`).run(base64, id)
}