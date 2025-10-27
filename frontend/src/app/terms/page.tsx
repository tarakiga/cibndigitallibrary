'use client'

import { useEffect, useState } from 'react'

export default function TermsPage() {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ try { const raw = localStorage.getItem('cms_pages'); if (raw) setData(JSON.parse(raw).terms) } catch{} },[])
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-gray-600">Please review the terms governing the use of this platform.</p>

      <div className="mt-6 space-y-4 text-gray-700 leading-relaxed bg-white p-6 rounded-xl border shadow-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: data?.bodyHtml || 'By accessing or using the CIBN Digital Library, you agree to these terms...' }} />
    </div>
  )
}
