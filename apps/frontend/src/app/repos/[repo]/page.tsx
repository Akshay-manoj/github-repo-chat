'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ReactMarkdown from 'react-markdown'

interface RepoDetails {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
}

interface Message {
  role: 'user' | 'ai'
  content: string
}

// Animate a number from 0 to target
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1200
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <>{count}{suffix}</>
}

// Typewriter that plays through text char by char
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
        onDone?.()
      }
    }, 6)
    return () => clearInterval(timer)
  }, [text])
  return (
    <span className={!done ? 'typewriter-cursor' : ''}>{displayed}</span>
  )
}

// Tooltip wrapper
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-surface-container-highest text-xs text-on-surface whitespace-nowrap border border-outline-variant/40 shadow-lg z-50"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RepoOverviewPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repoId = unwrappedParams.repo

  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [summaryReady, setSummaryReady] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    async function loadData() {
      try {
        const repoRes = await fetch(`${API_URL}/repositories/${repoId}`)
        const repoData = await repoRes.json()
        setRepoDetails(repoData)

        const searchRes = await fetch(`${API_URL}/repositories/${repoId}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'Provide a highly detailed executive analysis summary of this repository, followed by an architecture deep dive and key modules. Use markdown.' }),
        })
        const searchData = await searchRes.json()
        setAiSummary(searchData.answer || 'No summary available.')
      } catch (err) {
        console.error('Failed to load repo data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [repoId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        setChatOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch(`${API_URL}/repositories/${repoId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      })
      const data = await res.json()
      setChatMessages((prev) => [...prev, { role: 'ai', content: data.answer || 'No answer found.' }])
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', content: 'Error generating response.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-on-surface-variant text-sm animate-pulse">Loading repository data…</p>
        </div>
      </div>
    )
  }

  const repoName = repoDetails?.github_url.split('/').pop() || 'Unknown Repository'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="repositories" />
      <TopBar activeNav="explorer" />

      <main className="ml-64 pt-24 pb-32 min-h-screen transition-all duration-300">
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
                  <a href={repoDetails?.github_url} target="_blank" rel="noreferrer" className="text-primary-fixed-dim text-sm hover:underline">
                    {repoDetails?.github_url}
                  </a>
                </div>
                <h2 className="text-4xl font-bold text-on-surface mb-3 tracking-tight">{repoName}</h2>
              </div>
            </div>

            {/* Stats row with count-up */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Language', value: <span className="flex items-center gap-2"><span className="w-2 h-2 inline-block rounded-full bg-[#3178c6]" />{repoDetails?.language || 'Unknown'}</span> },
                { label: 'Status', value: repoDetails?.indexed_at ? '✓ Indexed' : 'Pending' },
                { label: 'Last Updated', value: repoDetails?.indexed_at ? new Date(repoDetails.indexed_at).toLocaleDateString() : 'N/A' },
                { label: 'Analysis Score', value: <span className="text-primary font-bold">AI Native</span> },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2, borderColor: 'rgba(173,198,255,0.3)' }}
                  className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/50 backdrop-blur-sm transition-all"
                >
                  <p className="text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">{s.label}</p>
                  <p className="text-sm font-semibold text-on-surface">{s.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Markdown Summary with typewriter */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-sm font-semibold text-primary">AI Analysis</span>
              {!summaryReady && aiSummary && (
                <span className="text-xs text-on-surface-variant animate-pulse ml-2">Generating…</span>
              )}
            </div>

            <div className="prose prose-invert prose-primary max-w-none">
              {aiSummary ? (
                summaryReady ? (
                  <ReactMarkdown>{aiSummary}</ReactMarkdown>
                ) : (
                  <TypewriterText text={aiSummary} onDone={() => setSummaryReady(true)} />
                )
              ) : (
                <div className="space-y-3">
                  {[80, 60, 90, 50, 70].map((w, i) => (
                    <div key={i} className={`skeleton h-4`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
            </div>
          </motion.section>
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
          <Tooltip label="Ask AI (press C)">
            <Link href={`/repos/${repoId}/chat`}>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 text-primary rounded-full text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Ask AI
              </motion.button>
            </Link>
          </Tooltip>
          <div className="w-px h-5 bg-outline-variant" />
          <Tooltip label="View Insights">
            <Link href={`/repos/${repoId}/insights`}>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                Insights
              </motion.button>
            </Link>
          </Tooltip>
          <div className="w-px h-5 bg-outline-variant" />
          <Tooltip label="Architecture diagram">
            <Link href={`/repos/${repoId}/diagram`}>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                Diagram
              </motion.button>
            </Link>
          </Tooltip>
          <div className="w-px h-5 bg-outline-variant" />
          <Tooltip label="Share repository">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(173,198,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share
            </motion.button>
          </Tooltip>
        </motion.div>
      </div>

      {/* Functional floating chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-8 w-[380px] h-[520px] bg-surface-container-low/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">AI Assistant</p>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Ready to analyze
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip label="Full chat">
                  <Link href={`/repos/${repoId}/chat`}>
                    <button className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                    </button>
                  </Link>
                </Tooltip>
                <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 custom-scrollbar overflow-y-auto flex flex-col gap-3">
              <div className="flex flex-col gap-1 max-w-[90%]">
                <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-none border border-primary/20 text-[13px] text-on-surface leading-relaxed">
                  Hello! I've analyzed <code className="text-primary font-mono">{repoName}</code>. Ask me anything about the architecture or code.
                </div>
              </div>

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-surface-container-highest rounded-tr-none border border-outline-variant/50'
                      : 'bg-primary/10 rounded-tl-none border border-primary/20 prose prose-sm prose-invert prose-primary'
                  }`}>
                    {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-1 p-3 bg-primary/10 rounded-2xl rounded-tl-none border border-primary/20 w-fit">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-outline-variant/30">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-surface-container-high border border-outline-variant/50 rounded-xl py-2.5 px-4 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-all"
                  placeholder="Ask about the code…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2.5 bg-primary text-on-primary rounded-xl disabled:opacity-50 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </motion.button>
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
