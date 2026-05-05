"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Package, DollarSign, Tag, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPanel() {
  // Estados para Seguridad
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Estados para el Formulario
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: 'Lencería' })
  const [file, setFile] = useState<File | null>(null)

  // CAMBIA TU CONTRASEÑA AQUÍ
  const PASSWORD_CORRECTA = "admin123"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD_CORRECTA) {
      setAuthorized(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      if (!file) throw new Error('Debes seleccionar una imagen')

      // 1. Subir la imagen a Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName)
      const imagenUrl = urlData.publicUrl

      // 3. Guardar en la tabla productos
      const { error: insertError } = await supabase
        .from('productos')
        .insert([{
          nombre: form.nombre,
          precio: parseFloat(form.precio),
          categoria: form.categoria,
          imagen_url: imagenUrl
        }])

      if (insertError) throw insertError

      setMensaje('¡Producto guardado con éxito!')
      setForm({ nombre: '', precio: '', categoria: 'Lencería' })
      setFile(null)
    } catch (error: any) {
      setMensaje('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // PANTALLA DE LOGIN (Si no ha puesto la contraseña)
  if (!authorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-rose-100 text-center"
        >
          <div className="bg-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-black uppercase">Acceso Privado</h1>
          <p className="text-gray-400 text-[10px] tracking-[0.2em] font-bold mt-2 mb-8">INVERSIONES J Y D</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-black outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="Ingresa la clave maestra"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button className="w-full bg-black text-white py-4 rounded-2xl font-black tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
              ENTRAR AL PANEL
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // PANEL ADMINISTRADOR (Si la contraseña es correcta)
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-black p-10 text-center">
          <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase">
            Panel <span className="text-rose-500">Administrador</span>
          </h1>
          <div className="flex justify-center gap-4 mt-3">
             <span className="text-gray-500 text-[10px] tracking-widest font-bold border border-zinc-800 px-3 py-1 rounded-full uppercase">
                Gestión de Inventario
             </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {mensaje && (
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${mensaje.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
            >
              <CheckCircle2 className="w-5 h-5" /> {mensaje}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nombre del Producto</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-black"
                placeholder="Ej: Perfume Chanel N°5"
                value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Precio Unitario ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  required type="number" step="0.01"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-black font-bold"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={(e) => setForm({...form, precio: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoría</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none appearance-none text-black font-medium"
                  value={form.categoria}
                  onChange={(e) => setForm({...form, categoria: e.target.value})}
                >
                  <option value="Lencería">Lencería</option>
                  <option value="Maquillaje">Maquillaje</option>
                  <option value="Perfumes">Perfumes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Imagen del Producto</label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:bg-gray-50 hover:border-rose-200 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <Upload className="w-8 h-8 text-rose-500 mb-3" />
                <p className="text-xs font-bold text-gray-500 tracking-tight">
                  {file ? file.name : "Click para abrir galería"}
                </p>
                <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold tracking-tighter">JPG, PNG o WEBP • Max 5MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white py-5 rounded-2xl font-black tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-gray-200"
            >
              {loading ? 'SUBIENDO PRODUCTO...' : 'PUBLICAR EN LA TIENDA'}
            </button>
            <button 
              type="button"
              onClick={() => setAuthorized(false)}
              className="w-full mt-4 text-[10px] font-black text-gray-300 hover:text-rose-500 transition-colors tracking-widest uppercase"
            >
              Cerrar Sesión de Admin
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}