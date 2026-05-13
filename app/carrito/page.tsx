"use client"
import { useCart } from '@/lib/store'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CarritoPage() {
  const { items, total, addItem, removeItem, clearItem } = useCart()

  const enviarPedidoWhatsApp = () => {
    const telefono = "50495708300" 
    let mensaje = `*SOLICITUD DE PEDIDO - INVERSIONES J Y D*%0A`
    mensaje += `------------------------------%0A`
    items.forEach(item => {
      // Cambio de $ a L en el mensaje de WhatsApp
      mensaje += `• ${item.cantidad}x ${item.nombre.toUpperCase()} - L${(item.precio * item.cantidad).toFixed(2)}%0A`
    })
    mensaje += `------------------------------%0A`
    // Cambio de $ a L en el total de WhatsApp
    mensaje += `*TOTAL: L${total.toFixed(2)}*%0A%0A`
    mensaje += `Deseo coordinar el pago y envío.`
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-100 mb-6" />
        <h1 className="text-3xl font-serif text-[#001A33] mb-4">Tu bolsa está vacía</h1>
        <p className="text-gray-400 mb-10 max-w-xs font-serif italic">Tu selección exclusiva aparecerá aquí una vez que elijas tus piezas favoritas.</p>
        <Link href="/" className="bg-[#001A33] text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#002a52] transition-all">
          Volver a la Tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="text-[#001A33] hover:text-[#D4AF37] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-serif text-[#001A33]">Tu <span className="italic">Selección</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div layout key={item.id} className="bg-white p-6 flex gap-6 items-center shadow-sm border border-gray-50">
                <div className="w-24 h-24 bg-gray-50 flex-shrink-0 overflow-hidden">
                  <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-[#001A33]">{item.nombre}</h3>
                  {/* Cambio de $ a L en el precio del producto */}
                  <p className="text-[#D4AF37] font-bold text-sm mb-4">L{item.precio.toFixed(2)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-100 rounded-full">
                      <button onClick={() => removeItem(item.id)} className="p-2 hover:text-[#D4AF37]"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-6 text-center">{item.cantidad}</span>
                      <button onClick={() => addItem(item)} className="p-2 hover:text-[#D4AF37]"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => clearItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RESUMEN DE COMPRA */}
          <div className="lg:col-span-1">
            <div className="bg-[#001A33] p-8 text-white sticky top-32 shadow-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-8 text-center">Resumen de Selección</h2>
              <div className="flex justify-between items-end mb-10">
                <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Total Estimado</span>
                {/* Cambio de $ a L en el total mostrado */}
                <span className="text-3xl font-serif">L{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={enviarPedidoWhatsApp}
                className="w-full bg-[#D4AF37] text-[#001A33] py-5 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Finalizar Pedido
              </button>
              <p className="mt-6 text-[9px] text-white/40 text-center uppercase font-bold tracking-widest">
                Envío de lujo • Atención Personalizada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}