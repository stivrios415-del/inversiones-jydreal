"use client"
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import { useCart } from '@/lib/store'
import { Plus, SearchX } from 'lucide-react'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const buscarProductos = async () => {
      if (!query) return
      setLoading(true)
      
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .ilike('nombre', `%${query}%`) // Busca coincidencias en el nombre

      if (!error && data) setProductos(data)
      setLoading(false)
    }
    buscarProductos()
  }, [query])

  if (loading) return <div className="pt-40 text-center font-serif italic">Buscando en la colección...</div>

  return (
    <div className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-serif text-[#001A33] mb-10">
          Resultados para: <span className="italic">"{query}"</span>
        </h1>

        {productos.length === 0 ? (
          <div className="text-center py-20">
            <SearchX className="w-12 h-12 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-serif">No encontramos piezas con ese nombre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {productos.map((p) => (
              <div key={p.id} className="group">
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-4">
                  <img src={p.imagen_url} className="w-full h-full object-cover" alt={p.nombre} />
                  <button 
                    onClick={() => addItem(p)}
                    className="absolute bottom-4 right-4 bg-[#001A33] text-[#D4AF37] p-3 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <h3 className="font-serif text-[#001A33]">{p.nombre}</h3>
                <p className="text-[#D4AF37] font-bold">${p.precio.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SearchResults />
    </Suspense>
  )
}