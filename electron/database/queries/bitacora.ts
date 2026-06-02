import type { Database } from 'better-sqlite3'
import type { EntradaBitacora, Captura } from '../../src/types'

export function getBitacora(db: Database): EntradaBitacora[] {
  const entradas = db.prepare(`
    SELECT id, fecha, region_id, spot_id, region_nombre, spot_nombre,
           clima, viento, marea, fase_lunar, notas
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
    })) as Captura[],
  }))
}

export function createEntrada(db: Database, entrada: EntradaBitacora): number {
  const result = db.prepare(`
    INSERT INTO bitacora
      (fecha, region_id, spot_id, region_nombre, spot_nombre,
       clima, viento, marea, fase_lunar, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entrada.fecha,
    entrada.region_id,
    entrada.spot_id,
    entrada.region_nombre ?? '',
    entrada.spot_nombre ?? '',
    entrada.clima ?? '',
    entrada.viento ?? '',
    entrada.marea ?? '',
    entrada.fase_lunar ?? '',
    entrada.notas ?? '',
  )

  const id = result.lastInsertRowid as number

  if (entrada.capturas?.length) {
    const insertCaptura = db.prepare(`
      INSERT INTO capturas
        (bitacora_id, especie_id, especie_nombre, cantidad,
         peso_kg, talla_cm, senuelo, tecnica, liberado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const c of entrada.capturas) {
      insertCaptura.run(
        id,
        c.especie_id,
        c.especie_nombre ?? '',
        c.cantidad,
        c.peso_kg ?? null,
        c.talla_cm ?? null,
        c.senuelo ?? '',
        c.tecnica ?? '',
        c.liberado ? 1 : 0,
      )
    }
  }

  return id
}

export function updateEntrada(db: Database, id: number, datos: Partial<EntradaBitacora>) {
  const campos = ['clima','viento','marea','fase_lunar','notas']
    .filter(k => k in datos)
  if (campos.length === 0) return

  const sql = `UPDATE bitacora SET ${campos.map(c => `${c} = ?`).join(', ')} WHERE id = ?`
  const valores = [...campos.map(k => (datos as any)[k]), id]
  db.prepare(sql).run(...valores)
}

export function deleteEntrada(db: Database, id: number) {
  db.prepare(`DELETE FROM capturas WHERE bitacora_id = ?`).run(id)
  db.prepare(`DELETE FROM bitacora WHERE id = ?`).run(id)
}