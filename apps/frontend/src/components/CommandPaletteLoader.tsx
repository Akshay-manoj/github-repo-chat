'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false })

interface RepoItem {
  id: string
  github_url: string
  language?: string
  indexed_at?: string
  created_at: string
}

export default function CommandPaletteLoader() {
  const [repos, setRepos] = useState<RepoItem[]>([])

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    fetch(`${API_URL}/repositories`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRepos(data) })
      .catch(() => {})
  }, [])

  return <CommandPalette repos={repos} />
}
