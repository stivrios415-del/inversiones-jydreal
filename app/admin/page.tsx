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

  // Estados Formulario / Edición
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: 'lenceria' })
  const [file, setFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')

  // Estados Inventario
  const [productos, setProductos] = useState<any[]>([])
  const [loadingInv, setLoadingInv] = useState(false)

  const PASSWORD_CORRECTA = "admin123"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD_CORRECTA) setAuthorized(true)
    else alert("Acceso Denegado")
  }

  // CARGAR PRODUCTOS DESDE LA TABLA
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

  // PREPARAR EDICIÓN
  const prepararEdicion = (producto: any) => {
    setEditingId(producto.id)
    setForm({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      categoria: producto.categoria
    })
    setCurrentImageUrl(producto.imagen_url)
    setActiveTab('subir') // Regresa al formulario
  }

  const cancelarEdicion = () => {
    setEditingId(null)
    setForm({ nombre: '', precio: '', categoria: 'lenceria' })
    setFile(null)
    setCurrentImageUrl('')
  }

  // GUARDAR O ACTUALIZAR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      let finalImageUrl = currentImageUrl

      // Si hay un archivo nuevo, lo subimos
      if (file) {
        const fileName = `${Date.now()}-${file.name}`
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
        // ACTUALIZAR
        const { error } = await supabase.from('productos').update(datosProducto).eq('id', editingId)
        if (error) throw error
        setMensaje('¡Producto actualizado correctamente!')
      } else {
        // INSERTAR NUEVO
        if (!file) throw new Error('Se requiere una imagen para nuevos productos')
        const { error } = await supabase.from('productos').insert([datosProducto])
        if (error) throw error
        setMensaje('¡Producto creado con éxito!')
      }

      cancelarEdicion()
      cargarInventario()
    } catch (error: any) {
      setMensaje('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Eliminar este producto de la tienda definitivamente?")) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) cargarInventario()
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-10 bg-white shadow-2xl text-center border-t-4 border-[#D4AF37]">
          <Lock className="text-[#D4AF37] w-12 h-12 mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-[#001A33] mb-8">Panel Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type={showPass ? "text" : "password"} 
              className="w-full border-b py-3 outline-none focus:border-[#D4AF37]"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#001A33] text-white py-4 text-[10px] font-black tracking-widest uppercase">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl overflow-hidden border border-gray-100">
        
        {/* Cabecera y Tabs */}
        <div className="bg-[#001A33] p-8 flex justify-between items-center">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('subir')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'subir' ? 'text-[#D4AF37]' : 'text-white/40'}`}
            >
              {editingId ? 'Editando Producto' : 'Nuevo Producto'}
            </button>
            <button 
              onClick={() => setActiveTab('galeria')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'galeria' ? 'text-[#D4AF37]' : 'text-white/40'}`}
            >
              Inventario Total ({productos.length})
            </button>
          </div>
          <button onClick={() => setAuthorized(false)} className="text-white/20 hover:text-white transition-colors"><LogOut size={20}/></button>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'subir' ? (
              <motion.form 
                key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} className="space-y-10"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-serif text-[#001A33] italic">
                    {editingId ? 'Modificar Registro' : 'Nueva Pieza de Catálogo'}
                  </h2>
                  {editingId && (
                    <button onClick={cancelarEdicion} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-2">
                      <X size={14}/> Cancelar Edición
                    </button>
                  )}
                </div>

                {mensaje && <div className="p-4 bg-[#001A33] text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">{mensaje}</div>}
                
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="border-b border-gray-100 pb-2 focus-within:border-[#D4AF37] transition-colors">
                      <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Nombre</label>
                      <input required className="w-full bg-transparent outline-none text-[#001A33] font-serif" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
                    </div>
                    <div className="border-b border-gray-100 pb-2 focus-within:border-[#D4AF37] transition-colors">
                      <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Precio ($)</label>
                      <input required type="number" step="0.01" className="w-full bg-transparent outline-none text-[#001A33] font-bold" value={form.precio} onChange={(e) => setForm({...form, precio: e.target.value})} />
                    </div>
                    <div className="border-b border-gray-100 pb-2 focus-within:border-[#D4AF37] transition-colors">
                      <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Categoría</label>
                      <select className="w-full bg-transparent outline-none uppercase text-[10px] font-bold" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                        <option value="lenceria">Lencería</option>
                        <option value="maquillaje">Cosmética</option>
                        <option value="perfumes">Perfumes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-gray-400">Imagen del Producto</label>
                    <label className="border-2 border-dashed border-gray-100 aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative">
                      {file || currentImageUrl ? (
                        <img src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="text-[#D4AF37]" />
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-[#001A33] text-[#D4AF37] py-6 font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl">
                  {loading ? 'Guardando Cambios...' : editingId ? 'Actualizar Producto' : 'Publicar en Tienda'}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-serif text-[#001A33] italic">Inventario de Productos</h2>
                  <button onClick={cargarInventario} className="text-[#001A33] hover:rotate-180 transition-transform duration-500">
                    <RefreshCw size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {productos.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-6 p-4 bg-[#F8FAFC] border border-gray-100 hover:border-[#D4AF37] transition-all group">
                      <img src={prod.imagen_url} className="w-16 h-16 object-cover bg-white" />
                      <div className="flex-1">
                        <h4 className="font-serif text-[#001A33]">{prod.nombre}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase">{prod.categoria}</span>
                          <span className="text-[9px] font-bold text-gray-400">${prod.precio}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => prepararEdicion(prod)}
                          className="p-3 bg-white text-[#001A33] hover:bg-[#001A33] hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => eliminarProducto(prod.id)}
                          className="p-3 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}