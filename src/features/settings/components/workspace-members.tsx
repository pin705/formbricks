'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'

interface Member {
  userId: string
  role: string
  name: string | null
  email: string
  avatarUrl: string | null
}

interface Props {
  members: Member[]
  currentUserId: string
  canManage: boolean
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-muted text-muted-foreground'
}

export function WorkspaceMembers({ members, currentUserId, canManage }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, role: string) => {
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/workspace/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (!res.ok) throw new Error('Failed to update role')
      toast.success('Role updated')
      startTransition(() => router.refresh())
    } catch {
      toast.error('Failed to update role')
    } finally {
      setLoadingId(null)
    }
  }

  const handleRemove = async (userId: string, name: string | null) => {
    if (!confirm(`Remove ${name ?? 'this member'} from workspace?`)) return
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/workspace/members/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove member')
      toast.success('Member removed')
      startTransition(() => router.refresh())
    } catch {
      toast.error('Failed to remove member')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-1'>
          {members.map((member) => {
            const initials =
              member.name?.slice(0, 2).toUpperCase() ??
              member.email.slice(0, 2).toUpperCase()
            const isCurrentUser = member.userId === currentUserId
            const isOwner = member.role === 'owner'

            return (
              <div
                key={member.userId}
                className='flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors gap-3'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar className='size-8 shrink-0'>
                    <AvatarImage src={member.avatarUrl ?? ''} />
                    <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {member.name ?? member.email}
                      {isCurrentUser && (
                        <span className='ml-1.5 text-xs text-muted-foreground font-normal'>(you)</span>
                      )}
                    </p>
                    {member.name && (
                      <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2 shrink-0'>
                  <Badge
                    variant='outline'
                    className={`text-xs border-0 capitalize ${ROLE_COLORS[member.role] ?? ''}`}
                  >
                    {member.role}
                  </Badge>

                  {canManage && !isOwner && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-7'
                          disabled={loadingId === member.userId}
                        >
                          {loadingId === member.userId ? (
                            <Icons.spinner className='size-3.5 animate-spin' />
                          ) : (
                            <Icons.ellipsis className='size-3.5' />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.userId, 'admin')}>
                          Make admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.userId, 'member')}>
                          Make member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => handleRemove(member.userId, member.name)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {members.length === 1 && (
          <p className='mt-4 text-center text-sm text-muted-foreground'>
            Invite team members by sharing your workspace slug with them — invite flow coming soon.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
