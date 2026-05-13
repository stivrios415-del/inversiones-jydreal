"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Lock, Eye, EyeOff, LogOut, Trash2, RefreshCw, Edit3, X, LayoutGrid, PlusCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [activeTab, setActiveTab] = useState<'subir' | 'galeria'>('subir')

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: 'lenceria' })
  const [file, setFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')

  const [productos, setProductos] = useState<any[]>([])
  const [loadingInv, setLoadingInv] = useState(false)

  const PASSWORD_CORRECTA = "admin123"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD_CORRECTA) setAuthorized(true)
    else alert("Acceso Denegado")
  }

  const cargarInventario = async () => {
    setLoadingInv(true)
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setProductos(data)
    } catch (err) {
      console.error("Error al cargar:", err)
    } finally {
      setLoadingInv(false)
    }
  }

  useEffect(() => {
    if (authorized) cargarInventario()
  }, [authorized])

  const prepararEdicion = (producto: any) => {
    setEditingId(producto.id)
    setForm({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      categoria: producto.categoria
    })
    setCurrentImageUrl(producto.imagen_url)
    setActiveTab('subir')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setEditingId(null)
    setForm({ nombre: '', precio: '', categoria: 'lenceria' })
    setFile(null)
    setCurrentImageUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      let finalImageUrl = currentImageUrl

      // Subida de imagen si hay archivo nuevo
      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
        const { error: upError } = await supabase.storage.from('productos').upload(fileName, file)
        if (upError) throw upError
        const { data } = supabase.storage.from('productos').getPublicUrl(fileName)
        finalImageUrl = data.publicUrl
      }

      const datosProducto = {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        categoria: form.categoria.toLowerCase(),
        imagen_url: finalImageUrl
      }

      if (editingId) {
        // LÓGICA DE ACTUALIZACIÓN
        const { error: updateError } = await supabase
          .from('productos')
          .update(datosProducto)
          .eq('id', editingId)
        
        if (updateError) throw updateError
        setMensaje('¡Cambios guardados!')
      } else {
        // LÓGICA DE CREACIÓN
        if (!file) throw new Error('Imagen requerida para nuevos productos')
        const { error: insertError } = await supabase.from('productos').insert([datosProducto])
        if (insertError) throw insertError
        setMensaje('¡Publicado con éxito!')
      }

      // Refrescar datos y limpiar
      await cargarInventario()
      setTimeout(() => {
        cancelarEdicion()
        if (!editingId) setActiveTab('galeria') // Si era nuevo, ve al inventario
      }, 1500)
      
    } catch (error: any) {
      console.error("Error:", error)
      setMensaje('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Deseas eliminar este producto permanentemente?")) return
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      setProductos(productos.filter(p => p.id !== id))
    } catch (err: any) {
      alert("Error al borrar: " + err.message)
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-6">
        <div className="max-w-md w-full p-8 bg-white text-center border-t-4 border-[#D4AF37] shadow-2xl rounded-2xl">
          <Lock className="text-[#D4AF37] w-10 h-10 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-[#001A33] mb-6 uppercase tracking-widest">Acceso Panel</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] text-[#001A33] text-center"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 top-3 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="w-full bg-[#001A33] text-white py-4 text-xs font-black tracking-widest uppercase rounded-xl">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans">
      <header className="bg-[#001A33] text-white py-6 px-6 shadow-md sticky top-0 z-[60]">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-serif italic text-[#D4AF37]">Inversiones JyD <span className="text-white/40 text-[10px] not-italic font-sans uppercase">Admin</span></h1>
          <button onClick={() => setAuthorized(false)} className="text-white/40 hover:text-red-400"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'subir' ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100 space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-serif text-[#001A33]">{editingId ? 'Editando' : 'Nuevo Producto'}</h2>
                {editingId && <button onClick={cancelarEdicion} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"><X size={12}/> Cancelar</button>}
              </div>

              {mensaje && <div className="p-3 bg-[#001A33] text-[#D4AF37] text-[10px] font-black text-center uppercase rounded-xl shadow-lg">{mensaje}</div>}
              
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-1">
                  <label className="text-[8px] font-black uppercase text-gray-400">Nombre de la pieza</label>
                  <input required className="w-full bg-transparent outline-none text-[#001A33] py-2" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400">Precio (L)</label>
                    <input required type="number" step="0.01" className="w-full bg-transparent outline-none text-[#001A33] font-bold py-2" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400">Categoría</label>
                    <select className="w-full bg-transparent outline-none text-[#001A33] text-[10px] font-bold uppercase py-2 cursor-pointer" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                      <option value="lenceria">Lencería</option>
                      <option value="maquillaje">Cosmética</option>
                      <option value="perfumes">Perfumes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400">Fotografía</label>
                  <label className="border-2 border-dashed border-gray-100 aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative rounded-2xl transition-all">
                    {file || currentImageUrl ? (
                      <img src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center">
                        <Upload className="text-[#D4AF37] mx-auto mb-2" size={32} />
                        <span className="text-[9px] font-black text-gray-300 uppercase">Tocar para subir</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full bg-[#001A33] text-[#D4AF37] py-5 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? 'Sincronizando...' : editingId ? 'Guardar Cambios' : 'Publicar en Tienda'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-10">
              <div className="flex justify-between items-center bg-white p-5 shadow-sm rounded-2xl border border-gray-100">
                <h2 className="text-lg font-serif text-[#001A33]">Inventario</h2>
                <button onClick={cargarInventario} className={`text-[#001A33] p-2 ${loadingInv ? 'animate-spin' : ''}`}>
                    <RefreshCw size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {productos.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <img src={prod.imagen_url} className="w-16 h-16 object-cover rounded-xl bg-gray-50" alt={prod.nombre} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#001A33] truncate">{prod.nombre}</h4>
                     <p className="text-[10px] font-bold text-[#D4AF37] uppercase">L{prod.precio.toFixed(2)} • {prod.categoria}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => prepararEdicion(prod)} className="p-3 bg-gray-50 text-[#001A33] rounded-full active:bg-[#001A33] active:text-white transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => eliminarProducto(prod.id)} className="p-3 bg-red-50 text-red-500 rounded-full active:bg-red-500 active:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NAVEGACIÓN INFERIOR MEJORADA */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#001A33] border-t border-[#D4AF37]/20 pb-8 pt-4 px-10 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('subir')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'subir' ? 'text-[#D4AF37] scale-110' : 'text-white/30'}`}
          >
            <PlusCircle size={28} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{editingId ? 'Editar' : 'Añadir'}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('galeria'); cargarInventario(); }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'galeria' ? 'text-[#D4AF37] scale-110' : 'text-white/30'}`}
          >
            <div className="relative">
                <LayoutGrid size={28} />
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#001A33] text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#001A33]">
                    {productos.length}
                </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">Inventario</span>
          </button>
        </div>
      </nav>
    </div>
  )
}