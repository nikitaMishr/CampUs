
"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function CampusLogo({ className }: { className?: string }) {
  const logo = PlaceHolderImages.find(img => img.id === 'campus-logo')
  
  if (!logo) return null

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={logo.imageUrl}
        alt="CampUs Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
