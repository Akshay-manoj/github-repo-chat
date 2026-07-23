'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ReactMarkdown from 'react-markdown'

interface SectionDef {
  id: string
  icon: string
  iconBg: string
  iconText: string
  title: string
  subtitle: string
  query: string
}

type SectionStatus = 'idle' | 'loading' | 'loaded' | 'error'

function SkeletonBlock() {
  return (
    <div className="space-y-3 py-4">
      {[90, 70, 85, 55, 75, 60].map((w, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
      ))}
      <div className="skeleton h-4 w-1/3" />
    </div>
  )
}

function StatusBadge({ status }: { status: SectionStatus }) {
  const configs: Record<SectionStatus, { label: string; color: string; dot: string }> = {
    idle:    { label: 'Not loaded', color: 'text-on-surface-variant border-outline-variant/40 bg-transparent', dot: 'bg-outline' },
    loading: { label: 'Loading…',   color: 'text-primary border-primary/30 bg-primary/5',         dot: 'bg-primary animate-pulse' },
    loaded:  { label: 'Loaded',     color: 'text-green-400 border-green-500/30 bg-green-500/5',   dot: 'bg-green-400' },
    error:   { label: 'Error',      color: 'text-error border-error/30 bg-error/5',               dot: 'bg-error' },
  }
  const c = configs[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

export default function InsightsPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repoId = unwrappedParams.repo
  const [expanded, setExpanded] = useState<string | null>(null)
  const [insights, setInsights] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, SectionStatus>>({})
  const [generatingAll, setGeneratingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  const sections: SectionDef[] = [
    {
      id: 'section-auth',
      icon: 'lock',
      iconBg: 'bg-primary/10 group-hover:bg-primary',
      iconText: 'text-primary group-hover:text-on-primary',
      title: 'Authentication',
      subtitle: 'Identity providers, JWT flow, and middleware',
      query: 'Explain the authentication flow, identity providers, and middleware used in this repository. Use markdown.',
    },
    {
      id: 'section-db',
      icon: 'storage',
      iconBg: 'bg-secondary-container/20 group-hover:bg-secondary',
      iconText: 'text-secondary group-hover:text-on-secondary',
      title: 'Database Schema',
      subtitle: 'ORM models, relationships, and migrations',
      query: 'Explain the database schema, ORM models, relationships, and any data architecture patterns found. Show schema code blocks if possible. Use markdown.',
    },
    {
      id: 'section-api',
      icon: 'api',
      iconBg: 'bg-tertiary-container/20 group-hover:bg-tertiary',
      iconText: 'text-tertiary group-hover:text-on-tertiary',
      title: 'API Endpoints',
      subtitle: 'REST resources and GraphQL resolution',
      query: 'List and describe the key API endpoints, REST resources, or GraphQL resolvers found in the repository. Use markdown.',
    },
    {
      id: 'section-env',
      icon: 'settings_input_component',
      iconBg: 'bg-surface-container-highest group-hover:bg-primary',
      iconText: 'text-outline group-hover:text-on-primary',
      title: 'Environment Variables',
      subtitle: 'Configuration, secrets, and staging flags',
      query: 'List the required environment variables, configuration flags, and secrets used in this repository based on .env files or config loaders. Use markdown.',
    },
    {
      id: 'section-queues',
      icon: 'queue',
      iconBg: 'bg-primary/10 group-hover:bg-primary',
      iconText: 'text-primary group-hover:text-on-primary',
      title: 'Queues & Workers',
      subtitle: 'Background workers, BullMQ, and cron tasks',
      query: 'Explain any background jobs, queues, workers, or cron tasks implemented in this repository. Use markdown.',
    },
  ]

  const fetchSection = async (section: SectionDef) => {
    setStatuses((prev) => ({ ...prev, [section.id]: 'loading' }))
    try {
      const res = await fetch(`${API_URL}/repositories/${repoId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: section.query }),
      })
      const data = await res.json()
      setInsights((prev) => ({ ...prev, [section.id]: data.answer || 'No insights found.' }))
      setStatuses((prev) => ({ ...prev, [section.id]: 'loaded' }))
    } catch {
      setInsights((prev) => ({ ...prev, [section.id]: 'Failed to generate insights.' }))
      setStatuses((prev) => ({ ...prev, [section.id]: 'error' }))
    }
  }

  const toggle = async (section: SectionDef) => {
    if (expanded === section.id) {
      setExpanded(null)
      return
    }
    setExpanded(section.id)
    if (!insights[section.id]) {
      await fetchSection(section)
    }
  }

  const generateAll = async () => {
    setGeneratingAll(true)
    const pending = sections.filter((s) => !insights[s.id])
    await Promise.all(pending.map(fetchSection))
    setGeneratingAll(false)
    // Expand first section
    if (sections.length > 0) setExpanded(sections[0].id)
  }

  const copySection = async (id: string) => {
    const text = insights[id]
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredSections = sections.filter((s) =>
    !searchQuery ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadedCount = sections.filter((s) => statuses[s.id] === 'loaded').length

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="docs" />
      <TopBar activeNav="history" />

      <main className="ml-64 mt-16 px-8 py-8 flex justify-center transition-all duration-300">
        <div className="w-full max-w-[1100px]">
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  System Analysis
                </div>
                <h2 className="text-3xl font-bold text-on-surface mb-3">Extracted Information</h2>
                <p className="text-on-surface-variant max-w-2xl">
                  Our AI audited your repository structure and logic flow. Expand each section for a granular deep-dive dynamically generated by Gemini!
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Progress pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                  {loadedCount}/{sections.length} loaded
                </div>

                {/* Generate All */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateAll}
                  disabled={generatingAll || loadedCount === sections.length}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold disabled:opacity-50 transition-all"
                >
                  {generatingAll ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                      Generating…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      Generate All
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative mt-6 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="Filter sections…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Accordion sections */}
          <div className="space-y-3 mb-12">
            <AnimatePresence>
              {filteredSections.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[48px] mb-3 block">search_off</span>
                  No sections match "{searchQuery}"
                </motion.div>
              )}
            </AnimatePresence>

            {filteredSections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface-container-low/80 backdrop-blur-sm rounded-xl border border-outline-variant/40 overflow-hidden hover:border-primary/20 transition-colors"
              >
                <motion.button
                  className="w-full px-6 py-5 flex items-center justify-between group"
                  onClick={() => toggle(section)}
                  whileTap={{ scale: 0.998 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${section.iconBg} ${section.iconText}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-on-surface">{section.title}</h3>
                        <StatusBadge status={statuses[section.id] || 'idle'} />
                      </div>
                      <p className="text-xs text-on-surface-variant">{section.subtitle}</p>
                    </div>
                  </div>
                  <motion.span
                    animate={{ rotate: expanded === section.id ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="material-symbols-outlined text-outline"
                  >
                    expand_more
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {expanded === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-outline-variant/30">
                        {statuses[section.id] === 'loading' ? (
                          <SkeletonBlock />
                        ) : (
                          <>
                            {/* Copy button */}
                            {insights[section.id] && (
                              <div className="flex justify-end mb-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => copySection(section.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {copiedId === section.id ? 'check' : 'content_copy'}
                                  </span>
                                  {copiedId === section.id ? 'Copied!' : 'Copy'}
                                </motion.button>
                              </div>
                            )}
                            <div className="prose prose-invert prose-sm prose-primary max-w-none">
                              <ReactMarkdown>{insights[section.id]}</ReactMarkdown>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
