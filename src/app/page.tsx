"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, ShieldCheck } from 'lucide-react'
import { CampusLogo } from '@/components/campus-logo'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'user' | 'admin' >('user')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    localStorage.setItem('campus_role', role)
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div className="flex items-center justify-center p-6 min-h-screen">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-700 -mt-8">
        <div className="text-center space-y-0">
          <CampusLogo className="w-24 h-24 sm:w-32 sm:h-32 mx-auto" />
          <div className="space-y-1 -mt-2">
            {/* Mixed-case branding preservation */}
            <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">CampUs</h1>
            <p className="font-serif italic text-xl text-foreground/60 tracking-tight">Find.Fix.Eat.Repeat</p>
          </div>
        </div>

        <Card className="glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden red-glow-shadow">
          <CardHeader className="text-center pb-6 pt-10">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground/80">Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-muted/40 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    role === 'user' 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User size={16} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    role === 'admin' 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Campus ID</Label>
                  <Input 
                    id="id" 
                    placeholder="Enter your ID" 
                    required 
                    className="rounded-2xl h-12 bg-white/50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" title="password" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="rounded-2xl h-12 bg-white/50 border-none shadow-inner"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl font-black bg-primary text-primary-foreground shadow-xl shadow-primary/10 hover:scale-[1.02] transition-transform"
                disabled={loading}
              >
                {loading ? "Initializing..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          The Intelligent Smart Campus Hub
        </p>
      </div>
    </div>
  )
}
