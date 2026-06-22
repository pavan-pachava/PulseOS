'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-10 h-10 border-[4px] border-black bg-[#FFE600] animate-spin rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-none p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-black/10 rounded-none w-3/4"></div>
        <div className="h-4 bg-black/10 rounded-none w-1/2"></div>
        <div className="h-8 bg-black/15 rounded-none mt-4"></div>
      </div>
    </div>
  )
}
