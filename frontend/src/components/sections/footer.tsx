'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Footer() {
  const [social, setSocial] = useState({ facebook: '#', twitter: '#', linkedin: '#', instagram: '#' })
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('cms_pages');
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.contact?.social) setSocial(parsed.contact.social)
      }
    } catch {}
  }, [])

  const footerLinks = {
    'Quick Links': [
      { name: 'About CIBN', href: '/about' },
      { name: 'Library', href: '/library' },
      { name: 'Resources', href: '/resources' }
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' }
    ],
    'Resources': [
      { name: 'Blog', href: '/blog' },
      { name: 'Publications', href: '/publications' },
      { name: 'Research Papers', href: '/research' },
      { name: 'Exam Materials', href: '/exams' },
      { name: 'Career Center', href: '/careers' }
    ]
  }

  const socialLinks = [
    { icon: Facebook, href: social.facebook || '#', label: 'Facebook' },
    { icon: Twitter, href: social.twitter || '#', label: 'Twitter' },
    { icon: Linkedin, href: social.linkedin || '#', label: 'LinkedIn' },
    { icon: Instagram, href: social.instagram || '#', label: 'Instagram' }
  ]

  return (
    <footer className="bg-[#059669] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
              <p className="text-white/80 text-lg">
                Get the latest banking resources, course updates, and exclusive offers delivered to your inbox.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder-white/60 px-6 py-4 rounded-xl"
              />
              <Button className="cibn-gold-gradient text-[#059669] px-8 py-4 font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                Subscribe
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center p-2">
                <Image
                  src="https://cibng.org/wp-content/uploads/2025/05/cibnlogo.png"
                  alt="CIBN Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-xl font-bold">CIBN Digital Library</h4>
                <p className="text-white/70 text-sm">Excellence in Banking Education</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              Empowering banking professionals with comprehensive digital resources, 
              expert-led courses, and a community of excellence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Link
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:text-[#059669] transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="space-y-6"
            >
              <h4 className="text-xl font-semibold">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-[#FFD700] transition-colors duration-300 flex items-center group"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-[#059669]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-white/80 text-sm">
                  Adeola Hopewell Street, Victoria Island, Lagos
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-[#059669]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-white/80 text-sm">
                  +234 (0) 1 461 1843 | (0700-DIAL-CIBN)
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-[#059669]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-white/80 text-sm">cibn@cibng.org</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-white/60 text-sm"
            >
              © 2024 Chartered Institute of Bankers of Nigeria. All rights reserved.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-6 text-white/60 text-sm"
            >
              <Link href="/terms" className="hover:text-[#FFD700] transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-[#FFD700] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-[#FFD700] transition-colors">
                Cookie Policy
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}