// Cálculos lunares para bitácora de pesca
// Coordenadas base: Puerto Escondido, Colombia (9.5°N, 75.9°W)

export type FaseLunar = 'nueva' | 'creciente_creciente' | 'cuarto_creciente' | 'gibosa_creciente' | 'llena' | 'gibosa_menguante' | 'cuarto_menguante' | 'creciente_menguante'
export type Calificacion = 'A+' | 'A' | 'B' | 'D'

export interface InfoLunar {
  fase: FaseLunar
  porcentaje: number
  icono: string
  nombre: string
  calificacion: Calificacion
  colorCalificacion: string
  descripcion: string
  recomendaciones: string[]
  diasHastaLlena: number
  diasHastaNueva: number
}

export interface VentanaPesca {
  inicio: string
  fin: string
  calidad: 'excelente' | 'buena' | 'regular'
  etiqueta: string
  motivo: string
}

/** Calcula la edad de la luna en días (0-29.53) */
export function edadLunaEnDias(fecha: Date = new Date()): number {
  const LUNA_NUEVA_REFERENCIA = new Date('2000-01-06T18:14:00Z')
  const CICLO_LUNAR = 29.530588853
  const diff = (fecha.getTime() - LUNA_NUEVA_REFERENCIA.getTime()) / (1000 * 60 * 60 * 24)
  return ((diff % CICLO_LUNAR) + CICLO_LUNAR) % CICLO_LUNAR
}

/** Calcula % de iluminación (0-100) */
export function porcentajeIluminacion(edadDias: number): number {
  const angulo = (edadDias / 29.530588853) * 2 * Math.PI
  return Math.round(((1 - Math.cos(angulo)) / 2) * 100)
}

/** Determina la fase lunar detallada */
export function getFaseLunar(edadDias: number): FaseLunar {
  if (edadDias < 1.85)  return 'nueva'
  if (edadDias < 7.38)  return 'creciente_creciente'
  if (edadDias < 9.22)  return 'cuarto_creciente'
  if (edadDias < 14.77) return 'gibosa_creciente'
  if (edadDias < 16.61) return 'llena'
  if (edadDias < 22.15) return 'gibosa_menguante'
  if (edadDias < 23.99) return 'cuarto_menguante'
  return 'creciente_menguante'
}

const DATOS_FASE: Record<FaseLunar, {
  icono: string
  nombre: string
  calificacion: Calificacion
  colorCalificacion: string
  descripcion: string
  recomendaciones: string[]
}> = {
  nueva: {
    icono: '🌑',
    nombre: 'Luna Nueva',
    calificacion: 'A+',
    colorCalificacion: 'text-green-400',
    descripcion: 'Luna Nueva — Excelente. Los peces se alimentan activamente sin luz lunar que los sacie por la noche. Las mareas son más pronunciadas (mareas vivas), generando mayor movimiento de carnada y activando la cadena alimenticia desde el fondo hasta la superficie.',
    recomendaciones: [
      'Excelente para pesca de fondo — pargos, meros y corvinas muy activos',
      'Señuelos oscuros o con destellos para simular carnada natural',
      'Madrugar vale la pena — ventana AM es excepcional',
      'Jigging y spinning en estructuras submarinas con alta efectividad',
      'Aprovechar los primeros 2 días después de luna nueva',
    ],
  },
  creciente_creciente: {
    icono: '🌒',
    nombre: 'Luna Creciente',
    calificacion: 'A',
    colorCalificacion: 'text-green-300',
    descripcion: 'Luna Creciente — Muy Buena. Las mareas están en aumento activo, generando corrientes que mueven la carnada. Los depredadores aprovechan estas condiciones para emboscar presas. La luz lunar nocturna aún es poca, por lo que los peces compensan alimentándose de día.',
    recomendaciones: [
      'Pesca de superficie muy efectiva — dorados y carites en acción',
      'Trolling con señuelos pequeños imitando peces voladores',
      'Las primeras 3 horas de la mañana son las mejores',
      'Buscar cambios de color de agua y corrientes visibles',
      'Señuelos en tonos azul/verde que imiten carnada pelágica',
    ],
  },
  cuarto_creciente: {
    icono: '🌓',
    nombre: 'Cuarto Creciente',
    calificacion: 'A',
    colorCalificacion: 'text-green-300',
    descripcion: 'Cuarto Creciente — Muy Buena. Mitad del ciclo de crecimiento lunar. Las mareas vivas están activas, excelente para pesca en corrientes y estructuras. Los peces de arrecife están muy activos aprovechando el movimiento de agua.',
    recomendaciones: [
      'Ideal para pesca en arrecifes y estructuras rocosas',
      'Currican y trolling paralelo a la costa',
      'Meros y pargos en puntos de corriente',
      'Usar carnada viva cuando sea posible',
      'Tarde-noche comienza a ser más difícil por la luz lunar',
    ],
  },
  gibosa_creciente: {
    icono: '🌔',
    nombre: 'Gibosa Creciente',
    calificacion: 'B',
    colorCalificacion: 'text-yellow-400',
    descripcion: 'Gibosa Creciente — Moderada. La luna ilumina gran parte de la noche, los peces se alimentaron bien durante la madrugada. Durante el día muestran actividad reducida pero aún hay ventanas buenas temprano en la mañana.',
    recomendaciones: [
      'Enfocarse estrictamente en la ventana de amanecer',
      'Pesca más profunda para encontrar peces en reposo activo',
      'Señuelos más naturales y de menor tamaño',
      'Considerar cambiar de spot si no hay actividad en 30 min',
      'La tarde puede mejorar conforme se acerca la puesta del sol',
    ],
  },
  llena: {
    icono: '🌕',
    nombre: 'Luna Llena',
    calificacion: 'D',
    colorCalificacion: 'text-red-400',
    descripcion: 'Luna Llena — Difícil. Los peces se alimentaron intensamente durante toda la noche bajo la intensa luz lunar. Durante el día están saciados y se refugian en aguas más profundas. Las mareas vivas pueden crear corrientes fuertes que dificultan la presentación del señuelo.',
    recomendaciones: [
      'Salir muy temprano antes del amanecer — única ventana viable',
      'Pesca de fondo profundo donde los peces se refugian',
      'Señuelos pequeños y naturales — peces exigentes y selectivos',
      'Ideal para explorar nuevas zonas o practicar técnica',
      'No desistir — siempre hay individuos hambrientos, solo menos',
    ],
  },
  gibosa_menguante: {
    icono: '🌖',
    nombre: 'Gibosa Menguante',
    calificacion: 'B',
    colorCalificacion: 'text-yellow-400',
    descripcion: 'Gibosa Menguante — Moderada mejorando. La luna comienza a retirarse, los peces empiezan a recuperar su ritmo de alimentación diurna. Las tardes son progresivamente mejores. Tendencia positiva hacia cuarto menguante.',
    recomendaciones: [
      'Las tardes comienzan a ser más productivas que los días anteriores',
      'Pesca en transición — probar diferentes profundidades',
      'Señuelos de tamaño mediano con algo de brillo',
      'Muy buenos resultados en la hora dorada (antes de puesta del sol)',
      'Pesca nocturna empieza a ser viable con luz artificial',
    ],
  },
  cuarto_menguante: {
    icono: '🌗',
    nombre: 'Cuarto Menguante',
    calificacion: 'A',
    colorCalificacion: 'text-green-300',
    descripcion: 'Cuarto Menguante — Muy Buena. La luna sale tarde en la noche, los peces han estado activos al amanecer sin luz lunar que los perturbe. Excelente actividad diurna, especialmente en la mañana.',
    recomendaciones: [
      'Amanecer excepcional — vale la pena madrugar',
      'Toda la mañana tiene buen potencial',
      'Carnada viva muy efectiva en esta fase',
      'Pargo rojo y pargo lunarejo especialmente activos',
      'Aprovechar estructuras submarinas conocidas',
    ],
  },
  creciente_menguante: {
    icono: '🌘',
    nombre: 'Luna Menguante',
    calificacion: 'A',
    colorCalificacion: 'text-green-300',
    descripcion: 'Luna Menguante — Buena. Transición hacia luna nueva. Los peces están en un ciclo activo de alimentación diurna, compensando la reducción de luz nocturna. Excelente para casi todas las técnicas.',
    recomendaciones: [
      'Muy versátil — funciona spinning, jigging, trolling y fondo',
      'Todo el día tiene potencial con picos en AM y PM',
      'Ideal para probar nuevas técnicas o especies objetivo',
      'Señuelos variados — los peces están menos selectivos',
      'Buena oportunidad para pesca de dorado en superficie',
    ],
  },
}

export function getInfoLunar(fecha: Date = new Date()): InfoLunar {
  const edad = edadLunaEnDias(fecha)
  const fase = getFaseLunar(edad)
  const porcentaje = porcentajeIluminacion(edad)
  const datos = DATOS_FASE[fase]

  // Días hasta próxima luna llena y nueva
  const CICLO = 29.530588853
  const edadLlena = 14.765
  const edadNueva = CICLO

  let diasHastaLlena = edadLlena - edad
  if (diasHastaLlena < 0) diasHastaLlena += CICLO

  let diasHastaNueva = edadNueva - edad
  if (diasHastaNueva < 0) diasHastaNueva += CICLO

  return {
    fase,
    porcentaje,
    icono: datos.icono,
    nombre: datos.nombre,
    calificacion: datos.calificacion,
    colorCalificacion: datos.colorCalificacion,
    descripcion: datos.descripcion,
    recomendaciones: datos.recomendaciones,
    diasHastaLlena: Math.round(diasHastaLlena),
    diasHastaNueva: Math.round(diasHastaNueva),
  }
}

/** Calcula ventanas de pesca basadas en fase lunar + horas de sol */
export function getVentanasPesca(
  fecha: Date,
  amanecer: Date,
  atardecer: Date
): VentanaPesca[] {
  const edad = edadLunaEnDias(fecha)
  const fase = getFaseLunar(edad)
  const ventanas: VentanaPesca[] = []

  const fmt = (d: Date) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

  const addMin = (d: Date, min: number) => new Date(d.getTime() + min * 60000)
  const subMin = (d: Date, min: number) => new Date(d.getTime() - min * 60000)

  const fasesExcelentes: FaseLunar[] = ['nueva', 'creciente_menguante', 'cuarto_menguante']
  const fasesBuenas: FaseLunar[] = ['creciente_creciente', 'cuarto_creciente', 'gibosa_menguante']

  const calidadAM: VentanaPesca['calidad'] = fasesExcelentes.includes(fase) ? 'excelente' : fasesBuenas.includes(fase) ? 'buena' : 'regular'
  const calidadPM: VentanaPesca['calidad'] = fase === 'llena' ? 'regular' : fasesBuenas.includes(fase) ? 'excelente' : 'buena'

  // Ventana amanecer
  ventanas.push({
    inicio: fmt(subMin(amanecer, 30)),
    fin: fmt(addMin(amanecer, 90)),
    calidad: calidadAM,
    etiqueta: calidadAM === 'excelente' ? '⭐ Mejor ventana' : calidadAM === 'buena' ? '✓ Buena' : '○ Regular',
    motivo: 'Cambio luz/oscuridad activa depredadores. Temperatura del agua en su punto más fresco.',
  })

  // Ventana media mañana (10-11:30am) — para fases activas
  if (fasesExcelentes.includes(fase) || fasesBuenas.includes(fase)) {
    const base = new Date(fecha)
    base.setHours(10, 0, 0, 0)
    ventanas.push({
      inicio: '10:00',
      fin: '11:30',
      calidad: 'buena',
      etiqueta: '✓ Buena',
      motivo: 'Corrientes de marea activas. Peces pelágicos en movimiento.',
    })
  }

  // Ventana atardecer
  ventanas.push({
    inicio: fmt(subMin(atardecer, 60)),
    fin: fmt(addMin(atardecer, 30)),
    calidad: calidadPM,
    etiqueta: calidadPM === 'excelente' ? '⭐ Excelente' : '✓ Buena',
    motivo: 'Descenso de temperatura activa alimentación. Peces pelágicos suben a superficie.',
  })

  return ventanas
}

export function getIconoFase(luna: string): string {
  const mapa: Record<string, string> = {
    nueva: '🌑',
    creciente: '🌒',
    cuarto_creciente: '🌓',
    gibosa_creciente: '🌔',
    llena: '🌕',
    gibosa_menguante: '🌖',
    cuarto_menguante: '🌗',
    menguante: '🌘',
    cualquiera: '🌙',
  }
  return mapa[luna?.toLowerCase()] ?? '🌙'
}