'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { TypewriterEffect } from '@/components/aceternity/TypewriterEffect'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'ai'
  content: string
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

export default function ChatPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repoId = unwrappedParams.repo

  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    async function loadRepo() {
      try {
        const repoRes = await fetch(`${API_URL}/repositories/${repoId}`)
        const repoData = await repoRes.json()
        setRepoDetails(repoData)
        setMessages([
          {
            role: 'ai',
            content: `Hello! I've loaded the AST chunks for \`${repoData.github_url.split('/').pop()}\`. How can I help you explore this codebase?`
          }
        ])
      } catch (err) {
        console.error('Failed to load repo data', err)
      }
    }
    loadRepo()
  }, [repoId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return
    const userMessage = inputValue
    
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    
    setIsLoading(true)
    
    try {
      const res = await fetch(`${API_URL}/repositories/${repoId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      })
      const data = await res.json()
      
      setMessages((prev) => [...prev, { role: 'ai', content: data.answer || 'I am not sure.' }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { role: 'ai', content: 'An error occurred while generating the response.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const repoName = repoDetails?.github_url.split('/').pop() || 'Loading...'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="chats" />
      <TopBar activeNav="explorer" searchPlaceholder="Search in this repository..." />

      <main className="ml-64 pt-16 min-h-screen flex flex-col">
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
                  <span className="text-on-surface-variant text-xs">v1.0.0</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">{repoName}</h2>
                <div className="flex gap-6 mt-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Languages</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#3178c6]" />
                      <span>{repoDetails?.language || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 p-5 bg-surface-container-low/80 backdrop-blur-sm rounded-2xl border border-outline-variant/40">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Insight Metrics</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Health Score', value: 'AI Native', color: 'text-primary' },
                  { label: 'Vector Engine', value: 'pgvector', color: 'text-primary' },
                  { label: 'Complexity', value: 'Unknown', color: 'text-secondary' },
                  { label: 'Maintainability', value: 'AI', color: 'text-secondary' },
                ].map((m) => (
                  <motion.div
                    key={m.label}
                    whileHover={{ scale: 1.03 }}
                    className="bg-surface-container p-3 rounded-xl border border-outline-variant"
                  >
                    <p className="text-[10px] text-on-surface-variant mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Chat area */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col bg-surface-container-low/60 backdrop-blur-sm rounded-2xl border border-outline-variant/40 mb-6 overflow-hidden min-h-[500px]"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-8">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-4'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      </div>
                    )}
                    <div className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed prose prose-sm prose-invert prose-primary ${msg.role === 'user'
                      ? 'bg-surface-container-highest rounded-tr-none border border-outline-variant/50'
                      : 'bg-surface-container rounded-tl-none border border-outline-variant/30'
                    }`}>
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-[16px] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                  </div>
                  <div className="bg-surface-container rounded-tl-none border border-outline-variant/30 max-w-2xl p-4 rounded-2xl text-sm text-on-surface-variant flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-outline-variant/30">
              <div className="relative max-w-4xl mx-auto">
                <motion.div
                  animate={{ boxShadow: isFocused ? '0 0 0 1px rgba(173,198,255,0.3), 0 0 20px rgba(173,198,255,0.1)' : '0 0 0 0px transparent' }}
                  className="relative bg-surface-container-high border border-outline-variant rounded-2xl p-2 flex flex-col transition-all"
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
                    onChange={(e) => setInputValue(e.target.value)}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">attach_file</span>
                      </button>
                    </div>
                    <ShimmerButton
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                      className="px-4 py-1.5 text-xs font-semibold rounded-xl disabled:opacity-50"
                      shimmerColor="#adc6ff"
                      borderRadius="10px"
                      background="rgba(0,46,106,1)"
                    >
                      {isLoading ? 'Thinking...' : 'Analyze'}
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
