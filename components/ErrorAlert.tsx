'use client'

interface ErrorAlertProps {
  title?: string
  message: string
}

export function ErrorAlert({ title = 'Error', message }: ErrorAlertProps) {
  return (
    <div className="bg-[#FF5EA6] text-black border-[3px] border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-extrabold text-lg mb-1 uppercase tracking-wide">⚠️ {title}</h3>
      <p className="font-bold text-sm">{message}</p>
    </div>
  )
}
