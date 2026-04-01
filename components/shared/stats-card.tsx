'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  delay?: number
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  delay = 0,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</p>
        {icon && <div className="text-white/30">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-semibold text-white tracking-tight">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-white/40">{description}</p>
      )}
    </motion.div>
  )
}
