"use client"
import { useEffect, useState, use } from 'react' // Importamos 'use'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import { useCart } from '@/lib/store'
import { ShoppingBag, Plus } from 'lucide-react'

export default function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  // En Next.js 15+, params es una Promesa. Usamos 'use' para obtener el valor.
  const resolvedParams = use(params)
  const slug = resolvedParams.slug

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      
      // Consultamos a Supabase usando el slug resuelto
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria', slug)

      if (!error && data) {
        setProductos(data)
      }
      setLoading(false)
    }

    fetchProductos()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#001A33]"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-[#001A33] capitalize mb-2">
            {slug.replace('-', ' ')}
          </h1>
          <div className="h-[1px] w-12 bg-[#D4AF37] mx-auto"></div>
        </header>

        {productos.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-100 mb-4" />
            <p className="text-[#001A33]/50 font-serif italic text-lg">
              Próximamente nuevas piezas en esta colección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productos.map((producto) => (
              <div key={producto.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F8FAFC] mb-4 shadow-sm">
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => addItem(producto)}
                    className="absolute bottom-4 right-4 bg-[#001A33] text-[#D4AF37] p-3 rounded-none shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#D4AF37] hover:text-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-serif text-lg text-[#001A33] mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {producto.nombre}
                </h3>
                <p className="text-[#D4AF37] font-bold text-sm tracking-tighter">
                  ${producto.precio.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}