'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface RepoItem {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
  created_at: string
}

interface CommandItem {
  id: string
  icon: string
  label: string
  sublabel?: string
  category: 'repo' | 'nav' | 'action'
  action: () => void
  keywords?: string
}

interface CommandPaletteProps {
  repos?: RepoItem[]
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export default function CommandPalette({ repos = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const go = useCallback((path: string) => {
    setOpen(false)
    setQuery('')
    router.push(path)
  }, [router])

  const allItems = useCallback((): CommandItem[] => {
    const navItems: CommandItem[] = [
      { id: 'nav-import', icon: 'add_circle', label: 'Import New Repository', category: 'action', action: () => go('/import'), keywords: 'analyze new repo' },
      { id: 'nav-repos', icon: 'folder_open', label: 'All Repositories', category: 'nav', action: () => go('/repos'), keywords: 'dashboard list repos' },
    ]

    const repoItems: CommandItem[] = repos.map((r) => {
      const name = r.github_url.split('/').pop() || r.github_url
      return {
        id: `repo-${r.id}`,
        icon: r.indexed_at ? 'check_circle' : 'hourglass_empty',
        label: name,
        sublabel: r.github_url,
        category: 'repo',
        keywords: r.github_url,
        action: () => go(`/repos/${r.id}`),
      }
    })

    // Per-repo quick actions for the first 3 repos
    const quickActions: CommandItem[] = repos.slice(0, 3).flatMap((r) => {
      const name = r.github_url.split('/').pop() || ''
      return [
        { id: `chat-${r.id}`, icon: 'chat', label: `Chat with ${name}`, sublabel: 'AI conversation', category: 'action' as const, action: () => go(`/repos/${r.id}/chat`), keywords: `ask question ${r.github_url}` },
        { id: `diagram-${r.id}`, icon: 'account_tree', label: `Diagram of ${name}`, sublabel: 'Architecture visualization', category: 'action' as const, action: () => go(`/repos/${r.id}/diagram`), keywords: `mermaid architecture ${r.github_url}` },
        { id: `insights-${r.id}`, icon: 'analytics', label: `Insights for ${name}`, sublabel: 'Deep-dive analysis', category: 'action' as const, action: () => go(`/repos/${r.id}/insights`), keywords: `insights ${r.github_url}` },
      ]
    })

    return [...navItems, ...repoItems, ...quickActions]
  }, [repos, go])

  const filtered = allItems().filter((item) =>
    fuzzyMatch(query, `${item.label} ${item.sublabel ?? ''} ${item.keywords ?? ''}`)
  )

  const grouped = {
    nav: filtered.filter((i) => i.category === 'nav'),
    repo: filtered.filter((i) => i.category === 'repo'),
    action: filtered.filter((i) => i.category === 'action'),
  }

  const flat = [
    ...grouped.nav,
    ...grouped.repo,
    ...grouped.action,
  ]

  // Keyboard: open/close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  // Keyboard navigation inside palette
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      flat[selected]?.action()
    }
  }

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  // Reset selection when query changes
  useEffect(() => setSelected(0), [query])

  const categoryLabel = { nav: 'Navigation', repo: 'Repositories', action: 'Quick Actions' }
  const categoryIcon = { nav: 'explore', repo: 'folder', action: 'bolt' }

  function renderGroup(items: CommandItem[], category: keyof typeof categoryLabel) {
    if (items.length === 0) return null
    const globalOffset = flat.indexOf(items[0])
    return (
      <div key={category}>
        <div className="px-4 py-2 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[12px]">{categoryIcon[category]}</span>
          {categoryLabel[category]}
        </div>
        {items.map((item, localIdx) => {
          const globalIdx = globalOffset + localIdx
          const isSelected = globalIdx === selected
          return (
            <motion.button
              key={item.id}
              onClick={item.action}
              onMouseEnter={() => setSelected(globalIdx)}
              animate={isSelected ? { backgroundColor: 'rgba(173,198,255,0.08)' } : { backgroundColor: 'transparent' }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg mx-1 ${
                isSelected ? 'text-on-surface' : 'text-on-surface-variant'
              }`}
              style={{ width: 'calc(100% - 8px)' }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-[18px]" style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>{item.label}</p>
                {item.sublabel && <p className="text-xs text-on-surface-variant/50 truncate">{item.sublabel}</p>}
              </div>
              {isSelected && (
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface-variant font-mono">↵</kbd>
              )}
            </motion.button>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-[600px] z-[101] mx-4"
              style={{ maxWidth: 'min(600px, calc(100vw - 32px))' }}
            >
              <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Search repos, actions, pages…"
                    className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                  />
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface-variant font-mono">Esc</kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                  {flat.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[36px]">search_off</span>
                      <p className="text-sm">No results for "{query}"</p>
                    </div>
                  ) : (
                    <>
                      {renderGroup(grouped.nav, 'nav')}
                      {renderGroup(grouped.repo, 'repo')}
                      {renderGroup(grouped.action, 'action')}
                    </>
                  )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-outline-variant/20 text-[11px] text-on-surface-variant/40">
                  <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> open</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">Esc</kbd> close</span>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    RepoInsight
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger hint — shown in a fixed bottom-right corner */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low/80 border border-outline-variant/40 backdrop-blur-sm text-xs text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span className="hidden sm:inline">Quick Search</span>
            <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-surface-container border border-outline-variant/30">⌘K</kbd>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
