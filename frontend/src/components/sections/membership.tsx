'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Star, Users, BookOpen, Headphones, Video, FileText, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

function pickIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('member')) return Crown
  if (n.includes('pro') || n.includes('professional')) return Star
  return Users
}

export function MembershipSection() {
  const [cmsPlans, setCmsPlans] = useState<any[] | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cms_resources')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.membership) && parsed.membership.length) {
          setCmsPlans(parsed.membership)
        }
      }
    } catch {}
  }, [])

  const plans = cmsPlans || [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for getting started',
      icon: Users,
      color: 'from-gray-500 to-gray-600',
      features: [
        'Access to free resources',
        'Basic search functionality',
        'Community forum access',
        'Monthly newsletter',
        'Limited downloads (5/month)'
      ],
      excluded: [
        'Premium content',
        'Video courses',
        'Expert support',
        'Certificates'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '₦5,000',
      period: '/month',
      description: 'Ideal for banking professionals',
      icon: Star,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Everything in Basic',
        'Access to premium documents',
        'Video course library',
        'Advanced search filters',
        'Unlimited downloads',
        'Expert support',
        'Progress tracking',
        'Monthly webinars'
      ],
      excluded: [
        'CIBN exclusive content',
        'One-on-one mentoring',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'CIBN Member',
      price: '₦10,000',
      period: '/month',
      description: 'Complete access for CIBN members',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      features: [
        'Everything in Professional',
        'CIBN exclusive publications',
        'Internal research papers',
        'One-on-one mentoring',
        'Priority support',
        'Certificate programs',
        'Networking events',
        'Exam preparation materials',
        'Physical resource discounts'
      ],
      excluded: [],
      popular: false,
      restricted: true
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-[#FFD700] text-[#059669] px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Membership Plans
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-[#059669]">Membership</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your professional development journey
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-[#FFD700] text-[#002366] px-4 py-2 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full relative overflow-hidden ${
                plan.popular ? 'border-2 border-[#FFD700] shadow-2xl' : 'border border-gray-200 shadow-lg'
              } rounded-2xl`}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color || 'from-gray-500 to-gray-600'} opacity-5`}></div>
                
                <CardHeader className="relative pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${plan.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                      {(() => {
                        const IconComp = (plan as any).icon || pickIcon(String(plan.name))
                        const Comp: any = IconComp
                        return <Comp className="w-8 h-8" />
                      })()}
                    </div>
                    {plan.restricted && (
                      <Badge className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        CIBN Only
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <p className="text-gray-600">{plan.description}</p>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-4xl font-bold text-[#059669]">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.excluded.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-500 text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full mt-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      plan.popular 
                        ? 'cibn-gold-gradient text-[#059669] hover:shadow-lg' 
                        : plan.restricted
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[#059669] hover:bg-[#047857] text-white'
                    }`}
                  >
                    {plan.restricted ? 'Verify CIBN ID' : plan.name === 'Basic' ? 'Get Started' : 'Subscribe Now'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            All Memberships Include
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Digital Library', description: 'Access thousands of resources' },
              { icon: Video, title: 'Video Content', description: 'HD streaming courses' },
              { icon: Headphones, title: 'Audio Materials', description: 'Learn on the go' },
              { icon: FileText, title: 'Documents', description: 'Downloadable PDFs and more' },
              { icon: Users, title: 'Community', description: 'Connect with professionals' },
              { icon: Zap, title: 'Regular Updates', description: 'Fresh content weekly' },
              { icon: Shield, title: 'Secure Platform', description: 'Your data is protected' },
              { icon: Star, title: 'Expert Support', description: 'Get help when you need it' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}