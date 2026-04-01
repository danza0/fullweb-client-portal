'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const [agencyName, setAgencyName] = useState('Fullweb')
  const [agencyEmail, setAgencyEmail] = useState('hello@fullweb.agency')
  const [agencyWebsite, setAgencyWebsite] = useState('https://fullweb.agency')
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure your portal settings" />

      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Agency Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Agency Name</Label>
                  <Input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Fullweb"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={agencyEmail}
                    onChange={(e) => setAgencyEmail(e.target.value)}
                    placeholder="hello@agency.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input
                    value={agencyWebsite}
                    onChange={(e) => setAgencyWebsite(e.target.value)}
                    placeholder="https://agency.com"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Button type="submit">Save Changes</Button>
                  {saved && <p className="text-xs text-white/50">Settings saved</p>}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Portal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Version">1.0.0</InfoRow>
              <InfoRow label="Environment">{process.env.NODE_ENV ?? 'production'}</InfoRow>
              <InfoRow label="Auth Provider">NextAuth.js v4</InfoRow>
              <InfoRow label="Database">PostgreSQL via Prisma</InfoRow>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs text-white/70">{children}</span>
    </div>
  )
}
