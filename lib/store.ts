import { create } from 'zustand'
import { Producto } from '@/types'

interface CartItem extends Producto {
  cantidad: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Producto) => void
  removeItem: (productId: string) => void // Resta 1 a la cantidad
  clearItem: (productId: string) => void  // Elimina el producto completo (Botón Basura)
  clearCart: () => void                   // Vacía todo el carrito
  total: number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  
  // Añadir producto o aumentar cantidad
  addItem: (product) => {
    const currentItems = get().items
    const existingItem = currentItems.find((item) => item.id === product.id)

    if (existingItem) {
      const updatedItems = currentItems.map((item) =>
        item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
      set({ items: updatedItems, total: get().total + product.precio })
    } else {
      set({ 
        items: [...currentItems, { ...product, cantidad: 1 }], 
        total: get().total + product.precio 
      })
    }
  },

  // Restar 1 a la cantidad (para el botón de "-")
  removeItem: (productId) => {
    const currentItems = get().items
    const existingItem = currentItems.find(i => i.id === productId)
    
    if (!existingItem) return

    if (existingItem.cantidad > 1) {
      const updatedItems = currentItems.map((item) =>
        item.id === productId ? { ...item, cantidad: item.cantidad - 1 } : item
      )
      set({ items: updatedItems, total: get().total - existingItem.precio })
    } else {
      // Si solo queda 1, se elimina por completo
      const updatedItems = currentItems.filter((item) => item.id !== productId)
      set({ items: updatedItems, total: get().total - existingItem.precio })
    }
  },

  // Eliminar el producto por completo (para el botón de basura)
  clearItem: (productId) => {
    const itemToRemove = get().items.find(i => i.id === productId)
    if (!itemToRemove) return
    
    const updatedItems = get().items.filter((item) => item.id !== productId)
    set({ 
      items: updatedItems, 
      total: get().total - (itemToRemove.precio * itemToRemove.cantidad) 
    })
  },

  // Vaciar el carrito completamente
  clearCart: () => set({ items: [], total: 0 }),
}))