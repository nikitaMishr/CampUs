
"use client"

import { useState } from 'react'
import { MapPin, Navigation, Landmark, Eye, EyeOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Building = {
  id: string
  name: string
  x: number
  y: number
  description: string
  type: 'admin' | 'academic' | 'facility' | 'food' | 'block'
}

const BUILDINGS: Building[] = [
  { id: 'lib', name: 'Main Library', x: 300, y: 150, description: 'Central hub for research and study.', type: 'academic' },
  { id: 'admin', name: 'Admin Block', x: 450, y: 100, description: 'Registrar and Dean offices.', type: 'admin' },
  { id: 'can', name: 'Canteen Hub', x: 550, y: 300, description: 'Food court and lounge.', type: 'food' },
  { id: 'aud', name: 'Auditorium', x: 200, y: 400, description: 'Events and ceremonies.', type: 'facility' },
  { id: 'well', name: 'All Is Well', x: 400, y: 350, description: 'Central campus plaza and relaxation zone.', type: 'facility' },
  { id: 'ba', name: 'Block A', x: 100, y: 80, description: 'Engineering departments.', type: 'block' },
  { id: 'bb', name: 'Block B', x: 100, y: 180, description: 'Science departments.', type: 'block' },
  { id: 'bc', name: 'Block C', x: 100, y: 280, description: 'Humanities departments.', type: 'block' },
  { id: 'bd', name: 'Block D', x: 700, y: 80, description: 'Management studies.', type: 'block' },
  { id: 'be', name: 'Block E', x: 700, y: 180, description: 'Design studios.', type: 'block' },
  { id: 'bf', name: 'Block F', x: 700, y: 280, description: 'Research labs.', type: 'block' },
]

export function CampusMap() {
  const [open, setOpen] = useState(false)
  const [destination, setDestination] = useState<Building | null>(null)
  const [showCurrentPos, setShowCurrentPos] = useState(true)
  const [showBuildings, setShowBuildings] = useState(true)
  
  const userPos = { x: 400, y: 460 }

  const calculateETA = (b: Building) => {
    const dist = Math.sqrt(Math.pow(b.x - userPos.x, 2) + Math.pow(b.y - userPos.y, 2))
    return Math.ceil(dist / 40) + " mins"
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-2xl bg-primary text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg z-50 group"
      >
        <Navigation className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden h-[85vh] rounded-[2.5rem] border-none">
          <div className="flex h-full bg-white">
            {/* Map Area */}
            <div className="flex-1 bg-muted/30 relative overflow-hidden p-8">
               <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-black flex items-center gap-3 text-primary uppercase tracking-tighter">
                  <Landmark className="w-5 h-5" />
                  Campus Navigator
                </DialogTitle>
              </DialogHeader>
              
              <div className="w-full h-[calc(100%-80px)] border border-border/50 rounded-[2rem] relative bg-white/50 backdrop-blur-sm soothing-shadow overflow-hidden">
                
                {/* Simulated Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Content wrapper with padding to prevent edge clipping */}
                <div className="relative w-full h-full p-12">
                  {/* Buildings */}
                  {showBuildings && BUILDINGS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setDestination(b)}
                      className={cn(
                        "absolute group transition-all duration-500 -translate-x-1/2 -translate-y-1/2",
                        destination?.id === b.id ? "z-20 scale-110" : "z-10 hover:scale-105"
                      )}
                      style={{ left: `${(b.x / 800) * 100}%`, top: `${(b.y / 550) * 100}%` }}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 shadow-sm",
                        destination?.id === b.id 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white border-border/60 text-foreground hover:border-primary/50 hover:shadow-md"
                      )}>
                        <Landmark size={14} className={cn(destination?.id === b.id ? "text-white" : "text-primary")} />
                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap px-1">{b.name}</span>
                      </div>
                    </button>
                  ))}

                  {/* You Are Here */}
                  {showCurrentPos && (
                    <div 
                      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(userPos.x / 800) * 100}%`, top: `${(userPos.y / 550) * 100}%` }}
                    >
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative p-2.5 rounded-full bg-primary text-white border-4 border-white shadow-xl">
                          <MapPin size={24} fill="currentColor" />
                        </div>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          YOU ARE HERE
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Route Line */}
                  {destination && showCurrentPos && showBuildings && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <line 
                        x1={`${(userPos.x / 800) * 100}%`} 
                        y1={`${(userPos.y / 550) * 100}%`} 
                        x2={`${(destination.x / 800) * 100}%`} 
                        y2={`${(destination.y / 550) * 100}%`} 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="3" 
                        strokeDasharray="8,8"
                        className="opacity-30"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-80 border-l border-border/50 p-10 flex flex-col gap-8 bg-muted/5">
              <div className="space-y-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Destination</h3>
                {destination ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase font-bold">{destination.type}</Badge>
                      </div>
                      <h4 className="font-black text-foreground text-2xl tracking-tighter leading-none">{destination.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{destination.description}</p>
                    </div>
                    
                    <div className="p-6 rounded-3xl bg-white border border-border/50 shadow-sm space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Estimated Arrival</p>
                          <p className="text-base font-black text-foreground">{calculateETA(destination)} walk</p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full h-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform" onClick={() => setDestination(null)}>
                      Clear Navigation
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-20 px-6 border-2 border-dashed border-border/50 rounded-[2rem] flex flex-col items-center">
                    <div className="p-4 rounded-3xl bg-muted/30 mb-4">
                      <Navigation className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Select a building on the map to start navigating.</p>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-6 pt-8 border-t border-border/50">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Map Legend</p>
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setShowCurrentPos(!showCurrentPos)}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors duration-300",
                      showCurrentPos ? "bg-primary" : "bg-muted"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                      showCurrentPos ? "text-foreground" : "text-muted-foreground"
                    )}>
                      Current Position
                    </span>
                  </div>
                  
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setShowBuildings(!showBuildings)}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-md border border-border/50 transition-colors duration-300",
                      showBuildings ? "bg-primary border-primary" : "bg-white"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                      showBuildings ? "text-foreground" : "text-muted-foreground"
                    )}>
                      Campus Buildings
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
