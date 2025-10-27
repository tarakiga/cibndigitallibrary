'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Award, Building2, Globe2, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 cibn-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-4 bg-[#FFD700] text-[#064E3B]">About CIBN Digital Library</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Excellence in Banking Education</h1>
            <p className="mt-4 text-gray-600 max-w-3xl">
              The Chartered Institute of Bankers of Nigeria (CIBN) is dedicated to advancing professionalism in banking. Our digital library brings
              world-class learning and research resources to every banking professional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 mt-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Users, label: 'Active Members', value: '5,000+' },
            { icon: Award, label: 'Certified Programs', value: '200+' },
            { icon: Building2, label: 'Partner Institutions', value: '50+' },
            { icon: Globe2, label: 'Global Reach', value: '30+ Countries' },
            { icon: ShieldCheck, label: 'Compliance Resources', value: 'Up-to-date' },
          ].map((s, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-5 text-center">
                <s.icon className="w-5 h-5 text-[#059669] mx-auto mb-2" />
                <div className="text-xl font-semibold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-600">To empower banking professionals with accessible, high-quality learning and research materials that drive excellence and ethical practice.</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h2>
            <p className="text-gray-600">To be the leading digital hub for banking education and research in Africa, supporting lifelong learning and innovation.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}


