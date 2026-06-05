import type { Database } from 'better-sqlite3'

// Especies precargadas con datos ricos
const ESPECIES_SEED = [
  {
    id: 'carite', nombre: 'Carite', nombre_cientifico: 'Scomberomorus brasiliensis',
    descripcion: 'Pez pelágico veloz y muy apreciado en el Caribe colombiano. Vive en cardúmenes y ataca en superficie.',
    luna_optima: 'nueva', profundidad_min: 0, profundidad_max: 100,
    tecnicas: 'Trolling,Spinning,Curricán',
    cebos: 'Cuchara metálica,Vinilo,Pluma,Carnada viva',
    peso_promedio: '3–8 kg', peso_maximo: '45 kg',
    talla_promedio: '60–90 cm', talla_maxima: '185 cm',
    record_colombia: '~20 kg',
    profundidad_detalle: '0–100 m (superficie preferida)',
    habitat: 'Pelágico,Arrecife',
    temporada_alta: 'Dic – Mar (época seca, alisios)',
    comportamiento: 'Depredador veloz en cardumen. Ataca carnadas en superficie con saltos. Muy activo al amanecer y atardecer. Sigue corrientes cálidas.',
    colores_senuelos: 'Azul/Blanco,Verde/Amarillo,Plateado,Natural/Transparente',
    curiosidad: 'Puede alcanzar velocidades de hasta 65 km/h. Excelente para ceviche.',
  },
  {
    id: 'sierra', nombre: 'Sierra', nombre_cientifico: 'Scomberomorus cavalla',
    descripcion: 'Pariente mayor del carite, más solitaria y con dientes letales. Una de las especies más buscadas del Caribe.',
    luna_optima: 'creciente_creciente', profundidad_min: 0, profundidad_max: 200,
    tecnicas: 'Trolling,Spinning',
    cebos: 'Cuchara grande,Madejas,Carnada viva',
    peso_promedio: '2–5 kg', peso_maximo: '38 kg',
    talla_promedio: '50–80 cm', talla_maxima: '200 cm',
    record_colombia: '~15 kg',
    profundidad_detalle: '0–200 m',
    habitat: 'Pelágico,Costero',
    temporada_alta: 'Nov – Feb',
    comportamiento: 'Solitaria o en parejas. Más lenta que el carite pero con dientes peligrosos. Ataca con movimiento lateral cortando la carnada.',
    colores_senuelos: 'Rojo/Blanco,Naranja,Plateado,Azul/Blanco',
    curiosidad: 'Sus dientes son tan afilados que puede cortar el hilo de pesca. Recomendable usar acero.',
  },
  {
    id: 'dorado', nombre: 'Dorado', nombre_cientifico: 'Coryphaena hippurus',
    descripcion: 'Uno de los peces más coloridos y acrobáticos del océano. Cambia de color dramáticamente al morir.',
    luna_optima: 'nueva', profundidad_min: 0, profundidad_max: 85,
    tecnicas: 'Trolling,Spinning,Jigging',
    cebos: 'Pullbait,Stickbait,Vinilo,Carnada viva',
    peso_promedio: '4–10 kg', peso_maximo: '40 kg',
    talla_promedio: '70–100 cm', talla_maxima: '210 cm',
    record_colombia: '~25 kg',
    profundidad_detalle: '0–85 m (superficie)',
    habitat: 'Pelágico oceánico',
    temporada_alta: 'Abr – Jul',
    comportamiento: 'Uno de los peces más rápidos del mar. Vive cerca de objetos flotantes (palos, sargazo). Cambia de color dramáticamente al morir. Excelente saltador.',
    colores_senuelos: 'Amarillo/Dorado,Azul/Blanco,Verde/Amarillo,Multicolor',
    curiosidad: 'El macho tiene la cabeza muy cuadrada (toro). La hembra la tiene redondeada (vaca). Crecen increíblemente rápido — 1 kg por mes.',
  },
  {
    id: 'wahoo', nombre: 'Wahoo', nombre_cientifico: 'Acanthocybium solandri',
    descripcion: 'El pez más rápido del océano tropical. Ataque explosivo y combate brutal.',
    luna_optima: 'nueva', profundidad_min: 0, profundidad_max: 150,
    tecnicas: 'Trolling de alta velocidad,Spinning',
    cebos: 'Cuchara large,Konahead,Rapala',
    peso_promedio: '8–15 kg', peso_maximo: '83 kg',
    talla_promedio: '100–150 cm', talla_maxima: '250 cm',
    record_colombia: '~35 kg',
    profundidad_detalle: '0–150 m',
    habitat: 'Pelágico oceánico',
    temporada_alta: 'Ene – Mar',
    comportamiento: 'Uno de los peces más rápidos del océano (~80 km/h). Solitario o en parejas. Ataca con explosividad brutal. Prefiere aguas cálidas y profundas.',
    colores_senuelos: 'Azul/Blanco,Rosa/Blanco,Plateado,Multicolor',
    curiosidad: 'Su nombre viene del hawaiano "wahoo". A alta velocidad puede cortar el hilo como una navaja.',
  },
  {
    id: 'atun_aleta', nombre: 'Atún Aleta Amarilla', nombre_cientifico: 'Thunnus albacares',
    descripcion: 'Especie pelágica oceánica de alto valor deportivo y comercial. Uno de los peces más poderosos del Caribe.',
    luna_optima: 'cuarto_creciente', profundidad_min: 0, profundidad_max: 250,
    tecnicas: 'Curricán,Popping,Jigging',
    cebos: 'Pullbait,Stickbait,Carnada viva,Jig metálico',
    peso_promedio: '15–40 kg', peso_maximo: '200 kg',
    talla_promedio: '100–160 cm', talla_maxima: '240 cm',
    record_colombia: '~80 kg',
    profundidad_detalle: '0–250 m',
    habitat: 'Pelágico oceánico',
    temporada_alta: 'Feb – May',
    comportamiento: 'Migrador oceánico. Vive en cardúmenes con delfines y ballenas. Velocidad hasta 70 km/h. Se localiza por aves y actividad en superficie.',
    colores_senuelos: 'Azul/Blanco,Verde/Amarillo,Plateado,Multicolor',
    curiosidad: 'Puede mantener la temperatura corporal más alta que el agua — un atributo casi único entre los peces.',
  },
  {
    id: 'pargo_rojo', nombre: 'Pargo Rojo', nombre_cientifico: 'Lutjanus campechanus',
    descripcion: 'El pargo más emblemático del Caribe colombiano. Especie de fondo muy apreciada gastronómicamente.',
    luna_optima: 'nueva', profundidad_min: 10, profundidad_max: 200,
    tecnicas: 'Fondo,Jigging,Cuchareo',
    cebos: 'Calamar,Jig,Camarón,Pescado',
    peso_promedio: '2–5 kg', peso_maximo: '22 kg',
    talla_promedio: '40–70 cm', talla_maxima: '100 cm',
    record_colombia: '~10 kg',
    profundidad_detalle: '10–200 m (fondo preferido)',
    habitat: 'Arrecife,Fondo rocoso',
    temporada_alta: 'Todo el año (mejor en luna nueva)',
    comportamiento: 'Especie de fondo, muy territorial. Vive en arrecifes y estructuras rocosas. Nocturno en alimentación. Muy apetecido por su sabor.',
    colores_senuelos: 'Rojo/Blanco,Naranja,Amarillo/Dorado,Natural/Transparente',
    curiosidad: 'Es la especie más representativa de la pesca artesanal del Caribe colombiano. Altamente cotizado en restaurantes.',
  },
  {
    id: 'pargo_lunarejo', nombre: 'Pargo Lunarejo', nombre_cientifico: 'Lutjanus guttatus',
    descripcion: 'Pargo de arrecife con mancha negra característica. Gregario y activo en la noche.',
    luna_optima: 'nueva', profundidad_min: 5, profundidad_max: 80,
    tecnicas: 'Fondo,Cuchareo,Jigging ligero',
    cebos: 'Camarón,Calamar,Carnada natural',
    peso_promedio: '1–3 kg', peso_maximo: '12 kg',
    talla_promedio: '30–55 cm', talla_maxima: '80 cm',
    record_colombia: '~6 kg',
    profundidad_detalle: '5–80 m',
    habitat: 'Arrecife,Manglar',
    temporada_alta: 'May – Sep',
    comportamiento: 'Especie gregaria, vive en cardúmenes en arrecifes de coral. Tiene una mancha negra característica en el lomo. Muy activo de noche.',
    colores_senuelos: 'Rojo/Blanco,Amarillo/Dorado,Rosa/Blanco',
    curiosidad: 'Se reconoce fácilmente por la mancha oscura detrás de la aleta dorsal. Excelente para comer asado.',
  },
  {
    id: 'pargo_cubera', nombre: 'Pargo Cubera', nombre_cientifico: 'Lutjanus cyanopterus',
    descripcion: 'El pargo más grande del Atlántico. Combatiente brutal y muy territorial.',
    luna_optima: 'creciente_menguante', profundidad_min: 5, profundidad_max: 55,
    tecnicas: 'Fondo profundo,Jigging pesado',
    cebos: 'Cangrejo,Pulpo,Carnada grande',
    peso_promedio: '5–15 kg', peso_maximo: '57 kg',
    talla_promedio: '60–100 cm', talla_maxima: '160 cm',
    record_colombia: '~25 kg',
    profundidad_detalle: '5–55 m',
    habitat: 'Arrecife,Fondo rocoso profundo',
    temporada_alta: 'Jun – Sep',
    comportamiento: 'El pargo más grande del Atlántico. Solitario y muy territorial. Protege su zona agresivamente. Extremadamente fuerte al picar.',
    colores_senuelos: 'Rojo/Blanco,Naranja,Natural/Transparente',
    curiosidad: 'Puede vivir más de 55 años. Es tan fuerte que puede romper anzuelos de acero inoxidable.',
  },
  {
    id: 'mero', nombre: 'Mero', nombre_cientifico: 'Epinephelus marginatus',
    descripcion: 'Depredador de emboscada en arrecifes y cuevas. Hermafrodita — nace hembra y puede cambiar a macho.',
    luna_optima: 'nueva', profundidad_min: 5, profundidad_max: 100,
    tecnicas: 'Fondo,Jigging,Carnada viva',
    cebos: 'Pescado,Pulpo,Carnada viva',
    peso_promedio: '3–10 kg', peso_maximo: '100 kg',
    talla_promedio: '50–90 cm', talla_maxima: '270 cm',
    record_colombia: '~40 kg',
    profundidad_detalle: '5–100 m',
    habitat: 'Arrecife,Fondo rocoso,Cuevas',
    temporada_alta: 'Todo el año',
    comportamiento: 'Hermafrodita protogínica — nace hembra y puede cambiar a macho. Depredador de emboscada. Muy sedentario. Atrae a sus presas hacia cuevas.',
    colores_senuelos: 'Naranja,Rojo/Blanco,Natural/Transparente',
    curiosidad: 'Todos los meros nacen hembras. Los más grandes son machos. Puede pesar más de 200 kg en especies gigantes.',
  },
  {
    id: 'mero_negro', nombre: 'Mero Negro', nombre_cientifico: 'Mycteroperca bonaci',
    descripcion: 'Mero de aguas profundas, oscuro y poderoso. Uno de los combatientes más fuertes del fondo.',
    luna_optima: 'nueva', profundidad_min: 20, profundidad_max: 150,
    tecnicas: 'Fondo profundo,Jigging pesado',
    cebos: 'Pescado,Carnada viva,Jig pesado',
    peso_promedio: '5–20 kg', peso_maximo: '180 kg',
    talla_promedio: '70–120 cm', talla_maxima: '240 cm',
    record_colombia: '~60 kg',
    profundidad_detalle: '20–150 m',
    habitat: 'Arrecife profundo,Fondo rocoso',
    temporada_alta: 'Oct – Feb',
    comportamiento: 'Mero de aguas profundas. Oscuro y robusto. Espera en cuevas para emboscar presas. Muy fuerte en el combate.',
    colores_senuelos: 'Negro,Rojo/Blanco,Natural/Transparente',
    curiosidad: 'Su color oscuro lo camufla perfectamente en arrecifes profundos. Muy apreciado por pescadores deportivos.',
  },
  {
    id: 'robalo', nombre: 'Róbalo', nombre_cientifico: 'Centropomus undecimalis',
    descripcion: 'El rey del manglar. Especie deportiva por excelencia en la costa, conocido por sus saltos espectaculares.',
    luna_optima: 'nueva', profundidad_min: 0, profundidad_max: 20,
    tecnicas: 'Spinning,Mosca,Señuelos de superficie',
    cebos: 'Vinilo,Rapala,Carnada viva',
    peso_promedio: '1–4 kg', peso_maximo: '20 kg',
    talla_promedio: '40–70 cm', talla_maxima: '140 cm',
    record_colombia: '~8 kg',
    profundidad_detalle: '0–20 m (estuarios y costa)',
    habitat: 'Manglar,Estuario,Costa rocosa',
    temporada_alta: 'May – Ago',
    comportamiento: 'Depredador costero y de manglar. Muy popular en pesca deportiva por sus saltos espectaculares. Activo en corrientes y entradas de agua dulce.',
    colores_senuelos: 'Plateado,Natural/Transparente,Azul/Blanco,Verde/Amarillo',
    curiosidad: 'Considerado el "rey del manglar". Sus saltos al picar son espectaculares. Muy combativo para su tamaño.',
  },
  {
    id: 'jurel', nombre: 'Jurel', nombre_cientifico: 'Caranx hippos',
    descripcion: 'Pez en cardumen, agresivo y veloz. Excelente para jigging vertical.',
    luna_optima: 'creciente_creciente', profundidad_min: 0, profundidad_max: 80,
    tecnicas: 'Jigging,Spinning,Trolling',
    cebos: 'Jig metálico,Vinilo,Carnada viva',
    peso_promedio: '2–6 kg', peso_maximo: '35 kg',
    talla_promedio: '40–70 cm', talla_maxima: '170 cm',
    record_colombia: '~15 kg',
    profundidad_detalle: '0–80 m',
    habitat: 'Pelágico,Arrecife',
    temporada_alta: 'Dic – Mar',
    comportamiento: 'Especie en cardumen. Muy agresivo y veloz. Excelente para pesca deportiva. Suele rodear cardúmenes de peces pequeños desde abajo.',
    colores_senuelos: 'Plateado,Azul/Blanco,Verde/Amarillo,Amarillo/Dorado',
    curiosidad: 'Tiene una línea lateral rígida que lo hace muy resistente. Excelente para pesca de jigging vertical.',
  },
  {
    id: 'barracuda', nombre: 'Barracuda', nombre_cientifico: 'Sphyraena barracuda',
    descripcion: 'Depredadora solitaria y curiosa. Ataque relámpago con dientes enormes. Icónica en el Caribe.',
    luna_optima: 'cuarto_creciente', profundidad_min: 0, profundidad_max: 100,
    tecnicas: 'Trolling,Spinning,Señuelos metálicos',
    cebos: 'Cuchara metálica,Vinilo plateado,Rapala',
    peso_promedio: '3–8 kg', peso_maximo: '45 kg',
    talla_promedio: '60–100 cm', talla_maxima: '200 cm',
    record_colombia: '~20 kg',
    profundidad_detalle: '0–100 m',
    habitat: 'Arrecife,Pelágico costero',
    temporada_alta: 'Todo el año',
    comportamiento: 'Predadora solitaria y curiosa. Se acerca a buzos y nadadores por curiosidad. Ataque relámpago con dientes enormes. Muy agresiva con señuelos brillantes.',
    colores_senuelos: 'Plateado,Azul/Blanco,Multicolor',
    curiosidad: 'Sus dientes son tan afilados como cuchillas quirúrgicas. Puede causar ciguatera si se come — verificar la zona antes de consumirla.',
  },
  {
    id: 'corvina', nombre: 'Corvina', nombre_cientifico: 'Cynoscion nebulosus',
    descripcion: 'Especie de fondo en zonas arenosas y estuarios. Produce sonidos con la vejiga natatoria.',
    luna_optima: 'nueva', profundidad_min: 5, profundidad_max: 50,
    tecnicas: 'Fondo,Cuchareo,Carnada natural',
    cebos: 'Camarón,Vinilo,Carnada natural',
    peso_promedio: '1–3 kg', peso_maximo: '15 kg',
    talla_promedio: '35–60 cm', talla_maxima: '100 cm',
    record_colombia: '~7 kg',
    profundidad_detalle: '5–50 m (fondos arenosos)',
    habitat: 'Fondo arenoso,Estuario,Costa',
    temporada_alta: 'Mar – Jun',
    comportamiento: 'Especie de fondo en zonas arenosas. Nocturna. Se alimenta de crustáceos y peces pequeños. Produce sonidos con la vejiga natatoria.',
    colores_senuelos: 'Natural/Transparente,Amarillo/Dorado,Rojo/Blanco',
    curiosidad: 'Produce sonidos tipo "croack" con la vejiga natatoria. Por eso su nombre en inglés es "drum".',
  },
  {
    id: 'sabalo', nombre: 'Sábalo', nombre_cientifico: 'Megalops atlanticus',
    descripcion: 'El rey de la pesca deportiva. Sus saltos de hasta 3 metros son legendarios.',
    luna_optima: 'creciente_creciente', profundidad_min: 0, profundidad_max: 30,
    tecnicas: 'Spinning,Mosca,Curricán',
    cebos: 'Vinilo,Baitfish,Carnada viva',
    peso_promedio: '10–30 kg', peso_maximo: '161 kg',
    talla_promedio: '100–180 cm', talla_maxima: '250 cm',
    record_colombia: '~80 kg',
    profundidad_detalle: '0–30 m (superficie)',
    habitat: 'Estuario,Costa,Agua salobre',
    temporada_alta: 'Abr – Jul',
    comportamiento: 'El pez más acrobático del Caribe. Salta repetidamente al picar, puede alcanzar 3 metros de altura. Prácticamente siempre se libera (poca calidad para comer).',
    colores_senuelos: 'Plateado,Natural/Transparente,Azul/Blanco',
    curiosidad: 'El rey de la pesca deportiva. Sus escamas plateadas gigantes son icónicas. Puede respirar aire atmosférico directamente.',
  },
  {
    id: 'zapatero', nombre: 'Zapatero', nombre_cientifico: 'Oligoplites saurus',
    descripcion: 'Pez costero pequeño pero muy combativo. Excelente para iniciarse en el spinning.',
    luna_optima: 'creciente_creciente', profundidad_min: 0, profundidad_max: 10,
    tecnicas: 'Spinning',
    cebos: 'Pequeños vinilos,Cucharilla',
    peso_promedio: '0.2–0.8 kg', peso_maximo: '3 kg',
    talla_promedio: '20–35 cm', talla_maxima: '50 cm',
    record_colombia: '~1.5 kg',
    profundidad_detalle: '0–10 m',
    habitat: 'Pelágico costero,Estuario',
    temporada_alta: 'Todo el año',
    comportamiento: 'Pez costero en cardúmenes. Muy agresivo para su tamaño. Ideal para pesca con señuelos pequeños.',
    colores_senuelos: 'Plateado,Verde/Amarillo',
    curiosidad: 'Sus espinas dorsales pueden clavarse — manejar con cuidado al desanzuelar.',
  },
]

export function applySchema(db: Database) {
  // ── Tablas ────────────────────────────────────────────────────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS regiones (
      id          TEXT PRIMARY KEY,
      nombre      TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      estado      TEXT DEFAULT 'recomendado',
      activo      INTEGER DEFAULT 1
    )
  `)

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS especies (
      id                TEXT PRIMARY KEY,
      nombre            TEXT NOT NULL,
      nombre_cientifico TEXT DEFAULT '',
      descripcion       TEXT DEFAULT '',
      luna_optima       TEXT DEFAULT 'cualquiera',
      profundidad_min   INTEGER DEFAULT 0,
      profundidad_max   INTEGER DEFAULT 100,
      tecnicas          TEXT DEFAULT '',
      cebos             TEXT DEFAULT '',
      activo            INTEGER DEFAULT 1,
      imagen            TEXT DEFAULT '',
      peso_promedio     TEXT DEFAULT '',
      peso_maximo       TEXT DEFAULT '',
      talla_promedio    TEXT DEFAULT '',
      talla_maxima      TEXT DEFAULT '',
      record_colombia   TEXT DEFAULT '',
      profundidad_detalle TEXT DEFAULT '',
      habitat           TEXT DEFAULT '',
      temporada_alta    TEXT DEFAULT '',
      comportamiento    TEXT DEFAULT '',
      colores_senuelos  TEXT DEFAULT '',
      curiosidad        TEXT DEFAULT ''
    )
  `)

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
      notas          TEXT DEFAULT '',
      calificacion INTEGER DEFAULT 0
    )
  `)

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

  // ── Migraciones seguras ───────────────────────────────────────────────────────

  const migraciones = [
    { tabla: 'regiones', columna: 'descripcion',         tipo: "TEXT DEFAULT ''" },
    { tabla: 'regiones', columna: 'estado',              tipo: "TEXT DEFAULT 'recomendado'" },
    { tabla: 'regiones', columna: 'activo',              tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'spots',    columna: 'tipo',                tipo: "TEXT DEFAULT ''" },
    { tabla: 'spots',    columna: 'recomendaciones',     tipo: "TEXT DEFAULT ''" },
    { tabla: 'spots',    columna: 'activo',              tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'especies', columna: 'nombre_cientifico',   tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'profundidad_min',     tipo: 'INTEGER DEFAULT 0' },
    { tabla: 'especies', columna: 'profundidad_max',     tipo: 'INTEGER DEFAULT 100' },
    { tabla: 'especies', columna: 'tecnicas',            tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'cebos',               tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'activo',              tipo: 'INTEGER DEFAULT 1' },
    { tabla: 'especies', columna: 'imagen',              tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'peso_promedio',       tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'peso_maximo',         tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'talla_promedio',      tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'talla_maxima',        tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'record_colombia',     tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'profundidad_detalle', tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'habitat',             tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'temporada_alta',      tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'comportamiento',      tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'colores_senuelos',    tipo: "TEXT DEFAULT ''" },
    { tabla: 'especies', columna: 'curiosidad',          tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'region_nombre',       tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'spot_nombre',         tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'viento',              tipo: "TEXT DEFAULT ''" },
    { tabla: 'bitacora', columna: 'fase_lunar',          tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'especie_nombre',      tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'peso_kg',             tipo: 'REAL' },
    { tabla: 'capturas', columna: 'talla_cm',            tipo: 'REAL' },
    { tabla: 'capturas', columna: 'senuelo',             tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'tecnica',             tipo: "TEXT DEFAULT ''" },
    { tabla: 'capturas', columna: 'liberado',            tipo: 'INTEGER DEFAULT 0' },
    { tabla: 'regiones', columna: 'lat',                 tipo: 'REAL DEFAULT 0' },
    { tabla: 'regiones', columna: 'lon',                 tipo: 'REAL DEFAULT 0' },
  ]

  for (const { tabla, columna, tipo } of migraciones) {
    try { db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`) } catch { /* ya existe */ }
  }

  // ── Seed especies precargadas ─────────────────────────────────────────────────
  seedEspecies(db)
  seedRegiones(db)
}

function seedEspecies(db: Database) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO especies (
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
  `)

  for (const e of ESPECIES_SEED) {
    insert.run(
      e.id, e.nombre, e.nombre_cientifico, e.descripcion,
      e.luna_optima, e.profundidad_min, e.profundidad_max,
      e.tecnicas, e.cebos,
      e.peso_promedio, e.peso_maximo, e.talla_promedio, e.talla_maxima,
      e.record_colombia, e.profundidad_detalle, e.habitat,
      e.temporada_alta, e.comportamiento, e.colores_senuelos, e.curiosidad,
    )
  }
}

function seedRegiones(db: Database) {
  const insRegion = db.prepare(`
    INSERT OR IGNORE INTO regiones (id, nombre, descripcion, estado, lat, lon)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insSpot = db.prepare(`
    INSERT OR IGNORE INTO spots (id, region_id, nombre, tipo, recomendaciones)
    VALUES (?, ?, ?, ?, ?)
  `)

  const regiones = [
    { id: 'capurgana',        nombre: 'Capurganá & Sapzurro', descripcion: 'Zona fronteriza con Panamá, aguas cristalinas, arrecifes coralinos.',         estado: 'explorado',   lat: 8.63,  lon: -77.35 },
    { id: 'acandi',           nombre: 'Acandí',               descripcion: 'Costa Caribe chocoana, desembocaduras y playas vírgenes.',                    estado: 'explorado',   lat: 8.51,  lon: -77.28 },
    { id: 'golfo_uraba',      nombre: 'Golfo de Urabá',       descripcion: 'Golfo interior, aguas cálidas y productivas.',                               estado: 'explorado',   lat: 8.10,  lon: -76.87 },
    { id: 'puerto_escondido', nombre: 'Puerto Escondido',     descripcion: 'Costa norte de Córdoba, bajos y veriles offshore.',                          estado: 'explorado',   lat: 9.50,  lon: -75.90 },
    { id: 'isla_fuerte',      nombre: 'Isla Fuerte',          descripcion: 'Isla coralina al norte de Córdoba, excelente para pesca offshore.',          estado: 'explorado',   lat: 9.38,  lon: -76.19 },
    { id: 'santa_marta',      nombre: 'Santa Marta',          descripcion: 'Sierra Nevada hasta el mar, aguas ricas en nutrientes.',                     estado: 'recomendado', lat: 11.24, lon: -74.20 },
    { id: 'barranquilla',     nombre: 'Barranquilla',         descripcion: 'Delta del Magdalena, aguas mixtas con gran productividad.',                  estado: 'recomendado', lat: 11.00, lon: -74.80 },
  ]

  const spots = [
    // Capurganá
    { id: 'cap_la_miel',        region_id: 'capurgana',        nombre: 'La Miel',                 tipo: 'Fondo arenoso',        recomendaciones: 'Pesca de orilla al amanecer. Jureles y sierras.' },
    { id: 'cap_cabo_tiburon',   region_id: 'capurgana',        nombre: 'Cabo Tiburón',            tipo: 'Costa / Acantilado',   recomendaciones: 'Corrientes fuertes. Excelente para pargo y mero en la base de los acantilados.' },
    { id: 'cap_bahia_sapzurro', region_id: 'capurgana',        nombre: 'Bahía de Sapzurro',       tipo: 'Pelágico abierto',     recomendaciones: 'Aguas tranquilas. Buena para carite y sierra a media agua.' },
    { id: 'cap_bajos',          region_id: 'capurgana',        nombre: 'Bajos',                   tipo: 'Bajo / Montículo',     recomendaciones: 'Bajos coralinos, pesca de fondo para pargo y mero.' },
    { id: 'cap_islotes',        region_id: 'capurgana',        nombre: 'Islotes',                 tipo: 'Estructura submarina', recomendaciones: 'Rodeando islotes en superficie para dorado y atún.' },
    { id: 'cap_veril',          region_id: 'capurgana',        nombre: 'Veril',                   tipo: 'Corriente oceánica',   recomendaciones: 'Veril offshore 20-40m. Sierra, carite y dorado.' },
    // Acandí
    { id: 'aca_tolo',           region_id: 'acandi',           nombre: 'Desembocadura del Tolo',  tipo: 'Estuario',             recomendaciones: 'Robalos y sábalos. Mejor con marea entrante.' },
    { id: 'aca_playona',        region_id: 'acandi',           nombre: 'Playona',                 tipo: 'Fondo arenoso',        recomendaciones: 'Playa extensa, pesca de orilla. Jureles y zapateros.' },
    { id: 'aca_bajos',          region_id: 'acandi',           nombre: 'Bajos',                   tipo: 'Bajo / Montículo',     recomendaciones: 'Bajos rocosos, pargo lunarejo y mero.' },
    { id: 'aca_islotes',        region_id: 'acandi',           nombre: 'Islotes',                 tipo: 'Estructura submarina', recomendaciones: 'Pesca superficial, dorado y wahoo.' },
    // Golfo de Urabá
    { id: 'gur_rio_negro',      region_id: 'golfo_uraba',      nombre: 'Ensenada de Río Negro',   tipo: 'Estuario',             recomendaciones: 'Aguas salobres, excelente para robalo grande.' },
    { id: 'gur_faro',           region_id: 'golfo_uraba',      nombre: 'El Faro',                 tipo: 'Estructura submarina', recomendaciones: 'Estructura artificial, concentra pargo y corvina.' },
    { id: 'gur_aguila',         region_id: 'golfo_uraba',      nombre: 'Cerro del Águila',        tipo: 'Corriente oceánica',   recomendaciones: 'Veril profundo, atún aleta amarilla y dorado offshore.' },
    { id: 'gur_bajos',          region_id: 'golfo_uraba',      nombre: 'Bajos',                   tipo: 'Bajo / Montículo',     recomendaciones: 'Bajos interiores, sierra y carite en superficie.' },
    { id: 'gur_veriles',        region_id: 'golfo_uraba',      nombre: 'Veriles',                 tipo: 'Corriente oceánica',   recomendaciones: 'Veriles del Golfo, pesca offshore.' },
    // Puerto Escondido
    { id: 'pe_playa',           region_id: 'puerto_escondido', nombre: 'Playa',                   tipo: 'Fondo arenoso',        recomendaciones: 'Pesca de orilla, sábalo y robalo.' },
    { id: 'pe_tortuguilla',     region_id: 'puerto_escondido', nombre: 'Isla Tortuguilla',        tipo: 'Arrecife de coral',    recomendaciones: 'Isla con arrecife, pargo, mero y carite alrededor.' },
    { id: 'pe_bajo_medio',      region_id: 'puerto_escondido', nombre: 'Bajo del Medio',          tipo: 'Bajo / Montículo',     recomendaciones: 'Bajo coralino central, excelente para pargo rojo.' },
    { id: 'pe_bajo_burbujas',   region_id: 'puerto_escondido', nombre: 'Bajo Burbujas',           tipo: 'Bajo / Montículo',     recomendaciones: 'Actividad volcánica submarina, muy productivo.' },
    { id: 'pe_bajo_orion',      region_id: 'puerto_escondido', nombre: 'Bajo Orión',              tipo: 'Bajo / Montículo',     recomendaciones: 'Bajo profundo, atún y wahoo en temporada.' },
    { id: 'pe_veriles',         region_id: 'puerto_escondido', nombre: 'Veriles',                 tipo: 'Corriente oceánica',   recomendaciones: 'Veriles offshore, dorado y atún aleta.' },
    // Isla Fuerte
    { id: 'if_alrededor',       region_id: 'isla_fuerte',      nombre: 'Alrededor de la Isla',    tipo: 'Arrecife de coral',    recomendaciones: 'Periplo completo, pargo, mero y carite en todos los costados.' },
    { id: 'if_bushnell',        region_id: 'isla_fuerte',      nombre: 'Bajo Bushnell',           tipo: 'Bajo / Montículo',     recomendaciones: 'Bajo histórico, concentración de pargo lunarejo y rojo.' },
    { id: 'if_veril_detras',    region_id: 'isla_fuerte',      nombre: 'Veril detrás de la Isla', tipo: 'Corriente oceánica',   recomendaciones: 'Veril en sotavento, wahoo y dorado en corriente.' },
    { id: 'if_bajos',           region_id: 'isla_fuerte',      nombre: 'Bajos',                   tipo: 'Bajo / Montículo',     recomendaciones: 'Bajos coralinos variados, gran diversidad de especies.' },
    { id: 'if_veril',           region_id: 'isla_fuerte',      nombre: 'Veril',                   tipo: 'Corriente oceánica',   recomendaciones: 'Veril principal, atún y pesca pelágica.' },
    // Santa Marta
    { id: 'sm_pozos_colorados', region_id: 'santa_marta',      nombre: 'Pozos Colorados',         tipo: 'Corriente oceánica',   recomendaciones: 'Zona de upwelling, muy productiva para pesca pelágica.' },
    { id: 'sm_bahia_gaira',     region_id: 'santa_marta',      nombre: 'Bahía de Gaira',          tipo: 'Pelágico abierto',     recomendaciones: 'Bahía abrigada, buena para carite y sierra todo el año.' },
    { id: 'sm_punta_betin',     region_id: 'santa_marta',      nombre: 'Punta Betín',             tipo: 'Corriente oceánica',   recomendaciones: 'Corrientes convergentes, excelente para dorado y atún.' },
    // Barranquilla
    { id: 'baq_bocas_ceniza',   region_id: 'barranquilla',     nombre: 'Bocas de Ceniza',         tipo: 'Estuario',             recomendaciones: 'Delta del Magdalena, concentración de nutrientes. Robalo, sábalo y dorado.' },
    { id: 'baq_pradomar',       region_id: 'barranquilla',     nombre: 'Pradomar',                tipo: 'Fondo arenoso',        recomendaciones: 'Costa norte, sierra y carite en temporada seca.' },
    { id: 'baq_veriles',        region_id: 'barranquilla',     nombre: 'Veriles offshore',        tipo: 'Corriente oceánica',   recomendaciones: 'Veriles a 20-30mn, atún aleta amarilla y wahoo.' },
  ]

  for (const r of regiones) {
    insRegion.run(r.id, r.nombre, r.descripcion, r.estado, r.lat, r.lon)
  }

  for (const s of spots) {
    insSpot.run(s.id, s.region_id, s.nombre, s.tipo, s.recomendaciones)
  }
}