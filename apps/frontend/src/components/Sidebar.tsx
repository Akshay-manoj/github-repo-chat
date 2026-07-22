'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  activeItem?: 'repositories' | 'chats' | 'docs' | 'settings'
}

export default function Sidebar({ activeItem = 'repositories' }: SidebarProps) {
  const navItems = [
    { key: 'repositories', icon: 'folder_open', label: 'Repositories', href: '/import' },
    { key: 'chats', icon: 'forum', label: 'Recent Chats', href: '#' },
    { key: 'docs', icon: 'description', label: 'Architecture Documents', href: '#' },
    { key: 'settings', icon: 'settings', label: 'Settings', href: '#' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col justify-between py-stack-lg w-64 border-r border-outline-variant bg-surface-container-lowest z-50">
      <div className="px-6 flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md font-bold text-primary leading-none">RepoInsight</h1>
            <p className="font-caption text-caption text-on-surface-variant">AI Analysis</p>
          </div>
        </div>

        {/* Analyze New Button */}
        <Link
          href="/import"
          className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Analyze New
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${
                  isActive
                    ? 'text-primary border-r-2 border-primary bg-primary-container/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-6 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">dark_mode</span>
          Theme Toggle
        </button>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-high mt-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">
            AX
          </div>
          <div className="overflow-hidden">
            <p className="font-label-md text-label-md text-on-surface truncate">Alex Rivera</p>
            <p className="font-caption text-caption text-on-surface-variant truncate">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
