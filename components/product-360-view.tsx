'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Product360ViewProps {
  images: { url: string; alt?: string }[]
  className?: string
}

const AUTO_ROTATE_INTERVAL = 4000
const DRAG_THRESHOLD = 60

export function Product360View({ images, className }: Product360ViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragX = useMotionValue(0)
  const total = images.length
  if (total === 0) return null

  const goTo = useCallback((index: number) => {
    setCurrentIndex(((index % total) + total) % total)
  }, [total])

  useEffect(() => {
    if (isHovered || isDragging) return
    const timer = setInterval(() => goTo(currentIndex + 1), AUTO_ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [currentIndex, isHovered, isDragging, goTo])

  const handlePointerDown = () => {
    dragX.set(0)
    setIsDragging(true)
  }

  const handlePointerUp = () => {
    const moved = dragX.get()
    if (Math.abs(moved) > DRAG_THRESHOLD) {
      goTo(currentIndex - Math.sign(moved))
    }
    dragX.set(0)
    setIsDragging(false)
  }

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    dragX.set(dragX.get() + e.movementX)
  }, [isDragging, dragX])

  return (
    <div className={cn('relative select-none', className)}>
      <div
        ref={containerRef}
        className="product-360 relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ touchAction: 'none' }}
      >
        {images.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === currentIndex ? 1 : 0,
              scale: i === currentIndex ? 1 : 0.95,
            }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Image
              src={img.url}
              alt={img.alt ?? `Vista 360° ${i + 1}`}
              fill
              className="object-contain p-4"
              draggable={false}
              priority={i === 0}
            />
          </motion.div>
        ))}

        {isDragging && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-sm"
              style={{ color: '#1B2B5E' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ver vista ${i + 1}`}
            onClick={() => goTo(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 24 : 8,
              backgroundColor: i === currentIndex ? '#1B2B5E' : '#cbd5e1',
            }}
          />
        ))}
      </div>
    </div>
  )
}
