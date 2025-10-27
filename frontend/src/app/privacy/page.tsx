'use client'

import { useEffect, useState } from 'react'

export default function PrivacyPage() {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ try { const raw = localStorage.getItem('cms_pages'); if (raw) setData(JSON.parse(raw).privacy) } catch{} },[])
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-gray-600">How we collect, use, and protect your data.</p>

      <div className="mt-6 space-y-4 text-gray-700 leading-relaxed bg-white p-6 rounded-xl border shadow-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: data?.bodyHtml || 'Your privacy is important to us. This policy explains our practices...' }} />
    </div>
  )
}
