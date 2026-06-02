import path from 'path'
import fs from 'fs'
import { app } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js')

let db: InstanceType<Awaited<ReturnType<typeof initSqlJs>>['Database']> | null = null

function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'bitacora.db')
}

export async function initDatabase() {
  const SQL = await initSqlJs()
  const dbPath = getDbPath()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  runMigrations()
  persistDb()
}

export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function persistDb() {
  const data = db!.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(getDbPath(), buffer)
}

function runMigrations() {
  db!.run(`
    CREATE TABLE IF NOT EXISTS regiones (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      estado TEXT DEFAULT 'explorado'
    );
  `)

  db!.run(`
    CREATE TABLE IF NOT EXISTS spots (
      id TEXT PRIMARY KEY,
      region_id TEXT NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT,
      estructuras TEXT,
      recomendaciones TEXT,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (region_id) REFERENCES regiones(id)
    );
  `)

  db!.run(`
    CREATE TABLE IF NOT EXISTS bitacora (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      region_id TEXT,
      spot_id TEXT,
      clima TEXT,
      viento TEXT,
      marea TEXT,
      fase_lunar TEXT,
      notas TEXT,
      activo INTEGER DEFAULT 1,
      creado_en TEXT DEFAULT (datetime('now'))
    );
  `)

  db!.run(`
    CREATE TABLE IF NOT EXISTS capturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bitacora_id INTEGER NOT NULL,
      especie_id TEXT NOT NULL,
      cantidad INTEGER DEFAULT 1,
      peso_kg REAL,
      talla_cm REAL,
      senuelo TEXT,
      tecnica TEXT,
      liberado INTEGER DEFAULT 0,
      FOREIGN KEY (bitacora_id) REFERENCES bitacora(id)
    );
  `)

  db!.run(`
    CREATE TABLE IF NOT EXISTS especies_catalogo (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      nombre_cientifico TEXT,
      descripcion TEXT,
      imagen TEXT,
      luna_optima TEXT,
      profundidad TEXT,
      tecnicas TEXT,
      cebos TEXT
    );
  `)

  // Seed regiones si están vacías
  const res = db!.exec('SELECT COUNT(*) as cnt FROM regiones')
  const count = res[0]?.values[0][0] as number
  if (count === 0) seedData()

  persistDb()
}

function seedData() {
  const regiones = [
    { id: 'capurgana', nombre: 'Capurganá & Sapzurro', descripcion: 'Zona fronteriza con Panamá, aguas cristalinas, arrecifes coralinos.', estado: 'explorado' },
    { id: 'acandi', nombre: 'Acandí', descripcion: 'Costa Caribe chocoana, desembocaduras y playas vírgenes.', estado: 'explorado' },
    { id: 'golfo_uraba', nombre: 'Golfo de Urabá', descripcion: 'Golfo interior, aguas cálidas y productivas.', estado: 'explorado' },
    { id: 'puerto_escondido', nombre: 'Puerto Escondido', descripcion: 'Costa norte de Córdoba, bajos y veriles offshore.', estado: 'explorado' },
    { id: 'isla_fuerte', nombre: 'Isla Fuerte', descripcion: 'Isla coralina al norte de Córdoba, excelente para pesca offshore.', estado: 'explorado' },
    { id: 'santa_marta', nombre: 'Santa Marta', descripcion: 'Sierra Nevada hasta el mar, aguas ricas en nutrientes.', estado: 'recomendado' },
    { id: 'barranquilla', nombre: 'Barranquilla', descripcion: 'Delta del Magdalena, aguas mixtas con gran productividad.', estado: 'recomendado' },
  ]

  const spots: Array<{ id: string; region_id: string; nombre: string; tipo: string; recomendaciones: string }> = [
    { id: 'cap_la_miel', region_id: 'capurgana', nombre: 'La Miel', tipo: 'playa', recomendaciones: 'Pesca de orilla al amanecer. Jureles y sierras.' },
    { id: 'cap_cabo_tiburon', region_id: 'capurgana', nombre: 'Cabo Tiburón', tipo: 'cabo', recomendaciones: 'Corrientes fuertes. Excelente para pargo y mero en la base de los acantilados.' },
    { id: 'cap_bahia_sapzurro', region_id: 'capurgana', nombre: 'Bahía de Sapzurro', tipo: 'bahia', recomendaciones: 'Aguas tranquilas. Buena para carite y sierra a media agua.' },
    { id: 'cap_bajos', region_id: 'capurgana', nombre: 'Bajos', tipo: 'bajo', recomendaciones: 'Bajos coralinos, pesca de fondo para pargo y mero.' },
    { id: 'cap_islotes', region_id: 'capurgana', nombre: 'Islotes', tipo: 'islote', recomendaciones: 'Rodeando islotes en superficie para dorado y atún.' },
    { id: 'cap_veril', region_id: 'capurgana', nombre: 'Veril', tipo: 'veril', recomendaciones: 'Veril offshore 20-40m. Sierra, carite y dorado en luna llena.' },
    { id: 'aca_tolo', region_id: 'acandi', nombre: 'Desembocadura del Tolo', tipo: 'desembocadura', recomendaciones: 'Robalos y sábalos. Mejor con marea entrante.' },
    { id: 'aca_playona', region_id: 'acandi', nombre: 'Playona', tipo: 'playa', recomendaciones: 'Playa extensa, pesca de orilla. Jureles y zapateros.' },
    { id: 'aca_bajos', region_id: 'acandi', nombre: 'Bajos', tipo: 'bajo', recomendaciones: 'Bajos rocosos, pargo lunarejo y mero.' },
    { id: 'aca_islotes', region_id: 'acandi', nombre: 'Islotes', tipo: 'islote', recomendaciones: 'Pesca superficial, dorado y wahoo.' },
    { id: 'gur_rio_negro', region_id: 'golfo_uraba', nombre: 'Ensenada de Río Negro', tipo: 'ensenada', recomendaciones: 'Aguas salobres, excelente para robalo grande.' },
    { id: 'gur_faro', region_id: 'golfo_uraba', nombre: 'El Faro', tipo: 'estructura', recomendaciones: 'Estructura artificial, concentra pargo y corvina.' },
    { id: 'gur_aguila', region_id: 'golfo_uraba', nombre: 'Cerro del Águila', tipo: 'veril', recomendaciones: 'Veril profundo, atún aleta amarilla y dorado offshore.' },
    { id: 'gur_bajos', region_id: 'golfo_uraba', nombre: 'Bajos', tipo: 'bajo', recomendaciones: 'Bajos interiores, sierra y carite en superficie.' },
    { id: 'gur_veriles', region_id: 'golfo_uraba', nombre: 'Veriles', tipo: 'veril', recomendaciones: 'Veriles del Golfo, pesca offshore en luna llena.' },
    { id: 'pe_playa', region_id: 'puerto_escondido', nombre: 'Playa', tipo: 'playa', recomendaciones: 'Pesca de orilla, sábalo y robalo.' },
    { id: 'pe_tortuguilla', region_id: 'puerto_escondido', nombre: 'Isla Tortuguilla', tipo: 'isla', recomendaciones: 'Isla con arrecife, pargo, mero y carite alrededor.' },
    { id: 'pe_bajo_medio', region_id: 'puerto_escondido', nombre: 'Bajo del Medio', tipo: 'bajo', recomendaciones: 'Bajo coralino central, excelente para pargo rojo.' },
    { id: 'pe_bajo_burbujas', region_id: 'puerto_escondido', nombre: 'Bajo Burbujas', tipo: 'bajo', recomendaciones: 'Actividad volcánica submarina, muy productivo.' },
    { id: 'pe_bajo_orion', region_id: 'puerto_escondido', nombre: 'Bajo Orión', tipo: 'bajo', recomendaciones: 'Bajo profundo, atún y wahoo en temporada.' },
    { id: 'pe_veriles', region_id: 'puerto_escondido', nombre: 'Veriles', tipo: 'veril', recomendaciones: 'Veriles offshore, dorado y atún aleta.' },
    { id: 'if_alrededor', region_id: 'isla_fuerte', nombre: 'Alrededor de la Isla', tipo: 'isla', recomendaciones: 'Periplo completo, pargo, mero y carite en todos los costados.' },
    { id: 'if_bushnell', region_id: 'isla_fuerte', nombre: 'Bajo Bushnell', tipo: 'bajo', recomendaciones: 'Bajo histórico, concentración de pargo lunarejo y rojo.' },
    { id: 'if_veril_detras', region_id: 'isla_fuerte', nombre: 'Veril detrás de la Isla', tipo: 'veril', recomendaciones: 'Veril en sotavento, wahoo y dorado en corriente.' },
    { id: 'if_bajos', region_id: 'isla_fuerte', nombre: 'Bajos', tipo: 'bajo', recomendaciones: 'Bajos coralinos variados, gran diversidad de especies.' },
    { id: 'if_veril', region_id: 'isla_fuerte', nombre: 'Veril', tipo: 'veril', recomendaciones: 'Veril principal, atún y pesca pelágica.' },
    { id: 'sm_pozos_colorados', region_id: 'santa_marta', nombre: 'Pozos Colorados', tipo: 'veril', recomendaciones: 'Zona de upwelling, muy productiva para pesca pelágica.' },
    { id: 'sm_bahia_gaira', region_id: 'santa_marta', nombre: 'Bahía de Gaira', tipo: 'bahia', recomendaciones: 'Bahía abrigada, buena para carite y sierra todo el año.' },
    { id: 'sm_punta_betin', region_id: 'santa_marta', nombre: 'Punta Betín', tipo: 'punto', recomendaciones: 'Corrientes convergentes, excelente para dorado y atún.' },
    { id: 'baq_bocas_ceniza', region_id: 'barranquilla', nombre: 'Bocas de Ceniza', tipo: 'desembocadura', recomendaciones: 'Delta del Magdalena, concentración de nutrientes. Robalo, sábalo y dorado.' },
    { id: 'baq_pradomar', region_id: 'barranquilla', nombre: 'Pradomar', tipo: 'playa', recomendaciones: 'Costa norte, sierra y carite en temporada seca.' },
    { id: 'baq_veriles', region_id: 'barranquilla', nombre: 'Veriles offshore', tipo: 'veril', recomendaciones: 'Veriles a 20-30mn, atún aleta amarilla y wahoo.' },
  ]

  const especies = [
    { id: 'carite_br', nombre: 'Carite', nombre_cientifico: 'Scomberomorus brasiliensis', luna_optima: 'llena,creciente', tecnicas: 'curricán,spinning', cebos: 'cuchara,vinilo', profundidad: '5-25m' },
    { id: 'sierra', nombre: 'Sierra', nombre_cientifico: 'Scomberomorus cavalla', luna_optima: 'llena,nueva', tecnicas: 'curricán,jigging', cebos: 'cuchara grande,madejas', profundidad: '10-40m' },
    { id: 'atun_aleta', nombre: 'Atún Aleta Amarilla', nombre_cientifico: 'Thunnus albacares', luna_optima: 'nueva,cuarto menguante', tecnicas: 'curricán,popping', cebos: 'pullbait,stickbait', profundidad: '20-200m' },
    { id: 'dorado', nombre: 'Dorado', nombre_cientifico: 'Coryphaena hippurus', luna_optima: 'llena,creciente', tecnicas: 'curricán,spinning', cebos: 'vinilo,pullbait', profundidad: '0-30m' },
    { id: 'wahoo', nombre: 'Wahoo', nombre_cientifico: 'Acanthocybium solandri', luna_optima: 'nueva,cuarto creciente', tecnicas: 'curricán rápido', cebos: 'cuchara large,konahead', profundidad: '15-60m' },
    { id: 'pargo_rojo', nombre: 'Pargo Rojo', nombre_cientifico: 'Lutjanus campechanus', luna_optima: 'nueva,cuarto menguante', tecnicas: 'fondo,jigging', cebos: 'calamar,jigg', profundidad: '20-100m' },
    { id: 'pargo_lunarejo', nombre: 'Pargo Lunarejo', nombre_cientifico: 'Lutjanus guttatus', luna_optima: 'cuarto menguante,nueva', tecnicas: 'fondo', cebos: 'camarón,calamar', profundidad: '10-60m' },
    { id: 'mero', nombre: 'Mero', nombre_cientifico: 'Epinephelus marginatus', luna_optima: 'nueva,menguante', tecnicas: 'fondo,jigging', cebos: 'pescado,pulpo', profundidad: '15-80m' },
    { id: 'robalo', nombre: 'Robalo', nombre_cientifico: 'Centropomus undecimalis', luna_optima: 'llena,nueva', tecnicas: 'spinning,mosca', cebos: 'vinilo,rapala', profundidad: '0-10m' },
    { id: 'jurel', nombre: 'Jurel', nombre_cientifico: 'Caranx hippos', luna_optima: 'creciente,llena', tecnicas: 'spinning,jigging', cebos: 'vinilo,jig', profundidad: '0-20m' },
    { id: 'cubera', nombre: 'Pargo Cubera', nombre_cientifico: 'Lutjanus cyanopterus', luna_optima: 'nueva,menguante', tecnicas: 'fondo', cebos: 'cangrejo,pulpo', profundidad: '10-40m' },
    { id: 'sabalo', nombre: 'Sábalo', nombre_cientifico: 'Megalops atlanticus', luna_optima: 'llena,creciente', tecnicas: 'spinning,mosca', cebos: 'vinilo,baitfish', profundidad: '0-5m' },
    { id: 'corvina', nombre: 'Corvina', nombre_cientifico: 'Cynoscion nebulosus', luna_optima: 'nueva,cuarto creciente', tecnicas: 'spinning,fondo', cebos: 'vinilo,camarón', profundidad: '0-15m' },
    { id: 'zapatero', nombre: 'Zapatero', nombre_cientifico: 'Oligoplites saurus', luna_optima: 'creciente', tecnicas: 'spinning', cebos: 'pequeños vinilos', profundidad: '0-10m' },
  ]

  for (const r of regiones) {
    db!.run(
      'INSERT OR IGNORE INTO regiones (id, nombre, descripcion, estado) VALUES (?, ?, ?, ?)',
      [r.id, r.nombre, r.descripcion, r.estado]
    )
  }

  for (const s of spots) {
    db!.run(
      'INSERT OR IGNORE INTO spots (id, region_id, nombre, tipo, recomendaciones) VALUES (?, ?, ?, ?, ?)',
      [s.id, s.region_id, s.nombre, s.tipo, s.recomendaciones]
    )
  }

  for (const e of especies) {
    db!.run(
      'INSERT OR IGNORE INTO especies_catalogo (id, nombre, nombre_cientifico, luna_optima, tecnicas, cebos, profundidad) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [e.id, e.nombre, e.nombre_cientifico, e.luna_optima, e.tecnicas, e.cebos, e.profundidad]
    )
  }
}