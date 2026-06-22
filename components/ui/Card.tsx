'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function Card({ children, className = '', href, onClick }: CardProps) {
  const baseClass = 'bg-white text-black rounded-none p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150'
  const interactiveClass = href || onClick 
    ? 'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer' 
    : ''

  if (href) {
    return (
      <a href={href} className={`${baseClass} ${interactiveClass} ${className} block`}>
        {children}
      </a>
    )
  }

  return (
    <div className={`${baseClass} ${interactiveClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
