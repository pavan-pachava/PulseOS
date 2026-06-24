import { NextRequest, NextResponse } from 'next/server'
import cities from '@/lib/cities.json'

interface City {
  name: string
  city: string
  lat: number
  lng: number
  pop: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      // Return top 20 largest cities by default
      return NextResponse.json(cities.slice(0, 20))
    }
    
    const lowercaseQuery = query.toLowerCase()
    const matches = (cities as City[])
      .filter((c) => c.name.toLowerCase().includes(lowercaseQuery))
      .slice(0, 50)
      
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
