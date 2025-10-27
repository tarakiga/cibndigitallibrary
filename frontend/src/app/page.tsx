'use client'

import { HeroSection } from '@/components/sections/hero'
import { ContentShowcase } from '@/components/sections/content-showcase'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ContentShowcase />
    </div>
  )
}
