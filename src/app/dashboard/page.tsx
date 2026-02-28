"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Utensils, AlertCircle, Search, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CampusLogo } from '@/components/campus-logo'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem('campus_role'))
  }, [])

  const features = [
    { 
      title: 'Canteen', 
      desc: 'Order fresh meals from the campus hub.',
      icon: Utensils,
      href: '/dashboard/canteen',
      image: 'https://i.postimg.cc/Fs0c82W4/fast-ink-Oyslr-Pi-Pg0-unsplash.png',
      hint: 'food canteen'
    },
    { 
      title: 'Report Issue', 
      desc: 'Keep our campus clean and safe.',
      icon: AlertCircle,
      href: '/dashboard/issues',
      image: 'https://i.postimg.cc/bvyQQ3Rw/2922241-26963.jpg',
      hint: 'maintenance repair'
    },
    { 
      title: 'Lost & Found', 
      desc: 'Reconnect with your missing items.',
      icon: Search,
      href: '/dashboard/lost-found',
      image: 'https://i.postimg.cc/658bZ5pC/v3p2-27n0-160326.jpg',
      hint: 'lost belongings'
    },
    { 
      title: 'Events Updates', 
      desc: 'Workshops, seminars and more.',
      icon: Calendar,
      href: '/dashboard/events',
      image: 'https://i.postimg.cc/bvfdWLGL/ev.jpg',
      hint: 'campus event'
    },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12 flex flex-col items-center pt-8">
      {/* Header Section */}
      <div className="space-y-2 text-center mx-auto max-w-2xl flex flex-col items-center mb-10">
        <CampusLogo className="w-20 h-20 sm:w-28 sm:h-28 animate-pulse-neon" />
        <div className="space-y-1">
          {/* Friendly Greeting correctly formatted */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground leading-tight">
            Hola , Welcome to CampUs
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-foreground/60 tracking-tight">
            Find.Fix.Eat.Repeat
          </p>
        </div>
      </div>

      {/* Service Grid with intensified red-glow-shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 sm:px-0">
        {features.map((feature, i) => (
          <Link key={i} href={feature.href} className="flex">
            <Card className={cn(
              "glass-card group h-full overflow-hidden flex flex-col border-none hover:ring-2 hover:ring-primary/20 transition-all duration-500 rounded-[2.5rem] red-glow-shadow w-full"
            )}>
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src={feature.image} 
                  alt={feature.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  data-ai-hint={feature.hint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                    Enter Service <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
              <CardContent className="p-6 flex-1 space-y-3">
                <div className="flex items-center gap-3 text-primary mb-1">
                  <div className="p-2.5 rounded-2xl bg-primary/5 transition-all duration-500 group-hover:bg-primary group-hover:text-white shadow-inner">
                    <feature.icon size={20} />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight">{feature.title}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
