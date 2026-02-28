"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, MapPin, Tag, Image as ImageIcon, CheckCircle, Trash2, Shield, Sparkles, Camera, X, Info, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { matchLostFoundItems } from '@/ai/flows/lost-found-matcher-flow'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type ItemRecord = {
  id: string
  type: 'lost' | 'found'
  description: string
  location: string
  timestamp: string
  contact: string
  imageUrl?: string
  matchFound?: boolean
}

const INITIAL_ITEMS: ItemRecord[] = [
  { id: '1', type: 'lost', description: 'Blue Nike water bottle with campus logo sticker.', location: 'Main Gym', timestamp: 'Yesterday', contact: 'Student #2392' },
  { id: '2', type: 'found', description: 'Hydration flask, blue color, looks like Nike brand.', location: 'Library Lounge', timestamp: 'Today', contact: 'Admin Office' },
  { id: '3', type: 'lost', description: 'Keys with a red car fob and leather keychain.', location: 'Auditorium', timestamp: '2 days ago', contact: 'Faculty #102' },
]

export default function LostFoundPage() {
  const { toast } = useToast()
  const [role, setRole] = useState<'user' | 'admin' | null>(null)
  const [items, setItems] = useState<ItemRecord[]>(INITIAL_ITEMS)
  const [matchingId, setMatchingId] = useState<string | null>(null)
  const [matchResult, setMatchResult] = useState<{ [key: string]: any }>({})
  const [searchQuery, setSearchQuery] = useState('')
  
  // States for reporting
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [newType, setNewType] = useState<'lost' | 'found'>('lost')
  const [newDesc, setNewDesc] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const [newPhoto, setNewPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for viewing details
  const [viewingItem, setViewingItem] = useState<ItemRecord | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem('campus_role') as 'user' | 'admin')
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setNewPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleReportSubmit = () => {
    if (!newDesc || !newLoc) {
      toast({ title: "Missing Info", description: "Please provide a description and location.", variant: "destructive" })
      return
    }

    const newItem: ItemRecord = {
      id: Date.now().toString(),
      type: newType,
      description: newDesc,
      location: newLoc,
      timestamp: 'Just now',
      contact: role === 'admin' ? 'Campus Admin' : 'Student User',
      imageUrl: newPhoto || undefined
    }

    setItems([newItem, ...items])
    setIsReportOpen(false)
    setNewDesc('')
    setNewLoc('')
    setNewPhoto(null)
    toast({ title: "Report Posted", description: `Your ${newType} item has been listed.` })
  }

  const handleMatch = async (lost: ItemRecord, found: ItemRecord) => {
    setMatchingId(`${lost.id}-${found.id}`)
    try {
      const result = await matchLostFoundItems({
        lostItemDescription: lost.description,
        lostItemImageDataUri: lost.imageUrl,
        foundItemDescription: found.description,
        foundItemImageDataUri: found.imageUrl
      })
      setMatchResult({ ...matchResult, [`${lost.id}-${found.id}`]: result })
      if (result.isMatch) {
        toast({ title: "Potential Match Found!", description: `AI Confidence: ${result.confidenceScore}%` })
      } else {
        toast({ title: "No Match Detected", description: "AI suggests these are different items." })
      }
    } catch (err) {
      toast({ title: "Matching Error", variant: "destructive" })
    } finally {
      setMatchingId(null)
    }
  }

  const handleClaim = (item: ItemRecord) => {
    toast({ 
      title: "Claim Request Sent", 
      description: `We've notified the person who ${item.type === 'lost' ? 'found' : 'posted'} this item.` 
    })
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
    toast({ title: "Post Removed" })
  }

  if (!role) return null

  const filteredBySearch = items.filter(item => 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lostItems = filteredBySearch.filter(i => i.type === 'lost')
  const foundItems = filteredBySearch.filter(i => i.type === 'found')

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent">Lost & Found Hub</h1>
          <p className="text-muted-foreground">Reconnect with your belongings using our smart matching system.</p>
        </div>
        
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground font-bold gap-2 neon-glow h-12 px-6">
              <Plus size={20} /> Report Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-[95vw] max-h-[90vh] bg-white backdrop-blur-2xl border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden outline-none">
            <ScrollArea className="max-h-[90vh]">
              <div className="p-8 sm:p-10">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-accent uppercase tracking-tight">Report Item</DialogTitle>
                  <DialogDescription>Provide details to help someone find their item.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Item Type</Label>
                    <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                      <SelectTrigger className="rounded-2xl bg-muted/40 border-none shadow-inner h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <SelectItem value="lost">Lost Item</SelectItem>
                        <SelectItem value="found">Found Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</Label>
                    <Textarea 
                      placeholder="e.g. Red iPhone 13, Blue Nike bottle..." 
                      className="rounded-2xl bg-muted/40 border-none shadow-inner min-h-[100px]"
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Location</Label>
                    <Input 
                      placeholder="Where was it seen?" 
                      className="rounded-2xl bg-muted/40 border-none shadow-inner h-12"
                      value={newLoc}
                      onChange={e => setNewLoc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Photo (Optional)</Label>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/40 transition-colors cursor-pointer relative overflow-hidden group"
                    >
                      {newPhoto ? (
                        <Image src={newPhoto} alt="Preview" fill className="object-cover" />
                      ) : (
                        <>
                          <Camera size={24} className="group-hover:text-accent transition-colors" />
                          <span className="text-xs">Click to upload</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-8">
                  <Button onClick={handleReportSubmit} className="w-full h-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform">
                    Submit Report
                  </Button>
                </DialogFooter>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between bg-white/20 p-1 rounded-[1.5rem] border border-white/40 shadow-xl">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger value="all" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-xl px-8 font-black uppercase text-[10px] tracking-widest transition-all">All Items</TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest transition-all">Lost</TabsTrigger>
            <TabsTrigger value="found" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest transition-all">Found</TabsTrigger>
          </TabsList>
          <div className="hidden md:flex items-center px-4 gap-2 text-muted-foreground">
            <Search size={16} />
            <Input 
              placeholder="Search descriptions..." 
              className="h-10 bg-transparent border-none focus-visible:ring-0 text-xs w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-12 mt-8">
          {role === 'admin' && (
            <section className="space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                <Shield size={16} /> Admin Intelligence: Match Suggestion Tool
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lostItems.length > 0 && foundItems.length > 0 ? (
                  lostItems.slice(0, 1).map(lost => (
                    foundItems.slice(0, 1).map(found => (
                      <Card key={`${lost.id}-${found.id}`} className="glass-card border-none bg-accent/5 overflow-hidden shadow-xl rounded-[2.5rem]">
                        <CardHeader className="p-6 pb-2">
                          <CardTitle className="text-xs font-black uppercase tracking-widest text-accent">Potential Match Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/5">
                              <span className="font-black text-primary text-[9px] uppercase tracking-widest block mb-1">LOST:</span>
                              <p className="text-xs font-medium leading-relaxed">{lost.description}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/5">
                              <span className="font-black text-emerald-600 text-[9px] uppercase tracking-widest block mb-1">FOUND:</span>
                              <p className="text-xs font-medium leading-relaxed">{found.description}</p>
                            </div>
                          </div>
                          <div className="md:w-40 flex flex-col items-center justify-center gap-2 md:border-l md:border-border/30 md:pl-6">
                            {matchResult[`${lost.id}-${found.id}`] ? (
                              <div className="text-center animate-in zoom-in duration-300">
                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">AI Match Score</p>
                                <p className={cn(
                                  "text-4xl font-black",
                                  matchResult[`${lost.id}-${found.id}`].isMatch ? "text-emerald-500" : "text-primary"
                                )}>
                                  {matchResult[`${lost.id}-${found.id}`].confidenceScore}%
                                </p>
                                <p className="text-[9px] font-bold text-muted-foreground mt-2 leading-tight">
                                  {matchResult[`${lost.id}-${found.id}`].reasoning.split('.')[0]}
                                </p>
                              </div>
                            ) : (
                              <Button 
                                className="w-full bg-accent text-accent-foreground font-black text-[10px] tracking-widest h-12 rounded-2xl shadow-lg shadow-accent/10"
                                onClick={() => handleMatch(lost, found)}
                                disabled={matchingId === `${lost.id}-${found.id}`}
                              >
                                {matchingId === `${lost.id}-${found.id}` ? (
                                  "Analyzing..."
                                ) : (
                                  <>
                                    <Sparkles size={14} className="mr-2" /> Compare AI
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center glass-card border-none rounded-[2.5rem] bg-accent/5">
                    <Info className="mx-auto w-8 h-8 text-accent/40 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">Add both lost and found items to see AI matching suggestions.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBySearch.length > 0 ? (
              filteredBySearch.map((item) => (
                <Card key={item.id} className="glass-card group border-none rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                  {item.imageUrl && (
                    <div className="h-48 relative overflow-hidden">
                      <Image src={item.imageUrl} alt="item" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={cn(
                        "text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full",
                        item.type === 'lost' ? "bg-primary text-white" : "bg-emerald-500 text-white"
                      )}>
                        {item.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-bold">{item.timestamp}</span>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight leading-tight line-clamp-2">{item.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <div className="p-2 rounded-xl bg-accent/5 text-accent">
                        <MapPin size={16} />
                      </div>
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <div className="p-2 rounded-xl bg-accent/5 text-accent">
                        <Tag size={16} />
                      </div>
                      <span>Reported by: {item.contact}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl border-accent/20 bg-accent/5 hover:bg-accent hover:text-white transition-all"
                      onClick={() => setViewingItem(item)}
                    >
                      View Details
                    </Button>
                    {role === 'admin' ? (
                      <Button 
                        variant="ghost" 
                        className="w-12 h-12 rounded-2xl text-primary hover:bg-primary/10 transition-all"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 size={20} />
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/10 hover:scale-[1.02] transition-transform"
                        onClick={() => handleClaim(item)}
                      >
                        Claim Item
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card border-none rounded-[2.5rem]">
                <p className="text-muted-foreground font-medium">No items match your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lost" className="mt-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lostItems.length > 0 ? lostItems.map(item => (
               <Card key={item.id} className="glass-card group border-none rounded-[2.5rem] overflow-hidden shadow-xl">
                <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full bg-primary text-white">LOST</Badge>
                      <span className="text-[10px] text-muted-foreground font-bold">{item.timestamp}</span>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight leading-tight line-clamp-2">{item.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <div className="p-2 rounded-xl bg-accent/5 text-accent"><MapPin size={16} /></div>
                      <span>{item.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 flex gap-3">
                    <Button variant="outline" className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl border-accent/20 bg-accent/5 hover:bg-accent hover:text-white transition-all" onClick={() => setViewingItem(item)}>View Details</Button>
                    <Button className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/10 hover:scale-[1.02] transition-transform" onClick={() => handleClaim(item)}>Claim Item</Button>
                  </CardFooter>
               </Card>
            )) : (
              <div className="col-span-full py-20 text-center glass-card border-none rounded-[2.5rem]">
                <p className="text-muted-foreground font-medium">No lost items match your search.</p>
              </div>
            )}
           </div>
        </TabsContent>

        <TabsContent value="found" className="mt-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foundItems.length > 0 ? foundItems.map(item => (
               <Card key={item.id} className="glass-card group border-none rounded-[2.5rem] overflow-hidden shadow-xl">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full bg-emerald-500 text-white">FOUND</Badge>
                      <span className="text-[10px] text-muted-foreground font-bold">{item.timestamp}</span>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight leading-tight line-clamp-2">{item.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <div className="p-2 rounded-xl bg-accent/5 text-accent"><MapPin size={16} /></div>
                      <span>{item.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 flex gap-3">
                    <Button variant="outline" className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl border-accent/20 bg-accent/5 hover:bg-accent hover:text-white transition-all" onClick={() => setViewingItem(item)}>View Details</Button>
                    <Button className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/10 hover:scale-[1.02] transition-transform" onClick={() => handleClaim(item)}>Claim Item</Button>
                  </CardFooter>
               </Card>
            )) : (
              <div className="col-span-full py-20 text-center glass-card border-none rounded-[2.5rem]">
                <p className="text-muted-foreground font-medium">No found items match your search.</p>
              </div>
            )}
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] p-0 bg-white backdrop-blur-2xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden outline-none">
          <ScrollArea className="max-h-[90vh]">
            {viewingItem?.imageUrl && (
              <div className="h-64 relative">
                <Image src={viewingItem.imageUrl} alt="item" fill className="object-cover" />
                <Badge className={cn(
                  "absolute top-6 left-6 text-[10px] font-black tracking-widest uppercase px-4 py-2",
                  viewingItem.type === 'lost' ? "bg-primary text-white" : "bg-emerald-500 text-white"
                )}>
                  {viewingItem.type}
                </Badge>
              </div>
            )}
            <div className="p-8 sm:p-10 space-y-8">
              <div className="space-y-4">
                 {!viewingItem?.imageUrl && (
                   <Badge className={cn(
                      "text-[10px] font-black tracking-widest uppercase px-4 py-2",
                      viewingItem?.type === 'lost' ? "bg-primary text-white" : "bg-emerald-500 text-white"
                    )}>
                      {viewingItem?.type}
                    </Badge>
                 )}
                <DialogTitle className="text-3xl font-black tracking-tight leading-none text-foreground">{viewingItem?.description}</DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Clock className="w-4 h-4" /> Reported {viewingItem?.timestamp}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-muted/40 space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {viewingItem?.location}</p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/40 space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Contact</p>
                  <p className="text-sm font-bold flex items-center gap-2"><Tag className="w-4 h-4 text-accent" /> {viewingItem?.contact}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-muted/20 border border-border/10 flex items-start gap-4">
                 <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   To ensure the security of items, you will be required to provide proof of ownership or additional details when meeting to claim this item.
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/10"
                  onClick={() => {
                    handleClaim(viewingItem!)
                    setViewingItem(null)
                  }}
                >
                  Request to Claim
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl border-accent/20 bg-accent/5 font-black uppercase tracking-widest"
                  onClick={() => setViewingItem(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
