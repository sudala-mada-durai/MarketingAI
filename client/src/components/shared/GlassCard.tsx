import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  delay?: number
}

export default function GlassCard({ children, className, containerClassName, delay = 0, ...props }: GlassCardProps) {
  return (
    <div className={cn('h-full', containerClassName)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay,
          ease: [0.16, 1, 0.3, 1] // Custom ease for premium feel
        }}
        className={cn(
          'glass-card h-full flex flex-col',
          'border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  )
}
