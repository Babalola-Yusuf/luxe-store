import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem('cart-items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart-items', JSON.stringify(items))
  }, [items])

  function addToCart(productId, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(([id]) => id === productId)
      if (existing) {
        return prev.map(([id, qty]) => 
          id === productId ? [id, qty + quantity] : [id, qty]
        )
      }
      return [...prev, [productId, quantity]]
    })
  }

  function removeFromCart(productId) {
    setItems(prev => prev.filter(([id]) => id !== productId))
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev => 
      prev.map(([id, qty]) => id === productId ? [id, quantity] : [id, qty])
    )
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem('cart-items')
  }

  const totalItems = items.reduce((sum, [, qty]) => sum + qty, 0)

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}