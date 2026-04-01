'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  variant?: 'admin' | 'portal'
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Clients', href: '/admin/clients', icon: <Users className="h-4 w-4" /> },
  { label: 'Projects', href: '/admin/projects', icon: <FolderKanban className="h-4 w-4" /> },
  { label: 'Invoices', href: '/admin/invoices', icon: <FileText className="h-4 w-4" /> },
  { label: 'Tutorials', href: '/admin/tutorials', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
]

const portalNav: NavItem[] = [
  { label: 'Overview', href: '/portal', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Project', href: '/portal/project', icon: <FolderKanban className="h-4 w-4" /> },
  { label: 'Invoices', href: '/portal/invoices', icon: <FileText className="h-4 w-4" /> },
  { label: 'Agreement', href: '/portal/agreement', icon: <FileText className="h-4 w-4" /> },
  { label: 'Welcome', href: '/portal/welcome', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Timeline', href: '/portal/timeline', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Updates', href: '/portal/updates', icon: <FileText className="h-4 w-4" /> },
  { label: 'Deliverables', href: '/portal/deliverables', icon: <FolderKanban className="h-4 w-4" /> },
  { label: 'Tutorials', href: '/portal/tutorials', icon: <BookOpen className="h-4 w-4" /> },
]

export function Sidebar({ variant = 'admin' }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const navItems = variant === 'admin' ? adminNav : portalNav

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/portal') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-full w-56 border-r border-white/[0.06] bg-black flex flex-col z-40"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <span className="text-sm font-bold tracking-[0.25em] text-white">FULLWEB</span>
        {variant === 'admin' && (
          <p className="mt-0.5 text-[10px] text-white/30 tracking-wider uppercase">Admin</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all',
              isActive(item.href)
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
            )}
          >
            <span className={cn(isActive(item.href) ? 'text-white' : 'text-white/30')}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">
              {session?.user?.name ? getInitials(session.user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-white/30 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </motion.aside>
  )
}

export { adminNav, portalNav }
export type { NavItem }
