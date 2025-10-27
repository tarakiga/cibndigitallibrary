'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Play, Clock, Users, Award, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

const courses = [
  {
    title: 'Retail Banking Fundamentals',
    level: 'Beginner',
    duration: '8h',
    lessons: 24,
    rating: 4.8,
    students: 1200,
    gradient: 'from-blue-500 to-blue-600',
    description: 'Master the foundation of retail banking operations and products.'
  },
  {
    title: 'Risk Management in Financial Institutions',
    level: 'Intermediate',
    duration: '12h',
    lessons: 36,
    rating: 4.9,
    students: 980,
    gradient: 'from-purple-500 to-purple-600',
    description: 'Identify, assess, and mitigate key risks in banking.'
  },
  {
    title: 'Compliance & Regulatory Framework',
    level: 'Advanced',
    duration: '10h',
    lessons: 28,
    rating: 4.7,
    students: 760,
    gradient: 'from-green-500 to-green-600',
    description: 'Stay ahead with practical compliance and AML/CFT guidance.'
  },
]

export default function CoursesPage() {
  // Interactive dataset from CMS or fallback
  const [items, setItems] = useState<{ id: string|number, title: string, price: number, duration: string }[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cms_courses')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) {
          setItems(parsed)
          return
        }
      }
    } catch {}
    setItems([
      { id: 1, title: 'Financial Analysis Masterclass', price: 7500, duration: '6 hours' },
      { id: 2, title: 'Risk Management Pro', price: 5000, duration: '4 hours' },
      { id: 3, title: 'Customer Service Excellence', price: 1500, duration: '1.5 hours' },
    ])
  }, [])

  const [query, setQuery] = useState('')
  const [priceMin, setPriceMin] = useState<number|''>('')
  const [priceMax, setPriceMax] = useState<number|''>('')
  const [sort, setSort] = useState<'relevance'|'price_asc'|'price_desc'|'title'|'duration'>('relevance')
  const [page, setPage] = useState(1)
  const pageSize = 9

  const parseHours = (d:string) => { const m = d.match(/([0-9]+(\.[0-9]+)?)\s*hour/i); return m?parseFloat(m[1]):0 }

  const filtered = useMemo(() => {
    let arr = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
    const min = priceMin === '' ? 0 : Number(priceMin)
    const max = priceMax === '' ? Number.MAX_SAFE_INTEGER : Number(priceMax)
    arr = arr.filter(i => i.price >= min && i.price <= max)
    switch (sort) {
      case 'price_asc': arr = [...arr].sort((a,b)=>a.price-b.price); break
      case 'price_desc': arr = [...arr].sort((a,b)=>b.price-a.price); break
      case 'title': arr = [...arr].sort((a,b)=>a.title.localeCompare(b.title)); break
      case 'duration': arr = [...arr].sort((a,b)=>parseHours(a.duration)-parseHours(b.duration)); break
    }
    return arr
  }, [items, query, priceMin, priceMax, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 cibn-gradient opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-[#FFD700] text-[#064E3B]">Premium Courses</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Learn from industry experts. Advance your banking career.
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Curated programs designed by top practitioners at CIBN to sharpen your expertise and unlock new opportunities.
            </p>
            <div className="mt-6 flex gap-3">
              <Button className="cibn-green-gradient text-white">Browse all courses</Button>
              <Button variant="outline" className="border-gray-300">
                Get recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ icon: Award, label: 'Accredited', value: 'CIBN Certified' }, { icon: Users, label: 'Community', value: '5k+ Members' }, { icon: Star, label: 'Satisfaction', value: '4.8/5 Avg' }, { icon: Clock, label: 'Flexible', value: 'Self-paced' }].map((item, idx) => (
            <Card key={idx} className="border-gray-200">
              <CardContent className="p-5 flex items-center gap-3">
                <item.icon className="w-5 h-5 text-[#059669]" />
                <div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="font-semibold text-gray-900">{item.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Course Grid (Featured) */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div key={course.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden border-gray-200 group">
                <div className={`h-28 bg-gradient-to-r ${course.gradient} relative`}>
                  <div className="absolute inset-0 opacity-20 cibn-gradient" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.title}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" /> {course.rating}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1"><Play className="w-4 h-4" /> {course.lessons} lessons</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
                    <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {course.students}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                    <Button className="cibn-green-gradient text-white">Enroll now</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Browser */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
          <input className="h-10 px-3 rounded-md border border-gray-300" placeholder="Search courses" value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1) }} />
          <input type="number" className="h-10 w-24 px-3 rounded-md border border-gray-300" placeholder="Min ₦" value={priceMin} onChange={(e)=>{ setPriceMin(e.target.value===''?'':Number(e.target.value)); setPage(1) }} />
          <input type="number" className="h-10 w-24 px-3 rounded-md border border-gray-300" placeholder="Max ₦" value={priceMax} onChange={(e)=>{ setPriceMax(e.target.value===''?'':Number(e.target.value)); setPage(1) }} />
          <select className="h-10 px-3 rounded-md border border-gray-300" value={sort} onChange={(e)=> setSort(e.target.value as any)}>
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title">Title</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((i) => (
            <Card key={i.id} className="p-5 border-gray-200">
              <div className="font-medium text-gray-900">{i.title}</div>
              <div className="text-sm text-gray-500">{i.duration}</div>
              <div className="mt-2 font-semibold text-brand-accent">₦{i.price.toLocaleString()}</div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" className="border-gray-300">Details</Button>
              </div>
            </Card>
          ))}
          {pageItems.length===0 && (
            <div className="col-span-full text-center text-gray-500">No courses found.</div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button disabled={page<=1} onClick={()=> setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 rounded border hover:bg-gray-50 cursor-pointer disabled:opacity-50">Previous</button>
          <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
          <button disabled={page>=Math.max(1, Math.ceil(filtered.length / pageSize))} onClick={()=> setPage(p=>p+1)} className="px-3 py-1.5 rounded border hover:bg-gray-50 cursor-pointer disabled:opacity-50">Next</button>
        </div>
      </section>
    </div>
  )
}


