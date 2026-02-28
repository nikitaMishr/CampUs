
"use client"

import { useState, useEffect, useRef } from 'react'
import { AlertCircle, Camera, CheckCircle2, Clock, MessageSquare, Send, Sparkles, Wand2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { triageIssue } from '@/ai/flows/issue-triage-flow'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type CampusIssue = {
  id: string
  description: string
  photoUrl?: string
  status: 'Reported' | 'In Progress' | 'Resolved'
  category?: string[]
  timestamp: string
  summary?: string
  isMyReport?: boolean
}

const MOCK_ISSUES: CampusIssue[] = [
  { id: '1', description: 'The AC in Library Room 302 is making loud noises and not cooling.', status: 'In Progress', category: ['HVAC', 'Maintenance'], timestamp: '2h ago', summary: 'AC malfunction in Library', isMyReport: false },
  { id: '2', description: 'Water leak detected in the ground floor hallway of Block A near the elevators.', status: 'Reported', timestamp: '5h ago', isMyReport: false },
]

export default function IssuesPage() {
  const { toast } = useToast()
  const [role, setRole] = useState<'user' | 'admin' | null>(null)
  const [issues, setIssues] = useState<CampusIssue[]>(MOCK_ISSUES)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triagingId, setTriagingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'my'>('all')
  
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRole(localStorage.getItem('campus_role') as 'user' | 'admin')
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      const newIssue: CampusIssue = {
        id: Date.now().toString(),
        description,
        status: 'Reported',
        timestamp: 'Just now',
        photoUrl: photoDataUri || undefined,
        isMyReport: true
      }
      setIssues([newIssue, ...issues])
      setDescription('')
      setPhotoDataUri(null)
      setIsSubmitting(false)
      toast({ title: "Issue Reported", description: "Maintenance team has been notified." })
    }, 1000)
  }

  const handleTriage = async (issue: CampusIssue) => {
    setTriagingId(issue.id)
    try {
      const result = await triageIssue({ 
        issueDescription: issue.description,
        issuePhotoDataUri: issue.photoUrl 
      })
      setIssues(issues.map(i => i.id === issue.id ? { 
        ...i, 
        summary: result.summary, 
        category: result.suggestedCategories 
      } : i))
      toast({ title: "AI Triage Complete", description: "Summary and categories generated." })
    } catch (err) {
      toast({ title: "Triage Error", description: "Could not process AI analysis.", variant: "destructive" })
    } finally {
      setTriagingId(null)
    }
  }

  const updateStatus = (id: string, status: CampusIssue['status']) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i))
    toast({ title: "Status Updated", description: `Issue is now ${status}.` })
  }

  if (!role) return null

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(i => i.isMyReport)

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-accent">Issue Reporting</h1>
        <p className="text-muted-foreground">Help us keep the campus in top shape. Report problems instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Report Form (User) or Service Status (Both) */}
        <div className="space-y-6">
          {role === 'user' && (
            <Card className="glass border-white/10 overflow-hidden">
              <div className="h-2 bg-accent shadow-[0_0_15px_rgba(0,245,255,0.5)]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-accent" />
                  Report New Issue
                </CardTitle>
                <CardDescription>Include as much detail as possible for faster resolution.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desc">Describe the Problem</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="e.g. Broken chair in Room 101, Flickering lights in Hall B..." 
                      className="bg-white/5 border-white/10 min-h-[120px] focus:border-accent"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attach Photo (Optional)</Label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/40 transition-colors cursor-pointer group relative overflow-hidden"
                    >
                      {photoDataUri ? (
                        <>
                          <Image 
                            src={photoDataUri} 
                            alt="Preview" 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold uppercase">Change Photo</span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoDataUri(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors z-10"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Camera size={24} className="group-hover:text-accent transition-colors" />
                          <span className="text-xs">Click to upload image</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-accent text-accent-foreground font-bold h-12 gap-2"
                    disabled={isSubmitting}
                  >
                    <Send size={18} /> {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="glass-dark border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Campus Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Electrical', status: 'Stable', color: 'text-emerald-500' },
                { label: 'Water Supply', status: 'Issues in Block C', color: 'text-orange-500' },
                { label: 'Internet', status: 'Optimal', color: 'text-emerald-500' },
                { label: 'Security', status: 'Active', color: 'text-emerald-500' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={cn("font-bold", s.color)}>{s.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List of Issues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Reports</h3>
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  filter === 'all' ? "bg-accent/10 border-accent/20 text-accent" : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => setFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  filter === 'my' ? "bg-accent/10 border-accent/20 text-accent" : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => setFilter('my')}
              >
                My Reports
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <Card key={issue.id} className="glass-dark border-white/5 hover:border-white/10 transition-all">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-[10px] font-bold uppercase",
                            issue.status === 'Reported' ? "bg-red-500/20 text-red-500" : 
                            issue.status === 'In Progress' ? "bg-orange-500/20 text-orange-500" : "bg-emerald-500/20 text-emerald-500"
                          )}>
                            {issue.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{issue.timestamp}</span>
                          {issue.isMyReport && (
                            <Badge variant="outline" className="text-[8px] border-accent/30 text-accent/70 h-4 py-0">You</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-2 leading-relaxed">{issue.description}</p>
                      </div>
                      {issue.photoUrl && (
                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 relative">
                          <Image src={issue.photoUrl} alt="issue" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {issue.summary && (
                    <CardContent className="p-4 pt-0">
                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 flex gap-3 mt-2">
                        <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-accent uppercase">AI Summary</p>
                          <p className="text-xs text-muted-foreground">{issue.summary}</p>
                          {issue.category && (
                            <div className="flex gap-1 mt-2">
                              {issue.category.map((cat, i) => (
                                <Badge key={i} variant="secondary" className="text-[9px] bg-white/5 h-4">{cat}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                  <CardFooter className="p-4 pt-2 border-t border-white/5 bg-white/5 flex items-center justify-between">
                    {role === 'admin' ? (
                      <>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-[11px] font-bold hover:text-accent"
                            onClick={() => handleTriage(issue)}
                            disabled={triagingId === issue.id}
                          >
                            <Wand2 size={14} className="mr-1" /> {triagingId === issue.id ? "Analyzing..." : "Triage AI"}
                          </Button>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              className="h-8 text-[11px] bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white"
                              onClick={() => updateStatus(issue.id, 'In Progress')}
                            >
                              In Progress
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 text-[11px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              onClick={() => updateStatus(issue.id, 'Resolved')}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Button variant="ghost" className="h-8 text-[11px] text-muted-foreground gap-2">
                        <MessageSquare size={14} /> View Comments
                      </Button>
                    )}
                    <span className="text-[10px] text-muted-foreground">ID: #{issue.id.slice(-4)}</span>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-muted-foreground text-sm">No reports found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
