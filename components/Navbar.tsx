"use client"
import { useState } from 'react'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import { useCart } from '@/lib/store'
import CartDrawer from './CartDrawer'
import Link from 'next/link'

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const items = useCart((state) => state.items)
  
  // Calculamos el total de artículos para el círculo
  const totalArticulos = items.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <>
      <nav className="flex items-center justify-between px-10 py-7 bg-[#001A33] border-b border-white/5 sticky top-0 z-50">
        
        {/* LOGO - Estilo Boutique de Lujo */}
        <Link href="/" className="group flex flex-col items-start leading-none">
          <span className="text-2xl font-serif tracking-tight text-white italic">
            Inversiones <span className="text-[#D4AF37]">J y D</span>
          </span>
          <span className="text-[8px] uppercase tracking-[0.5em] text-[#D4AF37] font-black mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
            Midnight Collection
          </span>
        </Link>

        {/* LINKS DE CATEGORÍAS (Escritorio - Estilo Minimalista) */}
        <div className="hidden md:flex space-x-10 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
          <Link href="/" className="hover:text-[#D4AF37] hover:tracking-[0.35em] transition-all duration-300">
            Inicio
          </Link>
          <Link href="/categoria/lenceria" className="hover:text-[#D4AF37] hover:tracking-[0.35em] transition-all duration-300">
            Lencería
          </Link>
          <Link href="/categoria/maquillaje" className="hover:text-[#D4AF37] hover:tracking-[0.35em] transition-all duration-300">
            Cosmética
          </Link>
          <Link href="/categoria/perfumes" className="hover:text-[#D4AF37] hover:tracking-[0.35em] transition-all duration-300">
            Perfumes
          </Link>
        </div>

        {/* ICONOS */}
        <div className="flex items-center space-x-6 text-white">
          <button className="hover:text-[#D4AF37] transition-colors duration-300">
            <Search className="w-5 h-5 font-light" />
          </button>
          
          <div 
            className="relative cursor-pointer group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 group-hover:text-[#D4AF37] transition-colors duration-300" />
            
            {/* Badge del Carrito - Ahora en Dorado para resaltar sobre el Azul */}
            {totalArticulos > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#001A33] text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-in fade-in zoom-in font-black shadow-lg">
                {totalArticulos}
              </span>
            )}
          </div>

          {/* Menú Móvil */}
          <button className="md:hidden hover:text-[#D4AF37] transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* COMPONENTE DEL CARRITO LATERAL */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}