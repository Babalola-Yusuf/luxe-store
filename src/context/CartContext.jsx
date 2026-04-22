import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const qty = (state[action.id] || 0) + 1
      return { ...state, [action.id]: qty }
    }
    case 'CHANGE': {
      const qty = Math.max(0, (state[action.id] || 0) + action.delta)
      if (qty === 0) {
        const next = { ...state }
        delete next[action.id]
        return next
      }
      return { ...state, [action.id]: qty }
    }
    case 'REMOVE': {
      const next = { ...state }
      delete next[action.id]
      return next
    }
    case 'CLEAR':
      return {}
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, {})

  const addToCart   = (id)          => dispatch({ type: 'ADD',    id })
  const changeQty   = (id, delta)   => dispatch({ type: 'CHANGE', id, delta })
  const removeItem  = (id)          => dispatch({ type: 'REMOVE', id })
  const clearCart   = ()            => dispatch({ type: 'CLEAR' })

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQty, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
