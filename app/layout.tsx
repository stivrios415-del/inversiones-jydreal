import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer' // Importa el footer

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        {children}
        <Footer /> {/* Ponlo aquí abajo */}
      </body>
    </html>
  )
}