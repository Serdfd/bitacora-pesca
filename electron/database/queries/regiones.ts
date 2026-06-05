import type { Database } from 'better-sqlite3'

export function getRegiones(db: Database) {
  const regiones = db.prepare(`
    SELECT id, nombre, descripcion, estado, lat, lon
    FROM regiones WHERE activo = 1 ORDER BY nombre
  `).all() as any[]

  const spots = db.prepare(`
    SELECT id, region_id, nombre, tipo, recomendaciones
    FROM spots WHERE activo = 1 ORDER BY nombre
  `).all() as any[]

  return regiones.map(r => ({
    ...r,
    lat: r.lat ?? 0,
    lon: r.lon ?? 0,
    spots: spots.filter(s => s.region_id === r.id),
  }))
}

export function createRegion(
  db: Database,
  data: { nombre: string; descripcion?: string; estado?: string; lat?: number; lon?: number }
) {
  const id = `region_${Date.now()}`
  db.prepare(`
    INSERT INTO regiones (id, nombre, descripcion, estado, lat, lon, activo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(
    id,
    data.nombre,
    data.descripcion ?? '',
    data.estado ?? 'recomendado',
    data.lat ?? 0,
    data.lon ?? 0,
  )
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