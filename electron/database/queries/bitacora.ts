import type { Database } from 'better-sqlite3'

export function getBitacora(db: Database) {
  const entradas = db.prepare(`
    SELECT id, fecha, region_id, spot_id, region_nombre, spot_nombre,
           clima, viento, marea, fase_lunar, notas, calificacion
    FROM bitacora
    ORDER BY fecha DESC
  `).all() as any[]

  const getCapturas = db.prepare(`
    SELECT especie_id, especie_nombre, cantidad,
           peso_kg, talla_cm, senuelo, tecnica, liberado
    FROM capturas WHERE bitacora_id = ?
  `)

  return entradas.map(e => ({
    ...e,
    capturas: (getCapturas.all(e.id) as any[]).map(c => ({
      ...c,
      liberado: Boolean(c.liberado),
    })),
  }))
}

export function createEntrada(db: Database, entrada: any): number {
  const result = db.prepare(`
    INSERT INTO bitacora
      (fecha, region_id, spot_id, region_nombre, spot_nombre,
       clima, viento, marea, fase_lunar, notas, calificacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entrada.fecha,
    entrada.region_id,
    entrada.spot_id,
    entrada.region_nombre ?? '',
    entrada.spot_nombre   ?? '',
    entrada.clima         ?? '',
    entrada.viento        ?? '',
    entrada.marea         ?? '',
    entrada.fase_lunar    ?? '',
    entrada.notas         ?? '',
    entrada.calificacion  ?? 0,
  )

  const id = result.lastInsertRowid as number
  _insertCapturas(db, id, entrada.capturas ?? [])
  return id
}

export function updateEntrada(db: Database, id: number, datos: any) {
  db.prepare(`
    UPDATE bitacora SET
      fecha         = ?,
      region_id     = ?,
      spot_id       = ?,
      region_nombre = ?,
      spot_nombre   = ?,
      clima         = ?,
      marea         = ?,
      fase_lunar    = ?,
      notas         = ?,
      calificacion  = ?
    WHERE id = ?
  `).run(
    datos.fecha         ?? '',
    datos.region_id     ?? '',
    datos.spot_id       ?? '',
    datos.region_nombre ?? '',
    datos.spot_nombre   ?? '',
    datos.clima         ?? '',
    datos.marea         ?? '',
    datos.fase_lunar    ?? '',
    datos.notas         ?? '',
    datos.calificacion  ?? 0,
    id,
  )

  if (datos.capturas !== undefined) {
    db.prepare(`DELETE FROM capturas WHERE bitacora_id = ?`).run(id)
    _insertCapturas(db, id, datos.capturas)
  }
}

export function deleteEntrada(db: Database, id: number) {
  db.prepare(`DELETE FROM capturas WHERE bitacora_id = ?`).run(id)
  db.prepare(`DELETE FROM bitacora  WHERE id = ?`).run(id)
}

function _insertCapturas(db: Database, bitacoraId: number, capturas: any[]) {
  if (!capturas.length) return
  const stmt = db.prepare(`
    INSERT INTO capturas
      (bitacora_id, especie_id, especie_nombre, cantidad,
       peso_kg, talla_cm, senuelo, tecnica, liberado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const c of capturas) {
    stmt.run(
      bitacoraId,
      c.especie_id,
      c.especie_nombre ?? '',
      c.cantidad,
      c.peso_kg  ?? null,
      c.talla_cm ?? null,
      c.senuelo  ?? '',
      c.tecnica  ?? '',
      c.liberado ? 1 : 0,
    )
  }
}