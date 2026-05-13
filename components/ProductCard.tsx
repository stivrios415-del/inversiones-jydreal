"use client"
import { Producto } from '@/types'
import { ShoppingCart, Plus } from 'lucide-react'
import { useCart } from '@/lib/store'

export default function ProductCard({ producto }: { producto: Producto }) {
  const addItem = useCart((state) => state.addItem)

  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-500 border border-gray-50 hover:shadow-[0_20px_40px_rgba(0,26,51,0.08)]">
      
      {/* SECCIÓN DE LA IMAGEN - Estilo Galería */}
      <div className="relative h-80 w-full overflow-hidden bg-[#F8FAFC]">
        <img 
          src={producto.imagen_url} 
          alt={producto.nombre} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000'
          }}
        />
        
        {/* Badge de "Nuevo" o "Exclusivo" opcional */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#001A33] text-[#D4AF37] text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-lg">
            Exclusivo
          </span>
        </div>

        {/* Overlay con botón de compra rápida al hacer hover */}
        <div className="absolute inset-0 bg-[#001A33]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.preventDefault();
              addItem(producto);
            }}
            className="bg-white text-[#001A33] px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-[#D4AF37] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
          >
            Añadir a la Selección
          </button>
        </div>
      </div>

      {/* DETALLES DEL PRODUCTO - Estilo Editorial */}
      <div className="p-6 text-center">
        <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-2 block">
          {producto.categoria}
        </span>
        
        <h3 className="font-serif text-[#001A33] text-lg mb-3 truncate group-hover:text-[#D4AF37] transition-colors duration-300">
          {producto.nombre}
        </h3>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-gray-300 line-through tracking-widest italic">
              ${(producto.precio + 15).toFixed(2)}
            </p>
           <p className="text-[#D4AF37] font-bold">L{producto.precio.toFixed(2)}</p>
          </div>
          
          {/* Línea decorativa minimalista */}
          <div className="w-8 h-[1px] bg-gray-100 mt-4 group-hover:w-16 group-hover:bg-[#D4AF37] transition-all duration-500" />
        </div>
      </div>

      {/* Botón flotante para móvil (visible solo si no hay hover) */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          addItem(producto);
        }}
        className="md:hidden absolute bottom-24 right-4 w-10 h-10 bg-[#001A33] text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}