'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { TypewriterEffect } from '@/components/aceternity/TypewriterEffect'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const placeholderWords = [
  { text: 'Ask about the authentication flow...' },
  { text: 'Explain the database schema...' },
  { text: 'How are API routes structured?' },
  { text: 'What background jobs exist?' },
]

export default function ChatPage({ params }: { params: Promise<{ repo: string }> }) {
  const unwrappedParams = React.use(params)
  const repo = unwrappedParams.repo
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content: 'How is the authentication flow implemented in this repository? I want to understand the handshake between the frontend and the services.',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: inputValue }])
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

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
                  <span className="text-on-surface-variant text-xs">v2.4.1-stable</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">{repo}</h2>
                <p className="text-sm text-on-surface-variant max-w-lg">
                  Microservices architecture handling high-concurrency transactional data with event-sourcing and distributed locking.
                </p>
                <div className="flex gap-6 mt-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Languages</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#3178c6]" />
                      <span>TypeScript</span>
                      <div className="w-2 h-2 rounded-full bg-[#f1e05a] ml-2" />
                      <span>JavaScript</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-outline-variant" />
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Last Indexed</p>
                    <p className="text-xs font-medium">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 p-5 bg-surface-container-low/80 backdrop-blur-sm rounded-2xl border border-outline-variant/40">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Insight Metrics</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Health Score', value: '94%', color: 'text-primary' },
                  { label: 'Coverage', value: '82%', color: 'text-primary' },
                  { label: 'Complexity', value: 'Medium', color: 'text-secondary' },
                  { label: 'Maintainability', value: 'A+', color: 'text-secondary' },
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
                    <div className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-surface-container-highest rounded-tr-none border border-outline-variant/50'
                      : 'bg-surface-container rounded-tl-none border border-outline-variant/30'
                    }`}>
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-primary font-semibold text-base">Authentication Implementation</h4>
                          <p className="text-on-surface-variant">
                            The authentication system leverages a <strong className="text-on-surface">JWT-based Stateless Flow</strong> with an asymmetric signing strategy (RSA-256). The frontend communicates with a centralized{' '}
                            <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-primary font-mono text-xs">AuthService</code> which acts as the identity provider.
                          </p>

                          {/* Architecture diagram */}
                          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant mermaid-bg overflow-x-auto">
                            <div className="flex items-center justify-center gap-3 min-w-[480px]">
                              {['Frontend', 'API Gateway', 'Auth Service', 'Redis / DB'].map((node, idx, arr) => (
                                <div key={node} className="flex items-center gap-3">
                                  <div className="px-3 py-2 bg-surface-container-high border border-outline-variant/50 rounded-lg text-center">
                                    <p className="text-xs font-medium text-on-surface">{node}</p>
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="text-center text-[11px] text-on-surface-variant mt-3 italic">Figure 1.0: Authentication request lifecycle</p>
                          </div>

                          {/* Code block */}
                          <div className="rounded-xl bg-[#010409] border border-outline-variant overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-surface-container-high border-b border-outline-variant">
                              <span className="text-xs text-on-surface-variant font-mono">auth.middleware.ts</span>
                              <button className="text-xs text-primary hover:text-primary-fixed flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                Copy
                              </button>
                            </div>
                            <pre className="p-4 text-xs font-mono text-[#d1d5db] overflow-x-auto leading-relaxed">
                              <code>{`export const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedException();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    throw new TokenExpiredException();
  }
};`}</code>
                            </pre>
                          </div>

                          {/* Suggestion chips */}
                          <div className="flex gap-2 flex-wrap">
                            {['Explain token refresh logic', 'Show RBAC implementation', 'Compare with OAuth'].map((chip) => (
                              <motion.button
                                key={chip}
                                whileHover={{ scale: 1.03, borderColor: 'rgba(173,198,255,0.5)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setInputValue(chip)}
                                className="px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-xs text-on-surface-variant hover:text-primary transition-all"
                              >
                                {chip}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Artifact download bar */}
            <div className="px-6 py-3 bg-surface-container-low border-y border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[18px]">cloud_download</span>
                Suggested artifacts:
              </div>
              <div className="flex gap-2">
                {[{ icon: 'description', label: 'Architecture.md' }, { icon: 'picture_as_pdf', label: 'Overview.pdf' }].map((a) => (
                  <motion.button
                    key={a.label}
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs hover:border-primary/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                    {a.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="p-4">
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
                  />
                  <div className="flex items-center justify-between px-3 pb-2">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">attach_file</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">code</span>
                      </button>
                    </div>
                    <ShimmerButton
                      onClick={handleSend}
                      className="px-4 py-1.5 text-xs font-semibold rounded-xl"
                      shimmerColor="#adc6ff"
                      borderRadius="10px"
                      background="rgba(0,46,106,1)"
                    >
                      Analyze
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </ShimmerButton>
                  </div>
                </motion.div>
                <p className="text-center text-[11px] text-on-surface-variant/40 mt-2">
                  AI may produce inaccuracies. Verify critical architectural findings.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
