'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Prepopulate email if provided in search parameters (from homepage input)
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen neo-grid neo-glow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-black">
            <p className="text-5xl mb-4 bg-[#B2FF00] border-2 border-black inline-block p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">✅</p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-2">Node Instantiated!</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Routing payload to login vector...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen neo-grid neo-glow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
          
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-cover rounded-none" />
          </div>
          
          <h1 className="text-3xl font-black uppercase text-center mb-1 tracking-tight">Create Node</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 text-center mb-6">Initialize telemetry stream profile</p>

          {error && (
            <div className="mb-6 p-4 bg-[#FF5EA6] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-black font-bold text-xs uppercase tracking-wide">⚠️ Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">User Handle</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User name"
                className="w-full px-4 py-2 border-[3px] border-black text-black placeholder-slate-400 bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none uppercase font-bold text-xs sm:text-sm tracking-wider"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Email Node Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border-[3px] border-black text-black placeholder-slate-400 bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none uppercase font-bold text-xs sm:text-sm tracking-wider"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Secret Phrase</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border-[3px] border-black text-black placeholder-slate-400 bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none uppercase font-bold text-xs sm:text-sm tracking-wider"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Confirm Secret Phrase</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border-[3px] border-black text-black placeholder-slate-400 bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none uppercase font-bold text-xs sm:text-sm tracking-wider"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full uppercase font-black tracking-wider mt-2 bg-[#B2FF00]"
              disabled={isLoading}
            >
              {isLoading ? 'Instantiating Node...' : 'Initialize telemetry stream'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Node exists?{' '}
              <a href="/auth/login" className="text-[#FF5EA6] hover:underline font-black">
                Connect Node
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
