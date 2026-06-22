'use client'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-black text-white',
    success: 'bg-[#00E5FF] text-black', // cyan
    warning: 'bg-[#FFE600] text-black', // yellow
    info: 'bg-[#FF5EA6] text-black', // pink
  }

  return (
    <span className={`inline-block px-3 py-1 border-2 border-black rounded-none text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
