"use client"
import { useCart } from '@/lib/store'
import { X, Trash2, ShoppingBag, Plus, Minus, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // Extraemos las funciones necesarias del store
  // Asegúrate de que 'removeItemAll' o 'clearItem' exista en tu store.ts
  const { items, total, removeItem, addItem, clearItem } = useCart()

  // CONFIGURACIÓN DE WHATSAPP (Midnight Style)
  const enviarPedidoWhatsApp = () => {
    const telefono = "50495708300" 
    
    let mensaje = `*SOLICITUD DE PEDIDO - INVERSIONES J Y D*%0A`
    mensaje += `_Midnight Collection_%0A`
    mensaje += `------------------------------%0A`
    
    items.forEach(item => {
      mensaje += `• ${item.cantidad}x ${item.nombre.toUpperCase()} - $${(item.precio * item.cantidad).toFixed(2)}%0A`
    })
    
    mensaje += `------------------------------%0A`
    mensaje += `*TOTAL ESTIMADO: $${total.toFixed(2)}*%0A%0A`
    mensaje += `Buen día, deseo coordinar el pago y envío de mi selección exclusiva.`

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con desenfoque suave */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#001A33]/40 z-[60] backdrop-blur-md"
          />

          {/* Panel Lateral Midnight Luxury */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col"
          >
            {/* Cabecera Minimalista */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif tracking-tight text-[#001A33]">Tu Selección</h2>
                <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.3em] mt-1">Inversiones J y D</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:rotate-90 transition-transform duration-300 text-[#001A33]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Productos Estilo Boutique */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="text-center py-24">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-100 mb-6 font-light" />
                  <p className="text-[#001A33]/40 font-serif italic text-lg">El carrito está esperando tu elección</p>
                  <button 
                    onClick={onClose} 
                    className="mt-6 text-[#001A33] font-bold text-xs uppercase tracking-widest border-b border-[#001A33] pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                  >
                    Explorar Colección
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden shadow-sm">
                      <img 
                        src={item.imagen_url} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        alt={item.nombre}
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <div>
                        <h4 className="font-serif text-[#001A33] text-lg leading-tight">{item.nombre}</h4>
                        <p className="text-[#D4AF37] font-bold text-sm mt-1 tracking-tight">${item.precio.toFixed(2)}</p>
                      </div>
                      
                      {/* Controles Minimalistas */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-100 rounded-full px-2">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-[#001A33] hover:text-[#D4AF37] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-8 text-center text-[#001A33]">{item.cantidad}</span>
                          <button 
                            onClick={() => addItem(item)}
                            className="p-2 text-[#001A33] hover:text-[#D4AF37] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* BOTÓN ELIMINAR ACTUALIZADO */}
                        <button 
                          onClick={() => clearItem(item.id)} 
                          className="text-gray-300 hover:text-red-700 transition-colors p-2"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer con Azul Medianoche */}
            {items.length > 0 && (
              <div className="p-8 bg-white border-t border-gray-50">
                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-[#001A33]/40 text-[10px] font-black uppercase tracking-[0.2em]">Total Estimado</span>
                  <span className="text-3xl font-serif text-[#001A33]">${total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={enviarPedidoWhatsApp}
                    className="w-full bg-[#001A33] text-white py-6 rounded-none font-bold text-center flex items-center justify-center gap-3 hover:bg-[#002a52] transition-all active:scale-[0.98] shadow-2xl shadow-blue-900/20"
                  >
                    <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="tracking-[0.2em] text-[10px] uppercase font-black">Finalizar Pedido</span>
                  </button>
                  
                  <div className="text-center space-y-2 pt-2">
                    <p className="text-[9px] text-[#001A33]/50 font-bold uppercase tracking-[0.2em]">
                      Atención Personalizada • Transferencia Bancaria
                    </p>
                    <div className="h-[1px] w-8 bg-[#D4AF37] mx-auto opacity-50" />
                    <p className="text-[9px] text-[#D4AF37] font-medium uppercase tracking-[0.1em] italic">
                      Envíos de lujo desde Saba, Honduras
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}