import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  // Obtenemos los productos de Supabase
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-10 text-center text-red-500">Error al cargar productos</div>;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sección de Bienvenida */}
      <section className="bg-white px-8 py-16 text-center border-b border-gray-100">
        <h1 className="text-5xl md:text-7xl font-serif italic text-[#001A33] mb-6 tracking-tight">
  Inversiones <span className="text-[#D4AF37] not-italic font-bold">J y D</span>
</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base tracking-wide uppercase">
          Lencería Exclusiva • Maquillaje Profesional • Perfumes Importados
        </p>
      </section>

      {/* Grid de Productos */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-black">Novedades</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productos?.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

        {productos?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Aún no hay productos disponibles. ¡Agrégalos en Supabase!</p>
          </div>
        )}
      </div>
    </main>
  )
}