'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/trades', label: 'Trades', icon: '📋' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
]

export function Navbar() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved === 'dark' || saved === 'light' ? saved : systemDark ? 'dark' : 'light'

    document.documentElement.classList.toggle('dark', initial === 'dark')
    setTheme(initial as 'light' | 'dark')
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">TradeTracker</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  )}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              ))}
            </div>

            <button type="button" onClick={toggleTheme} className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800" aria-label="Toggle dark mode" >
              {mounted ? (theme === 'dark' ? '☀️ Light' : '🌙 Dark') : 'Theme'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}