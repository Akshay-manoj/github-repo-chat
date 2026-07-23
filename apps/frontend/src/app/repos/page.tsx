'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'

interface Repository {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
  created_at: string
  _count?: { files: number }
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
}

function RepoCard({ repo, index }: { repo: Repository; index: number }) {
  const router = useRouter()
  const name = repo.github_url.split('/').pop() || repo.github_url
  const owner = repo.github_url.split('/').slice(-2, -1)[0] || ''
  const isIndexed = !!repo.indexed_at
  const langColor = repo.language ? (LANG_COLORS[repo.language] ?? '#8c909f') : '#8c909f'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative bg-surface-container-low/80 border border-outline-variant/50 rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => router.push(`/repos/${repo.id}`)}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/8 rounded-full blur-[60px]" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-on-surface-variant truncate">{owner}</p>
            <h3 className="font-bold text-on-surface leading-tight truncate group-hover:text-primary transition-colors">{name}</h3>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          isIndexed
            ? 'text-green-400 border-green-500/30 bg-green-500/5'
            : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isIndexed ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
          {isIndexed ? 'Indexed' : 'Pending'}
        </span>
      </div>

      {/* GitHub URL */}
      <a
        href={repo.github_url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-on-surface-variant/60 hover:text-primary truncate transition-colors relative"
      >
        {repo.github_url}
      </a>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        {repo.language && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: langColor }} />
            {repo.language}
          </div>
        )}
        {repo._count?.files != null && (
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px]">description</span>
            {repo._count.files.toLocaleString()} files
          </div>
        )}
        {repo.indexed_at && (
          <div className="flex items-center gap-1 text-xs text-on-surface-variant ml-auto">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {new Date(repo.indexed_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div
        className="flex gap-2 pt-2 border-t border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {[
          { icon: 'open_in_new', label: 'Overview', href: `/repos/${repo.id}` },
          { icon: 'chat', label: 'Chat', href: `/repos/${repo.id}/chat` },
          { icon: 'account_tree', label: 'Diagram', href: `/repos/${repo.id}/diagram` },
          { icon: 'analytics', label: 'Insights', href: `/repos/${repo.id}/insights` },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20"
          >
            <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-6 text-center"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
        </motion.div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">add</span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-on-surface mb-2">No repositories yet</h3>
        <p className="text-on-surface-variant text-sm max-w-sm">
          Import a GitHub repository to start exploring its architecture, patterns, and logic with AI.
        </p>
      </div>

      <Link href="/import">
        <ShimmerButton
          className="px-6 py-3 text-sm font-semibold rounded-xl"
          shimmerColor="#adc6ff"
          borderRadius="12px"
          background="rgba(0,46,106,1)"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Import Your First Repository
        </ShimmerButton>
      </Link>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-low/80 border border-outline-variant/50 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="flex gap-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  )
}

export default function RepositoriesDashboard() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'indexed' | 'pending'>('all')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    fetch(`${API_URL}/repositories`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRepos(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = repos.filter((r) => {
    const name = r.github_url.toLowerCase()
    const matchesSearch = !search || name.includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'indexed' ? !!r.indexed_at :
      !r.indexed_at
    return matchesSearch && matchesFilter
  })

  const indexedCount = repos.filter((r) => !!r.indexed_at).length

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="repositories" />
      <TopBar activeNav="explorer" searchPlaceholder="Search repositories…" />

      <main className="ml-64 pt-16 pb-16 min-h-screen transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-8 py-10">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-10 flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                Repositories
              </div>
              <h1 className="text-3xl font-bold text-on-surface">Your Repositories</h1>
              {!loading && (
                <p className="text-on-surface-variant mt-1 text-sm">
                  {repos.length} imported · {indexedCount} indexed · {repos.length - indexedCount} pending
                </p>
              )}
            </div>

            <Link href="/import">
              <ShimmerButton
                className="h-10 px-5 text-sm font-semibold rounded-xl"
                shimmerColor="#adc6ff"
                borderRadius="12px"
                background="rgba(0,46,106,1)"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Analyze New
              </ShimmerButton>
            </Link>
          </motion.div>

          {/* Filters + search */}
          {!loading && repos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-8 flex-wrap"
            >
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Filter by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 bg-surface-container-low border border-outline-variant/40 rounded-xl p-1">
                {(['all', 'indexed', 'pending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      filter === f
                        ? 'bg-primary text-on-primary shadow'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : repos.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[48px] mb-3 block">search_off</span>
                    <p className="text-sm">No repositories match your filter</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((repo, i) => (
                      <RepoCard key={repo.id} repo={repo} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
