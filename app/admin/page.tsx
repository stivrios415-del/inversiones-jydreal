"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Package, DollarSign, Tag, CheckCircle2, Lock, Eye, EyeOff, LogOut, Trash2, RefreshCw, Edit3, X } from 'lucide-react'
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
        const { error } = await supabase.from('productos').update(datosProducto).eq('id', editingId)
        if (error) throw error
        setMensaje('¡Actualizado con éxito!')
      } else {
        if (!file) throw new Error('Se requiere una imagen')
        const { error } = await supabase.from('productos').insert([datosProducto])
        if (error) throw error
        setMensaje('¡Publicado con éxito!')
      }

      cancelarEdicion()
      cargarInventario()
    } catch (error: any) {
      setMensaje('Error: ' + error.message)
    } finally {
      setLoading(false)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Eliminar este producto definitivamente?")) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) {
        setProductos(productos.filter(p => p.id !== id))
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full p-8 bg-white shadow-2xl text-center border-t-4 border-[#D4AF37]">
          <Lock className="text-[#D4AF37] w-10 h-10 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-[#001A33] mb-6 uppercase tracking-widest">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] text-center text-[#001A33]"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 top-3 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="w-full bg-[#001A33] text-white py-4 text-xs font-black tracking-[0.2em] uppercase active:scale-95 transition-transform">Entrar al Sistema</button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Cabecera Móvil */}
      <div className="sticky top-0 z-50 bg-[#001A33] text-white shadow-lg">
        <div className="flex justify-between items-center px-6 py-5">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('subir')}
              className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'subir' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40'}`}
            >
              {editingId ? 'Editando' : 'Añadir'}
            </button>
            <button 
              onClick={() => setActiveTab('galeria')}
              className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'galeria' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40'}`}
            >
              Inventario ({productos.length})
            </button>
          </div>
          <button onClick={() => setAuthorized(false)} className="text-white/40 active:text-white"><LogOut size={18}/></button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'subir' ? (
            <motion.form 
              key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif text-[#001A33] italic">{editingId ? 'Editar Producto' : 'Nueva Pieza'}</h2>
                {editingId && <button onClick={cancelarEdicion} className="text-red-500 text-[10px] font-bold uppercase underline">Cancelar</button>}
              </div>

              {mensaje && <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-3 bg-[#001A33] text-[#D4AF37] text-[10px] font-black text-center uppercase tracking-widest">{mensaje}</motion.div>}
              
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-1 focus-within:border-[#D4AF37]">
                  <label className="text-[8px] font-black uppercase text-gray-400">Nombre del Producto</label>
                  <input required className="w-full bg-transparent outline-none text-[#001A33] py-1" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-100 pb-1 focus-within:border-[#D4AF37]">
                    <label className="text-[8px] font-black uppercase text-gray-400">Precio ($)</label>
                    <input required type="number" step="0.01" className="w-full bg-transparent outline-none text-[#001A33] font-bold py-1" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div className="border-b border-gray-100 pb-1 focus-within:border-[#D4AF37]">
                    <label className="text-[8px] font-black uppercase text-gray-400">Categoría</label>
                    <select className="w-full bg-transparent outline-none text-[#001A33] text-[10px] font-bold uppercase py-1" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                      <option value="lenceria">Lencería</option>
                      <option value="maquillaje">Cosmética</option>
                      <option value="perfumes">Perfumes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400">Foto del Producto</label>
                  <label className="border-2 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative rounded-lg">
                    {file || currentImageUrl ? (
                      <img src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="text-[#D4AF37] mx-auto mb-2" size={24} />
                        <span className="text-[9px] font-black text-gray-300 uppercase">Tocar para subir</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-[#001A33] text-[#D4AF37] py-5 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95 disabled:opacity-50">
                {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Publicar Producto'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-serif text-[#001A33] italic">Lista de Productos</h2>
                <button onClick={cargarInventario} className="text-[#001A33] active:rotate-180 transition-transform"><RefreshCw size={18} /></button>
              </div>

              {loadingInv ? (
                <div className="text-center py-10 text-[10px] font-black text-gray-300 uppercase tracking-widest">Cargando catálogo...</div>
              ) : (
                <div className="space-y-3">
                  {productos.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-4 p-3 bg-white border border-gray-50 shadow-sm active:bg-gray-50 transition-colors">
                      <img src={prod.imagen_url} className="w-14 h-14 object-cover rounded-sm bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm text-[#001A33] truncate">{prod.nombre}</h4>
                        <div className="flex gap-3 items-center">
                          <span className="text-[8px] font-black text-[#D4AF37] uppercase">{prod.categoria}</span>
                          <span className="text-[9px] font-bold text-gray-400">${prod.precio}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => prepararEdicion(prod)} className="p-3 text-[#001A33] active:bg-[#001A33] active:text-white rounded-full transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => eliminarProducto(prod.id)} className="p-3 text-red-400 active:bg-red-500 active:text-white rounded-full transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}