import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Product, Order, OrderItem, Promotion } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

// ============================================
// PRODUCTS
// ============================================

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as SupabaseQuery)
        .from("products")
        .select("*")
        .eq("is_active", true)
      setProducts(data || [])
      setIsLoading(false)
    }
    fetch()
  }, [])

  return { products, isLoading }
}

// ============================================
// CART STORE (Zustand-style con React state)
// ============================================

export interface CartItem {
  product: Product
  quantity: number
  size?: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product, quantity: number, size?: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === size
      )
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, size }]
    })
  }

  const removeItem = (productId: number, size?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size))
    )
  }

  const updateQuantity = (productId: number, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }
}

// ============================================
// ORDERS
// ============================================

export function useOrders(athleteId?: string) {
  const [orders, setOrders] = useState<(Order & { items?: (OrderItem & { product?: Product })[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    let query = (supabase as SupabaseQuery)
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .order("created_at", { ascending: false })

    if (athleteId) query = query.eq("athlete_id", athleteId)

    const { data } = await query
    setOrders(data || [])
    setIsLoading(false)
  }, [athleteId])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const createOrder = async (athleteId: string, items: CartItem[]) => {
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

    const { data: order, error: orderError } = await (supabase as SupabaseQuery)
      .from("orders")
      .insert({ athlete_id: athleteId, total_amount: total, status: "pending" })
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      size: item.size,
      unit_price: item.product.price,
    }))

    const { error: itemsError } = await (supabase as SupabaseQuery)
      .from("order_items")
      .insert(orderItems)

    if (itemsError) throw new Error(itemsError.message)
    await fetchOrders()
  }

  return { orders, isLoading, refetch: fetchOrders, createOrder }
}

// ============================================
// PROMOTIONS
// ============================================

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as SupabaseQuery)
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString().split("T")[0])
      setPromotions(data || [])
      setIsLoading(false)
    }
    fetch()
  }, [])

  return { promotions, isLoading }
}
