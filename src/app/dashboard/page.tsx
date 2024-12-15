'use client'

import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@firebase/auth'

const DashboardContent = dynamic(
  () => Promise.resolve(function DashboardContent({ user, logout }: { user: User; logout: () => Promise<void> }) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="space-y-4">
          <p>Welcome, {user.email}</p>
          <Button 
            variant="outline"
            onClick={() => logout()}
          >
            Sign Out
          </Button>
        </div>
      </>
    );
  }),
  { ssr: false }
);

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (!mounted) {
    return (
      <main className="container mx-auto p-4">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4" suppressHydrationWarning>
      <Card className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ) : user ? (
          <DashboardContent user={user} logout={logout} />
        ) : null}
      </Card>
    </main>
  )
} 