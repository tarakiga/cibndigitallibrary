"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/api/auth'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const onOpenChange = (open:boolean) => { if (!open) onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (e:any) {
      setError(e?.response?.data?.detail || 'Request failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[520px]">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#002366] to-[#059669] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reset your password</DialogTitle>
            <DialogDescription className="text-white/80">Enter your email to receive reset instructions.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 py-5">
          {sent ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">If the email exists, reset instructions have been sent.</div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
              <div>
                <Label htmlFor="fp-email">Email</Label>
                <Input id="fp-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button type="submit" className="cibn-green-gradient text-white" disabled={!email || submitting}>
                {submitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
