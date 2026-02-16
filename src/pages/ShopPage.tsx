import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { useProducts, useCart, useOrders, usePromotions } from "@/hooks/useShop"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShoppingCart, Plus, Minus, Trash2, Package, Tag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ShopPage() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const { products } = useProducts()
  const { items, addItem, removeItem, updateQuantity, total, itemCount, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { promotions } = usePromotions()
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddToCart = () => {
    if (!selectedProduct) return
    addItem(selectedProduct, 1, selectedSize)
    setSelectedProduct(null)
    setSelectedSize("")
  }

  const handleCheckout = async () => {
    if (!user?.id || profile?.is_moroso) return
    setIsSubmitting(true)
    try {
      await createOrder(user.id, items)
      clearCart()
      setIsCartOpen(false)
      alert("Ordine inviato! Verrai contattato per il pagamento.")
    } catch (error) {
      alert("Errore durante l'invio dell'ordine")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shop VRB</h1>
          <p className="text-muted-foreground">Merchandising ufficiale</p>
        </div>
        <Button variant="outline" onClick={() => setIsCartOpen(true)} className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Carrello
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Moroso Warning */}
      {profile?.is_moroso && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          Non puoi effettuare ordini perché risulti moroso.
        </div>
      )}

      {/* Promotions */}
      {promotions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {promotions.map((promo) => (
            <Card key={promo.id} className="bg-gradient-to-r from-vrb-orange/10 to-vrb-magenta/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-vrb-orange mt-0.5" />
                  <div>
                    <p className="font-medium">{promo.title}</p>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    {promo.partner_name && (
                      <p className="text-sm text-muted-foreground">Partner: {promo.partner_name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-lg font-bold text-vrb-orange">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                  {product.stock > 0 ? `${product.stock} disp.` : "Esaurito"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {product.description}
              </p>
              <Button
                className="w-full mt-4"
                disabled={product.stock === 0 || profile?.is_moroso}
                onClick={() => setSelectedProduct(product)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-2xl font-bold text-vrb-orange">
              {selectedProduct && formatCurrency(selectedProduct.price)}
            </p>
            <p className="text-muted-foreground">{selectedProduct?.description}</p>

            {selectedProduct?.available_sizes &&
              (selectedProduct.available_sizes as string[]).length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taglia</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona taglia" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedProduct.available_sizes as string[]).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddToCart}
              disabled={Boolean(
                selectedProduct?.available_sizes &&
                (selectedProduct.available_sizes as string[]).length > 0 &&
                !selectedSize
              )}
            >
              Aggiungi al Carrello
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Carrello</DialogTitle>
          </DialogHeader>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Il carrello è vuoto</p>
          ) : (
            <>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      {item.size && <p className="text-sm text-muted-foreground">Taglia: {item.size}</p>}
                      <p className="text-sm">{formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 ml-2"
                        onClick={() => removeItem(item.product.id, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Totale</span>
                  <span className="text-2xl font-bold text-vrb-orange">
                    {formatCurrency(total)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={Boolean(isSubmitting || profile?.is_moroso)}
                >
                  {isSubmitting ? "Invio..." : "Conferma Ordine"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Pagamento in sede. Riceverai conferma via email.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
