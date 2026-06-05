import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '@/store'

const NAV_ITEMS = [
  { to: '/',          icono: '🌅', label: 'Hoy'       },
  { to: '/fecha',     icono: '📅', label: 'Fecha'     },
  { to: '/bitacora',  icono: '📖', label: 'Bitácora'  },
  { to: '/especies',  icono: '🐟', label: 'Especies'  },
  { to: '/zonas',     icono: '🗺️', label: 'Zonas'     },
  { to: '/reportes', icono: '📊', label: 'Reportes' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const { regiones, zonaSeleccionadaId } = useAppStore()
  const zonaActual = regiones.find(r => r.id === zonaSeleccionadaId) ?? regiones.find(r => r.lat && r.lat !== 0)

  const paginaActual = NAV_ITEMS.find(n => n.to === location.pathname)?.label ?? 'Bitácora de Pesca'

  return (
    <div className="flex h-screen bg-ocean-950 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        className={`
          flex flex-col flex-shrink-0 h-full
          bg-ocean-900/80 backdrop-blur-md
          border-r border-white/10
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-56'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-2xl flex-shrink-0">🎣</span>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-amber-400 font-bold text-sm leading-tight">Bitácora</p>
              <p className="text-ocean-300 text-xs leading-tight">de Pesca</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-ocean-300 hover:bg-white/5 hover:text-white border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-xl flex-shrink-0">{item.icono}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {/* Tooltip cuando está colapsado */}
              {collapsed && (
                <div className="
                  absolute left-full ml-3 px-2 py-1 rounded-lg
                  bg-ocean-800 text-white text-xs font-medium
                  opacity-0 group-hover:opacity-100
                  pointer-events-none whitespace-nowrap
                  transition-opacity duration-200 z-50
                  border border-white/10
                ">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Botón colapsar */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(v => !v)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-xl
              text-ocean-400 hover:text-white hover:bg-white/5
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <span className="text-lg">{collapsed ? '»' : '«'}</span>
            {!collapsed && <span className="text-xs">Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header top bar */}
        <header className="
          flex items-center justify-between
          px-6 py-4
          bg-ocean-900/40 backdrop-blur-sm
          border-b border-white/10
          flex-shrink-0
        ">
          <h1 className="text-lg font-semibold text-white">{paginaActual}</h1>
          <div className="flex items-center gap-3 text-sm text-ocean-300">
            <span>🌍 {zonaActual?.nombre ?? 'Sin zona seleccionada'}, Colombia</span>
            <span className="text-ocean-600">|</span>
            <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        {/* Página activa */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}