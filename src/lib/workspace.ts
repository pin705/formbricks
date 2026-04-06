import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db'

export type WorkspaceWithPlan = NonNullable<Awaited<ReturnType<typeof getWorkspace>>>

// ─────────────────────────────────────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function getSupabaseUser() {
  const supabase = await createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('active_workspace_id')?.value ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// Main workspace resolver — used in dashboard server components
// ─────────────────────────────────────────────────────────────────────────────

export async function getWorkspace() {
  const user = await getSupabaseUser()
  if (!user) redirect('/auth/sign-in')

  const activeId = await getActiveWorkspaceId()

  let workspace = null

  if (activeId) {
    workspace = await db.workspace.findFirst({
      where: {
        id: activeId,
        members: { some: { userId: user.id } }
      },
      include: { subscription: { include: { plan: true } } }
    })
  }

  if (!workspace) {
    const membership = await db.workspaceMember.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: {
        workspace: { include: { subscription: { include: { plan: true } } } }
      }
    })
    workspace = membership?.workspace ?? null
  }

  if (!workspace) redirect('/onboarding')

  return workspace
}

export async function getWorkspaceOrNull() {
  const user = await getSupabaseUser()
  if (!user) return null

  const activeId = await getActiveWorkspaceId()

  if (activeId) {
    const workspace = await db.workspace.findFirst({
      where: {
        id: activeId,
        members: { some: { userId: user.id } }
      },
      include: { subscription: { include: { plan: true } } }
    })
    if (workspace) return workspace
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      workspace: { include: { subscription: { include: { plan: true } } } }
    }
  })

  return membership?.workspace ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// Ensure user row exists in our DB (called after Supabase auth callback)
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureUserRecord(supabaseUser: {
  id: string
  email?: string
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string }
}) {
  await db.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name:
        supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null
    },
    update: {
      email: supabaseUser.email ?? undefined,
      name:
        supabaseUser.user_metadata?.full_name ??
        supabaseUser.user_metadata?.name ??
        undefined,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? undefined
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

export function getCurrentPeriod() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
