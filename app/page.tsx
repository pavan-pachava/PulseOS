'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  Bot, 
  Flame, 
  Trophy, 
  Cpu, 
  ArrowRight
} from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard/daily')
    } else {
      if (email.trim()) {
        router.push(`/auth/register?email=${encodeURIComponent(email.trim())}`)
      } else {
        router.push('/auth/register')
      }
    }
  }

  return (
    <div className="min-h-screen neo-grid neo-glow flex flex-col pb-12">
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="flex items-center bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-xl font-black uppercase tracking-tight flex items-center gap-1">
              ⚡ PulseOS
            </span>
          </div>

          {/* Github Stars Badge (Similar to folder badge in screenshot) */}
          <div className="hidden sm:flex items-center bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] gap-2">
            <span className="text-sm">📂</span>
            <span className="text-xs font-black bg-[#FFE600] px-1.5 py-0.5 border border-black">
              ★ 1.2K
            </span>
          </div>
        </div>

        <Button 
          onClick={handleGetStarted} 
          variant="secondary" 
          size="sm"
        >
          {session ? '📊 Dashboard' : '⚡ Connect'}
        </Button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center pt-8 md:pt-16 space-y-16">
        
        {/* Centered Hero Card */}
        <div className="w-full max-w-3xl text-center space-y-8 z-10">
          <div className="relative bg-white border-[3px] border-black p-8 md:p-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] neo-shadow-yellow-lg">
            
            {/* Main Header */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-black leading-[1.1] uppercase tracking-tight select-none">
              Living Data
              <br />
              <span className="text-[#FF5EA6] flex items-center justify-center gap-2">
                Operating System
                <span className="text-[#FFE600] inline-block animate-pulse">⚡</span>
              </span>
            </h1>

            {/* Rotated Beta Version Badge */}
            <div className="absolute -bottom-4 right-4 sm:right-8 bg-black text-[#FFE600] text-xs font-black uppercase tracking-widest px-3 py-1.5 border-[3px] border-black rotate-[-2deg] shadow-[2px_2px_0px_0px_rgba(255,94,166,1)]">
              Beta Version v1.0
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl font-bold text-slate-800 max-w-2xl mx-auto px-4 leading-relaxed">
            The high-fidelity protocol for personal pattern analysis. Roast your habits, quantify focus, and upgrade your life trajectory.
          </p>
        </div>

        {/* Input & Call to Action Bar */}
        <div className="w-full max-w-2xl px-4 z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Neo-brutalist Input bar */}
            <div className="flex-1 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center px-4 py-3 gap-3">
              <span className="text-[#FF5EA6] font-black text-lg select-none">$</span>
              <input
                type="email"
                placeholder="USER_EMAIL_ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-none text-black font-bold placeholder-slate-400 focus:outline-none uppercase text-sm sm:text-base tracking-wider"
              />
              <span className="hidden sm:inline-block bg-slate-800 text-slate-300 border-2 border-black text-xs font-bold px-2 py-0.5 select-none uppercase tracking-wide">
                User_Node
              </span>
            </div>

            {/* Neo-brutalist Button */}
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto uppercase tracking-wider font-extrabold"
            >
              Initialize ⚡
            </Button>
          </div>
        </div>

        {/* Core 3 Feature Cards (Similar to bottom row in screenshot) */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 z-10">
          
          <Card className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Bot className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">AI Morning Briefing</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Deep kernel analysis of your daily habits. Generates an AI-synthesized 3-line protocol of your productivity and sleep vectors.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Consistency Hub</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Real-time multi-dimensional streak tracking. Keep your Spotify rhythms, calendar loads, and GitHub commits in absolute sync.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="p-4 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Merit Badges</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              AI-quantified achievement protocol artifacts. Auto-generate badges as you code more, listen to deeper tracks, and balance meetings.
            </p>
          </Card>

        </div>

        {/* Data Integrations Segment */}
        <section className="w-full max-w-6xl space-y-8 pt-12 z-10">
          <div className="text-center space-y-2">
            <div className="inline-block">
              <Badge variant="success">Protocols</Badge>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Plug-and-Play Integrations</h2>
            <p className="text-sm font-bold text-slate-600 max-w-md mx-auto">
              PulseOS connects securely to the services you already run every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:bg-[#FFF] hover:shadow-[6px_6px_0px_0px_#FFE600] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🎵</span>
                <div>
                  <h4 className="font-black uppercase tracking-tight text-lg">Spotify Link</h4>
                  <Badge variant="info">Audio Data</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-700 font-bold">
                Tracks your BPM ranges, acoustic valence, and top tracks to align beats with high productivity focus times.
              </p>
            </Card>

            <Card className="hover:bg-[#FFF] hover:shadow-[6px_6px_0px_0px_#FF5EA6] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">💻</span>
                <div>
                  <h4 className="font-black uppercase tracking-tight text-lg">GitHub Stream</h4>
                  <Badge variant="warning">Dev Metrics</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-700 font-bold">
                Monitors commit rates, code reviews, pull requests, and languages used to create coding speed visualizations.
              </p>
            </Card>

            <Card className="hover:bg-[#FFF] hover:shadow-[6px_6px_0px_0px_#00E5FF] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📅</span>
                <div>
                  <h4 className="font-black uppercase tracking-tight text-lg">G-Calendar Sync</h4>
                  <Badge variant="default">Schedule</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-700 font-bold">
                Computes meeting loads, context switching overheads, and schedules to isolate deep focus slots.
              </p>
            </Card>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="w-full max-w-4xl bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 z-10">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-black" />
            <h3 className="text-2xl font-black uppercase tracking-tight">System Specifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
            <div className="space-y-1">
              <h4 className="font-extrabold uppercase text-sm text-[#FF5EA6]">{"// Core Framework"}</h4>
              <p className="text-sm font-bold">Next.js App Router API nodes & React client components.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold uppercase text-sm text-[#FFE600]">{"// Event Database"}</h4>
              <p className="text-sm font-bold">TimescaleDB Postgres store for hyper-fast time series streams.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold uppercase text-sm text-[#00E5FF]">{"// Intelligence Layer"}</h4>
              <p className="text-sm font-bold">FastAPI microservice analyzing vectors and mood correlates.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full max-w-4xl text-center py-8 z-10">
          <div className="bg-[#FFE600] border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Initialize Your Personal OS Now</h3>
            <p className="text-sm sm:text-base font-bold text-black max-w-xl mx-auto">
              Establish connection vectors to your Spotify, GitHub, and calendar systems. Start analyzing your identity today.
            </p>
            <div className="pt-2">
              <Button onClick={handleGetStarted} variant="primary" size="lg" className="uppercase font-extrabold">
                Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 border-t-[3px] border-black mt-20 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-bold uppercase text-slate-700 tracking-wider gap-4">
        <p>⚡ PulseOS Kernel — All vectors operating within normal limits.</p>
        <p>© {new Date().getFullYear()} PulseOS Corp. All telemetry protected.</p>
      </footer>
    </div>
  )
}
