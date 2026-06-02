// Cálculo armónico simplificado de mareas
// Calibrado para el Caribe colombiano (Puerto Escondido, ~9.5°N 75.9°W)
// El Caribe tiene mareas mixtas con rango pequeño (20-50cm)

export type TipoMarea = 'Pleamar' | 'Bajamar' | 'Subiendo' | 'Bajando'

export interface EstadoMarea {
  tipo: TipoMarea
  altura: number          // metros estimados
  proximaPleamar: string  // HH:MM
  proximaBasjamar: string
  horasPleamar: number    // horas hasta próxima pleamar
  horasBasjamar: number
  descripcion: string
}

interface EventoMarea {
  hora: Date
  tipo: 'pleamar' | 'bajamar'
  altura: number
}

/**
 * Genera eventos de marea para un día dado usando cálculo armónico simplificado.
 * Constantes calibradas para el Caribe colombiano.
 */
function generarEventosDia(fecha: Date): EventoMarea[] {
  // En el Caribe colombiano las mareas son principalmente semidiurnas
  // con periodo ~12.42 horas (componente M2)
  const CICLO_LUNAR = 29.530588853
  const LUNA_NUEVA_REF = new Date('2000-01-06T18:14:00Z')

  const edadLuna = ((fecha.getTime() - LUNA_NUEVA_REF.getTime()) /
    (1000 * 60 * 60 * 24) % CICLO_LUNAR + CICLO_LUNAR) % CICLO_LUNAR

  // Fase en radianes
  const faseRad = (edadLuna / CICLO_LUNAR) * 2 * Math.PI

  // Hora del tránsito lunar (hora local en que la luna está en el meridiano)
  // Aproximación: la luna retrasa ~50 min/día respecto al sol
  const retrasoDias = edadLuna * (50 / 60 / 24) // en fracciones de día
  const horaTransito = (12 + retrasoDias * 24) % 24

  // Amplitud varía con la fase lunar (mareas vivas en luna nueva/llena, muertas en cuartos)
  const amplitudBase = 0.25 // metros, promedio Caribe colombiano
  const amplitudViva = 0.40
  const amplitudMuerta = 0.15

  // Factor de amplitud según fase
  const cosPhase = Math.cos(faseRad)
  const amplitud = amplitudMuerta + (amplitudViva - amplitudMuerta) * Math.abs(cosPhase)

  // Generar 4-5 eventos en el día (±1 día para contexto)
  const eventos: EventoMarea[] = []
  const PERIODO_M2 = 12.42 // horas

  // Primera pleamar del día centrada en el tránsito lunar
  let horaBase = horaTransito % PERIODO_M2

  for (let i = -1; i <= 4; i++) {
    const horaPleamar = horaBase + i * PERIODO_M2
    if (horaPleamar >= -2 && horaPleamar <= 26) {
      const fechaPleamar = new Date(fecha)
      fechaPleamar.setHours(0, 0, 0, 0)
      fechaPleamar.setTime(fechaPleamar.getTime() + horaPleamar * 3600000)

      eventos.push({ hora: fechaPleamar, tipo: 'pleamar', altura: amplitud })

      // Bajamar a mitad del periodo
      const fechaBasjamar = new Date(fechaPleamar.getTime() + (PERIODO_M2 / 2) * 3600000)
      eventos.push({ hora: fechaBasjamar, tipo: 'bajamar', altura: amplitud * 0.1 })
    }
  }

  return eventos.sort((a, b) => a.hora.getTime() - b.hora.getTime())
}

export function getEstadoMarea(fecha: Date = new Date()): EstadoMarea {
  const eventos = generarEventosDia(fecha)
  const ahora = fecha.getTime()

  // Encontrar evento anterior y siguiente
  let anterior: EventoMarea | null = null
  let siguiente: EventoMarea | null = null

  for (const ev of eventos) {
    if (ev.hora.getTime() <= ahora) {
      anterior = ev
    } else if (!siguiente) {
      siguiente = ev
    }
  }

  if (!anterior || !siguiente) {
    return {
      tipo: 'Subiendo',
      altura: 0.2,
      proximaPleamar: '06:00',
      proximaBasjamar: '12:00',
      horasPleamar: 6,
      horasBasjamar: 6,
      descripcion: 'Calculando...',
    }
  }

  const fmt = (d: Date) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
  const diffHoras = (d: Date) => Math.max(0, (d.getTime() - ahora) / 3600000)

  // Interpolar altura actual
  const progreso = (ahora - anterior.hora.getTime()) / (siguiente.hora.getTime() - anterior.hora.getTime())
  const alturaActual = anterior.altura + (siguiente.altura - anterior.altura) * progreso

  // Determinar si sube o baja
  let tipo: TipoMarea
  if (anterior.tipo === 'bajamar') {
    tipo = progreso > 0.85 ? 'Pleamar' : 'Subiendo'
  } else {
    tipo = progreso > 0.85 ? 'Bajamar' : 'Bajando'
  }

  // Encontrar próximas pleamar y bajamar
  const proxPleamar = eventos.find(e => e.tipo === 'pleamar' && e.hora.getTime() > ahora)
  const proxBasjamar = eventos.find(e => e.tipo === 'bajamar' && e.hora.getTime() > ahora)

  const descripcionesTipo: Record<TipoMarea, string> = {
    Pleamar: 'Agua alta — buen movimiento de carnada en superficie y arrecifes',
    Bajamar: 'Agua baja — carnada concentrada, ideal para pesca de fondo',
    Subiendo: 'Marea subiendo — excelente para pesca activa, peces se mueven con la corriente',
    Bajando: 'Marea bajando — corriente activa arrastra carnada, peces en puntos de emboscada',
  }

  return {
    tipo,
    altura: Math.round(alturaActual * 100) / 100,
    proximaPleamar: proxPleamar ? fmt(proxPleamar.hora) : '--:--',
    proximaBasjamar: proxBasjamar ? fmt(proxBasjamar.hora) : '--:--',
    horasPleamar: proxPleamar ? Math.round(diffHoras(proxPleamar.hora) * 10) / 10 : 0,
    horasBasjamar: proxBasjamar ? Math.round(diffHoras(proxBasjamar.hora) * 10) / 10 : 0,
    descripcion: descripcionesTipo[tipo],
  }
}

export function getMareasDia(fecha: Date): Array<{ hora: string; tipo: 'pleamar' | 'bajamar'; altura: number }> {
  const inicio = new Date(fecha)
  inicio.setHours(0, 0, 0, 0)
  const fin = new Date(fecha)
  fin.setHours(23, 59, 59, 999)

  const eventos = generarEventosDia(fecha)
  return eventos
    .filter(e => e.hora >= inicio && e.hora <= fin)
    .map(e => ({
      hora: e.hora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      tipo: e.tipo,
      altura: Math.round(e.altura * 100) / 100,
    }))
}

/**
 * Genera puntos interpolados cada 30min para graficar la curva de mareas del día.
 * Usa interpolación coseno entre pleamar y bajamar.
 */
export function getCurvaMareasDia(fecha: Date): Array<{ minuto: number; altura: number }> {
  const inicio = new Date(fecha)
  inicio.setHours(0, 0, 0, 0)

  const eventos = generarEventosDia(fecha)
    .sort((a, b) => a.hora.getTime() - b.hora.getTime())

  const puntos: Array<{ minuto: number; altura: number }> = []

  for (let min = 0; min <= 1440; min += 30) {
    const t = new Date(inicio.getTime() + min * 60000)

    // Encontrar eventos anterior y siguiente
    let anterior: EventoMarea | null = null
    let siguiente: EventoMarea | null = null
    for (const ev of eventos) {
      if (ev.hora.getTime() <= t.getTime()) anterior = ev
      else if (!siguiente) siguiente = ev
    }

    let altura = 0.2
    if (anterior && siguiente) {
      const progreso = (t.getTime() - anterior.hora.getTime()) /
        (siguiente.hora.getTime() - anterior.hora.getTime())
      // Interpolación coseno para curva suave
      const smooth = (1 - Math.cos(progreso * Math.PI)) / 2
      altura = anterior.altura + (siguiente.altura - anterior.altura) * smooth
    } else if (anterior) {
      altura = anterior.altura
    } else if (siguiente) {
      altura = siguiente.altura
    }

    puntos.push({ minuto: min, altura: Math.max(0, Math.round(altura * 1000) / 1000) })
  }

  return puntos
}