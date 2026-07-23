'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface RepoDetails {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
}

function MermaidRenderer({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!chart || !ref.current) return
    let cancelled = false
    import('mermaid').then((m) => {
      if (cancelled) return
      m.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#0b1326',
          primaryColor: '#002e6a',
          primaryTextColor: '#dae2fd',
          primaryBorderColor: '#adc6ff',
          lineColor: '#424754',
          secondaryColor: '#131b2e',
          tertiaryColor: '#171f33',
          edgeLabelBackground: '#131b2e',
          fontFamily: 'Geist, sans-serif',
        },
      })
      const id = `mermaid-${Date.now()}`
      m.default.render(id, chart).then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
          setRendered(true)
        }
      }).catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Failed to render diagram')
      })
    })
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-error">
        <span className="material-symbols-outlined text-[36px]">error</span>
        <p className="text-sm">Diagram render error — check raw source below</p>
        <p className="text-xs text-on-surface-variant font-mono max-w-lg text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full flex items-center justify-center min-h-[400px]">
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      <div
        ref={ref}
        className={`w-full overflow-auto custom-scrollbar transition-opacity duration-500 ${rendered ? 'opacity-100' : 'opacity-0'}`}
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

function extractMermaid(markdown: string): string | null {
  const match = markdown.match(/```mermaid\n([\s\S]*?)```/)
  if (match) return match[1].trim()
  // Try without language tag
  const match2 = markdown.match(/```\n(graph\s[\s\S]*?)```/)
  if (match2) return match2[1].trim()
  // Try bare graph/flowchart/sequenceDiagram
  const match3 = markdown.match(/((?:graph|flowchart|sequenceDiagram|classDiagram|erDiagram|gantt)[\s\S]+)/)
  if (match3) return match3[1].trim()
  return null
}

export default function DiagramPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repoId = unwrappedParams.repo

  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [rawMarkdown, setRawMarkdown] = useState('')
  const [mermaidCode, setMermaidCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSource, setShowSource] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [copied, setCopied] = useState(false)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    async function load() {
      try {
        const [repoRes, diagramRes] = await Promise.all([
          fetch(`${API_URL}/repositories/${repoId}`),
          fetch(`${API_URL}/repositories/${repoId}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'Generate a Mermaid graph diagram (using graph TD or flowchart TD syntax) showing the main module dependencies, key classes, services, and their relationships in this repository. Only output the Mermaid code block, nothing else.',
            }),
          }),
        ])
        const repoData = await repoRes.json()
        const diagramData = await diagramRes.json()
        setRepoDetails(repoData)
        const answer = diagramData.answer || ''
        setRawMarkdown(answer)
        setMermaidCode(extractMermaid(answer))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [repoId])

  const repoName = repoDetails?.github_url.split('/').pop() || 'Repository'

  const downloadSvg = () => {
    const svg = svgContainerRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${repoName}-architecture.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySource = async () => {
    if (!mermaidCode) return
    await navigator.clipboard.writeText(mermaidCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fitDiagram = () => setZoom(1)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="docs" />
      <TopBar activeNav="docs" showSearch={false} />

      <main className="ml-64 pt-16 min-h-screen flex flex-col transition-all duration-300">
        <div className="max-w-[1200px] mx-auto w-full px-8 py-8 flex-1 flex flex-col">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6 flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                Architecture Diagram
              </div>
              <h2 className="text-2xl font-bold text-on-surface">{repoName}</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                AI-generated module dependency visualization
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/40 rounded-xl p-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Zoom out"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="px-2 text-xs text-on-surface-variant font-mono">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Zoom in"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
                <div className="w-px h-5 bg-outline-variant mx-1" />
                <button
                  onClick={fitDiagram}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Fit to screen"
                >
                  <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                </button>
              </div>

              <button
                onClick={downloadSvg}
                disabled={!mermaidCode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/50 text-xs text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                SVG
              </button>

              <button
                onClick={() => setShowSource((s) => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/50 text-xs text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                {showSource ? 'Hide' : 'Source'}
              </button>
            </div>
          </motion.div>

          {/* Main diagram area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden relative"
          >
            {/* Dot grid background */}
            <div className="absolute inset-0 mermaid-bg opacity-40 pointer-events-none" />

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary"
                />
                <p className="text-on-surface-variant text-sm animate-pulse">Generating architecture diagram…</p>
                <p className="text-on-surface-variant/50 text-xs">Analyzing module dependencies with AI</p>
              </div>
            ) : !mermaidCode ? (
              <div className="flex flex-col items-center justify-center h-[500px] gap-4 text-center px-8">
                <span className="material-symbols-outlined text-on-surface-variant text-[48px]">account_tree</span>
                <p className="text-on-surface-variant">Could not extract a Mermaid diagram from the AI response.</p>
                <div className="max-w-2xl p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-left">
                  <p className="text-xs text-on-surface-variant/70 font-mono whitespace-pre-wrap">{rawMarkdown}</p>
                </div>
              </div>
            ) : (
              <div
                ref={svgContainerRef}
                className="w-full h-full min-h-[500px] p-8 flex items-center justify-center relative z-10"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
              >
                <MermaidRenderer chart={mermaidCode} />
              </div>
            )}
          </motion.div>

          {/* Raw source collapsible */}
          <AnimatePresence>
            {showSource && mermaidCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/30">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Mermaid Source</span>
                    <button
                      onClick={copySource}
                      className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="code-block text-xs text-green-400 p-5 overflow-x-auto custom-scrollbar max-h-64">
                    <code>{mermaidCode}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
