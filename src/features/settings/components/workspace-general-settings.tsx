'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'

interface Props {
  workspace: { id: string; name: string; slug: string }
  canEdit: boolean
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function WorkspaceGeneralSettings({ workspace, canEdit }: Props) {
  const router = useRouter()
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [loading, setLoading] = useState(false)

  const isDirty = name !== workspace.name || slug !== workspace.slug

  const handleSave = async () => {
    if (!isDirty) return
    setLoading(true)
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      toast.success('Settings saved')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Workspace name and URL slug.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='space-y-1.5'>
          <Label htmlFor='name'>Workspace name</Label>
          <Input
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='slug'>Slug</Label>
          <div className='flex items-center gap-0 rounded-md border focus-within:ring-1 focus-within:ring-ring overflow-hidden'>
            <span className='shrink-0 border-r bg-muted px-3 py-2 text-sm text-muted-foreground'>
              linkos.app/
            </span>
            <Input
              id='slug'
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              disabled={!canEdit}
              className='rounded-none border-0 focus-visible:ring-0 shadow-none'
            />
          </div>
        </div>

        {canEdit && (
          <Button onClick={handleSave} disabled={loading || !isDirty} size='sm'>
            {loading && <Icons.spinner className='mr-2 size-4 animate-spin' />}
            Save changes
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
