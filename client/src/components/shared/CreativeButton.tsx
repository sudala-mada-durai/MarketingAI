import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CreativeButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
}

export default function CreativeButton({ children, className, variant = 'primary', ...props }: CreativeButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        variant === 'primary' ? 'btn-creative' : 'btn-creative-secondary',
        'group relative overflow-hidden flex items-center justify-center gap-2',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
    </motion.button>
  )
}
