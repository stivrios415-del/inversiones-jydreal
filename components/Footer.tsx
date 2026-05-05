"use client"
import { MessageSquare, MapPin, Phone,} from 'lucide-react'
import Link from 'next/link'
import '../app/globals.css'

export default function Footer() {
  return (
    <footer className="bg-[#001A33] text-white pt-20 pb-10 mt-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
        
        {/* Columna de Marca */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif tracking-tight text-white italic">
              Inversiones <span className="text-[#D4AF37]">J y D</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold mt-1">
              Midnight Collection
            </p>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed font-light">
            Elevando el estándar de la belleza en Honduras con una curaduría exclusiva de fragancias y lencería fina.
          </p>
          <div className="flex space-x-5">
            
            <MessageSquare className="w-5 h-5 text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Categorías */}
        <div>
          <h3 className="font-serif text-lg mb-8 text-white">Colecciones</h3>
          <ul className="space-y-4 text-xs uppercase tracking-[0.2em] text-gray-400">
            <li><Link href="/categoria/lenceria" className="hover:text-[#D4AF37] transition-colors">Lencería Fina</Link></li>
            <li><Link href="/categoria/maquillaje" className="hover:text-[#D4AF37] transition-colors">Cosmética Pro</Link></li>
            <li><Link href="/categoria/perfumes" className="hover:text-[#D4AF37] transition-colors">Alta Perfumería</Link></li>
            <li><Link href="/categoria/nuevo" className="hover:text-[#D4AF37] transition-colors">Novedades</Link></li>
          </ul>
        </div>

        {/* Soporte */}
        <div>
          <h3 className="font-serif text-lg mb-8 text-white">Servicio Privado</h3>
          <ul className="space-y-4 text-xs uppercase tracking-[0.2em] text-gray-400">
            <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Guía de Tallas</li>
            <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Envíos a Nivel Nacional</li>
            <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Cuidado de Prendas</li>
            <li className="hover:text-[#D4AF37] cursor-pointer transition-colors">Términos de Exclusividad</li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-serif text-lg mb-8 text-white">Boutique</h3>
          <ul className="space-y-5 text-sm text-gray-400 font-light">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D4AF37] mt-1" /> 
              <span>SABA, Colón <br /> Honduras, C.A.</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#D4AF37]" /> 
              <span className="tracking-widest">+504 9570-8300</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} INVERSIONES J Y D. TODOS LOS DERECHOS RESERVADOS.
        </p>
        <div className="flex gap-8 text-[9px] text-gray-500 uppercase tracking-[0.2em]">
          <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
          <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
        </div>
      </div>
    </footer>
  )
}