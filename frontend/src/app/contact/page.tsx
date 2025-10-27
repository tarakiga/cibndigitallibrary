'use client'

import { useEffect, useState } from 'react'

export default function ContactPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    try { const raw = localStorage.getItem('cms_pages'); if (raw) setData(JSON.parse(raw).contact) } catch {}
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {data?.heroImage && <img src={data.heroImage} alt="contact-hero" className="h-48 w-full object-cover rounded-xl mb-6" />}
      <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
      <p className="mt-2 text-gray-600">We’d love to hear from you. Reach out via the form or the details below.</p>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-sm text-gray-500">Address</div>
          <div className="mt-1 font-medium text-gray-900">Adeola Hopewell Street, Victoria Island, Lagos</div>
        </div>
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-sm text-gray-500">Phone</div>
          <div className="mt-1 font-medium text-gray-900">+234 (0) 1 461 1843 • (0700-DIAL-CIBN)</div>
        </div>
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-sm text-gray-500">Email</div>
          <div className="mt-1 font-medium text-gray-900">info@cibn.org</div>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Send a Message</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Full Name</label>
              <input className="mt-1 h-11 w-full rounded-md border px-3" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input type="email" className="mt-1 h-11 w-full rounded-md border px-3" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Message</label>
              <textarea className="mt-1 w-full min-h-[120px] rounded-md border p-3" placeholder="How can we help?" />
            </div>
            <button type="button" className="px-5 py-2.5 rounded-md text-white cibn-green-gradient shadow-premium cursor-pointer">Send</button>
          </form>
        </div>
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Office Hours</h2>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>Mon–Fri: 9:00 AM – 5:00 PM</li>
            <li>Sat–Sun: Closed</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Follow Us</h2>
          <p className="mt-2 text-gray-600">Connect with us on our social channels.</p>
        </div>
      </div>
    </div>
  )
}
