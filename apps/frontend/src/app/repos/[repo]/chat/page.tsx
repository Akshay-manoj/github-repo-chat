'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { TypewriterEffect } from '@/components/aceternity/TypewriterEffect'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'
import ReactMarkdown from 'react-markdown'

interface Reference {
  path: string
  distance: number
}

interface Message {
  id: string          // stable unique id — not index
  role: 'user' | 'ai'
  content: string
  streaming?: boolean
  references?: Reference[]
}

interface RepoDetails {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
}

const placeholderWords = [
  { text: 'Ask about the authentication flow...' },
  { text: 'Explain the database schema...' },
  { text: 'How are API routes structured?' },
  { text: 'What background jobs exist?' },
]

const suggestedPrompts = [
  { icon: 'lock',         text: 'How does authentication work?' },
  { icon: 'storage',      text: 'Explain the database schema' },
  { icon: 'api',          text: 'List all API endpoints' },
  { icon: 'account_tree', text: 'Describe the overall architecture' },
  { icon: 'bug_report',   text: 'Any potential security concerns?' },
  { icon: 'code',         text: 'What design patterns are used?' },
]

let msgCounter = 0
function nextId() { return `msg-${++msgCounter}` }

// ── Streaming typewriter ──────────────────────────────────────────────────────
function StreamingMessage({ content, onDone }: { content: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone]           = useState(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)
    // adaptive speed: faster for long responses
    const charsPerTick = Math.max(3, Math.ceil(content.length / 400))
    const timer = setInterval(() => {
      i = Math.min(i + charsPerTick, content.length)
      setDisplayed(content.slice(0, i))
      if (i >= content.length) {
        clearInterval(timer)
        setDone(true)
        onDoneRef.current()
      }
    }, 16)
    return () => clearInterval(timer)
  }, [content])

  return (
    <div className={`prose prose-sm prose-invert prose-primary max-w-none ${!done ? 'typewriter-cursor' : ''}`}>
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-primary transition-all"
      title="Copy message"
    >
      <span className="material-symbols-outlined text-[15px]">
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  )
}

// ── Source references panel ───────────────────────────────────────────────────
function ReferencesPanel({ references }: { references: Reference[] }) {
  const [open, setOpen]             = useState(false)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  // Deduplicate: keep best (lowest distance) per path using a Map
  const uniqueRefs = [...references.reduce((map, ref) => {
    const existing = map.get(ref.path)
    if (!existing || ref.distance < existing.distance) map.set(ref.path, ref)
    return map
  }, new Map<string, Reference>()).values()].sort((a, b) => a.distance - b.distance)

  if (uniqueRefs.length === 0) return null

  const copyPath = async (path: string) => {
    await navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 1500)
  }

  const scoreColor = (d: number) =>
    d < 0.35 ? 'text-green-400' : d < 0.6 ? 'text-yellow-400' : 'text-on-surface-variant/60'

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
      >
        <span className="material-symbols-outlined text-[13px]">folder_open</span>
        {uniqueRefs.length} source {uniqueRefs.length === 1 ? 'file' : 'files'} referenced
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-[13px]"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex flex-wrap gap-1.5">
              {uniqueRefs.map((ref, idx) => (
                <button
                  key={`${idx}-${ref.path}`}
                  onClick={() => copyPath(ref.path)}
                  title={`${ref.path} · distance ${ref.distance.toFixed(3)}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/40 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">description</span>
                  <span className="text-[11px] font-mono text-on-surface-variant truncate max-w-[180px]">
                    {ref.path.split('/').pop()}
                  </span>
                  <span className={`text-[10px] font-semibold ${scoreColor(ref.distance)}`}>
                    {Math.round((1 - ref.distance) * 100)}%
                  </span>
                  <span className="material-symbols-outlined text-[11px] text-on-surface-variant/40">
                    {copiedPath === ref.path ? 'check' : 'content_copy'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── AI message bubble + references ───────────────────────────────────────────
function AiMessage({ msg, onStreamDone }: { msg: Message; onStreamDone: (id: string) => void }) {
  const handleDone = useCallback(() => onStreamDone(msg.id), [msg.id, onStreamDone])

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      {/* Avatar + bubble row */}
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
          <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
        <div className="relative max-w-2xl p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed bg-surface-container border border-outline-variant/30 group">
          {msg.streaming ? (
            <StreamingMessage content={msg.content} onDone={handleDone} />
          ) : (
            <div className="prose prose-sm prose-invert prose-primary max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
          {!msg.streaming && <CopyButton text={msg.content} />}
        </div>
      </div>

      {/* References sit below the avatar+bubble row, indented */}
      {!msg.streaming && msg.references && msg.references.length > 0 && (
        <div className="pl-12">
          <ReferencesPanel references={msg.references} />
        </div>
      )}
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChatPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repoId = unwrappedParams.repo

  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [messages,    setMessages]    = useState<Message[]>([])
  const [inputValue,  setInputValue]  = useState('')
  const [isFocused,   setIsFocused]   = useState(false)
  const [isLoading,   setIsLoading]   = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)

  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    async function loadRepo() {
      try {
        const res  = await fetch(`${API_URL}/repositories/${repoId}`)
        const data = await res.json()
        setRepoDetails(data)
        setMessages([{
          id: nextId(),
          role: 'ai',
          content: `Hello! I've loaded **${data.github_url.split('/').pop()}**. Ask me anything about its architecture or code.`,
        }])
      } catch (err) {
        console.error('Failed to load repo', err)
      }
    }
    loadRepo()
  }, [repoId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const growTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const handleSend = useCallback(async (text?: string) => {
    const userMessage = (text ?? inputValue).trim()
    if (!userMessage || isLoading) return

    const userMsgId = nextId()
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userMessage }])
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    try {
      const res  = await fetch(`${API_URL}/repositories/${repoId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
      })
      const data = await res.json()
      const answer: string       = data.answer || 'I am not sure.'
      const refs: Reference[]    = Array.isArray(data.references) ? data.references : []
      const aiMsgId              = nextId()

      setStreamingId(aiMsgId)
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: answer, streaming: true, references: refs }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: nextId(), role: 'ai', content: 'An error occurred while generating the response.' }])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, repoId, API_URL])

  // Called by AiMessage when streaming animation finishes
  const handleStreamDone = useCallback((id: string) => {
    setStreamingId(null)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, streaming: false } : m))
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const repoName       = repoDetails?.github_url.split('/').pop() || 'Loading...'
  const showSuggestions = messages.length <= 1 && !inputValue && !isLoading

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="chats" />
      <TopBar activeNav="explorer" searchPlaceholder="Search in this repository..." />

      <main className="ml-64 pt-16 min-h-screen flex flex-col transition-all duration-300">
        <div className="max-w-[1100px] mx-auto w-full px-8 py-6 flex-1 flex flex-col">

          {/* Repo banner */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-12 gap-4 mb-6"
          >
            <div className="col-span-8 p-6 bg-surface-container-low/80 backdrop-blur-sm rounded-2xl border border-outline-variant/40 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded border border-primary/20 uppercase tracking-wider">Active</span>
                  <a href={repoDetails?.github_url} target="_blank" rel="noreferrer" className="text-on-surface-variant text-xs hover:text-primary transition-colors truncate">
                    {repoDetails?.github_url}
                  </a>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">{repoName}</h2>
                <div className="flex gap-6 mt-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Language</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#3178c6]" />
                      <span>{repoDetails?.language || 'Unknown'}</span>
                    </div>
                  </div>
                  {repoDetails?.indexed_at && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Indexed</p>
                      <p className="text-xs text-on-surface">{new Date(repoDetails.indexed_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-3">
              {[
                { label: 'Vector Engine', value: 'pgvector', icon: 'hub' },
                { label: 'AI Model',      value: 'Gemini',  icon: 'auto_awesome' },
                { label: 'Indexed At',    value: repoDetails?.indexed_at ? new Date(repoDetails.indexed_at).toLocaleDateString() : '–', icon: 'schedule' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 bg-surface-container-low/80 backdrop-blur-sm rounded-xl border border-outline-variant/40">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant">{stat.label}</p>
                    <p className="text-xs font-semibold text-on-surface">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Chat area */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col bg-surface-container-low/60 backdrop-blur-sm rounded-2xl border border-outline-variant/40 mb-6 overflow-hidden min-h-[500px]"
          >
            {/* Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-5">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-2xl p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed bg-surface-container-highest border border-outline-variant/50">
                      <p>{msg.content}</p>
                    </div>
                  </motion.div>
                ) : (
                  <AiMessage
                    key={msg.id}
                    msg={msg}
                    onStreamDone={handleStreamDone}
                  />
                )
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-[16px] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                  </div>
                  <div className="bg-surface-container rounded-tl-none border border-outline-variant/30 p-4 rounded-2xl text-sm flex gap-1.5 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4 overflow-hidden"
                >
                  <p className="text-xs text-on-surface-variant mb-3 font-medium">Suggested questions</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map(p => (
                      <button
                        key={p.text}
                        onClick={() => handleSend(p.text)}
                        className="prompt-chip"
                      >
                        <span className="material-symbols-outlined text-[14px]">{p.icon}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-outline-variant/30">
              <div className="relative max-w-4xl mx-auto">
                <motion.div
                  animate={{ boxShadow: isFocused ? '0 0 0 1px rgba(173,198,255,0.3), 0 0 20px rgba(173,198,255,0.1)' : 'none' }}
                  className="relative bg-surface-container-high border border-outline-variant rounded-2xl p-2 flex flex-col"
                >
                  {!inputValue && !isFocused && (
                    <div className="absolute left-4 top-4 pointer-events-none text-sm text-on-surface-variant/40">
                      <TypewriterEffect words={placeholderWords} />
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-on-surface p-3 pb-2 custom-scrollbar resize-none min-h-[52px] placeholder:text-transparent outline-none"
                    rows={1}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onInput={growTextarea}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between px-3 pb-2">
                    <span className="text-[11px] text-on-surface-variant/40 select-none">
                      <kbd className="px-1 py-0.5 rounded bg-surface-container border border-outline-variant/50 font-mono text-[10px]">Enter</kbd> send ·{' '}
                      <kbd className="px-1 py-0.5 rounded bg-surface-container border border-outline-variant/50 font-mono text-[10px]">Shift+Enter</kbd> newline
                    </span>
                    <ShimmerButton
                      onClick={() => handleSend()}
                      disabled={isLoading || !inputValue.trim()}
                      className="px-4 py-1.5 text-xs font-semibold rounded-xl disabled:opacity-50"
                      shimmerColor="#adc6ff"
                      borderRadius="10px"
                      background="rgba(0,46,106,1)"
                    >
                      {isLoading ? 'Thinking…' : 'Send'}
                      {!isLoading && <span className="material-symbols-outlined text-[16px]">send</span>}
                    </ShimmerButton>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
