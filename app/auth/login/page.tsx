'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/daily'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen neo-grid neo-glow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
          
          <div className="flex justify-center mb-4">
            <img src="/catlogo.png" alt="Logo" className="logo-img w-20 h-20 object-cover rounded-none" />
          </div>

          <h1 className="text-3xl font-black uppercase text-center mb-1 tracking-tight">CatnelOS</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 text-center mb-6">Your life as a living data OS</p>

          {error && (
            <div className="mb-6 p-4 bg-[#FF5EA6] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-black font-bold text-xs uppercase tracking-wide">⚠️ Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">email handle</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@catnel.os"
                className="w-full px-4 py-2 border-[3px] border-black text-black font-bold bg-[#FAF9F3] placeholder-slate-500 focus:outline-none focus:bg-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">access cipher</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border-[3px] border-black text-black font-bold bg-[#FAF9F3] placeholder-slate-500 focus:outline-none focus:bg-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full uppercase font-black tracking-wider mt-2 bg-[#B2FF00]"
              disabled={isLoading}
            >
              {isLoading ? 'Instantiating Connection...' : 'Connect Node to Core'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              No registered node?{' '}
              <a href="/auth/register" className="text-[#FF5EA6] hover:underline font-black">
                Register Node
              </a>
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#FAF9F3] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Telemetry Sandbox Mode</p>
            <p className="text-xs font-bold text-slate-800">
              Demo credentials: Use any email and password combination to instantiate a new account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen neo-grid neo-glow flex items-center justify-center p-4">
        <div className="bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
          <p className="font-bold text-center">Loading CatnelOS...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
