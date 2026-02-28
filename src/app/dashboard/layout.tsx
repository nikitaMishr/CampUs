"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { CampusMap } from '@/components/campus-map'
import { CampusLogo } from '@/components/campus-logo'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [role, setRole] = useState<'user' | 'admin' | null>(null)

  useEffect(() => {
    const savedRole = localStorage.getItem('campus_role') as 'user' | 'admin'
    if (!savedRole) {
      router.push('/')
    } else {
      setRole(savedRole)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('campus_role')
    router.push('/')
  }

  if (!role) return null

  return (
    <div className="min-h-screen minimal-soothing-bg flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/20 bg-white/30 backdrop-blur-md px-6 sm:px-12 flex items-center justify-end z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationsDropdown />
          <div className="h-6 w-px bg-foreground/10 mx-1" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center font-bold text-[10px] text-primary shadow-sm border border-white/40">
              {role === 'admin' ? 'AD' : 'US'}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-2xl text-muted-foreground hover:text-primary hover:bg-white/50 transition-all duration-300 h-9 px-3 gap-2 font-bold uppercase tracking-widest text-[10px]"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-12 pt-4 sm:pt-6 overflow-y-auto relative z-20 campus-bg">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
        
        {/* Floating Map Button */}
        <CampusMap />
      </main>
    </div>
  )
}
