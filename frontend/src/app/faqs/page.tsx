'use client'

import { useEffect, useState } from 'react'

export default function FAQsPage() {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ try { const raw = localStorage.getItem('cms_pages'); if (raw) setData(JSON.parse(raw).faqs) } catch{} },[])
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {data?.heroImage && <img src={data.heroImage} alt="faqs-hero" className="h-48 w-full object-cover rounded-xl mb-6" />}
      <h1 className="text-3xl font-bold text-gray-900">FAQs</h1>
      <p className="mt-2 text-gray-600">Frequently asked questions about the platform.</p>

      <div className="mt-6 space-y-3">
        {(data?.items || []).map((it: any, idx: number) => (
          <details key={idx} className="p-4 bg-white border rounded-xl shadow-sm">
            <summary className="cursor-pointer font-medium text-gray-900">{it.q || 'Untitled Question'}</summary>
            <div className="mt-2 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: it.aHtml || '' }} />
          </details>
        ))}
        {(!data?.items || data.items.length===0) && (
          <div className="text-gray-500 text-sm">No FAQs added yet.</div>
        )}
      </div>
    </div>
  )
}
