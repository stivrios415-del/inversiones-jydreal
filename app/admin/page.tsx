"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Package, DollarSign, Tag, CheckCircle2, Lock, Eye, EyeOff, LogOut, Trash2, RefreshCw, Edit3, X, List } from 'lucide-react'
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
        setMensaje('¡Actualizado!')
      } else {
        if (!file) throw new Error('Imagen requerida')
        const { error } = await supabase.from('productos').insert([datosProducto])
        if (error) throw error
        setMensaje('¡Publicado!')
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
    if (!confirm("¿Eliminar definitivamente?")) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) {
        setProductos(productos.filter(p => p.id !== id))
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-6">
        <div className="max-w-md w-full p-8 bg-white shadow-2xl text-center border-t-4 border-[#D4AF37]">
          <Lock className="text-[#D4AF37] w-10 h-10 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-[#001A33] mb-6">ADMIN</h1>
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
            <button className="w-full bg-[#001A33] text-white py-4 text-xs font-black tracking-widest uppercase">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* BARRA DE NAVEGACIÓN CORREGIDA PARA MÓVIL */}
      <div className="sticky top-0 z-50 bg-[#001A33] text-white shadow-lg w-full">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => setActiveTab('subir')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'subir' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/40'}`}
          >
            <Upload size={14} />
            <span className="hidden xs:inline">{editingId ? 'Editar' : 'Nuevo'}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('galeria'); cargarInventario(); }}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'galeria' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/40'}`}
          >
            <List size={14} />
            <span className="hidden xs:inline">Inventario</span>
            <span className="bg-[#D4AF37] text-[#001A33] px-1.5 py-0.5 rounded-sm text-[8px]">{productos.length}</span>
          </button>

          <button onClick={() => setAuthorized(false)} className="p-2 text-white/40 hover:text-white transition-colors">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'subir' ? (
            <motion.form 
              key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-serif text-[#001A33] italic">{editingId ? 'Editar Producto' : 'Nueva Pieza'}</h2>
                {editingId && <button onClick={cancelarEdicion} className="text-red-500 text-[9px] font-black uppercase border border-red-500 px-2 py-1">Cancelar</button>}
              </div>

              {mensaje && <div className="p-3 bg-[#001A33] text-[#D4AF37] text-[10px] font-black text-center uppercase tracking-widest">{mensaje}</div>}
              
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-1">
                  <label className="text-[8px] font-black uppercase text-gray-400">Nombre</label>
                  <input required className="w-full bg-transparent outline-none text-[#001A33] py-1" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400">Precio</label>
                    <input required type="number" step="0.01" className="w-full bg-transparent outline-none text-[#001A33] font-bold py-1" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div className="border-b border-gray-100 pb-1">
                    <label className="text-[8px] font-black uppercase text-gray-400">Categoría</label>
                    <select className="w-full bg-transparent outline-none text-[#001A33] text-[9px] font-bold uppercase py-1" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                      <option value="lenceria">Lencería</option>
                      <option value="maquillaje">Cosmética</option>
                      <option value="perfumes">Perfumes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400">Fotografía</label>
                  <label className="border-2 border-dashed border-gray-100 aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
                    {file || currentImageUrl ? (
                      <img src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="text-[#D4AF37]" size={24} />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-[#001A33] text-[#D4AF37] py-5 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg">
                {loading ? 'Procesando...' : editingId ? 'Actualizar' : 'Publicar'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <div className="flex justify-between items-center bg-white p-4 shadow-sm border-l-4 border-[#D4AF37]">
                <h2 className="text-lg font-serif text-[#001A33] italic">Catálogo</h2>
                <button onClick={cargarInventario} className="text-[#001A33] p-2 active:rotate-180 transition-transform"><RefreshCw size={18} /></button>
              </div>

              {loadingInv ? (
                <div className="text-center py-20 animate-pulse text-[10px] font-black text-gray-300 uppercase tracking-widest">Sincronizando...</div>
              ) : (
                <div className="space-y-2">
                  {productos.length === 0 ? (
                    <div className="bg-white p-10 text-center text-gray-400 font-serif italic border border-dashed">No hay productos registrados</div>
                  ) : (
                    productos.map((prod) => (
                      <div key={prod.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 shadow-sm rounded-sm">
                        <img src={prod.imagen_url} className="w-12 h-12 object-cover bg-gray-50 rounded-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-[13px] text-[#001A33] truncate leading-tight">{prod.nombre}</h4>
                          <div className="flex gap-2 items-center">
                            <span className="text-[8px] font-black text-[#D4AF37] uppercase">{prod.categoria}</span>
                            <span className="text-[9px] font-bold text-gray-400">${prod.precio}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => prepararEdicion(prod)} className="p-2.5 text-[#001A33] active:bg-[#001A33] active:text-white rounded-full transition-colors border border-gray-50"><Edit3 size={14} /></button>
                          <button onClick={() => eliminarProducto(prod.id)} className="p-2.5 text-red-400 active:bg-red-500 active:text-white rounded-full transition-colors border border-gray-50"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}