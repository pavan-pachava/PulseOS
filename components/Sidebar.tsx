'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/dashboard/daily', label: 'Daily Dashboard', icon: '📊' },
    { href: '/dashboard/integrations', label: 'Integrations', icon: '🔌' },
    { href: '/dashboard/insights', label: 'Insights', icon: '✨' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <aside className="w-64 bg-white border-r-[3px] border-black p-6 h-screen flex flex-col justify-between z-20">
      <div className="space-y-8">
        {/* Brand */}
        <Link href="/dashboard/daily" className="flex items-center gap-2 bg-[#FFE600] border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
          <span className="text-2xl animate-pulse">⚡</span>
          <span className="text-lg font-black uppercase tracking-wider text-black">PulseOS</span>
        </Link>

        {/* Nav list */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full px-4 py-2 border-2 font-bold uppercase tracking-wide text-xs sm:text-sm transition-all block rounded-none ${
                  isActive
                    ? 'bg-[#FF5EA6] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]'
                    : 'text-black border-transparent hover:border-black hover:bg-black/5'
                }`}
              >
                <span className="mr-2 text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {session?.user && (
        <div className="border-t-[3px] border-black pt-4 bg-[#FAF9F3] -mx-6 -mb-6 p-6 border-l-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">User Node ID:</p>
          <p className="text-black font-extrabold text-xs mb-4 truncate bg-white border border-black px-2 py-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {session.user.email}
          </p>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="w-full px-4 py-2 border-2 border-black font-bold text-xs uppercase bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-center block"
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
