import type { Database } from 'better-sqlite3'

export function getEspecies(db: Database) {
  return db.prepare(`
    SELECT id, nombre, nombre_cientifico, descripcion,
           luna_optima, profundidad_min, profundidad_max,
           tecnicas, cebos, activo, imagen
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
}) {
  const id = e.nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  db.prepare(`
    INSERT OR REPLACE INTO especies
      (id, nombre, nombre_cientifico, descripcion, luna_optima,
       profundidad_min, profundidad_max, tecnicas, cebos, activo, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '')
  `).run(
    id,
    e.nombre,
    e.nombre_cientifico ?? '',
    e.descripcion ?? '',
    e.luna_optima ?? 'cualquiera',
    e.profundidad_min ?? 0,
    e.profundidad_max ?? 100,
    e.tecnicas ?? '',
    e.cebos ?? '',
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
}) {
  db.prepare(`
    UPDATE especies SET
      nombre            = ?,
      nombre_cientifico = ?,
      descripcion       = ?,
      luna_optima       = ?,
      profundidad_min   = ?,
      profundidad_max   = ?,
      tecnicas          = ?,
      cebos             = ?
    WHERE id = ?
  `).run(
    e.nombre ?? '',
    e.nombre_cientifico ?? '',
    e.descripcion ?? '',
    e.luna_optima ?? 'cualquiera',
    e.profundidad_min ?? 0,
    e.profundidad_max ?? 100,
    e.tecnicas ?? '',
    e.cebos ?? '',
    id,
  )
}

export function deleteEspecie(db: Database, id: string) {
  db.prepare(`UPDATE especies SET activo = 0 WHERE id = ?`).run(id)
}

export function saveImagenEspecie(db: Database, id: string, base64: string) {
  db.prepare(`UPDATE especies SET imagen = ? WHERE id = ?`).run(base64, id)
}