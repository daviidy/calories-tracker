'use client'

import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/ui/icons';
import { LogOut, Plus, Pizza } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (!mounted || loading || !user) {
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
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Daily Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Daily Target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2000 kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2000 kcal</p>
          </CardContent>
        </Card>
      </div>

      {/* Meals List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Meals</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Button>
        </CardHeader>
        <CardContent>
          {/* Placeholder for when no meals are added */}
          <div className="text-center py-8 text-muted-foreground">
            <Pizza className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No meals added yet</p>
            <p className="text-sm">Click the Add Meal button to get started</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 