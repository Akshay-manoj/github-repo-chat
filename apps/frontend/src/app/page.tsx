'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Spotlight } from '@/components/aceternity/Spotlight'
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect'
import { ShimmerButton } from '@/components/aceternity/ShimmerButton'

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setTimeout(() => setStatus('sent'), 1500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background antialiased relative overflow-hidden">
      {/* Aceternity Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#adc6ff" />
      <Spotlight className="top-1/4 right-0" fill="#4d8eff" />

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(173,198,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(173,198,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px] mx-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(173,198,255,0.2)]">
            <span
              className="material-symbols-outlined text-primary text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              explore
            </span>
          </div>

          <TextGenerateEffect
            words="GitHub Repository AI Explorer"
            className="text-center text-3xl font-bold text-primary"
            duration={0.4}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-on-surface-variant text-sm text-center mt-3 max-w-xs"
          >
            Understand any codebase with AI. Deep analysis of architecture, patterns and logic in seconds.
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative"
        >
          {/* Glow border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary-container/20 to-primary/30 rounded-3xl blur-sm opacity-50" />

          <div className="relative bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant/40 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-on-surface">Welcome back</h2>
              <p className="text-on-surface-variant text-sm mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-2 ml-1" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-highest/50 border border-outline-variant/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* CTA */}
              <Link href="/import" className="block">
                <ShimmerButton
                  type="submit"
                  className="w-full h-12 text-sm font-semibold rounded-xl"
                  shimmerColor="#adc6ff"
                  shimmerDuration="2s"
                  background="rgba(0, 46, 106, 1)"
                  borderRadius="12px"
                >
                  {status === 'idle' && (
                    <>
                      <span>Send Login Link</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                  {status === 'loading' && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {status === 'sent' && (
                    <>
                      <span className="material-symbols-outlined">check_circle</span>
                      <span>Check your inbox</span>
                    </>
                  )}
                </ShimmerButton>
              </Link>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="mx-4 text-xs text-on-surface-variant/50 font-medium">OR</span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>

              {/* GitHub */}
              <Link href="/import">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="w-full h-12 bg-surface-container-high border border-outline-variant/40 rounded-xl text-sm font-medium text-on-surface flex items-center justify-center gap-3 hover:border-primary/30 hover:bg-surface-container-highest transition-all"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span>Continue with GitHub</span>
                </motion.button>
              </Link>
            </form>

            <p className="text-center text-xs text-on-surface-variant/50 mt-6 leading-relaxed">
              By continuing, you agree to our{' '}
              <a className="text-primary hover:underline" href="#">Terms</a>
              {' '}and{' '}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </motion.div>

        {/* Footer badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-6 mt-8"
        >
          {['SOC 2 Compliant', 'SSO Support', 'GDPR Ready'].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
              <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
              {badge}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
