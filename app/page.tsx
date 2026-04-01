'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, LayoutDashboard, FileText, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: 'Project Dashboard',
    description: 'Track every milestone, update, and deliverable in real time.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Invoices & Agreements',
    description: 'Access all your documents, invoices, and contracts in one place.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Onboarding Flow',
    description: 'Guided onboarding with clear tasks and progress tracking.',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Transparent Timeline',
    description: 'Stay informed with milestones and live project updates.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.015] blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="text-lg font-bold tracking-[0.2em] text-white">FULLWEB</span>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/50 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
            Premium Client Portal
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6">
            Your project,
            <br />
            <span className="text-white/40">organized.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            A premium client portal built for agencies and their clients. Track
            progress, manage documents, and communicate—all in one elegant space.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2 group">
              Access Your Portal
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-white/40">{feature.icon}</div>
                <h3 className="text-sm font-medium text-white">{feature.title}</h3>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 max-w-6xl mx-auto flex items-center justify-between text-xs text-white/30">
        <span className="font-bold tracking-[0.2em]">FULLWEB</span>
        <span>© {new Date().getFullYear()} Fullweb Agency</span>
      </footer>
    </main>
  )
}

