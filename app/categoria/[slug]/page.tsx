"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import { useCart } from '@/lib/store'
import { ShoppingBag, Plus } from 'lucide-react'

export default function CategoriaPage({ params }: { params: { slug: string } }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      // Buscamos productos que coincidan con la categoría (slug)
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria', params.slug) // Asegúrate que el nombre en Supabase coincida

      if (!error && data) {
        setProductos(data)
      }
      setLoading(false)
    }

    fetchProductos()
  }, [params.slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#001A33]"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-[#001A33] capitalize mb-2">
            {params.slug.replace('-', ' ')}
          </h1>
          <div className="h-1 w-12 bg-[#D4AF37] mx-auto"></div>
        </header>

        {productos.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-serif italic text-lg">
              Próximamente nuevas piezas en esta colección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productos.map((producto) => (
              <div key={producto.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4 shadow-sm">
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <button
                    onClick={() => addItem(producto)}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#001A33] hover:text-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-serif text-xl text-[#001A33] mb-1">{producto.nombre}</h3>
                <p className="text-[#D4AF37] font-bold">${producto.precio.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}