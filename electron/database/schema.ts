import type { Database } from 'better-sqlite3'

export function applySchema(db: Database) {
  // Regiones
  db.exec(`
    CREATE TABLE IF NOT EXISTS regiones (
      id          TEXT PRIMARY KEY,
      nombre      TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      estado      TEXT DEFAULT 'recomendado',
      activo      INTEGER DEFAULT 1
    )
  `)

  // Spots
  db.exec(`
    CREATE TABLE IF NOT EXISTS spots (
      id              TEXT PRIMARY KEY,
      region_id       TEXT NOT NULL,
      nombre          TEXT NOT NULL,
      tipo            TEXT DEFAULT '',
      recomendaciones TEXT DEFAULT '',
      activo          INTEGER DEFAULT 1,
      FOREIGN KEY (region_id) REFERENCES regiones(id)
    )
  `)

  // Especies
  db.exec(`
    CREATE TABLE IF NOT EXISTS especies (
      id               TEXT PRIMARY KEY,
      nombre           TEXT NOT NULL,
      nombre_cientifico TEXT DEFAULT '',
      descripcion      TEXT DEFAULT '',
      luna_optima      TEXT DEFAULT 'cualquiera',
      profundidad_min  INTEGER DEFAULT 0,
      profundidad_max  INTEGER DEFAULT 100,
      tecnicas         TEXT DEFAULT '',
      cebos            TEXT DEFAULT '',
      activo           INTEGER DEFAULT 1
    )
  `)

  // Bitácora
  db.exec(`
    CREATE TABLE IF NOT EXISTS bitacora (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha          TEXT NOT NULL,
      region_id      TEXT NOT NULL,
      spot_id        TEXT NOT NULL,
      region_nombre  TEXT DEFAULT '',
      spot_nombre    TEXT DEFAULT '',
      clima          TEXT DEFAULT '',
      viento         TEXT DEFAULT '',
      marea          TEXT DEFAULT '',
      fase_lunar     TEXT DEFAULT '',
      notas          TEXT DEFAULT ''
    )
  `)

  // Capturas (tabla hija de bitácora)
  db.exec(`
    CREATE TABLE IF NOT EXISTS capturas (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      bitacora_id    INTEGER NOT NULL,
      especie_id     TEXT NOT NULL,
      especie_nombre TEXT DEFAULT '',
      cantidad       INTEGER DEFAULT 1,
      peso_kg        REAL,
      talla_cm       REAL,
      senuelo        TEXT DEFAULT '',
      tecnica        TEXT DEFAULT '',
      liberado       INTEGER DEFAULT 0,
      FOREIGN KEY (bitacora_id) REFERENCES bitacora(id)
    )
  `)

  // Migraciones seguras (ALTER TABLE si columna no existe)
  const migraciones = [
    { tabla: 'regiones', columna: 'descripcion',      tipo: "TEXT DEFAULT ''" },
    { tabla: 'regiones', columna: 'estado',            tipo: "TEXT DEFAULT 'recomendado'" },
    { tabla: 'spots',    columna: 'tipo',              tipo: "TEXT DEFAULT ''" },
    { tabla: 'spots',    columna: 'recomendaciones',   tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'nombre_cientifico', tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'profundidad_min',   tipo: 'INTEGER DEFAULT 0' },
    { tabla: 'especies', columna: 'profundidad_max',   tipo: 'INTEGER DEFAULT 100' },
    { tabla: 'especies', columna: 'tecnicas',          tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'cebos',             tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'region_nombre',     tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'spot_nombre',       tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'viento',            tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'fase_lunar',        tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'especie_nombre',    tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'peso_kg',           tipo: 'REAL' },
    { tabla: 'capturas', columna: 'talla_cm',          tipo: 'REAL' },
    { tabla: 'capturas', columna: 'senuelo',           tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'tecnica',           tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'liberado',          tipo: 'INTEGER DEFAULT 0' },
    { tabla: 'regiones', columna: 'activo', tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'spots',    columna: 'activo', tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'especies', columna: 'activo', tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'especies', columna: 'imagen', tipo: "TEXT DEFAULT ''" },
  ]

  for (const { tabla, columna, tipo } of migraciones) {
    try {
      db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`)
    } catch {
      // Columna ya existe — ignorar
    }
  }
}