"use client"

import { useState } from 'react'
import { Bell, Calendar, Info, Palmtree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  category: 'event' | 'holiday' | 'notice'
}

const INITIAL_NOTIFS: Notification[] = [
  { id: '1', title: 'Cultural Fest 2024', description: 'Annual cultural festival starts tomorrow. Be there!', time: '2h ago', read: false, category: 'event' },
  { id: '2', title: 'Holiday Announcement', description: 'Campus will remain closed on Friday for Holi.', time: '5h ago', read: false, category: 'holiday' },
  { id: '3', title: 'Exams Schedule Out', description: 'The mid-semester exam dates are posted in the portal.', time: '1d ago', read: true, category: 'notice' },
]

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-white/50 hover:bg-white transition-all shadow-sm">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white border-white border-2 animate-bounce">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card border-none shadow-2xl rounded-3xl mt-4 mr-4" align="end">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h4 className="font-bold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              All caught up!
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-5 border-b border-border/30 hover:bg-primary/5 transition-colors cursor-pointer group",
                    !n.read && "bg-primary/[0.02]"
                  )}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        n.category === 'event' ? "bg-blue-100 text-blue-600" : 
                        n.category === 'holiday' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {n.category === 'event' && <Calendar size={12} />}
                        {n.category === 'holiday' && <Palmtree size={12} />}
                        {n.category === 'notice' && <Info size={12} />}
                      </div>
                      <h5 className={cn("text-xs font-bold", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</h5>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 pl-8">{n.description}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-border/50">
          <Button variant="ghost" className="w-full text-[10px] h-8 font-bold uppercase tracking-widest text-muted-foreground hover:text-primary rounded-xl">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
