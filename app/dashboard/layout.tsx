'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAF9F3] neo-grid neo-glow">
        <div className="text-center bg-white border-[3px] border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="font-extrabold uppercase tracking-wider text-sm text-black">Initializing Telemetry...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#FAF9F3] text-black neo-grid overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto neo-glow min-h-full pb-16">
          {children}
        </div>
      </main>
    </div>
  )
}
