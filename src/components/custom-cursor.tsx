"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.glass-card')
      
      setIsHovering(!!isInteractive)
    }

    const onMouseDown = () => setIsMouseDown(true)
    const onMouseUp = () => setIsMouseDown(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Outer Ring */}
      <div 
        className={cn(
          "fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30",
          isHovering ? "w-12 h-12 bg-primary/5 border-primary/50" : "w-8 h-8",
          isMouseDown && "scale-90 opacity-50"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Inner Dot */}
      <div 
        className={cn(
          "fixed top-0 left-0 w-1.5 h-1.5 pointer-events-none z-[9999] bg-primary transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(210,83,83,0.5)]",
          isHovering && "scale-150"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}
