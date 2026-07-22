'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams'
import { HoverEffect } from '@/components/aceternity/HoverEffect'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect'

type StepState = 'idle' | 'active' | 'done'

const features = [
  {
    icon: 'account_tree',
    title: 'Architectural Mapping',
    description: 'Automatically map out module dependencies and system architecture with AI-driven insights.',
  },
  {
    icon: 'security',
    title: 'Vulnerability Scan',
    description: 'Identify potential security bottlenecks and pattern anti-goals before they reach production.',
  },
  {
    icon: 'auto_stories',
    title: 'Doc Generation',
    description: 'Turn complex undocumented code into high-quality technical documentation instantly.',
  },
]

export default function ImportPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progressVisible, setProgressVisible] = useState(false)
  const [step1, setStep1] = useState<StepState>('idle')
  const [step2, setStep2] = useState<StepState>('idle')
  const [step3, setStep3] = useState<StepState>('idle')
  const [progressWidth, setProgressWidth] = useState('0%')
  const [done, setDone] = useState(false)

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setProgressVisible(true);
    setStep1('active');
    setProgressWidth('0%');

    try {
      // Trigger Import
      const res = await fetch(`${API_URL}/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: url }),
      });
      const data = await res.json();
      const repoId = data.repositoryId;

      setStep1('done');
      setStep2('active');
      setProgressWidth('33%');

      // Simple polling for AST parsing completion
      let isIndexed = false;
      while (!isIndexed) {
        await sleep(2000);
        const statusRes = await fetch(`${API_URL}/repositories/${repoId}`);
        const statusData = await statusRes.json();
        
        if (statusData?.indexed_at) {
          isIndexed = true;
          setStep2('done');
          setStep3('active');
          setProgressWidth('66%');
          
          // Wait a bit to simulate embedding generation phase
          await sleep(1500);
          setStep3('done');
          setProgressWidth('100%');
          setDone(true);
        }
      }
    } catch (error) {
      console.error('Error importing repository:', error);
      // Fallback or error state handling could go here
    } finally {
      setAnalyzing(false);
    }
  }

  const stepClass = (state: StepState) => {
    if (state === 'active') return 'border-primary shadow-[0_0_20px_rgba(173,198,255,0.5)] bg-primary/10'
    if (state === 'done') return 'bg-primary border-primary'
    return 'border-outline-variant bg-surface-container'
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem="repositories" />
      <TopBar activeNav="explorer" />

      <main className="ml-64 pt-16 min-h-screen relative overflow-hidden">
        {/* BackgroundBeams only on the hero section */}
        <div className="absolute inset-0 pointer-events-none">
          <BackgroundBeams />
        </div>

        <div className="relative z-10 flex flex-col items-center px-8 py-16 max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Powered by AI Analysis
            </motion.div>

            <TextGenerateEffect
              words="GitHub Repository AI Explorer"
              className="text-4xl md:text-5xl text-on-surface mb-4"
              duration={0.3}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-on-surface-variant text-lg max-w-2xl mx-auto"
            >
              Paste any GitHub URL and get a comprehensive AI analysis of the architecture,
              patterns, and logic in seconds.
            </motion.p>
          </motion.div>

          {/* Import Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full max-w-3xl"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-sm" />
              <div className="relative bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-8">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4 block">
                  Repository URL
                </label>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">link</span>
                    <input
                      className="w-full h-14 bg-surface-container-lowest border border-outline-variant rounded-xl pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="https://github.com/username/repository"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  {done ? (
                    <ShimmerButton
                      onClick={() => router.push('/repos/nest-booking-api')}
                      className="h-14 px-6 text-sm font-semibold rounded-xl whitespace-nowrap"
                      shimmerColor="#adc6ff"
                      borderRadius="12px"
                      background="rgba(0,46,106,1)"
                    >
                      Open Dashboard
                      <span className="material-symbols-outlined text-[18px]">launch</span>
                    </ShimmerButton>
                  ) : (
                    <ShimmerButton
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="h-14 px-6 text-sm font-semibold rounded-xl whitespace-nowrap disabled:opacity-60"
                      shimmerColor="#adc6ff"
                      borderRadius="12px"
                      background="rgba(0,46,106,1)"
                    >
                      {analyzing ? (
                        <>
                          <span>Processing</span>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                          <span>Analyze</span>
                        </>
                      )}
                    </ShimmerButton>
                  )}
                </div>

                {/* Progress */}
                <AnimatePresence>
                  {progressVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-10"
                    >
                      {/* Progress bar */}
                      <div className="relative mb-10">
                        <div className="absolute top-5 left-0 w-full h-[2px] bg-outline-variant/50" />
                        <motion.div
                          className="absolute top-5 left-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(173,198,255,0.8)]"
                          initial={{ width: '0%' }}
                          animate={{ width: progressWidth }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />

                        <div className="relative flex justify-between">
                          {[
                            { state: step1, icon: 'cloud_download', label: 'Cloning Repository' },
                            { state: step2, icon: 'data_object', label: 'Reading Source Code' },
                            { state: step3, icon: 'psychology', label: 'Building Knowledge Base' },
                          ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                              <motion.div
                                animate={s.state === 'active' ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${stepClass(s.state)}`}
                              >
                                <span className={`material-symbols-outlined text-[20px] ${
                                  s.state === 'done' ? 'text-on-primary' :
                                  s.state === 'active' ? 'text-primary' : 'text-on-surface-variant'
                                }`}>
                                  {s.state === 'done' ? 'check' : s.icon}
                                </span>
                              </motion.div>
                              <span className={`text-xs font-medium transition-colors ${s.state !== 'idle' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                {s.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {done && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Analysis Complete
                          </div>
                          <br />
                          <ShimmerButton
                            onClick={() => router.push('/repos/nest-booking-api')}
                            className="mt-2 px-8 py-3 text-sm font-semibold rounded-xl"
                            shimmerColor="#adc6ff"
                            borderRadius="12px"
                            background="rgba(0,46,106,1)"
                          >
                            Open Dashboard →
                          </ShimmerButton>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* HoverEffect feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-5xl"
          >
            <HoverEffect items={features} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
