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
  
  // CORRECCIÓN: Aseguramos que el estado inicial coincida con una opción del select
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
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setProductos(data)
    setLoadingInv(false)
  }

  useEffect(() => {
    if (authorized) cargarInventario()
  }, [authorized])

  const prepararEdicion = (producto: any) => {
    setEditingId(producto.id)
    setForm({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      categoria: producto.categoria // Esto ahora cargará correctamente el valor
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
        categoria: form.categoria.toLowerCase(), // Normalizamos a minúsculas
        imagen_url: finalImageUrl
      }

      if (editingId) {
        const { error } = await supabase
          .from('productos')
          .update(datosProducto)
          .eq('id', editingId)
        
        if (error) throw error
        setMensaje('¡Producto actualizado!')
      } else {
        if (!file) throw new Error('Imagen requerida')
        const { error } = await supabase.from('productos').insert([datosProducto])
        if (error) throw error
        setMensaje('¡Publicado con éxito!')
      }

      // IMPORTANTE: Resetear estados y refrescar
      cancelarEdicion()
      await cargarInventario() 
      
    } catch (error: any) {
      setMensaje('Error: ' + error.message)
    } finally {
      setLoading(false)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Eliminar definitivamente?")) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) {
        setProductos(productos.filter(p => p.id !== id))
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-6 font-sans">
        <div className="max-w-md w-full p-8 bg-white text-center border-t-4 border-[#D4AF37] shadow-2xl rounded-xl">
          <Lock className="text-[#D4AF37] w-10 h-10 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-[#001A33] mb-6 tracking-widest uppercase">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] text-[#001A33]"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 top-3 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="w-full bg-[#001A33] text-white py-4 text-xs font-black tracking-widest uppercase rounded-lg active:scale-95 transition-transform">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <header className="bg-[#001A33] text-white py-6 px-6 shadow-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-serif italic text-[#D4AF37]">Inversiones JyD <span className="text-white/50 text-xs not-italic font-sans ml-2 uppercase tracking-tighter">Panel</span></h1>
          <button onClick={() => setAuthorized(false)} className="text-white/40 hover:text-red-400 transition-colors"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'subir' ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-serif text-[#001A33]">{editingId ? 'Editar Producto' : 'Nueva Pieza'}</h2>
                {editingId && <button onClick={cancelarEdicion} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 border border-red-100 px-2 py-1 rounded"><X size={12}/> Cancelar</button>}
              </div>

              {mensaje && <div className="p-3 bg-[#001A33] text-[#D4AF37] text-[10px] font-black text-center uppercase rounded-lg animate-pulse">{mensaje}</div>}
              
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-1">
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Nombre</label>
                  <input required className="w-full bg-transparent outline-none text-[#001A33] py-2 font-medium" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Precio ($)</label>
                    <input required type="number" step="0.01" className="w-full bg-transparent outline-none text-[#001A33] font-bold py-2" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Categoría</label>
                    <select 
                      className="w-full bg-transparent outline-none text-[#001A33] text-[10px] font-bold uppercase py-2" 
                      value={form.categoria} 
                      onChange={(e) => setForm({...form, categoria: e.target.value})}
                    >
                      {/* CORRECCIÓN: Los values deben ser consistentes */}
                      <option value="lenceria">Lencería</option>
                      <option value="maquillaje">Cosmética</option>
                      <option value="perfumes">Perfumes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest block mb-2">Imagen del catálogo</label>
                  <label className="border-2 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative rounded-xl transition-all">
                    {file || currentImageUrl ? (
                      <img src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="text-[#D4AF37] mx-auto mb-2" size={28} />
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tocar para subir</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-[#001A33] text-[#D4AF37] py-5 font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-xl active:scale-95 transition-transform disabled:opacity-50">
                {loading ? 'Sincronizando...' : editingId ? 'Guardar Cambios' : 'Publicar en Tienda'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="flex justify-between items-center bg-white p-5 shadow-sm rounded-xl border border-gray-100">
                <h2 className="text-lg font-serif text-[#001A33]">Inventario <span className="text-[#D4AF37] italic">Digital</span></h2>
                <button onClick={cargarInventario} className={`text-[#001A33] p-2 transition-transform ${loadingInv ? 'animate-spin' : 'active:rotate-180'}`} disabled={loadingInv}>
                    <RefreshCw size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 pb-10">
                {productos.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <img src={prod.imagen_url} className="w-16 h-16 object-cover rounded-lg bg-gray-50 shadow-inner" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#001A33] truncate">{prod.nombre}</h4>
                      <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">${prod.precio.toFixed(2)} • {prod.categoria}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => prepararEdicion(prod)} className="p-3 bg-[#F8FAFC] text-[#001A33] rounded-full active:bg-[#001A33] active:text-white transition-colors border border-gray-100"><Edit3 size={16} /></button>
                      <button onClick={() => eliminarProducto(prod.id)} className="p-3 bg-red-50 text-red-500 rounded-full active:bg-red-500 active:text-white transition-colors border border-red-100"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#001A33] border-t border-[#D4AF37]/30 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center h-20 px-4">
          <button 
            onClick={() => setActiveTab('subir')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'subir' ? 'text-[#D4AF37] scale-110' : 'text-white/40 hover:text-white'}`}
          >
            <PlusCircle size={ activeTab === 'subir' ? 28 : 24 } />
            <span className="text-[8px] font-black uppercase tracking-tighter">{editingId ? 'Editar' : 'Añadir'}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('galeria'); cargarInventario(); }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'galeria' ? 'text-[#D4AF37] scale-110' : 'text-white/40 hover:text-white'}`}
          >
            <div className="relative">
                <LayoutGrid size={ activeTab === 'galeria' ? 28 : 24 } />
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#001A33] text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#001A33] shadow-lg">
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