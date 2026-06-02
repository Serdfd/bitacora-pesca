import type { Database } from 'better-sqlite3'

export function getEspecies(db: Database) {
  return db.prepare(`
    SELECT id, nombre, nombre_cientifico, descripcion,
           luna_optima, profundidad_min, profundidad_max,
           tecnicas, cebos, activo
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
    INSERT OR IGNORE INTO especies
      (id, nombre, nombre_cientifico, descripcion, luna_optima,
       profundidad_min, profundidad_max, tecnicas, cebos, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
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