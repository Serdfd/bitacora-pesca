const MONTHS      = ['E','F','M','A','M','J','J','A','S','O','N','D'];
const MONTHS_LONG = ['enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_SHORT  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const MOON_PHASES = [
  { sym:'🌑', name:'Luna nueva',        score:'B',  color:'warn',   diurno:'Bueno — peces hambrientos al amanecer' },
  { sym:'🌒', name:'Creciente joven',   score:'A+', color:'good',   diurno:'Excelente — el mejor momento diurno del mes' },
  { sym:'🌓', name:'Cuarto creciente',  score:'A+', color:'good',   diurno:'Excelente — sierras, barracuda y pargo muy activos' },
  { sym:'🌔', name:'Gibosa creciente',  score:'A',  color:'good',   diurno:'Bueno — sal muy temprano (5:30am)' },
  { sym:'🌕', name:'Luna llena',        score:'D',  color:'danger', diurno:'Difícil — peces saciados de alimentación nocturna' },
  { sym:'🌖', name:'Gibosa menguante',  score:'C',  color:'warn',   diurno:'Regular — mejora 2–3 días después de la llena' },
  { sym:'🌗', name:'Cuarto menguante',  score:'A+', color:'good',   diurno:'Excelente — pargo especialmente activo' },
  { sym:'🌘', name:'Menguante vieja',   score:'A',  color:'good',   diurno:'Bueno — actividad en aumento hacia luna nueva' }
];

const SPECIES = {
  carite_br: {
    common:'Carite / Sierra brasileña', sci:'Scomberomorus brasiliensis', icon:'🐠',
    img:'assets/img/carite.png',
    months:   ['hi','hi','hi','hi','mid','mid','lo','lo','mid','mid','mid','hi'],
    lunaScore:[3,4,5,3,2,4,3,3,4,3,2,3],
    bestMonths:'Dic – Abr', bestHour:'6:00 – 10:00am',
    talla_minima:'50 cm',
    peso_record:'Hasta 5 kg. Promedio captura: 1.5–3 kg',
    cebo:'Rapala plateada Nº11–13, señuelos de pluma, spoons metálicos',
    habitat:'Pelágica costera, 0–30m. Aguas cálidas >24°C, salinidad alta',
    behavior:'Pelágica migratoria. Sigue cardúmenes de anchoa en aguas cálidas. La más abundante del género en el Caribe colombiano.',
    technique:'Trolling 5–8 nudos con rapala plateada. Jigging vertical en bajos con corriente activa.',
    luna:'Cuarto creciente y 3 días antes de luna nueva. Corrientes de sicigia activan los bajos.',
    zones:{
      capurgana:  'Esporádica. Aparece en temporada seca en la entrada al golfo de Urabá.',
      pescondido: 'Muy presente en bajos 8–18km de enero a abril. El bajo lejano es ruta de migración activa.',
      ifuerte:    'Borde norte del Bajo Bushnell dic–mar. Trolling al llegar antes de anclar para pargo.',
      santamarta: 'Presente en aguas abiertas frente a Santa Marta, especialmente ene–mar.',
      barranquilla:'Ocasional en corriente del Magdalena. Mejor en temporada seca ene–feb.'
    }
  },
  sierra: {
    common:'Sierra común / Carite real', sci:'Scomberomorus cavalla', icon:'🐟',
    img:'assets/img/sierra_comun.png',
    months:   ['hi','hi','hi','mid','mid','lo','lo','lo','mid','mid','mid','hi'],
    lunaScore:[3,4,5,3,2,3,3,3,4,3,2,3],
    bestMonths:'Dic – Mar · pico Feb', bestHour:'6:00 – 10:00am',
    talla_minima:'60 cm',
    peso_record:'Hasta 40 kg. Promedio captura: 5–15 kg',
    cebo:'Konahead grande, rapala magnum, feather lures, carnada viva (bonito)',
    habitat:'Pelágica oceánica, 0–60m. Requiere aguas azules y claras >26°C',
    behavior:'La más grande del género. Pelágica, migratoria. Sigue atunes y carnadas grandes. Requiere aguas azules y claras.',
    technique:'Trolling 7–9 nudos con konahead o rapala grande. Línea 40–60lb.',
    luna:'Cuarto creciente y 2–3 días antes de luna llena. Muy activa cuando hay corriente fuerte.',
    zones:{
      capurgana:   'Muy rara. Solo aparece excepcionalmente en temporada seca.',
      pescondido:  'Zona estrella. Bajo lejano (18km) en ruta migratoria del Caribe occidental. Ene–mar.',
      ifuerte:     'Borde exterior del Bajo Bushnell. Trabaja el borde norte con corriente activa.',
      santamarta:  'Presente frente a Taganga y la Bahía de Santa Marta en temporada seca.',
      barranquilla:'Rara en costa. Buscarla offshore en mar abierto frente a Barranquilla ene–feb.'
    }
  },
  sierra_pin: {
    common:'Sierra pintada / Carite pintado', sci:'Scomberomorus regalis', icon:'🐡',
    img:'assets/img/sierra_pintada.png',
    months:   ['mid','hi','hi','hi','mid','mid','mid','lo','mid','mid','hi','mid'],
    lunaScore:[3,4,4,3,2,3,3,3,4,3,2,3],
    bestMonths:'Feb – Abr y Nov', bestHour:'6:30 – 10:30am',
    talla_minima:'40 cm',
    peso_record:'Hasta 9 kg. Promedio captura: 1–3 kg',
    cebo:'Señuelos pequeños 7–9cm, jigs pluma, spoons ligeros plateados o dorados',
    habitat:'Pelágica costera y arrecifal, 0–20m. Asociada a estructuras coralinas',
    behavior:'Más pequeña que la cavalla. Colorido distintivo con manchas. Frecuente en arrecifes y estructuras costeras.',
    technique:'Trolling ligero o casting con señuelos pequeños. Spinning 20–30lb.',
    luna:'Cuarto creciente. Más activa que la cavalla incluso en luna nueva.',
    zones:{
      capurgana:   'La más frecuente del género aquí. Arrecifes de Capurganá y Sapzurro en feb–abr.',
      pescondido:  'Bajos someros y alrededor de Tortuguilla. También presente en bajos intermedios.',
      ifuerte:     'Alrededor de la isla y bordes del Bajo Bushnell. Todo el año, pico en temporada seca.',
      santamarta:  'Arrecifes de Taganga y costa de Santa Marta. Buena opción todo el año.',
      barranquilla:'Costas e islas cercanas. Búscala en estructuras y arrecifes artificiales.'
    }
  },
  jurel: {
    common:'Jurel aleta amarilla', sci:'Caranx hippos', icon:'🟡',
    img:'assets/img/jurel_aleta_amarilla.png',
    months:   ['mid','mid','hi','hi','hi','mid','mid','mid','hi','hi','mid','mid'],
    lunaScore:[3,3,4,4,4,3,3,3,4,4,3,3],
    bestMonths:'Mar – May y Sep – Oct', bestHour:'6:00 – 11:00am',
    talla_minima:'45 cm',
    peso_record:'Hasta 32 kg. Promedio captura: 2–8 kg',
    cebo:'Poppers, jigs metálicos 40–80g, señuelos de superficie, carnada viva',
    habitat:'Pelágica costera y arrecifal, 0–25m. Gregaria, forma cardúmenes grandes',
    behavior:'Gregario, caza en cardúmenes. Muy agresivo con señuelos en superficie. Aguanta más horas que otras especies.',
    technique:'Casting con poppers o jigs en superficie. Spinning 20–30lb cerca de estructuras y puntas rocosas.',
    luna:'Poco selectivo con la luna. Lo clave: pescar en cambio de marea (entrada o salida).',
    zones:{
      capurgana:   'Puntas rocosas al amanecer. Punta Sapzurro concentra carnada y jurel muy activo.',
      pescondido:  'Alrededor de Tortuguilla y bajos someros. Ejemplares más grandes en bajos offshore.',
      ifuerte:     'Zona privilegiada. Punta norte y borde del Bajo Bushnell. Muy activo con corriente.',
      santamarta:  'Frente a Taganga y Bahía de Gaira. Activo todo el año cerca de puntas rocosas.',
      barranquilla:'Bocas del Magdalena y estructuras offshore. Activo en temporada de lluvias también.'
    }
  },
  barracuda: {
    common:'Barracuda', sci:'Sphyraena barracuda', icon:'⚡',
    img:'assets/img/barracuda.png',
    months:   ['hi','hi','hi','mid','mid','lo','lo','lo','mid','mid','hi','hi'],
    lunaScore:[3,4,5,3,2,4,3,4,5,3,2,3],
    bestMonths:'Nov – Mar', bestHour:'5:30 – 9:00am',
    talla_minima:'50 cm',
    peso_record:'Hasta 50 kg. Promedio captura: 3–10 kg',
    cebo:'Señuelos plateados brillantes, tube lures, plugs de superficie, rapalas plateadas',
    habitat:'Pelágica y arrecifal, 0–100m. Cazadora visual, necesita aguas claras y transparentes',
    behavior:'Cazadora visual. Necesita agua clara. Se mueve a profundidades con lluvia o turbidez.',
    technique:'Trolling superficial con señuelos plateados. Casting con plug en bordes de arrecife.',
    luna:'2–3 días antes de luna llena y cuarto creciente. Evita el día exacto de luna llena.',
    zones:{
      capurgana:   'Borde de arrecife de coral frente a Sapzurro. Punta Sapzurro al amanecer.',
      pescondido:  'Bajos 8–18km. El bajo lejano (18km) tiene ejemplares más grandes por menor presión.',
      ifuerte:     'Borde exterior del Bajo Bushnell donde el fondo cae. Muy productiva al amanecer.',
      santamarta:  'Aguas claras frente a Taganga. Muy productiva en temporada seca con buen fondo rocoso.',
      barranquilla:'Menos frecuente por turbidez del Magdalena. Buscarla offshore en agua azul.'
    }
  },
  pargo: {
    common:'Pargo', sci:'Lutjanus spp.', icon:'🎣',
    img:'assets/img/pargo.png',
    months:   ['hi','hi','hi','mid','mid','mid','mid','mid','mid','lo','mid','hi'],
    lunaScore:[2,3,5,3,2,3,3,4,5,3,2,3],
    bestMonths:'Dic – Mar · estable todo el año', bestHour:'5:30 – 8:30am y 2:00 – 4:00pm',
    talla_minima:'35 cm',
    peso_record:'Hasta 20 kg (pargo rojo). Promedio captura: 1–5 kg',
    cebo:'Carnada viva o muerta (calamar, machuelo), jigs verticales 60–120g, señuelos de fondo',
    habitat:'Demersal, 10–100m. Asociado a fondos rocosos, arrecifes y estructuras. Sedentario',
    behavior:'Demersal, ligado a estructuras. Más activo con corriente moderada. Pargo rojo, lunarejo y amarillo en tus zonas.',
    technique:'Fondo con carnada viva o muerta. Jigging vertical jigs 60–120g. Anclado en bordes de bajo.',
    luna:'Cuarto creciente y menguante (días 8–12 del ciclo). En luna llena/nueva come de noche.',
    zones:{
      capurgana:   'Pargo lunarejo y amarillo en arrecifes costeros. Fondos 10–25m cerca de coral.',
      pescondido:  'Pargo rojo y amarillo en bajos 8–18km. Mayor profundidad = ejemplares más grandes.',
      ifuerte:     'El mejor spot para pargo rojo. Bajo Bushnell con cimas 15–40m. Ancla en bordes del bajo.',
      santamarta:  'Arrecifes de Taganga y fondos rocosos. Pargo rojo presente en temporada seca.',
      barranquilla:'Estructuras offshore y naufragios cercanos. Pargo amarillo más común en esta zona.'
    }
  },
  tarpon: {
    common:'Tarpon / Sábalo', sci:'Megalops atlanticus', icon:'🦈',
    img:'assets/img/tarpon.png',
    months:   ['lo','lo','mid','mid','hi','hi','hi','hi','mid','mid','lo','lo'],
    lunaScore:[3,3,3,3,2,2,2,3,3,3,3,3],
    bestMonths:'May – Ago · aguas cálidas y lluvias', bestHour:'5:30 – 8:00am (y justo antes de las 4pm)',
    talla_minima:'Captura y suelta recomendada — trofeo',
    peso_record:'Hasta 160 kg. Promedio captura: 20–60 kg',
    cebo:'Streamer grande, señuelos de superficie, carnada viva (lisa, mojarra), muñecos',
    habitat:'Costera y estuarina, 0–10m. Bocas de ríos, manglares y lagunas. Resiste aguas turbias',
    behavior:'Migratoria. Presente en bocas de ríos, manglares y aguas someras costeras. Pesca de trofeo — generalmente captura y suelta.',
    technique:'Señuelos grandes, streamer o carnada viva. Línea pesada 50–80lb. Mucha paciencia.',
    luna:'Luna llena y nueva. El tarpon es nocturno pero muy activo al amanecer en esas fases.',
    zones:{
      capurgana:   'Principal y casi único spot tuyo para tarpon. Bocas de quebradas y manglares en temporada de lluvias (may–ago).',
      pescondido:  'Bocas de ríos cercanos en temporada de lluvias. Menos accesible que Capurganá.',
      ifuerte:     'Ocasional. Bordea los manglares de la isla en temporada de lluvias.',
      santamarta:  'Bocas de ríos y ciénagas cercanas. Temporada may–ago, requiere exploración local.',
      barranquilla:'Bocas del Magdalena y Ciénaga Grande. Buena zona para tarpon en temporada de lluvias.'
    }
  },
  wahoo: {
    common:'Wahoo', sci:'Acanthocybium solandri', icon:'💨',
    img:'assets/img/wahoo.png',
    months:   ['mid','mid','hi','hi','hi','mid','lo','lo','mid','mid','hi','mid'],
    lunaScore:[3,4,5,3,2,4,3,3,4,3,2,3],
    bestMonths:'Mar – May y Nov', bestHour:'6:00 – 10:00am · amanecer crítico',
    talla_minima:'65 cm',
    peso_record:'Hasta 83 kg. Promedio captura: 8–25 kg',
    cebo:'Konahead grande (rojo/negro), feather lures, rapalas de alta velocidad, jigs pesados 150–300g',
    habitat:'Pelágica oceánica, 0–12m superficie. Aguas azules >27°C, alta salinidad. Solitario',
    behavior:'Uno de los peces más rápidos del océano. Solitario. Aguas azules offshore, profundidades 30–100m. Dientes muy afilados.',
    technique:'Trolling rápido 10–14 nudos con feather o konahead. Usar cable de acero o fluorocarbono pesado.',
    luna:'Cuarto creciente y 2–3 días antes de luna nueva. Requiere condiciones de blue-water perfectas.',
    zones:{
      capurgana:   'Muy raro cerca de costa. Requiere acceso a aguas profundas offshore.',
      pescondido:  'El bajo lejano (18km) es el mejor acceso. Requiere días de mar perfecto. Mar–may.',
      ifuerte:     'Borde exterior del Bajo Bushnell en aguas azules adyacentes. Posible mar–abr.',
      santamarta:  'Aguas profundas frente a Santa Marta. Requiere embarcación y días de mar en calma.',
      barranquilla:'Raro. Solo en condiciones perfectas muy offshore al norte de Barranquilla.'
    }
  },
  dorado: {
    common:'Dorado / Mahi-Mahi', sci:'Coryphaena hippurus', icon:'🌈',
    img:'assets/img/dorado.png',
    months:   ['mid','mid','hi','hi','hi','mid','mid','lo','mid','mid','hi','mid'],
    lunaScore:[3,4,5,3,2,4,3,3,4,3,2,3],
    bestMonths:'Mar – May y Nov', bestHour:'6:00 – 11:00am',
    talla_minima:'50 cm',
    peso_record:'Hasta 40 kg. Promedio captura: 3–10 kg',
    cebo:'Señuelos de colores vivos (amarillo/verde/azul), rapalas, skirts, carnada bajo objeto flotante',
    habitat:'Pelágica oceánica, 0–85m. Aguas azules cálidas. Se agrega bajo objetos flotantes y sargazo',
    behavior:'Pelágico offshore. Se agrega bajo objetos flotantes (palos, sargazo). Van en cardúmenes — si ves uno, hay más.',
    technique:'Trolling con señuelos de colores vivos (amarillo/verde). Si picas uno, para y tira más señuelos.',
    luna:'Cuarto creciente es el mejor. Muy sensible al color del agua — solo en blue-water.',
    zones:{
      capurgana:   'Raro cerca de costa. Aparece en aguas azules offshore en temporada.',
      pescondido:  'El bajo lejano y aguas circundantes. Busca objetos flotantes en el camino al bajo.',
      ifuerte:     'Borde exterior del Bajo Bushnell. Trolling en aguas azules adyacentes mar–abr.',
      santamarta:  'Aguas abiertas frente a Santa Marta. Busca sargazo flotante en temporada mar–may.',
      barranquilla:'Muy ocasional. Solo offshore en condiciones perfectas de blue-water.'
    }
  },

  // ─── NUEVAS ESPECIES ──────────────────────────────────────────────────────

  atun_aleta: {
    common:'Atún aleta amarilla', sci:'Thunnus albacares', icon:'🔱',
    img:'assets/img/atun_aleta_amarilla.png',
    months:   ['mid','mid','hi','hi','hi','mid','mid','lo','mid','hi','hi','mid'],
    lunaScore:[3,4,5,4,2,3,3,3,4,4,3,3],
    bestMonths:'Mar – May y Oct – Nov', bestHour:'5:30 – 10:00am · amanecer crítico',
    talla_minima:'50 cm',
    peso_record:'Hasta 200 kg. Promedio captura: 10–40 kg',
    cebo:'Konahead mediano-grande, feather lures, rapalas magnum, carnada viva (bonito, barrilete), jigs 150–400g',
    habitat:'Pelágica oceánica, 0–250m. Aguas azules >24°C, termoclina marcada. Altamente migratorio',
    behavior:'El atún más codiciado del Caribe. Altamente migratorio, sigue termoclinas y corrientes cálidas. Forma cardúmenes mixtos con barrilete y delfines. Cuando ves delfines, puede haber atún debajo.',
    technique:'Trolling 7–10 nudos con feather o konahead. Chunking con carnada cortada en corriente. Jigging con jigs pesados 200–400g en profundidades 60–150m.',
    luna:'Cuarto creciente y gibosa creciente. Muy activo en mareas de sicigia cuando la corriente activa el upwelling.',
    zones:{
      capurgana:   'Muy raro en zona costera. Requiere salir offshore en condiciones perfectas.',
      pescondido:  'Bajo lejano (18km) y más allá en aguas azules profundas. Mar–may en condiciones ideales.',
      ifuerte:     'Borde exterior del Bajo Bushnell y aguas adyacentes >100m. Posible abr–may con buena corriente.',
      santamarta:  'Aguas profundas offshore. Uno de los mejores accesos del Caribe colombiano en temporada seca.',
      barranquilla:'Raro. Solo condiciones perfectas offshore. Muy lejano de la costa — requiere embarcación grande.'
    }
  },
  atun_patudo: {
    common:'Atún patudo / Bigeye', sci:'Thunnus obesus', icon:'👁️',
    img:'assets/img/atun_patudo.png',
    months:   ['mid','mid','hi','hi','mid','lo','lo','lo','mid','hi','hi','mid'],
    lunaScore:[3,4,5,3,2,3,3,3,4,4,3,3],
    bestMonths:'Mar – Abr y Oct – Nov', bestHour:'Amanecer y crepúsculo · 5:30–8:00am y 4:00–6:00pm',
    talla_minima:'50 cm',
    peso_record:'Hasta 210 kg. Promedio captura: 15–50 kg',
    cebo:'Jigs pesados 300–500g (jigging profundo), konahead, carnada viva (barrilete, bonito)',
    habitat:'Pelágica oceánica y mesopelágica, 0–500m. Baja a profundidades en el día, sube de noche. Aguas >22°C',
    behavior:'Más grande que el aleta amarilla en promedio. Ojos grandes adaptados a poca luz — muy activo al amanecer y atardecer. Se alimenta en profundidades durante el día y sube a la superficie de noche. Pez de trofeo.',
    technique:'Jigging profundo 150–300m con jigs pesados 300–500g. Trolling nocturno o en penumbra. Línea 80–130lb.',
    luna:'Cuarto creciente y menguante. Sube más a superficie en noches de luna nueva.',
    zones:{
      capurgana:   'Prácticamente inaccesible desde costa. Solo en expediciones offshore muy planificadas.',
      pescondido:  'Aguas muy profundas más allá del bajo lejano (>25km). Requiere embarcación offshore.',
      ifuerte:     'Aguas profundas al norte de Isla Fuerte. Posible en expediciones de jigging profundo.',
      santamarta:  'El mejor acceso del Caribe colombiano. Aguas profundas rápidamente accesibles frente a Santa Marta.',
      barranquilla:'Muy raro. Solo offshore muy alejado de la costa en condiciones perfectas.'
    }
  },
  barrilete: {
    common:'Barrilete', sci:'Katsuwonus pelamis', icon:'🌀',
    img:'assets/img/barrilete.png',
    months:   ['mid','mid','hi','hi','hi','hi','mid','mid','hi','hi','hi','mid'],
    lunaScore:[3,3,4,4,3,3,3,3,4,4,3,3],
    bestMonths:'Mar – Jun y Sep – Nov', bestHour:'6:00 – 11:00am',
    talla_minima:'40 cm',
    peso_record:'Hasta 35 kg. Promedio captura: 2–8 kg',
    cebo:'Señuelos pequeños y medianos tipo feather, jigs 40–100g, carnada viva pequeña, señuelos de colores vivos',
    habitat:'Pelágica oceánica y costera, 0–260m. Muy adaptable — el más costero de los atunes. Aguas >18°C',
    behavior:'El atún más abundante del mundo. Forma cardúmenes enormes, frecuentemente asociado con delfines, tortugas y objetos flotantes. Excelente como carnada viva para sierra cavalla y wahoo. Muy agresivo con señuelos.',
    technique:'Cualquier técnica funciona — trolling, casting, jigging. Ideal para spinning ligero. Si hay cardumen visible, cualquier señuelo en movimiento pica.',
    luna:'Poco selectivo. Activo en casi todas las fases — lo clave es encontrar el cardumen.',
    zones:{
      capurgana:   'Presente en aguas abiertas. Aparece cuando hay corriente activa y agua azul en temporada seca.',
      pescondido:  'Muy presente en los bajos offshore. Excelente como carnada viva para sierras grandes en el bajo lejano.',
      ifuerte:     'Borde del Bajo Bushnell y aguas adyacentes. Frecuente cuando hay corriente activa.',
      santamarta:  'Abundante en aguas abiertas frente a Santa Marta. Fácil de capturar para usar como carnada.',
      barranquilla:'Presente en aguas offshore. Cardúmenes visibles con fragatas en temporada seca.'
    }
  },
  atun_negro: {
    common:'Atún negro / Blackfin', sci:'Thunnus atlanticus', icon:'🖤',
    img:'assets/img/atun_negro.png',
    months:   ['mid','mid','hi','hi','hi','mid','mid','mid','hi','hi','mid','mid'],
    lunaScore:[3,4,5,3,2,4,3,3,4,4,3,3],
    bestMonths:'Mar – May y Sep – Oct', bestHour:'6:00 – 10:00am',
    talla_minima:'40 cm',
    peso_record:'Hasta 22 kg. Promedio captura: 2–6 kg',
    cebo:'Jigs medianos 60–150g, feather lures pequeños, carnada viva (barrilete pequeño, sardinas), señuelos de colores vivos',
    habitat:'Pelágica costera y oceánica, 0–250m. El único atún endémico del Atlántico. Aguas >20°C, más costero que otros atunes',
    behavior:'El más pequeño de los atunes del Caribe y el único endémico del Atlántico. Más accesible desde costa que el aleta amarilla. Frecuentemente asociado a estructuras flotantes y arrecifes externos. Excelente para fly fishing offshore.',
    technique:'Jigging medio 60–150m con jigs medianos. Trolling con feathers pequeños o carnada viva. Spinning 20–40lb. Fly fishing con línea de hundimiento rápido.',
    luna:'Cuarto creciente y gibosa creciente. Activo al amanecer en casi cualquier fase lunar.',
    zones:{
      capurgana:   'Ocasional en aguas claras offshore. Aparece en temporada seca frente a arrecifes externos.',
      pescondido:  'Presente en bajos intermedios y lejanos. Más accesible que el aleta amarilla desde esta zona.',
      ifuerte:     'Borde del Bajo Bushnell y aguas adyacentes. Frecuente en temporada seca mar–may.',
      santamarta:  'Buena presencia en aguas abiertas. Más accesible desde Santa Marta que otras especies de atún.',
      barranquilla:'Offshore en condiciones de blue-water. Requiere salir a aguas limpias fuera de la influencia del Magdalena.'
    }
  },
  bonito: {
    common:'Bonito / Falso bonito', sci:'Euthynnus alletteratus', icon:'🔵',
    img:'assets/img/bonito.png',
    months:   ['mid','mid','hi','hi','hi','hi','mid','mid','hi','hi','hi','mid'],
    lunaScore:[3,3,4,4,3,3,3,3,4,4,3,3],
    bestMonths:'Mar – Jun y Sep – Nov', bestHour:'6:00 – 11:00am',
    talla_minima:'35 cm',
    peso_record:'Hasta 12 kg. Promedio captura: 1–4 kg',
    cebo:'Señuelos pequeños tipo feather o spoon, jigs 20–60g, carnada viva pequeña, cualquier señuelo brillante',
    habitat:'Pelágica costera, 0–200m. Muy costera — la más accesible de la familia de los túnidos. Aguas >18°C',
    behavior:'El túnido más accesible y abundante del Caribe colombiano. Siempre presente cerca de costa. Excelente carnada viva para peces grandes como sierra cavalla, wahoo y barracuda. Muy agresivo y fácil de capturar — ideal para iniciarse en pesca pelágica.',
    technique:'Cualquier señuelo en movimiento funciona. Trolling ligero, casting spinning, jigging superficial. Ideal para equipo ligero 15–20lb. Si hay cardumen visible, lanza al frente del movimiento.',
    luna:'Muy poco selectivo con la luna. Presente en todas las fases — lo clave es la presencia de carnada en el área.',
    zones:{
      capurgana:   'Muy abundante en toda la zona costera. Presente todo el año. El primero que encontrarás al salir.',
      pescondido:  'Abundante en bajos someros e intermedios. Clave como carnada viva para los bajos offshore.',
      ifuerte:     'Muy presente alrededor de la isla y en el Bajo Bushnell. Fácil de conseguir como carnada.',
      santamarta:  'Muy abundante. Presente en toda la franja costera de Santa Marta todo el año.',
      barranquilla:'Presente en aguas costeras. Más abundante que otros túnidos cerca de la costa en esta zona.'
    }
  }
};

const REGIONES = [
  {
    id: "sapzurro_capurgana",
    nombre: "Sapzurro · Capurganá",
    descripcion:
      "Zona costera mixta con playas, islotes y veriles cercanos.",

    spots: [
      {
        id: "la_miel",
        nombre: "La Miel",
        estado: "explorado",

        tipo: "playa",

        estructuras: [
          "arena",
          "corriente"
        ],

        especiesPotenciales: [
          "jurel",
          "sierra",
          "barracuda",
          "sabalo"
        ],

        recomendaciones: [
          "Buscar actividad temprano.",
          "Revisar agua limpia.",
          "Casting paralelo a playa."
        ],

        notas:
          "Zona costera con corriente variable y presencia frecuente de carnada."
      },

      {
        id: "cabo_tiburon",
        nombre: "Cabo Tiburón",
        estado: "explorado",

        tipo: "punta",

        estructuras: [
          "roca",
          "corriente"
        ],

        especiesPotenciales: [
          "jurel",
          "sierra",
          "barracuda",
          "sabalo"
        ],

        recomendaciones: [
          "Amanecer suele ser mejor.",
          "Trabajar espuma y corrientes laterales."
        ],

        notas:
          "Mezcla de playa y roca con buena movilidad de depredadores."
      },

      {
        id: "bahia_sapzurro",
        nombre: "Bahía Sapzurro",
        estado: "explorado",

        tipo: "bahia",

        estructuras: [
          "arena",
          "corriente"
        ],

        especiesPotenciales: [
          "barracuda",
          "jurel",
          "pargo"
        ],

        recomendaciones: [
          "Observar actividad superficial.",
          "Buscar sardinas y movimiento de carnada."
        ],

        notas:
          "Zona protegida con actividad variable según corriente."
      },

      {
        id: "bajos_sapzurro",
        nombre: "Bajos",
        estado: "explorado",

        tipo: "bajo",

        estructuras: [
          "roca",
          "coral"
        ],

        especiesPotenciales: [
          "pargo",
          "mero",
          "jurel"
        ],

        recomendaciones: [
          "Jigging alrededor de estructura.",
          "Trabajar profundo."
        ],

        notas:
          "Estructura con potencial para peces de fondo."
      },

      {
        id: "islotes_capurgana",
        nombre: "Islotes",
        estado: "explorado",

        tipo: "islote",

        estructuras: [
          "roca"
        ],

        especiesPotenciales: [
          "barracuda",
          "jurel",
          "sierra"
        ],

        recomendaciones: [
          "Trabajar perímetros y sombras.",
          "Casting cerca de roca."
        ],

        notas:
          "Alta probabilidad de depredadores emboscando carnada."
      },

      {
        id: "veril_capurgana",
        nombre: "Veril",
        estado: "explorado",

        tipo: "veril",

        estructuras: [
          "dropoff",
          "corriente"
        ],

        especiesPotenciales: [
          "atun",
          "mahi",
          "sierra"
        ],

        recomendaciones: [
          "Buscar líneas de agua.",
          "Seguir aves trabajando."
        ],

        notas:
          "Zona pelágica dependiente de corriente y temperatura."
      }
    ]
  },

  {
    id: "acandi",
    nombre: "Acandí",
    descripcion:
      "Zona de playas extensas, desembocaduras y bajos costeros.",

    spots: [
      {
        id: "desembocadura_tolo",
        nombre: "Desembocadura del Tolo",
        estado: "explorado",

        tipo: "desembocadura",

        estructuras: [
          "corriente",
          "arena"
        ],

        especiesPotenciales: [
          "sabalo",
          "robalo",
          "jurel"
        ],

        recomendaciones: [
          "Mejor con corriente saliendo.",
          "Buscar mezcla de agua."
        ],

        notas:
          "Cambios de salinidad generan actividad impredecible."
      },

      {
        id: "playona",
        nombre: "Playona",
        estado: "explorado",

        tipo: "playa",

        estructuras: [
          "arena"
        ],

        especiesPotenciales: [
          "sierra",
          "jurel",
          "barracuda"
        ],

        recomendaciones: [
          "Casting largo temprano.",
          "Observar oleaje y carnada."
        ],

        notas:
          "Playa extensa con tránsito de depredadores."
      },

      {
        id: "bajos_acandi",
        nombre: "Bajos",
        estado: "explorado",

        tipo: "bajo",

        estructuras: [
          "roca",
          "coral"
        ],

        especiesPotenciales: [
          "mero",
          "pargo",
          "jurel"
        ],

        recomendaciones: [
          "Trabajar estructura lentamente.",
          "Buscar peces pegados al fondo."
        ],

        notas:
          "Posible presencia de peces grandes de fondo."
      },

      {
        id: "islotes_acandi",
        nombre: "Islotes",
        estado: "explorado",

        tipo: "islote",

        estructuras: [
          "roca"
        ],

        especiesPotenciales: [
          "sierra",
          "barracuda",
          "jurel"
        ],

        recomendaciones: [
          "Revisar corrientes laterales.",
          "Buscar sombra y actividad."
        ],

        notas:
          "Buena actividad con corriente activa."
      }
    ]
  },

  {
    id: "golfo_uraba",
    nombre: "Golfo de Urabá",
    descripcion:
      "Ecosistema variable con influencia de agua dulce y grandes corrientes.",

    spots: [
      {
        id: "ensenada_rio_negro",
        nombre: "Ensenada Río Negro",
        estado: "explorado",

        tipo: "ensenada",

        estructuras: [
          "corriente"
        ],

        especiesPotenciales: [
          "jurel",
          "sierra",
          "sabalo"
        ],

        recomendaciones: [
          "Buscar mezcla de agua.",
          "Observar sardina activa."
        ],

        notas:
          "Alta variabilidad según lluvias y descarga del río."
      },

      {
        id: "el_faro",
        nombre: "El Faro",
        estado: "explorado",

        tipo: "punta",

        estructuras: [
          "roca"
        ],

        especiesPotenciales: [
          "barracuda",
          "jurel"
        ],

        recomendaciones: [
          "Revisar corrientes golpeando estructura."
        ],

        notas:
          "Punto costero con actividad intermitente."
      },

      {
        id: "cerro_aguila",
        nombre: "Cerro del Águila",
        estado: "explorado",

        tipo: "costa",

        estructuras: [
          "roca"
        ],

        especiesPotenciales: [
          "jurel",
          "sierra"
        ],

        recomendaciones: [
          "Observar aves trabajando cerca de costa."
        ],

        notas:
          "Costa rocosa con tránsito de depredadores."
      },

      {
        id: "bajos_uraba",
        nombre: "Bajos",
        estado: "explorado",

        tipo: "bajo",

        estructuras: [
          "roca",
          "cascajo"
        ],

        especiesPotenciales: [
          "mero",
          "pargo",
          "cobia"
        ],

        recomendaciones: [
          "Jigging y fondo profundo."
        ],

        notas:
          "Estructura de holding para peces grandes."
      },

      {
        id: "veriles_uraba",
        nombre: "Veriles",
        estado: "explorado",

        tipo: "veril",

        estructuras: [
          "dropoff",
          "corriente"
        ],

        especiesPotenciales: [
          "sierra",
          "mahi",
          "atun"
        ],

        recomendaciones: [
          "Trolling sobre cambios de agua."
        ],

        notas:
          "Mejor cuando aparecen líneas verde-azul."
      },

      {
        id: "desembocadura_rio_negro",
        nombre: "Desembocadura Río Negro",
        estado: "explorado",

        tipo: "desembocadura",

        estructuras: [
          "corriente",
          "palizadas"
        ],

        especiesPotenciales: [
          "sabalo",
          "robalo",
          "jurel"
        ],

        recomendaciones: [
          "Corriente saliendo suele activar depredadores."
        ],

        notas:
          "Mezcla fuerte de agua dulce y salada."
      }
    ]
  }
]

/* =========================================================
   TIPOS DE SPOT
========================================================= */

const TIPOS_SPOT = [
  "playa",
  "bajo",
  "veril",
  "desembocadura",
  "islote",
  "isla",
  "bahia",
  "ensenada",
  "costa",
  "punta",
  "canal"
]

/* =========================================================
   ESTRUCTURAS
========================================================= */

const ESTRUCTURAS = [
  "roca",
  "coral",
  "arena",
  "cascajo",
  "piedras",
  "corriente",
  "dropoff",
  "pecio",
  "palizadas",
  "manglar",
  "arrecife"
]