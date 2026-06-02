import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Hoy from '@/pages/Hoy'
import Fecha from '@/pages/Fecha'
import Bitacora from '@/pages/Bitacora'
import Especies from '@/pages/Especies'
import Zonas from '@/pages/Zonas'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Hoy />} />
        <Route path="fecha" element={<Fecha />} />
        <Route path="bitacora" element={<Bitacora />} />
        <Route path="especies" element={<Especies />} />
        <Route path="zonas" element={<Zonas />} />
      </Route>
    </Routes>
  )
}