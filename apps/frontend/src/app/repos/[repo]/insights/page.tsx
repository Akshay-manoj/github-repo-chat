'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'

interface Section {
  id: string
  icon: string
  iconBg: string
  iconText: string
  title: string
  subtitle: string
  content: React.ReactNode
}

export default function InsightsPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repo = unwrappedParams.repo
  const [expanded, setExpanded] = useState<string | null>('section-auth')

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const sections: Section[] = [
    {
      id: 'section-auth',
      icon: 'lock',
      iconBg: 'bg-primary/10 group-hover:bg-primary',
      iconText: 'text-primary group-hover:text-on-primary',
      title: 'Authentication',
      subtitle: 'Identity providers, JWT flow, and middleware',
      content: (
        <div className="pb-8 grid md:grid-cols-3 gap-6 border-t border-outline-variant/30 pt-6">
          <div className="md:col-span-2 space-y-4 text-sm">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">AI-Generated Analysis</h4>
            <p className="text-on-surface leading-relaxed">
              The system utilizes a hybrid <strong>OAuth2 and JWT-based</strong> strategy. Sessions are managed via a Redis-backed store. A custom middleware layer handles role-based access control (RBAC) specifically within the <code className="text-primary bg-surface-container px-1 rounded">/api/v2</code> routes.
            </p>
            <div className="bg-surface-container-high rounded-lg p-4">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Relevant File Paths</p>
              {['src/lib/auth/provider.ts', 'middleware/verify-token.js'].map((path) => (
                <div key={path} className="flex items-center gap-2 text-on-surface-variant text-xs mt-1">
                  <span className="material-symbols-outlined text-[14px]">description</span>
                  <span className="font-mono">{path}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 text-sm">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-3">Security Insights</h4>
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                <p className="text-xs text-on-surface-variant">Argon2id hashing detected in user storage.</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
                <p className="text-xs text-on-surface-variant">CSRF protection missing on legacy v1 endpoints.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'section-db',
      icon: 'storage',
      iconBg: 'bg-secondary-container/20 group-hover:bg-secondary',
      iconText: 'text-secondary group-hover:text-on-secondary',
      title: 'Database Schema',
      subtitle: 'ORM models, relationships, and migrations',
      content: (
        <div className="pb-8 grid md:grid-cols-3 gap-6 border-t border-outline-variant/30 pt-6">
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Data Architecture</h4>
            <p className="text-sm text-on-surface leading-relaxed">
              The primary data layer is governed by <strong>Prisma ORM</strong> interacting with PostgreSQL. The schema follows a snowflake design, optimized for read-heavy operations in the dashboard module.
            </p>
            <div className="bg-[#060e20] p-4 rounded-lg border border-outline-variant/30 overflow-x-auto font-mono text-xs">
              <pre className="text-secondary-fixed-dim leading-relaxed">{`model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
}`}</pre>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30">
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-3">Core Models</p>
            <div className="flex flex-wrap gap-2">
              {['User', 'Organization', 'Project', 'AuditLog', 'Session'].map((m) => (
                <span key={m} className="px-2 py-1 bg-surface-container text-on-surface-variant rounded text-xs">{m}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'section-api',
      icon: 'api',
      iconBg: 'bg-tertiary-container/20 group-hover:bg-tertiary',
      iconText: 'text-tertiary group-hover:text-on-tertiary',
      title: 'API Endpoints',
      subtitle: 'REST resources and GraphQL resolution',
      content: (
        <div className="pb-8 space-y-6 border-t border-outline-variant/30 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">REST Signature</h4>
              <p className="text-sm text-on-surface-variant">The application exposes 42 RESTful routes with strict URL versioning.</p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <span className="text-primary-fixed">GET /v1/users</span>
                  <span className="text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded text-[10px]">Paginated</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <span className="text-secondary-fixed">POST /v1/upload</span>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px]">Multipart</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Integration Patterns</h4>
              <p className="text-sm text-on-surface-variant">Detected heavy use of Axios interceptors for global error handling and automatic retry logic on 503 status codes.</p>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 italic text-on-surface-variant text-xs">
                "The API design shows strong adherence to HATEOAS principles in the billing module."
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'section-env',
      icon: 'settings_input_component',
      iconBg: 'bg-surface-container-highest group-hover:bg-primary',
      iconText: 'text-outline group-hover:text-on-primary',
      title: 'Environment Variables',
      subtitle: 'Configuration, secrets, and staging flags',
      content: (
        <div className="pb-8 space-y-4 border-t border-outline-variant/30 pt-6">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Required Configuration</h4>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { key: 'DATABASE_URL', val: 'postgresql://user:***@host:5432/db' },
              { key: 'REDIS_HOST', val: 'cache.cluster.local' },
              { key: 'AWS_REGION', val: 'us-east-1' },
            ].map((env) => (
              <div key={env.key} className="p-3 border border-outline-variant/40 rounded-lg bg-surface-container-lowest">
                <p className="text-xs font-bold text-on-surface mb-1">{env.key}</p>
                <p className="text-xs font-mono text-on-surface-variant truncate">{env.val}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'section-queues',
      icon: 'queue',
      iconBg: 'bg-primary/10 group-hover:bg-primary',
      iconText: 'text-primary group-hover:text-on-primary',
      title: 'Queues & Workers',
      subtitle: 'Background workers, BullMQ, and cron tasks',
      content: (
        <div className="pb-8 grid md:grid-cols-2 gap-6 border-t border-outline-variant/30 pt-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Job Infrastructure</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The system leverages <strong className="text-on-surface">BullMQ</strong> for intensive background tasks. Three dedicated priority queues: <span className="text-primary text-xs font-mono">critical</span>, <span className="text-secondary text-xs font-mono">default</span>, and <span className="text-tertiary text-xs font-mono">low</span>.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">Active Workers</h4>
            {[
              { name: 'ImageProcessorWorker', instances: 4, active: true },
              { name: 'EmailDispatchWorker', instances: 1, active: true },
              { name: 'ReportGeneratorWorker', instances: 2, active: false },
            ].map((w) => (
              <div key={w.name} className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg border border-outline-variant/30">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.active ? 'bg-green-500 animate-pulse' : 'bg-outline'}`} />
                <span className="text-xs flex-1 text-on-surface">{w.name}</span>
                <span className="text-[10px] text-on-surface-variant">×{w.instances}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="docs" />
      <TopBar activeNav="history" />

      <main className="ml-64 mt-16 px-8 py-8 flex justify-center">
        <div className="w-full max-w-[1100px]">

          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 text-primary mb-2 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              System Analysis
            </div>
            <h2 className="text-3xl font-bold text-on-surface mb-3">Extracted Information</h2>
            <p className="text-on-surface-variant max-w-2xl">
              Our AI audited your repository structure and logic flow. Expand each section for a granular deep-dive.
            </p>
          </motion.section>

          {/* Accordion sections */}
          <div className="space-y-3 mb-12">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface-container-low/80 backdrop-blur-sm rounded-xl border border-outline-variant/40 overflow-hidden hover:border-primary/20 transition-colors"
              >
                <motion.button
                  className="w-full px-6 py-5 flex items-center justify-between group"
                  onClick={() => toggle(section.id)}
                  whileTap={{ scale: 0.998 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${section.iconBg} ${section.iconText}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-on-surface">{section.title}</h3>
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
                      <div className="px-6">{section.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Summary bento */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-4 gap-4 pb-12"
          >
            <div className="col-span-2 bg-surface-container-low/80 backdrop-blur-sm p-8 rounded-xl border border-outline-variant/40 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px]" />
              <h3 className="text-lg font-bold text-primary mb-3 relative z-10">Analysis Overview</h3>
              <p className="text-sm text-on-surface-variant relative z-10 leading-relaxed">
                Based on 1,240 files analyzed, the project demonstrates a high level of modularity with an 84% adherence to Clean Architecture principles.
              </p>
            </div>
            <div className="col-span-1 bg-surface-container-low/80 backdrop-blur-sm p-6 rounded-xl border border-outline-variant/40 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-secondary">84%</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-outline mt-1">Clean Score</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1 relative overflow-hidden rounded-xl cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
              <div className="relative p-6 h-full flex flex-col justify-between text-on-primary">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Generate Architecture Diagram</h4>
                  <p className="text-[11px] opacity-80 mt-1">Transform insights into a Mermaid.js diagram.</p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
