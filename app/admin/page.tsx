"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Package, DollarSign, Tag, CheckCircle2, Lock, Eye, EyeOff, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPanel() {
  // Estados para Seguridad
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Estados para el Formulario
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: 'lenceria' })
  const [file, setFile] = useState<File | null>(null)

  // CONTRASEÑA MAESTRA
  const PASSWORD_CORRECTA = "admin123"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD_CORRECTA) {
      setAuthorized(true)
    } else {
      alert("Acceso Denegado: Credencial Incorrecta")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      if (!file) throw new Error('Se requiere una imagen para el catálogo')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName)
      const imagenUrl = urlData.publicUrl

      const { error: insertError } = await supabase
        .from('productos')
        .insert([{
          nombre: form.nombre,
          precio: parseFloat(form.precio),
          categoria: form.categoria.toLowerCase(),
          imagen_url: imagenUrl
        }])

      if (insertError) throw insertError

      setMensaje('¡Producto añadido a la colección con éxito!')
      setForm({ nombre: '', precio: '', categoria: 'lenceria' })
      setFile(null)
    } catch (error: any) {
      setMensaje('Error en el sistema: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // VISTA DE ACCESO (LOGIN)
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#001A33] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center border-t-4 border-[#D4AF37]"
        >
          <div className="bg-[#001A33] w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock className="text-[#D4AF37] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif italic text-[#001A33] mb-2">Acceso Exclusivo</h1>
          <p className="text-[#D4AF37] text-[9px] tracking-[0.4em] font-black uppercase mb-10">Admin • J y D</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                className="w-full bg-gray-50 border-b border-gray-200 py-4 px-2 text-[#001A33] outline-none focus:border-[#D4AF37] transition-all font-serif"
                placeholder="Contraseña de Administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001A33]"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="w-full bg-[#001A33] text-white py-5 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[#002a52] transition-all shadow-lg active:scale-95">
              AUTENTICAR SESIÓN
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // VISTA DEL PANEL (ADMIN)
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white shadow-[0_10px_40px_rgba(0,26,51,0.05)] overflow-hidden"
      >
        {/* Header del Panel */}
        <div className="bg-[#001A33] p-12 text-center relative">
          <button 
            onClick={() => setAuthorized(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-[#D4AF37] transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
          <h1 className="text-4xl font-serif italic text-white mb-2">
            Gestión de <span className="text-[#D4AF37]">Inventario</span>
          </h1>
          <p className="text-[#D4AF37] text-[8px] tracking-[0.5em] font-black uppercase opacity-80">
            Control de Calidad J y D
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
          {mensaje && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`p-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 ${mensaje.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-[#001A33] text-[#D4AF37]'}`}
            >
              <CheckCircle2 className="w-5 h-5" /> {mensaje}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Columna Izquierda: Datos */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[#001A33]/40 tracking-[0.2em]">Nombre de la Pieza</label>
                <div className="relative border-b border-gray-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                  <Package className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input 
                    required
                    className="w-full pl-8 pr-2 py-2 bg-transparent outline-none text-[#001A33] font-serif text-lg"
                    placeholder="Ej: Lencería de Encaje Silk"
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[#001A33]/40 tracking-[0.2em]">Precio Unitario ($)</label>
                  <div className="relative border-b border-gray-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input 
                      required type="number" step="0.01"
                      className="w-full pl-8 pr-2 py-2 bg-transparent outline-none text-[#001A33] font-serif text-lg"
                      placeholder="0.00"
                      value={form.precio}
                      onChange={(e) => setForm({...form, precio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-[#001A33]/40 tracking-[0.2em]">Colección / Categoría</label>
                  <div className="relative border-b border-gray-100 focus-within:border-[#D4AF37] transition-colors pb-2">
                    <Tag className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <select 
                      className="w-full pl-8 pr-2 py-2 bg-transparent outline-none text-[#001A33] font-bold text-xs uppercase tracking-widest appearance-none cursor-pointer"
                      value={form.categoria}
                      onChange={(e) => setForm({...form, categoria: e.target.value})}
                    >
                      <option value="lenceria">Lencería</option>
                      <option value="maquillaje">Cosmética</option>
                      <option value="perfumes">Perfumes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Imagen */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-[#001A33]/40 tracking-[0.2em]">Fotografía del Producto</label>
              <label className="flex flex-col items-center justify-center w-full h-full min-h-[250px] border border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:bg-[#F8FAFC] hover:border-[#D4AF37] transition-all group">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Upload className="w-8 h-8 text-[#001A33] mb-4 group-hover:text-[#D4AF37] transition-colors" />
                  <p className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-2">
                    {file ? file.name : "Subir Imagen"}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">Formato cuadrado recomendado</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#001A33] text-[#D4AF37] py-6 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#002a52] transition-all active:scale-[0.99] disabled:opacity-50 shadow-2xl"
            >
              {loading ? 'PROCESANDO ALTA...' : 'REGISTRAR EN EL CATÁLOGO'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}