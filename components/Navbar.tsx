"use client"
import { useState } from 'react'
import { Search, ShoppingCart, Menu, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Importamos el router
import { useCart } from '@/lib/store'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('') // Estado para el texto de búsqueda
  const router = useRouter()
  const { items } = useCart()

  const categorias = [
    { nombre: 'Inicio', slug: '/' },
    { nombre: 'Lencería', slug: '/categoria/lenceria' },
    { nombre: 'Cosmética', slug: '/categoria/maquillaje' },
    { nombre: 'Perfumes', slug: '/categoria/perfumes' },
  ]

  // Función para procesar la búsqueda al dar Enter
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setIsSearchOpen(false)
      router.push(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
    }
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-100 bg-[#001A33] border-b border-[#D4AF37]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-serif italic text-white leading-none">
              Inversiones <span className="text-[#D4AF37]">JyD</span>
            </span>
            <span className="text-[7px] tracking-[0.4em] text-[#D4AF37] font-black uppercase mt-1">
              Midnight Collection
            </span>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {categorias.map((cat) => (
              <Link 
                key={cat.slug} 
                href={cat.slug}
                className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-[#D4AF37] transition-colors"
              >
                {cat.nombre}
              </Link>
            ))}
          </div>

          {/* Iconos de Acción */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-[#D4AF37] transition-colors"
            >
              <Search size={20} />
            </button>

            <Link href="/carrito" className="text-white hover:text-[#D4AF37] transition-colors relative">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#001A33] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-white hover:text-[#D4AF37] transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Buscador Desplegable */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-[#001A33] p-4 border-b border-[#D4AF37]/30"
            >
              <input 
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="¿Qué estás buscando hoy? (Presiona Enter)"
                className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-none py-3 px-4 text-white text-sm font-serif outline-none focus:border-[#D4AF37]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Menú Lateral (Mobile Drawer) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-1000 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-75 bg-[#001A33] z-1001 p-8 border-l border-[#D4AF37]/20 shadow-2xl"
            >
              <div className="flex justify-end mb-12">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#D4AF37] hover:rotate-90 transition-transform duration-300"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <p className="text-[9px] font-black tracking-[0.3em] text-[#D4AF37] uppercase mb-4 opacity-50">Navegación</p>
                {categorias.map((cat) => (
                  <Link 
                    key={cat.slug} 
                    href={cat.slug}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-xl font-serif italic text-white group-hover:text-[#D4AF37] transition-colors">
                      {cat.nombre}
                    </span>
                    <ChevronRight size={16} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-10 left-8">
                <p className="text-[10px] text-white/30 font-serif italic">
                  Inversiones JyD © 2026
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}