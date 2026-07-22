'use client'

import Link from 'next/link'

interface TopBarProps {
  activeNav?: 'explorer' | 'history' | 'docs'
  showSearch?: boolean
  searchPlaceholder?: string
}

export default function TopBar({ activeNav = 'explorer', showSearch = true, searchPlaceholder = 'Search anything...' }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 z-40 flex justify-between items-center px-gutter h-16 w-[calc(100%-16rem)] ml-64 bg-background/70 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-8">
        <nav className="flex gap-6">
          {(['explorer', 'history', 'docs'] as const).map((nav) => (
            <Link
              key={nav}
              href="#"
              className={`font-body-md text-body-md transition-colors capitalize ${
                activeNav === nav
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {nav}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container rounded-full py-2 pl-10 pr-4 text-label-md font-label-md outline-none border border-outline-variant focus:border-primary transition-all"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">help_outline</button>
        </div>
      </div>
    </header>
  )
}
