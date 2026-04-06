'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  const handleSlugChange = (value: string) => {
    setSlug(slugify(value))
    setSlugEdited(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create workspace')
      }

      const { workspace } = await res.json()

      // Set as active workspace
      await fetch('/api/workspaces/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id })
      })

      router.push('/onboarding/plan')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className='space-y-8'>
      {/* Progress */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>Step 1 of 2</span>
          <span>Create workspace</span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-muted'>
          <div className='h-full w-1/2 rounded-full bg-primary transition-all' />
        </div>
      </div>

      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>Create your workspace</h1>
        <p className='text-muted-foreground'>
          A workspace is your team's home for managing links, campaigns, and analytics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-1.5'>
          <Label htmlFor='name'>Workspace name</Label>
          <Input
            id='name'
            placeholder='Acme Inc.'
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='slug'>
            Slug
            <span className='ml-1 text-xs text-muted-foreground'>(used in URLs)</span>
          </Label>
          <div className='flex items-center gap-0 rounded-md border focus-within:ring-1 focus-within:ring-ring overflow-hidden'>
            <span className='shrink-0 border-r bg-muted px-3 py-2 text-sm text-muted-foreground'>
              linkos.app/
            </span>
            <Input
              id='slug'
              placeholder='acme-inc'
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className='rounded-none border-0 focus-visible:ring-0 shadow-none'
              required
              pattern='^[a-z0-9-]+$'
            />
          </div>
          <p className='text-xs text-muted-foreground'>Only lowercase letters, numbers, and hyphens</p>
        </div>

        <Button type='submit' className='w-full' disabled={loading || !name || !slug}>
          {loading && <Icons.spinner className='mr-2 size-4 animate-spin' />}
          Continue
          {!loading && <Icons.arrowRight className='ml-2 size-4' />}
        </Button>
      </form>
    </div>
  )
}
