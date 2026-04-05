'use client'
import Link from 'next/link'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/insights', label: 'Insights' },
  { href: '/trends', label: 'Trends' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 px-4 pt-4 pb-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0">
          <div className="bg-card border border-border rounded-xl px-2 py-1 shadow-sm">
            {/* Show full logo image — contains icon + OPENWATCH wordmark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.png"
              alt="OpenWatch"
              style={{ height: 36, width: 'auto', display: 'block' }}
            />
          </div>
        </Link>

        {/* Pill nav */}
        <nav className="bg-card border border-border rounded-2xl px-1.5 py-1.5 shadow-sm flex items-center gap-0.5">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/dashboard' && pathname.startsWith(l.href))
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-sm transition-all duration-150',
                  active
                    ? 'bg-foreground text-background font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right slot */}
        <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Anthropic Monitor
          </span>
        </div>
      </div>
    </header>
  )
}
