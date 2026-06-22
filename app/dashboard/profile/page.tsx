'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/LoadingSpinner'
import { ErrorAlert } from '@/components/ErrorAlert'
import { mockUser, mockIntegrations } from '@/lib/mockData'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Integration {
  id: string
  provider: string
  connected_at: string
  updated_at: string
  expires_at: string
}

interface User {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, intRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/integrations'),
        ])

        if (!userRes.ok) throw new Error('Failed to fetch user')
        if (!intRes.ok) throw new Error('Failed to fetch integrations')

        const userData = await userRes.json()
        const intData = await intRes.json()

        setUser(userData)
        setIntegrations(intData.integrations)
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 text-black">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Profile</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading telemetry...</p>
        </div>
        <LoadingCard />
      </div>
    )
  }

  return (
    <div className="space-y-8 text-black animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Profile</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Your PulseOS account settings and data</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* User Info */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-5xl bg-[#FAF9F3] border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
            👤
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                {user?.name || session?.user?.email?.split('@')[0] || 'User'}
              </h2>
              <Badge variant="success">User_Node_Active</Badge>
            </div>
            <p className="text-slate-800 text-xs font-black uppercase mt-1">{session?.user?.email}</p>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-wider mt-2">Member since {mockUser.joined}</p>
            <p className="text-slate-800 font-bold mt-3 border-t border-black/10 pt-3">{mockUser.bio}</p>
          </div>
        </div>
      </Card>

      {/* Connected Integrations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Connected Integrations</h2>
        {integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const mockInt = mockIntegrations.find(i => i.id === integration.provider)
              return (
                <Card key={integration.id} className="text-center flex flex-col items-center justify-between p-6">
                  <div>
                    <span className="text-4xl block mb-2 bg-[#FAF9F3] border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block select-none">{mockInt?.icon || '🔌'}</span>
                    <h3 className="font-black uppercase tracking-tight text-sm mt-3">{mockInt?.name || integration.provider}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Last synced 2 hours ago</p>
                  </div>
                  <div className="mt-4">
                    <Badge variant="info">{mockInt?.badge}</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <p className="text-slate-700 font-bold text-center py-6">No integrations connected to data kernel yet.</p>
          </Card>
        )}
      </section>

      {/* Data & Privacy */}
      <Card>
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-6">Data & Privacy Control</h3>
        <div className="space-y-4">
          <div className="p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-black uppercase text-sm text-black">Export Data</p>
              <p className="text-xs text-slate-700 font-bold mt-1">Download all your PulseOS telemetry vectors in standard JSON format.</p>
            </div>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              📥 Export Data
            </Button>
          </div>

          <div className="p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-black uppercase text-sm text-[#FF5EA6]">Data Retention</p>
              <p className="text-xs text-slate-700 font-bold mt-1">
                Telemetry data is auto-purged after 3 years. Immediate purge request can be issued.
              </p>
            </div>
            <Button variant="primary" size="sm" className="w-full sm:w-auto bg-[#FF5EA6]">
              🗑️ Request Purge
            </Button>
          </div>

          <div className="p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-black uppercase text-sm text-black">Privacy Protocol</p>
              <p className="text-xs text-slate-700 font-bold mt-1">
                Configure node visibility. Under core guidelines, your telemetry is never traded or sold.
              </p>
            </div>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              ⚙️ Privacy Config
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card>
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-6">Telemetry Dispatch Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black uppercase text-xs sm:text-sm text-black">Email Dispatch Notifications</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 border-2 border-black rounded-none bg-white accent-black cursor-pointer" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black uppercase text-xs sm:text-sm text-black">Weekly Telemetry Digest</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 border-2 border-black rounded-none bg-white accent-black cursor-pointer" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-[#FAF9F3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black uppercase text-xs sm:text-sm text-black">Anomaly Alert Protocols</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 border-2 border-black rounded-none bg-white accent-black cursor-pointer" 
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
