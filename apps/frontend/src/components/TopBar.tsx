'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TopBarProps {
  activeNav?: 'explorer' | 'history' | 'docs'
  showSearch?: boolean
  searchPlaceholder?: string
  sidebarCollapsed?: boolean
}

export default function TopBar({
  activeNav = 'explorer',
  showSearch = true,
  searchPlaceholder = 'Search anything...',
  sidebarCollapsed = false,
}: TopBarProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showNotif, setShowNotif] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const sidebarWidth = sidebarCollapsed ? 72 : 256

  return (
    <header
      style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)` }}
      className="fixed top-0 right-0 z-40 flex justify-between items-center px-gutter h-16 bg-background/70 backdrop-blur-md border-b border-outline-variant transition-all duration-300"
    >
      <div className="flex items-center gap-8">
        <nav className="flex gap-6">
          {(['explorer', 'history', 'docs'] as const).map((nav) => (
            <button
              key={nav}
              className={`font-body-md text-body-md transition-colors capitalize relative pb-1 ${
                activeNav === nav
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {nav}
              {activeNav === nav && (
                <motion.div
                  layoutId="topbar-active"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container rounded-full py-2 pl-10 pr-4 text-label-md font-label-md outline-none border border-outline-variant focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <AnimatePresence>
              {searchValue && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Notification bell with pulse dot */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setNotifOpen((o) => !o); setShowNotif(false) }}
              className={`relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ${showNotif ? 'notif-dot' : ''}`}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 top-full w-72 bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant/30">
                    <p className="text-sm font-semibold text-on-surface">Notifications</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      { icon: 'check_circle', text: 'Repository analysis complete', time: '2m ago', color: 'text-primary' },
                      { icon: 'auto_awesome', text: 'New AI insight available', time: '1h ago', color: 'text-secondary' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer">
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 ${n.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                        <div>
                          <p className="text-xs text-on-surface leading-snug">{n.text}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
