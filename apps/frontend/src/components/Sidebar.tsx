'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface SidebarProps {
  activeItem?: 'repositories' | 'chats' | 'docs' | 'settings'
}

const navItems = [
  { key: 'repositories', icon: 'folder_open', label: 'Repositories', href: '/repos' },
  { key: 'chats', icon: 'forum', label: 'Recent Chats', href: '#' },
  { key: 'docs', icon: 'description', label: 'Architecture Documents', href: '#' },
  { key: 'settings', icon: 'settings', label: 'Settings', href: '#' },
] as const

export default function Sidebar({ activeItem = 'repositories' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [pillTop, setPillTop] = useState(0)
  const [pillHeight, setPillHeight] = useState(0)
  const navRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    const activeRef = navRefs.current[activeItem]
    if (activeRef) {
      setPillTop(activeRef.offsetTop)
      setPillHeight(activeRef.offsetHeight)
    }
  }, [activeItem, collapsed])

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full flex flex-col justify-between py-stack-lg border-r border-outline-variant bg-surface-container-lowest z-50 overflow-hidden"
    >
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'px-4 justify-center' : 'px-6'}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-headline-md font-headline-md font-bold text-primary leading-none">RepoInsight</h1>
                <p className="font-caption text-caption text-on-surface-variant">AI Analysis</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Analyze New Button */}
        <div className={collapsed ? 'px-4' : 'px-6'}>
          <Link
            href="/import"
            className={`w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 ${collapsed ? 'px-0 justify-center' : 'px-4 justify-center'}`}
            title={collapsed ? 'Analyze New' : undefined}
          >
            <span className="material-symbols-outlined">add</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Analyze New
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav with sliding pill */}
        <nav className={`flex flex-col gap-1 relative ${collapsed ? 'px-2' : 'px-4'}`}>
          {/* Animated active pill */}
          {!collapsed && (
            <motion.div
              className="sidebar-active-pill"
              animate={{ top: pillTop, height: pillHeight }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}

          {navItems.map((item) => {
            const isActive = activeItem === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                ref={(el) => { navRefs.current[item.key] = el }}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg font-label-md text-label-md transition-all duration-200 relative ${
                  collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'text-primary bg-primary-container/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className={`flex flex-col gap-2 ${collapsed ? 'px-2' : 'px-6'}`}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="material-symbols-outlined"
          >
            chevron_left
          </motion.span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          title={collapsed ? 'Toggle theme' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="material-symbols-outlined">dark_mode</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Theme Toggle
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface-container-high mt-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">
            AX
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="font-label-md text-label-md text-on-surface truncate">Alex Rivera</p>
                <p className="font-caption text-caption text-on-surface-variant truncate">Premium Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
