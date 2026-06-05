// Integración con Open-Meteo para datos meteorológicos reales
// Puerto Escondido, Colombia: 9.5°N, 75.9°W
// Fallback a datos estimados estacionales cuando no hay internet

export interface DatosClimaticos {
  temperaturaAgua: number       // °C
  temperaturaAire: number       // °C
  vientoVelocidad: number       // km/h
  vientoDireccion: number       // grados
  vientoDireccionTexto: string  // NE, SW, etc.
  humedadRelativa: number       // %
  precipitacion: number         // mm/h
  coberturaNubes: number        // %
  visibilidad: number           // km
  presionAtmosferica: number    // hPa
  alturaOlas: number            // metros estimados
  estadoMar: string
  claridad: 'Clara' | 'Media' | 'Turbia'
  condicionGeneral: string
  fuenteDatos: 'api' | 'estimado'
  ultimaActualizacion: string
}

/** Estimaciones estacionales para el Caribe colombiano (Puerto Escondido) */
function getDatosEstacionales(fecha: Date): Partial<DatosClimaticos> {
  const mes = fecha.getMonth() + 1 // 1-12

  // Temporadas del Caribe colombiano:
  // Dic-Abr: Seco, vientos alisios NE fuertes (Canícula)
  // May-Jun: Lluvias menores, vientos moderados
  // Jul-Ago: Veranillo de San Juan, algo seco
  // Sep-Nov: Temporada de lluvias principal

  if (mes >= 12 || mes <= 4) {
    return {
      temperaturaAgua: 27,
      temperaturaAire: 29,
      vientoVelocidad: 25,
      vientoDireccion: 45,
      vientoDireccionTexto: 'NE',
      coberturaNubes: 20,
      precipitacion: 2,
      alturaOlas: 0.8,
      estadoMar: 'Poco agitado',
      claridad: 'Clara',
      condicionGeneral: 'Soleado con vientos alisios. Temporada seca.',
    }
  } else if (mes <= 6) {
    return {
      temperaturaAgua: 29,
      temperaturaAire: 31,
      vientoVelocidad: 15,
      vientoDireccion: 90,
      vientoDireccionTexto: 'E',
      coberturaNubes: 50,
      precipitacion: 15,
      alturaOlas: 0.4,
      estadoMar: 'Calmo',
      claridad: 'Media',
      condicionGeneral: 'Parcialmente nublado con lluvias intermitentes.',
    }
  } else if (mes <= 8) {
    return {
      temperaturaAgua: 29,
      temperaturaAire: 32,
      vientoVelocidad: 20,
      vientoDireccion: 45,
      vientoDireccionTexto: 'NE',
      coberturaNubes: 30,
      precipitacion: 5,
      alturaOlas: 0.5,
      estadoMar: 'Poco agitado',
      claridad: 'Clara',
      condicionGeneral: 'Veranillo — buenas condiciones.',
    }
  } else {
    return {
      temperaturaAgua: 28,
      temperaturaAire: 30,
      vientoVelocidad: 12,
      vientoDireccion: 135,
      vientoDireccionTexto: 'SE',
      coberturaNubes: 70,
      precipitacion: 25,
      alturaOlas: 0.6,
      estadoMar: 'Poco agitado',
      claridad: 'Turbia',
      condicionGeneral: 'Temporada de lluvias. Agua turbia en zonas costeras.',
    }
  }
}

function gradosADireccion(grados: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
  return dirs[Math.round(grados / 22.5) % 16]
}

function alturaOlasAEstado(altura: number): string {
  if (altura < 0.3) return 'Calmo (vidrio)'
  if (altura < 0.6) return 'Calmo'
  if (altura < 1.2) return 'Poco agitado'
  if (altura < 2.0) return 'Agitado'
  return 'Muy agitado'
}

function precipitacionAClaridad(precip: number, nubes: number): 'Clara' | 'Media' | 'Turbia' {
  if (precip > 10) return 'Turbia'
  if (precip > 3 || nubes > 60) return 'Media'
  return 'Clara'
}

/** Obtiene datos meteorológicos reales de Open-Meteo con fallback estacional */
export async function getDatosClimaticos(
  fecha: Date = new Date(),
  lat: number = 9.5,
  lon: number = -75.9
): Promise<DatosClimaticos> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,` +
      `wind_speed_10m,wind_direction_10m,surface_pressure,visibility` +
      `&daily=wave_height_max` +
      `&wind_speed_unit=kmh&timezone=America%2FBogota&forecast_days=1`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!resp.ok) throw new Error('HTTP error')

    const data = await resp.json()
    const c = data.current

    const velocidad    = c.wind_speed_10m ?? 0
    const direccion    = c.wind_direction_10m ?? 0
    const precipitacion = c.precipitation ?? 0
    const nubes        = c.cloud_cover ?? 0
    const alturaOlas   = data.daily?.wave_height_max?.[0] ?? 0.4

    return {
      temperaturaAgua:      getDatosEstacionales(fecha).temperaturaAgua ?? 28,
      temperaturaAire:      Math.round(c.temperature_2m ?? 30),
      vientoVelocidad:      Math.round(velocidad),
      vientoDireccion:      Math.round(direccion),
      vientoDireccionTexto: gradosADireccion(direccion),
      humedadRelativa:      Math.round(c.relative_humidity_2m ?? 75),
      precipitacion:        Math.round(precipitacion * 10) / 10,
      coberturaNubes:       Math.round(nubes),
      visibilidad:          Math.round((c.visibility ?? 10000) / 1000),
      presionAtmosferica:   Math.round(c.surface_pressure ?? 1013),
      alturaOlas:           Math.round(alturaOlas * 10) / 10,
      estadoMar:            alturaOlasAEstado(alturaOlas),
      claridad:             precipitacionAClaridad(precipitacion, nubes),
      condicionGeneral:     nubes > 70 ? 'Nublado' : nubes > 40 ? 'Parcialmente nublado' : 'Despejado',
      fuenteDatos:          'api',
      ultimaActualizacion:  new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    }
  } catch {
    const estimado = getDatosEstacionales(fecha)
    return {
      temperaturaAgua:      estimado.temperaturaAgua ?? 28,
      temperaturaAire:      estimado.temperaturaAire ?? 30,
      vientoVelocidad:      estimado.vientoVelocidad ?? 15,
      vientoDireccion:      estimado.vientoDireccion ?? 45,
      vientoDireccionTexto: estimado.vientoDireccionTexto ?? 'NE',
      humedadRelativa:      78,
      precipitacion:        estimado.precipitacion ?? 5,
      coberturaNubes:       estimado.coberturaNubes ?? 30,
      visibilidad:          10,
      presionAtmosferica:   1013,
      alturaOlas:           estimado.alturaOlas ?? 0.5,
      estadoMar:            estimado.estadoMar ?? 'Poco agitado',
      claridad:             estimado.claridad ?? 'Clara',
      condicionGeneral:     estimado.condicionGeneral ?? 'Datos estimados por temporada',
      fuenteDatos:          'estimado',
      ultimaActualizacion:  new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    }
  }
}

/** Señales del agua basadas en condiciones combinadas */
export interface SenalAgua {
  icono: string
  titulo: string
  descripcion: string
  impacto: 'positivo' | 'neutro' | 'negativo'
}

export function getSenalesAgua(datos: DatosClimaticos, faseLunar: string): SenalAgua[] {
  const senales: SenalAgua[] = []

  // Temperatura del agua
  if (datos.temperaturaAgua >= 28 && datos.temperaturaAgua <= 30) {
    senales.push({ icono: '🌡️', titulo: 'Temperatura óptima', descripcion: `${datos.temperaturaAgua}°C — Rango ideal para especies pelágicas del Caribe. Metabolismo activo.`, impacto: 'positivo' })
  } else if (datos.temperaturaAgua > 30) {
    senales.push({ icono: '🌡️', titulo: 'Agua caliente', descripcion: `${datos.temperaturaAgua}°C — Temperatura elevada. Peces se mueven a mayor profundidad en busca de termoclina.`, impacto: 'negativo' })
  } else {
    senales.push({ icono: '🌡️', titulo: 'Agua fresca', descripcion: `${datos.temperaturaAgua}°C — Temperatura baja. Actividad reducida en especies tropicales.`, impacto: 'neutro' })
  }

  // Claridad del agua
  if (datos.claridad === 'Clara') {
    senales.push({ icono: '💧', titulo: 'Agua clara', descripcion: 'Excelente visibilidad. Peces más selectivos — usar señuelos naturales y líneas delgadas.', impacto: 'positivo' })
  } else if (datos.claridad === 'Media') {
    senales.push({ icono: '💧', titulo: 'Agua moderada', descripcion: 'Visibilidad media. Señuelos con vibración o colores vivos funcionan bien.', impacto: 'neutro' })
  } else {
    senales.push({ icono: '💧', titulo: 'Agua turbia', descripcion: 'Baja visibilidad. Usar señuelos ruidosos, con color llamativo o carnada con olor fuerte.', impacto: 'negativo' })
  }

  // Viento
  if (datos.vientoVelocidad < 15) {
    senales.push({ icono: '💨', titulo: 'Viento suave', descripcion: `${datos.vientoVelocidad} km/h ${datos.vientoDireccionTexto} — Mar tranquilo, ideal para cualquier técnica.`, impacto: 'positivo' })
  } else if (datos.vientoVelocidad < 25) {
    senales.push({ icono: '💨', titulo: 'Viento moderado', descripcion: `${datos.vientoVelocidad} km/h ${datos.vientoDireccionTexto} — Algo de movimiento. Genera corrientes superficiales útiles para trolling.`, impacto: 'neutro' })
  } else {
    senales.push({ icono: '💨', titulo: 'Viento fuerte', descripcion: `${datos.vientoVelocidad} km/h ${datos.vientoDireccionTexto} — Mar agitado. Dificulta la presentación del señuelo y la navegación.`, impacto: 'negativo' })
  }

  // Presión atmosférica
  if (datos.presionAtmosferica > 1015) {
    senales.push({ icono: '📊', titulo: 'Alta presión', descripcion: `${datos.presionAtmosferica} hPa — Sistema estable. Los peces se distribuyen uniformemente y son más predecibles.`, impacto: 'positivo' })
  } else if (datos.presionAtmosferica < 1005) {
    senales.push({ icono: '📊', titulo: 'Baja presión', descripcion: `${datos.presionAtmosferica} hPa — Sistema inestable o frente de lluvia. Peces se alimentan intensamente antes de la tormenta.`, impacto: 'positivo' })
  }

  // Fase lunar efecto adicional
  if (faseLunar === 'nueva' || faseLunar === 'creciente_menguante') {
    senales.push({ icono: '🌊', titulo: 'Mareas vivas', descripcion: 'Ciclo de mareas pronunciado. Corrientes activas mueven la carnada — peces en posición de emboscada.', impacto: 'positivo' })
  } else if (faseLunar === 'cuarto_creciente' || faseLunar === 'cuarto_menguante') {
    senales.push({ icono: '🌊', titulo: 'Mareas muertas', descripcion: 'Rango de mareas reducido. Agua más estática — peces más activos pero menos concentrados.', impacto: 'neutro' })
  }

  return senales
}