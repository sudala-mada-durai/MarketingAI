import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CreativeInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  multiline?: boolean
}

export default function CreativeInput({ label, error, icon, multiline, className, ...props }: CreativeInputProps) {
  const Component = multiline ? 'textarea' : 'input'
  
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-semibold text-gray-300 ml-1">{label}</label>}
      <div className="relative group">
        <Component
          className={cn(
            multiline ? 'textarea-creative' : 'input-creative',
            icon && 'pl-12',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10',
            'w-full bg-transparent',
            className
          )}
          {...(props as any)}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 ml-1 mt-1">{error}</p>}
    </div>
  )
}
