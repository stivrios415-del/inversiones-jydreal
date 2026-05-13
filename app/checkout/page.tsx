"use client"
import { useState } from 'react'
import { useCart } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'transferencia'>('transferencia')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const datosCliente = {
      nombre_cliente: formData.get('nombre') as string,
      correo_cliente: formData.get('correo') as string,
      direccion: formData.get('direccion') as string,
      metodo_pago: metodoPago,
      total: total,
      estado: 'Pendiente'
    }

    try {
      // 1. Guardar el pedido en Supabase para tener un respaldo
      const { data, error } = await supabase
        .from('pedidos')
        .insert([datosCliente])

      if (error) throw error

      // 2. Si es transferencia, armar el mensaje de WhatsApp detallado
      if (metodoPago === 'transferencia') {
        const listaProductos = items.map(i => `- ${i.nombre} (x${i.cantidad})`).join('\n')
        const mensaje = `🛍️ *NUEVO PEDIDO - INVERSIONES J Y D*\n\n` +
                        `*Cliente:* ${datosCliente.nombre_cliente}\n` +
                        `*Dirección:* ${datosCliente.direccion}\n\n` +
                        `*Productos:*\n${listaProductos}\n\n` +
                        `*Total:* $${total.toFixed(2)}\n` +
                        `*Método:* Transferencia\n\n` +
                        `¿Me pueden confirmar los datos bancarios para el pago?`
        
        // REEMPLAZA EL NÚMERO AQUÍ (Formato internacional, ej: 50499999999)
        const tuNumero = "50489762100" 
        const whatsappUrl = `https://wa.me/${tuNumero}?text=${encodeURIComponent(mensaje)}`
        
        clearCart()
        window.location.href = whatsappUrl
      } else {
        // Aquí iría la lógica de Stripe para tarjetas
        alert("Integración de tarjeta en proceso. Por favor usa transferencia por ahora.")
      }

    } catch (err) {
      alert("Hubo un error al procesar tu pedido. Intenta de nuevo.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-black">Tu carrito está vacío</h2>
        <Link href="/" className="text-rose-500 font-bold hover:underline">Volver a la tienda</Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Formulario */}
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter mb-8 text-black">DATOS DE ENTREGA</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input name="nombre" placeholder="Nombre completo" required className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none text-black" />
                <input name="correo" type="email" placeholder="Correo electrónico" required className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none text-black" />
                <textarea name="direccion" placeholder="Dirección exacta en Honduras" required className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none text-black" rows={3} />
              </div>

              <div className="pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-400">Método de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setMetodoPago('transferencia')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${metodoPago === 'transferencia' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${metodoPago === 'transferencia' ? 'text-rose-500' : 'text-gray-200'}`} />
                    <span className="font-bold text-xs text-black">TRANSFERENCIA</span>
                  </button>
                  <button type="button" onClick={() => setMetodoPago('tarjeta')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${metodoPago === 'tarjeta' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}>
                    <CheckCircle2 className="w-5 h-5 text-gray-200" />
                    <span className="font-bold text-xs text-black">TARJETA</span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-xl shadow-gray-200">
                {loading ? 'PROCESANDO...' : 'CONFIRMAR Y ENVIAR PEDIDO'}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-8 rounded-3xl h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-black tracking-tighter">RESUMEN DE COMPRA</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={item.imagen_url} className="w-12 h-12 object-cover rounded-lg" alt={item.nombre} />
                    <div>
                      <p className="font-bold text-sm text-black">{item.nombre}</p>
                      <p className="text-xs text-gray-400">Cantidad: {item.cantidad}</p>
                    </div>
                  </div>
                  <span className="font-bold text-black">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
              <div className="flex justify-between items-center text-2xl font-black text-black">
                <span>TOTAL</span>
                <span className="text-rose-500">${total.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-tighter">Al confirmar, serás redirigido a WhatsApp para finalizar los detalles de pago con un asesor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}