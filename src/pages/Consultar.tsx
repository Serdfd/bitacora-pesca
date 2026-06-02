import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Mensaje {
  rol: 'user' | 'assistant'
  contenido: string
}

export default function Consultar() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') ?? '')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)

  function guardarApiKey() {
    localStorage.setItem('claude_api_key', apiKey)
  }

  async function enviar() {
    if (!input.trim() || !apiKey) return
    const nuevoMensaje: Mensaje = { rol: 'user', contenido: input }
    const nuevos = [...mensajes, nuevoMensaje]
    setMensajes(nuevos)
    setInput('')
    setCargando(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: 'Eres un experto en pesca deportiva del Caribe colombiano. Responde en español, de forma práctica y concisa.',
          messages: nuevos.map((m) => ({ role: m.rol, content: m.contenido })),
        }),
      })
      const data = await response.json()
      const respuesta = data.content?.[0]?.text ?? 'Sin respuesta'
      setMensajes([...nuevos, { rol: 'assistant', contenido: respuesta }])
    } catch {
      setMensajes([...nuevos, { rol: 'assistant', contenido: 'Error al conectar con Claude.' }])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Consultar a Claude</h1>

      {/* API Key */}
      <div className="bg-ocean-900 rounded-2xl p-4 border border-ocean-800 mb-4 flex gap-3">
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key de Anthropic (Claude)"
          className="flex-1 bg-ocean-800 rounded-lg px-3 py-2 text-sm border border-ocean-700 focus:outline-none" />
        <button onClick={guardarApiKey} className="bg-ocean-700 hover:bg-ocean-600 px-4 py-2 rounded-lg text-sm transition-colors">
          Guardar
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {mensajes.length === 0 && (
          <div className="text-center py-16 text-ocean-500">
            <Bot size={40} className="mx-auto mb-3 opacity-50" />
            <p>Pregúntale al asistente sobre pesca, técnicas, especies o zonas</p>
          </div>
        )}
        {mensajes.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.rol === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.rol === 'user' ? 'bg-ocean-600' : 'bg-ocean-800'}`}>
              {msg.rol === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.rol === 'user' ? 'bg-ocean-600 rounded-tr-sm' : 'bg-ocean-900 border border-ocean-800 rounded-tl-sm'}`}>
              {msg.contenido}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-ocean-800 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-ocean-900 border border-ocean-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-ocean-400">
              Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder="¿Qué técnica usar para sierra en luna llena?"
          className="flex-1 bg-ocean-900 border border-ocean-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ocean-600" />
        <button onClick={enviar} disabled={cargando || !input.trim() || !apiKey}
          className="bg-ocean-600 hover:bg-ocean-500 disabled:bg-ocean-800 disabled:text-ocean-600 px-4 py-3 rounded-xl transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}