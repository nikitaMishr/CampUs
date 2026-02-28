"use client"

import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, CheckCircle, ChefHat, Ticket, User, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type FoodItem = {
  id: string
  name: string
  price: number
  image: string
  available: boolean
}

const MENU: FoodItem[] = [
  { id: '1', name: 'Puri Sabji', price: 35, image: 'https://i.postimg.cc/6pJZRCr0/puri-sabji.jpg', available: true },
  { id: '2', name: 'Masala Dosa', price: 35, image: 'https://i.postimg.cc/BQQSzbq3/masala-dosa.jpg', available: true },
  { id: '3', name: 'Samosa', price: 20, image: 'https://i.postimg.cc/Bbnrm82z/samosa.webp', available: true },
  { id: '4', name: 'Sandwich', price: 60, image: 'https://i.postimg.cc/L8gpdZw7/sandwich.webp', available: true },
  { id: '5', name: 'Noodles', price: 70, image: 'https://i.postimg.cc/NGKbk7X2/noodles.webp', available: true },
  { id: '6', name: 'Fried Rice with Manchurian', price: 75, image: 'https://i.postimg.cc/ncYdXV7j/fried-rice.webp', available: true },
]

export default function CanteenPage() {
  const { toast } = useToast()
  const [role, setRole] = useState<'user' | 'admin' | null>(null)
  const [cart, setCart] = useState<{ id: string, qty: number }[]>([])
  const [orderSlip, setOrderSlip] = useState<{ customer: string, items: { name: string, qty: number }[], total: number } | null>(null)
  const [isOrdering, setIsOrdering] = useState(false)

  useEffect(() => {
    setRole(localStorage.getItem('campus_role') as 'user' | 'admin')
  }, [])

  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id, qty: 1 }]
    })
    toast({ title: "Added to cart", description: "Ready to order when you are." })
  }

  const handlePlaceOrder = () => {
    setIsOrdering(true)
    const orderItems = cart.map(c => ({
      name: MENU.find(m => m.id === c.id)?.name || 'Unknown',
      qty: c.qty
    }))
    const total = cart.reduce((sum, c) => sum + (MENU.find(m => m.id === c.id)?.price || 0) * c.qty, 0)

    setTimeout(() => {
      setOrderSlip({
        customer: role === 'admin' ? 'Campus Admin' : 'Campus Student',
        items: orderItems,
        total: total
      })
      setCart([])
      setIsOrdering(false)
      toast({ title: "Order Successful", description: "Your digital slip is ready." })
    }, 1500)
  }

  if (!role) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Campus Canteen</h1>
          <p className="text-muted-foreground">Today's fresh menu curated for you.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="outline" className="gap-2 glass-card border-none h-11 px-6">
              <ShoppingCart size={20} className="text-primary" />
              <span className="font-bold">Cart ({cart.reduce((a, b) => a + b.qty, 0)})</span>
            </Button>
            {cart.length > 0 && (
              <div className="absolute top-14 right-0 w-72 glass-card rounded-2xl p-5 shadow-2xl z-20 border-none">
                <h4 className="font-bold mb-4 flex items-center gap-2"><ChefHat size={18} /> Your Order</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-5">
                  {cart.map(ci => {
                    const item = MENU.find(i => i.id === ci.id)
                    return (
                      <div key={ci.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item?.name} <span className="text-primary font-bold">x{ci.qty}</span></span>
                        <span className="font-bold">₹{(item?.price || 0) * ci.qty}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-3 border-t border-dashed border-border mb-4 flex justify-between font-black">
                  <span>Total</span>
                  <span className="text-primary">₹{cart.reduce((sum, c) => sum + (MENU.find(m => m.id === c.id)?.price || 0) * c.qty, 0)}</span>
                </div>
                <Button 
                  className="w-full bg-primary text-white font-bold h-11 rounded-xl" 
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? "Processing..." : "Confirm & Pay"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MENU.map((item) => (
          <Card key={item.id} className="glass-card group border-none overflow-hidden">
            <div className="h-44 relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <Badge className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary font-bold px-3">
                ₹{item.price}
              </Badge>
            </div>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
            </CardHeader>
            <CardFooter className="p-5 pt-2">
              <Button 
                onClick={() => addToCart(item.id)}
                className="w-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300 gap-2 font-bold h-11 rounded-xl border-none"
              >
                <Plus size={18} /> Add to Order
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Order Slip Dialog - Stabilized by removing glass-card hover effects */}
      <Dialog open={!!orderSlip} onOpenChange={() => setOrderSlip(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white/80 backdrop-blur-2xl shadow-2xl rounded-3xl">
          <div className="bg-primary/5 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black mb-1">Payment Successful</DialogTitle>
            <p className="text-muted-foreground text-sm">Your order is being prepared.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><User size={16} /> Customer</div>
              <div className="font-bold">{orderSlip?.customer}</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><Ticket size={14} /> Order Summary</div>
              {orderSlip?.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                  <span className="text-sm font-medium">{item.name} <span className="text-primary">x{item.qty}</span></span>
                  <span className="text-sm font-bold">₹{MENU.find(m => m.name === item.name)?.price! * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><CreditCard size={16} /> Total Paid</div>
              <div className="text-xl font-black text-primary">₹{orderSlip?.total}</div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0">
            <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold" onClick={() => setOrderSlip(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
