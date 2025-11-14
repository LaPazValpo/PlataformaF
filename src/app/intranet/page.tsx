"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function IntranetHome() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/intranet/dashboard')
  }, [router])
  return null
}
