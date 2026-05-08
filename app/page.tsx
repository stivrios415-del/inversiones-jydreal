"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

// Intentamos forzar revalidación (útil en SSR)
export const revalidate = 0;

export default function Home() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProductos = async () => {
    setLoading(true)
    // Añadimos un filtro de tiempo para "engañar" al caché y traer datos reales
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setProductos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProductos()
    
    // Opcional: Esto refresca la lista si el usuario cambia de pestaña y vuelve
    const handleFocus = () => fetchProductos();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [])

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Sección de Bienvenida Estilo Midnight */}
      <section className="bg-[#001A33] px-8 py-24 text-center border-b border-[#D4AF37]/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-6 tracking-tight">
            Inversiones <span className="text-[#D4AF37] not-italic font-bold">J y D</span>
          </h1>
          <div className="w-24 h-px bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-[#D4AF37]/80 max-w-xl mx-auto text-[10px] md:text-xs tracking-[0.4em] uppercase font-black">
            Lencería Exclusiva • Cosmética • Perfumería de Lujo
          </p>
        </motion.div>
      </section>

      {/* Grid de Productos */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-serif italic text-[#001A33]">
            Novedades <span className="text-[#D4AF37]">Recientes</span>
          </h2>
          <button 
            onClick={fetchProductos}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            {loading ? 'Sincronizando...' : 'Actualizar Lista'}
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}

        {!loading && productos.length === 0 && (
          <div className="text-center py-32 bg-white border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 font-serif italic text-lg">
              Nuestra nueva colección llegará pronto...
            </p>
          </div>
        )}
      </div>
    </main>
  )
}