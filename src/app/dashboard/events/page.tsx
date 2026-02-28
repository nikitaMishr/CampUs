
"use client"

import { useState, useEffect } from 'react'
import { Calendar, Plus, MapPin, Users, Info, Bell, Trash2, Edit, CheckCircle2, Wand2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { generateEventDescription } from '@/ai/flows/event-description-generator-flow'
import { cn } from '@/lib/utils'

type CampusEvent = {
  id: string
  title: string
  description: string
  date: string
  venue: string
  departments: string[]
  registrationLink?: string
}

const INITIAL_EVENTS: CampusEvent[] = [
  { 
    id: '1', 
    title: 'Future Tech Summit 2026', 
    description: 'Join industry leaders for a day of networking and innovation in AI and Web3.', 
    date: 'Oct 26, 2026, 10:00 AM', 
    venue: 'Main Auditorium', 
    departments: ['CSE', 'ECE'],
    registrationLink: 'https://forms.gle/RRSMyX77YvoRKK9Y8'
  },
  { 
    id: '2', 
    title: 'Structural Integrity Seminar', 
    description: 'Advanced workshops on earthquake-resistant building design.', 
    date: 'Nov 2, 2026, 2:00 PM', 
    venue: 'Civil Engineering Block', 
    departments: ['CIVIL'],
    registrationLink: 'https://forms.gle/rqbnnCLQY48JCXYq8'
  },
]

export default function EventsPage() {
  const { toast } = useToast()
  const [role, setRole] = useState<'user' | 'admin' | null>(null)
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS)
  const [selectedDept, setSelectedDept] = useState('All')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // New Event State
  const [newTitle, setNewTitle] = useState('')
  const [newVenue, setNewVenue] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newDepts, setNewDepts] = useState<string[]>([])
  const [newDesc, setNewDesc] = useState('')
  const [newRegLink, setNewRegLink] = useState('')

  useEffect(() => {
    setRole(localStorage.getItem('campus_role') as 'user' | 'admin')
  }, [])

  const handleGenerateDesc = async () => {
    if (!newTitle || !newVenue || !newDate) {
      toast({ title: "Missing Info", description: "Title, Venue, and Date required for AI generation.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const result = await generateEventDescription({
        title: newTitle,
        date: newDate,
        venue: newVenue,
        departments: newDepts
      })
      setNewDesc(result.description)
      toast({ title: "Description Generated", description: "AI has crafted a compelling event summary." })
    } catch (err) {
      toast({ title: "Generation Failed", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddEvent = () => {
    const event: CampusEvent = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      date: newDate,
      venue: newVenue,
      departments: newDepts,
      registrationLink: newRegLink
    }
    setEvents([event, ...events])
    setIsAddOpen(false)
    resetForm()
    toast({ title: "Event Posted", description: "Notifications sent to selected departments." })
  }

  const resetForm = () => {
    setNewTitle('')
    setNewVenue('')
    setNewDate('')
    setNewDepts([])
    setNewDesc('')
    setNewRegLink('')
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    toast({ title: "Event Deleted", variant: "destructive" })
  }

  const handleRegister = (link?: string) => {
    if (link) {
      window.open(link, '_blank')
    } else {
      toast({
        title: "Registration Unavailable",
        description: "An official link has not been provided for this event yet.",
        variant: "destructive"
      })
    }
  }

  if (!role) return null

  const filteredEvents = selectedDept === 'All' 
    ? events 
    : events.filter(e => e.departments.includes(selectedDept))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent">Campus Events</h1>
          <p className="text-muted-foreground">Discover what's happening around campus and register for workshops.</p>
        </div>
        
        {role === 'admin' ? (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground font-bold gap-2 neon-glow">
                <Plus size={20} /> Create New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-2xl border-none rounded-[2.5rem] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-accent flex items-center gap-2 text-2xl font-black">
                  <Calendar className="w-6 h-6" /> Create Event
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input placeholder="Tech Expo 2024" className="rounded-2xl h-11 bg-muted/40 border-none shadow-inner" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input placeholder="Main Hall" className="rounded-2xl h-11 bg-muted/40 border-none shadow-inner" value={newVenue} onChange={e => setNewVenue(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input placeholder="Oct 20, 2:00 PM" className="rounded-2xl h-11 bg-muted/40 border-none shadow-inner" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Departments</Label>
                    <Input placeholder="CSE, ECE" className="rounded-2xl h-11 bg-muted/40 border-none shadow-inner" onChange={e => setNewDepts(e.target.value.split(',').map(s => s.trim()))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Link (Google Form)</Label>
                    <Input placeholder="https://forms.gle/..." className="rounded-2xl h-11 bg-muted/40 border-none shadow-inner" value={newRegLink} onChange={e => setNewRegLink(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Description</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-7 text-accent hover:bg-accent/10 font-black uppercase"
                      onClick={handleGenerateDesc}
                      disabled={isGenerating}
                    >
                      <Wand2 size={12} className="mr-1" /> {isGenerating ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Details about the event..." 
                    className="rounded-2xl bg-muted/40 border-none shadow-inner min-h-[220px]" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button className="bg-accent text-accent-foreground font-black uppercase rounded-xl h-11 px-8" onClick={handleAddEvent}>Post & Notify</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex gap-2 p-1 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-xl">
            {['All', 'CSE', 'ECE', 'MECH', 'CIVIL'].map(dept => (
              <Badge 
                key={dept} 
                variant={selectedDept === dept ? 'default' : 'ghost'}
                onClick={() => setSelectedDept(dept)}
                className={cn(
                  "cursor-pointer px-5 h-9 transition-all duration-300 rounded-xl uppercase font-black text-[10px] tracking-widest",
                  selectedDept === dept ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-white/40"
                )}
              >
                {dept}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEvents.map(event => (
          <Card key={event.id} className="group glass-card border-none overflow-hidden transition-all duration-500 rounded-[2.5rem] red-glow-shadow">
            <div className="h-40 relative bg-primary/20 flex items-center justify-center p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/20" />
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl z-10 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-12 h-12 text-accent" />
              </div>
              <div className="absolute top-4 left-4 z-10 flex gap-1">
                {event.departments.map(d => (
                  <Badge key={d} className="bg-black/60 backdrop-blur-md border-white/10 text-[9px] uppercase font-bold tracking-widest">{d}</Badge>
                ))}
              </div>
            </div>
            <CardHeader className="p-8">
              <div className="flex justify-between items-start gap-2 mb-4">
                <CardTitle className="text-xl group-hover:text-accent transition-colors font-black leading-tight">{event.title}</CardTitle>
                <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 flex gap-1 items-center font-bold px-3 py-1">
                  <CheckCircle2 size={10} /> Open
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">{event.description}</p>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                  <div className="p-2 rounded-xl bg-primary/5 text-accent"><Calendar size={16} /></div>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                  <div className="p-2 rounded-xl bg-primary/5 text-accent"><MapPin size={16} /></div>
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex items-center justify-between">
              {role === 'admin' ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1 text-[11px] h-11 border-primary/20 hover:bg-primary/5 rounded-2xl font-black uppercase"><Edit size={14} className="mr-1" /> Edit</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-[11px] h-11 text-destructive hover:bg-destructive/5 rounded-2xl font-black uppercase"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 size={14} className="mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-accent text-accent-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all duration-300 h-12 rounded-2xl shadow-lg shadow-accent/10"
                  onClick={() => handleRegister(event.registrationLink)}
                >
                  Register Now
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
