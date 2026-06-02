import type { Database } from 'better-sqlite3'

export function getRegiones(db: Database) {
  const regiones = db.prepare(`
    SELECT id, nombre, descripcion, estado FROM regiones WHERE activo = 1 ORDER BY nombre
  `).all() as any[]

  const spots = db.prepare(`
    SELECT id, region_id, nombre, tipo, recomendaciones FROM spots WHERE activo = 1 ORDER BY nombre
  `).all() as any[]

  return regiones.map(r => ({
    ...r,
    spots: spots.filter(s => s.region_id === r.id),
  }))
}

export function createRegion(
  db: Database,
  data: { nombre: string; descripcion?: string; estado?: string }
) {
  const id = `region_${Date.now()}`
  db.prepare(`
    INSERT INTO regiones (id, nombre, descripcion, estado, activo)
    VALUES (?, ?, ?, ?, 1)
  `).run(id, data.nombre, data.descripcion ?? '', data.estado ?? 'recomendado')
  return id
}

export function updateRegionEstado(db: Database, id: string, estado: string) {
  db.prepare(`UPDATE regiones SET estado = ? WHERE id = ?`).run(estado, id)
}

export function createSpot(
  db: Database,
  spot: {
    id: string
    region_id: string
    nombre: string
    tipo?: string
    recomendaciones?: string
  }
) {
  db.prepare(`
    INSERT INTO spots (id, region_id, nombre, tipo, recomendaciones, activo)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(
    spot.id,
    spot.region_id,
    spot.nombre,
    spot.tipo ?? '',
    spot.recomendaciones ?? '',
  )
}