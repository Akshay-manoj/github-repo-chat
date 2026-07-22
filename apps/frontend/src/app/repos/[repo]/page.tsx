'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'

export default function RepoOverviewPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repo = unwrappedParams.repo
  const [activeAccordions, setActiveAccordions] = useState<Set<string>>(new Set(['arch']))
  const [chatOpen, setChatOpen] = useState(true)
  const [chatInput, setChatInput] = useState('')

  const toggleAccordion = (id: string) => {
    setActiveAccordions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stats = [
    { label: 'Language', value: <span className="flex items-center gap-2"><span className="w-2 h-2 inline-block rounded-full bg-[#3178c6]" />TypeScript</span> },
    { label: 'Framework', value: 'NestJS (v10.0)' },
    { label: 'Last Updated', value: '2 hours ago' },
    { label: 'Analysis Score', value: <span className="text-primary font-bold">94 / 100</span> },
  ]

  const accordions = [
    {
      id: 'arch',
      icon: 'account_tree',
      title: 'Architecture Deep Dive',
      content: (
        <div className="grid md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-2 space-y-4">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              The system implements a <strong className="text-on-surface">hexagonal architecture</strong> (Ports and Adapters). The <code className="text-primary bg-surface-container px-1 rounded">/core</code> directory contains pure business logic, while <code className="text-primary bg-surface-container px-1 rounded">/infrastructure</code> handles database connectors and third-party API clients.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'State Management', desc: 'Redis for session caching and BullMQ queues for background processing.' },
              { title: 'Data Access', desc: 'TypeORM with Postgres, following the Repository pattern.' },
              { title: 'Observability', desc: 'Integrated Prometheus metrics and ELK-compatible structured logging.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ scale: 1.02, borderColor: 'rgba(173,198,255,0.4)' }}
                className="p-3 rounded-xl bg-surface-container-high border border-outline-variant transition-colors"
              >
                <span className="text-xs font-bold text-primary block mb-1">{item.title}</span>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'folder',
      icon: 'folder_zip',
      title: 'Folder Structure',
      content: (
        <div className="py-4">
          <div className="bg-[#0f172a] p-6 rounded-xl font-mono text-sm overflow-x-auto border border-[#1e293b]">
            <pre className="text-[#94a3b8] leading-loose">
              <span className="text-primary">src/</span>{'\n'}
              {'├── '}<span className="text-secondary">app.module.ts</span>{'           '}<span className="text-on-tertiary-fixed-variant">// Root module</span>{'\n'}
              {'├── '}<span className="text-primary">modules/</span>{'\n'}
              {'│   ├── '}<span className="text-primary">bookings/</span>{'          '}<span className="text-on-tertiary-fixed-variant">// Core booking logic</span>{'\n'}
              {'│   ├── '}<span className="text-primary">payments/</span>{'          '}<span className="text-on-tertiary-fixed-variant">// Stripe integration</span>{'\n'}
              {'│   └── '}<span className="text-primary">users/</span>{'             '}<span className="text-on-tertiary-fixed-variant">// IAM and profile mgmt</span>{'\n'}
              {'├── '}<span className="text-primary">common/</span>{'                '}<span className="text-on-tertiary-fixed-variant">// Shared decorators & filters</span>{'\n'}
              {'└── '}<span className="text-primary">infrastructure/</span>{'        '}<span className="text-on-tertiary-fixed-variant">// Database and external clients</span>
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 'modules',
      icon: 'inventory_2',
      title: 'Key Modules & Services',
      content: (
        <div className="py-4 grid md:grid-cols-2 gap-4">
          {[
            { name: 'BookingEngineModule', badge: 'Critical', badgeColor: 'bg-primary/20 text-primary', desc: 'Manages the core lifecycle of a reservation. Includes complex concurrency checks for room availability and lock management.', tags: ['Optimistic Locking', 'Cron Jobs'] },
            { name: 'PaymentGatewayModule', badge: 'Integration', badgeColor: 'bg-secondary-container text-on-secondary-container', desc: 'Secure handling of transactions via Stripe. Implements robust webhook verification and retry policies for failed payments.', tags: ['Webhooks', 'PCI Compliant'] },
          ].map((mod) => (
            <motion.div
              key={mod.name}
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-surface-container-high border border-outline-variant hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-on-surface font-bold text-sm">{mod.name}</span>
                <span className={`px-2 py-0.5 rounded-full ${mod.badgeColor} text-[10px] font-medium uppercase`}>{mod.badge}</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">{mod.desc}</p>
              <div className="flex flex-wrap gap-2">
                {mod.tags.map((t) => (
                  <span key={t} className="px-2 py-1 bg-surface-container rounded text-[11px] font-medium">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="repositories" />
      <TopBar activeNav="explorer" />

      <main className="ml-64 pt-24 pb-32 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-8">

          {/* Repository Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded border border-outline-variant text-[11px] font-medium text-on-surface-variant">Public</span>
                  <span className="text-primary-fixed-dim text-sm">organization /</span>
                </div>
                <h2 className="text-4xl font-bold text-on-surface mb-3 tracking-tight">{repo}</h2>
                <p className="text-on-surface-variant max-w-2xl">
                  A high-performance booking management system built with NestJS, implementing clean architecture and event-driven patterns for scalable hospitality operations.
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span>1.2k</span>
                  <span className="material-symbols-outlined text-[18px] ml-2">fork_right</span>
                  <span>248</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export PDF
                </motion.button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  whileHover={{ y: -2, borderColor: 'rgba(173,198,255,0.3)' }}
                  className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/50 backdrop-blur-sm transition-all"
                >
                  <p className="text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">{s.label}</p>
                  <p className="text-sm font-semibold text-on-surface">{s.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="relative flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h3 className="font-semibold text-lg text-on-surface">Executive Analysis Summary</h3>
            </div>
            <div className="relative grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
                <p>The <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary">{repo}</code> repository demonstrates a highly mature NestJS implementation. It strictly adheres to <strong className="text-on-surface">Domain-Driven Design (DDD)</strong> principles.</p>
                <p>Analysis of the core transaction engine reveals a robust implementation of the <strong className="text-on-surface">Saga pattern</strong> for handling distributed booking states.</p>
              </div>
              <div className="bg-surface-container-highest/50 p-4 rounded-xl border border-outline-variant text-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">verified</span> Key Findings
                </h4>
                <ul className="space-y-2 text-on-surface-variant">
                  {[
                    'Highly decoupled module structure facilitates easy testing.',
                    'Type safety coverage across the API boundary exceeds 98%.',
                    'Potential bottleneck in AvailabilityService synchronous operations.',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Accordion sections */}
          <div className="space-y-3">
            {accordions.map((acc, i) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden"
              >
                <motion.button
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low/50 transition-colors"
                  onClick={() => toggleAccordion(acc.id)}
                  whileTap={{ scale: 0.998 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">{acc.icon}</span>
                    <h3 className="font-semibold text-on-surface">{acc.title}</h3>
                  </div>
                  <motion.span
                    animate={{ rotate: activeAccordions.has(acc.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="material-symbols-outlined text-outline"
                  >
                    chevron_right
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {activeAccordions.has(acc.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 border-t border-outline-variant/30">
                        {acc.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating action dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ml-32 z-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-surface-container-low/90 backdrop-blur-xl border border-primary/20 shadow-2xl"
        >
          <Link href={`/repos/${repo}/chat`}>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 text-primary rounded-full text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Ask AI
            </motion.button>
          </Link>
          <div className="w-px h-5 bg-outline-variant" />
          <Link href={`/repos/${repo}/insights`}>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              Insights
            </motion.button>
          </Link>
          <div className="w-px h-5 bg-outline-variant" />
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share
          </motion.button>
        </motion.div>
      </div>

      {/* Floating chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-8 w-[380px] h-[500px] bg-surface-container-low/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">AI Assistant</p>
                  <p className="text-[11px] text-on-surface-variant">Ready to analyze</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex-1 p-4 custom-scrollbar overflow-y-auto">
              <div className="flex flex-col gap-1 max-w-[90%]">
                <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-none border border-primary/20 text-[13px] text-on-surface leading-relaxed">
                  Hello! I've analyzed <code className="text-primary font-mono">{repo}</code>. How can I help you explore the architecture or code today?
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-outline-variant/30">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-surface-container-high border border-outline-variant/50 rounded-xl py-2.5 px-4 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all"
                  placeholder="Ask about the code..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <Link href={`/repos/${repo}/chat`}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 bg-primary text-on-primary rounded-xl"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center z-50"
        >
          <span className="material-symbols-outlined">chat</span>
        </motion.button>
      )}
    </div>
  )
}
