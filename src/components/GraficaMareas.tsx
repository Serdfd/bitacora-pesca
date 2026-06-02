import { useMemo } from 'react'
import { getCurvaMareasDia, getMareasDia } from '@/utils/tides'

interface Props {
  fecha: Date
  altura?: number // alto del SVG en px, default 80
}

export default function GraficaMareas({ fecha, altura = 80 }: Props) {
  const ancho = 300

  const puntos = useMemo(() => getCurvaMareasDia(fecha), [fecha.toDateString()])
  const eventos = useMemo(() => getMareasDia(fecha), [fecha.toDateString()])

  const alturas = puntos.map(p => p.altura)
  const minH = Math.min(...alturas)
  const maxH = Math.max(...alturas)
  const rango = maxH - minH || 0.01

  // Mapear a coordenadas SVG
  const padX = 10
  const padY = 10
  const w = ancho - padX * 2
  const h = altura - padY * 2

  const toX = (min: number) => padX + (min / 1440) * w
  const toY = (alt: number) => padY + h - ((alt - minH) / rango) * h

  // Construir path
  const pathD = puntos.map((p, i) => {
    const x = toX(p.minuto)
    const y = toY(p.altura)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  // Área rellena (cerrar hacia abajo)
  const areaD = pathD +
    ` L ${toX(1440)} ${padY + h} L ${toX(0)} ${padY + h} Z`

  // Línea de hora actual
  const ahora = new Date()
  const esMismaFecha = fecha.toDateString() === ahora.toDateString()
  const minActual = ahora.getHours() * 60 + ahora.getMinutes()
  const xAhora = toX(minActual)

  // Altura actual interpolada para el punto
  const puntoActual = esMismaFecha
    ? puntos.reduce((prev, curr) =>
        Math.abs(curr.minuto - minActual) < Math.abs(prev.minuto - minActual) ? curr : prev
      )
    : null

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${ancho} ${altura}`}
        className="w-full"
        style={{ height: altura }}
      >
        <defs>
          <linearGradient id="gradMarea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Área rellena */}
        <path d={areaD} fill="url(#gradMarea)" />

        {/* Línea de curva */}
        <path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Marcadores pleamar / bajamar */}
        {eventos.map((ev, i) => {
          const [hh, mm] = ev.hora.split(':').map(Number)
          const minEv = hh * 60 + mm
          const x = toX(minEv)
          const y = toY(ev.altura)
          const esPlea = ev.tipo === 'pleamar'
          return (
            <g key={i}>
              <circle
                cx={x} cy={y} r={4}
                fill={esPlea ? '#60a5fa' : '#67e8f9'}
                stroke="#0f172a" strokeWidth="1.5"
              />
              <text
                x={x} y={esPlea ? y - 7 : y + 13}
                textAnchor="middle"
                fontSize="8"
                fill={esPlea ? '#93c5fd' : '#a5f3fc'}
              >
                {ev.hora}
              </text>
              <text
                x={x} y={esPlea ? y - 17 : y + 21}
                textAnchor="middle"
                fontSize="7"
                fill="#64748b"
              >
                {ev.altura}m
              </text>
            </g>
          )
        })}

        {/* Línea de hora actual */}
        {esMismaFecha && puntoActual && (
          <>
            <line
              x1={xAhora} y1={padY}
              x2={xAhora} y2={padY + h}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            <circle
              cx={xAhora}
              cy={toY(puntoActual.altura)}
              r={5}
              fill="#f59e0b"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>

      {/* Leyenda eventos */}
      <div className="flex justify-around mt-1">
        {eventos.map((ev, i) => (
          <div key={i} className="text-center">
            <p className={`text-xs font-bold ${ev.tipo === 'pleamar' ? 'text-blue-400' : 'text-cyan-400'}`}>
              {ev.tipo === 'pleamar' ? '⬆ Pleamar' : '⬇ Bajamar'}
            </p>
            <p className="text-white text-xs font-semibold">{ev.hora}</p>
            <p className="text-ocean-400 text-xs">{ev.altura}m</p>
          </div>
        ))}
      </div>
    </div>
  )
}