'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SignInPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'github' | 'google' | 'email' | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) {
      toast.error(error.message)
      setLoading(null)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading('email')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    setLoading(null)
    if (error) {
      toast.error(error.message)
    } else {
      setEmailSent(true)
    }
  }

  return (
    <div className='flex min-h-svh items-center justify-center bg-background p-4'>
      <div className='w-full max-w-[380px] space-y-6'>
        {/* Logo */}
        <div className='flex flex-col items-center gap-2 text-center'>
          <div className='flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            <Icons.link className='size-5' />
          </div>
          <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
          <p className='text-sm text-muted-foreground'>Sign in to your account to continue</p>
        </div>

        {emailSent ? (
          <div className='rounded-lg border bg-muted/40 p-5 text-center space-y-2'>
            <Icons.send className='mx-auto size-8 text-primary' />
            <p className='font-medium'>Check your email</p>
            <p className='text-sm text-muted-foreground'>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <Button variant='ghost' size='sm' onClick={() => setEmailSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* OAuth buttons */}
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                onClick={() => handleOAuth('github')}
                disabled={!!loading}
              >
                {loading === 'github' ? (
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                ) : (
                  <Icons.github className='mr-2 size-4' />
                )}
                GitHub
              </Button>
              <Button
                variant='outline'
                onClick={() => handleOAuth('google')}
                disabled={!!loading}
              >
                {loading === 'google' ? (
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                ) : (
                  <Icons.google className='mr-2 size-4' />
                )}
                Google
              </Button>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>or continue with email</span>
              </div>
            </div>

            {/* Magic link form */}
            <form onSubmit={handleMagicLink} className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@company.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete='email'
                  autoFocus
                />
              </div>
              <Button type='submit' className='w-full' disabled={!!loading}>
                {loading === 'email' && <Icons.spinner className='mr-2 size-4 animate-spin' />}
                Send magic link
              </Button>
            </form>
          </div>
        )}

        <p className='text-center text-xs text-muted-foreground'>
          By signing in you agree to our{' '}
          <Link href='/terms-of-service' className='underline underline-offset-4 hover:text-foreground'>
            Terms
          </Link>{' '}
          and{' '}
          <Link href='/privacy-policy' className='underline underline-offset-4 hover:text-foreground'>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
