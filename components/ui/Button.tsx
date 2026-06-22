'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'font-bold text-black border-[3px] border-black transition-all duration-100 rounded-none inline-flex items-center justify-center gap-2'

  const variants = {
    primary: 'bg-[#FF5EA6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
    secondary: 'bg-[#FFE600] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
    ghost: 'bg-transparent border-transparent text-black hover:border-black active:translate-x-0 active:translate-y-0 active:shadow-none hover:bg-black/5 shadow-none border-[3px]',
  }

  const sizes = {
    sm: 'px-3 py-1 text-xs sm:text-sm border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
    md: 'px-5 py-2 text-sm sm:text-base',
    lg: 'px-7 py-3.5 text-base sm:text-lg border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  }

  return (
    <button
      className={`${variant !== 'ghost' ? baseClass : 'font-bold text-black transition-all duration-100 rounded-none inline-flex items-center justify-center gap-2'} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
