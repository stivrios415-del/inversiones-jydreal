"use client"
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

export default function Home() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Función para traer productos frescos de Supabase
  const fetchProductos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProductos(data)
      }
    } catch (err) {
      console.error("Error al obtener productos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
    
    // Si el dueño de la tienda agrega algo y vuelve a esta pestaña, se actualiza solo
    const handleFocus = () => fetchProductos();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    }
  }, [fetchProductos])

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Cabecera Estilo Midnight Collection */}
      <section className="bg-[#001A33] px-8 py-20 text-center border-b border-[#D4AF37]/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-4 tracking-tight">
            Inversiones <span className="text-[#D4AF37] not-italic font-bold">J y D</span>
          </h1>
          <div className="w-20 h-px bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-[#D4AF37]/80 max-w-xl mx-auto text-[10px] md:text-xs tracking-[0.3em] uppercase font-black">
            Lencería Exclusiva • Maquillaje Profesional • Perfumes
          </p>
        </motion.div>
      </section>

      {/* Listado de Novedades */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-serif italic text-[#001A33]">
            Novedades <span className="text-[#D4AF37]">Recientes</span>
          </h2>
          <button 
            onClick={fetchProductos}
            className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-all"
          >
            {loading ? 'Sincronizando...' : 'Actualizar'}
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-xl shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}

        {!loading && productos.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-serif italic text-lg">
              Preparando nuevas piezas para la colección...
            </p>
          </div>
        )}
      </div>
    </main>
  )
}